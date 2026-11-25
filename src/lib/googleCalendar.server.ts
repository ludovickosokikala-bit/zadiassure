import { callAsAppUser } from "@/integrations/lovable/appUserConnector";
import { getConnectionKeyForUser } from "./appUserConnections.server";

export const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";
export const CALENDAR_CONNECTOR_ID = "google_calendar";
export const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/calendar.events",
];
const TIME_ZONE = "Europe/Brussels";

type Appt = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  location_type: string;
  location_note: string;
  meet_link: string;
  status: string;
  owner_id: string;
  google_event_id: string | null;
  google_owner_id: string | null;
};

async function call(userId: string, path: string, init?: RequestInit) {
  const key = await getConnectionKeyForUser(userId, CALENDAR_CONNECTOR_ID);
  if (!key) return null;
  return callAsAppUser({
    gatewayBaseUrl: GATEWAY_BASE_URL,
    connectionAPIKey: key,
    connectorId: CALENDAR_CONNECTOR_ID,
    path,
    ...(init ? { init } : {}),
  });
}

export async function reconnectRequired(res: Response) {
  if (res.status !== 401) return false;
  const body = (await res.clone().json().catch(() => null)) as { type?: unknown } | null;
  return typeof body?.type === "string" && body.type.startsWith("credential_");
}

async function failure(res: Response) {
  const text = await res.text();
  console.error(`Google Calendar request failed [${res.status}]: ${text}`);
  return `Google ${res.status}`;
}

function eventBody(a: Appt, labels: { location: string }) {
  const online = a.location_type === "online";
  return {
    summary: a.title,
    description: [labels.location, a.location_note].filter(Boolean).join("\n"),
    location: a.location_type === "online" ? "" : a.location_note,
    start: { dateTime: new Date(a.start_at).toISOString(), timeZone: TIME_ZONE },
    end: { dateTime: new Date(a.end_at).toISOString(), timeZone: TIME_ZONE },
    extendedProperties: { private: { zadiassureId: a.id } },
    ...(online && !a.meet_link
      ? {
          conferenceData: {
            createRequest: {
              requestId: `${a.id}-${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        }
      : {}),
  };
}

const LOCATION_LABEL: Record<string, string> = {
  office: "Op kantoor / Au bureau",
  client: "Bij klant / Chez le client",
  online: "Online / En ligne",
  phone: "Telefonisch / Par téléphone",
};

/**
 * Mirrors one CRM appointment into its responsible member's own Google Calendar.
 * Never throws: the CRM appointment is the source of truth, a failure is stored on the row.
 */
export async function syncAppointmentToGoogle(a: Appt) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const patch: {
    google_event_id?: string | null;
    google_owner_id?: string | null;
    meet_link?: string;
    google_sync_error?: string;
  } = {};
  try {
    let eventId = a.google_event_id;
    let eventOwner = a.google_owner_id;
    // Owner changed or appointment cancelled: remove the event from the previous calendar.
    if (eventId && eventOwner && (eventOwner !== a.owner_id || a.status === "cancelled")) {
      const res = await call(eventOwner, `/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}?sendUpdates=none`, { method: "DELETE" });
      if (res && !res.ok && res.status !== 404 && res.status !== 410) throw new Error(await failure(res));
      eventId = null;
      eventOwner = null;
      Object.assign(patch, { google_event_id: null, google_owner_id: null });
    }
    if (a.status !== "cancelled") {
      const body = JSON.stringify(eventBody(a, { location: LOCATION_LABEL[a.location_type] ?? "" }));
      const headers = { "Content-Type": "application/json" };
      let res = eventId
        ? await call(a.owner_id, `/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}?conferenceDataVersion=1&sendUpdates=none`, { method: "PATCH", headers, body })
        : await call(a.owner_id, `/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=none`, { method: "POST", headers, body });
      // Event deleted by the user in Google: create it again.
      if (res && eventId && (res.status === 404 || res.status === 410)) {
        res = await call(a.owner_id, `/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=none`, { method: "POST", headers, body });
      }
      if (res) {
        if (!res.ok) throw new Error((await reconnectRequired(res)) ? "RECONNECT" : await failure(res));
        const ev = (await res.json()) as { id?: string; hangoutLink?: string };
        patch.google_event_id = ev.id ?? null;
        patch.google_owner_id = a.owner_id;
        if (ev.hangoutLink && !a.meet_link) patch.meet_link = ev.hangoutLink;
      }
    }
    patch.google_sync_error = "";
  } catch (error) {
    patch.google_sync_error = error instanceof Error ? error.message.slice(0, 200) : "SYNC_FAILED";
  }
  await supabaseAdmin.from("crm_appointments").update(patch).eq("id", a.id);
}

export type GoogleBusyEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  crmId: string | null;
};

export async function listGoogleEvents(userId: string, timeMin: string, timeMax: string) {
  const q = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });
  const res = await call(userId, `/calendar/v3/calendars/primary/events?${q}`);
  if (!res) return { connected: false as const, events: [] as GoogleBusyEvent[] };
  if (await reconnectRequired(res))
    return { connected: false as const, reconnectRequired: true, events: [] as GoogleBusyEvent[] };
  if (!res.ok) return { connected: true as const, error: await failure(res), events: [] as GoogleBusyEvent[] };
  const body = (await res.json()) as {
    items?: Array<{
      id?: string;
      status?: string;
      summary?: string;
      transparency?: string;
      start?: { date?: string; dateTime?: string };
      end?: { date?: string; dateTime?: string };
      extendedProperties?: { private?: Record<string, string> };
    }>;
  };
  const events: GoogleBusyEvent[] = (body.items ?? [])
    .filter((e) => e.id && e.status !== "cancelled")
    .map((e) => {
      const allDay = !e.start?.dateTime;
      return {
        id: e.id!,
        title: e.summary ?? "",
        // All-day: Google's end date is exclusive; keep it as the local midnight it means.
        start: allDay ? `${e.start?.date}T00:00:00` : e.start!.dateTime!,
        end: allDay ? `${e.end?.date}T00:00:00` : e.end?.dateTime ?? e.start!.dateTime!,
        allDay,
        crmId: e.extendedProperties?.private?.["zadiassureId"] ?? null,
      };
    });
  return { connected: true as const, events };
}
