import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { agendaRangeSchema, appointmentSchema } from "./crm.schemas";

const APPOINTMENT_COLUMNS =
  "id, title, description, location, meeting_kind, starts_at, ends_at, all_day, status, attendee_emails, assigned_to, client_id, case_id, created_at";

/** Appointments plus tasks with a due date inside the requested range. */
export const listAgenda = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => agendaRangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const fromIso = `${data.from}T00:00:00.000Z`;
    const toIso = `${data.to}T23:59:59.999Z`;

    let appointments = context.supabase
      .from("appointments")
      .select(
        `${APPOINTMENT_COLUMNS}, cases ( id, case_number, title ), clients ( first_name, last_name, company_name )`,
      )
      .eq("organization_id", member.organization_id)
      .is("deleted_at", null)
      .gte("starts_at", fromIso)
      .lte("starts_at", toIso)
      .order("starts_at")
      .limit(500);
    if (data.mine) appointments = appointments.eq("assigned_to", context.userId);

    let tasks = context.supabase
      .from("tasks")
      .select("id, title, status, priority, due_date, due_time, assigned_to, case_id, client_id")
      .eq("organization_id", member.organization_id)
      .is("deleted_at", null)
      .not("due_date", "is", null)
      .gte("due_date", data.from)
      .lte("due_date", data.to)
      .not("status", "in", "(completed,cancelled)")
      .order("due_date")
      .limit(500);
    if (data.mine) tasks = tasks.eq("assigned_to", context.userId);

    const [a, t] = await Promise.all([appointments, tasks]);
    if (a.error) throw new Error(a.error.message);
    if (t.error) throw new Error(t.error.message);
    return { appointments: a.data ?? [], tasks: t.data ?? [] };
  });

export const saveAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => appointmentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, logActivity } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const { id, ...values } = data;

    if (id) {
      const { error } = await context.supabase
        .from("appointments")
        .update(values)
        .eq("id", id)
        .eq("organization_id", member.organization_id);
      if (error) throw new Error(error.message);
      await logActivity(context.supabase, member, context.userId, {
        case_id: values.case_id,
        client_id: values.client_id,
        kind: "appointment_updated",
        summary: `Afspraak bijgewerkt: ${values.title}`,
      });
      return { id };
    }

    const { data: created, error } = await context.supabase
      .from("appointments")
      .insert({ ...values, organization_id: member.organization_id, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, member, context.userId, {
      case_id: values.case_id,
      client_id: values.client_id,
      kind: "appointment_created",
      summary: `Afspraak gepland: ${values.title}`,
    });
    return { id: created.id };
  });

export const deleteAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("appointments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("organization_id", member.organization_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Personal subscription URL: pastes into Google/Outlook/Apple Calendar. */
export const getCalendarFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);

    const { data: existing } = await context.supabase
      .from("calendar_feeds")
      .select("token")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existing) return { token: existing.token };

    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const { error } = await context.supabase.from("calendar_feeds").insert({
      user_id: context.userId,
      organization_id: member.organization_id,
      token,
    });
    if (error) throw new Error(error.message);
    return { token };
  });

export const resetCalendarFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("calendar_feeds")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
