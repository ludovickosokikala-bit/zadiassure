import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { appointmentSchema } from "./agendaCore";
import { crmOriginFor } from "./host-routing";

const APPT_COLUMNS =
  "id,title,client_id,dossier_id,owner_id,member_ids,start_at,end_at,location_type,location_note,meet_link,status,kind,google_event_id,google_owner_id,google_sync_error,created_by,created_at";

export const listAppointments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { foundationMember } = await import("./foundation.server");
    const member = await foundationMember(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("crm_appointments")
      .select(APPT_COLUMNS)
      .eq("organization_id", member.organization_id)
      .order("start_at", { ascending: true })
      .limit(5000);
    if (error) throw new Error("LOAD_FAILED");
    return data ?? [];
  });

export const saveAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => appointmentSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { foundationMember } = await import("./foundation.server");
    const member = await foundationMember(context.supabase, context.userId);
    const { id, ...fields } = data;
    const values = { ...fields, member_ids: Array.from(new Set(fields.member_ids)) };
    const result = id
      ? await context.supabase
          .from("crm_appointments")
          .update(values)
          .eq("id", id)
          .eq("organization_id", member.organization_id)
          .select(APPT_COLUMNS)
          .single()
      : await context.supabase
          .from("crm_appointments")
          .insert({ ...values, organization_id: member.organization_id })
          .select(APPT_COLUMNS)
          .single();
    if (result.error || !result.data) throw new Error("SAVE_FAILED");
    const { syncAppointmentToGoogle } = await import("./googleCalendar.server");
    await syncAppointmentToGoogle(result.data);
    return { id: result.data.id };
  });

export const setAppointmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["planned", "cancelled", "completed"]) }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { foundationMember } = await import("./foundation.server");
    const member = await foundationMember(context.supabase, context.userId);
    const result = await context.supabase
      .from("crm_appointments")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("organization_id", member.organization_id)
      .select(APPT_COLUMNS)
      .single();
    if (result.error || !result.data) throw new Error("SAVE_FAILED");
    const { syncAppointmentToGoogle } = await import("./googleCalendar.server");
    await syncAppointmentToGoogle(result.data);
    return { ok: true };
  });

/** Signed-in member's own Google Calendar status and busy events for a range. */
export const googleCalendarEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ timeMin: z.string().datetime({ offset: true }), timeMax: z.string().datetime({ offset: true }) }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const { foundationMember } = await import("./foundation.server");
    await foundationMember(context.supabase, context.userId);
    const { listGoogleEvents } = await import("./googleCalendar.server");
    return listGoogleEvents(context.userId, data.timeMin, data.timeMax);
  });

export const googleCalendarStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getConnection } = await import("./appUserConnections.server");
    const { CALENDAR_CONNECTOR_ID } = await import("./googleCalendar.server");
    const conn = await getConnection(context.userId, CALENDAR_CONNECTOR_ID).catch(() => null);
    return {
      configured: Boolean(process.env["GOOGLE_CALENDAR_APP_USER_CONNECTOR_CLIENT_API_KEY"]),
      connected: Boolean(conn),
      email: conn?.accountEmail ?? "",
    };
  });

export const startGoogleCalendarConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientApiKey = process.env["GOOGLE_CALENDAR_APP_USER_CONNECTOR_CLIENT_API_KEY"];
    if (!clientApiKey) throw new Error("CALENDAR_CLIENT_NOT_CONFIGURED");
    const { foundationMember } = await import("./foundation.server");
    await foundationMember(context.supabase, context.userId);
    const request = getRequest();
    if (!request) throw new Error("OAuth must start from an app request.");
    const url = new URL(request.url);
    const sandboxHost = url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
    const origin = sandboxHost ? `https://${sandboxHost}` : crmOriginFor(url.origin);
    const { authorizeAppUserOAuth } = await import("@/integrations/lovable/appUserConnector");
    const { GATEWAY_BASE_URL, CALENDAR_CONNECTOR_ID, CALENDAR_SCOPES } = await import("./googleCalendar.server");
    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: CALENDAR_CONNECTOR_ID,
      appUserId: context.userId,
      clientAPIKey: clientApiKey,
      returnUrl: `${origin}/api/oauth/google-calendar/return`,
      credentialsConfiguration: { scopes: CALENDAR_SCOPES },
    });
    return { authorizationUrl };
  });

export const completeGoogleCalendarConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ code: z.string().min(8).max(400) }).parse(v))
  .handler(async ({ data, context }) => {
    const { exchangeAppUserOAuthCode, callAsAppUser } = await import("@/integrations/lovable/appUserConnector");
    const { saveConnectionKeyForUser } = await import("./appUserConnections.server");
    const { GATEWAY_BASE_URL, CALENDAR_CONNECTOR_ID } = await import("./googleCalendar.server");
    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(GATEWAY_BASE_URL, data.code);
    if (connectorId !== CALENDAR_CONNECTOR_ID) throw new Error("WRONG_CONNECTOR");
    let email = "";
    const res = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey,
      connectorId: CALENDAR_CONNECTOR_ID,
      path: "/calendar/v3/calendars/primary",
    });
    if (res.ok) email = ((await res.json()) as { id?: string }).id ?? "";
    await saveConnectionKeyForUser(context.userId, CALENDAR_CONNECTOR_ID, connectionAPIKey, email);
    // Push this member's upcoming CRM appointments into the freshly linked calendar.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { syncAppointmentToGoogle } = await import("./googleCalendar.server");
    const { data: rows } = await supabaseAdmin
      .from("crm_appointments")
      .select(APPT_COLUMNS)
      .eq("owner_id", context.userId)
      .eq("status", "planned")
      .gte("end_at", new Date().toISOString())
      .limit(100);
    for (const row of rows ?? []) await syncAppointmentToGoogle(row);
    return { ok: true, email };
  });

export const disconnectGoogleCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getConnectionKeyForUser, deleteConnectionForUser } = await import("./appUserConnections.server");
    const { disconnectAppUser } = await import("@/integrations/lovable/appUserConnector");
    const { GATEWAY_BASE_URL, CALENDAR_CONNECTOR_ID } = await import("./googleCalendar.server");
    const key = await getConnectionKeyForUser(context.userId, CALENDAR_CONNECTOR_ID);
    if (key) {
      await disconnectAppUser({ gatewayBaseUrl: GATEWAY_BASE_URL, connectionAPIKey: key, connectorId: CALENDAR_CONNECTOR_ID }).catch((e) =>
        console.error("Calendar disconnect failed", e),
      );
    }
    await deleteConnectionForUser(context.userId, CALENDAR_CONNECTOR_ID);
    return { ok: true };
  });
