import { z } from "zod";

/** Client-safe agenda rules shared by the CRM UI, server functions and tests. */
export const LOCATION_TYPES = ["office", "client", "online", "phone"] as const;
export const APPOINTMENT_STATUSES = ["planned", "cancelled", "completed"] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export const appointmentSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(200),
    client_id: z.string().uuid().nullable().default(null),
    dossier_id: z.string().uuid().nullable().default(null),
    owner_id: z.string().uuid(),
    member_ids: z.array(z.string().uuid()).max(20).default([]),
    start_at: z.string().datetime({ offset: true }),
    end_at: z.string().datetime({ offset: true }),
    location_type: z.enum(LOCATION_TYPES),
    location_note: z.string().trim().max(1000).default(""),
    meet_link: z
      .string()
      .trim()
      .max(500)
      .refine((v) => !v || /^https:\/\//.test(v), "https link required")
      .default(""),
    status: z.enum(APPOINTMENT_STATUSES).default("planned"),
    kind: z.enum(["regular", "bud_followup"]).default("regular"),
  })
  .refine((v) => new Date(v.end_at) > new Date(v.start_at), { message: "End after start" });
export type AppointmentInput = z.infer<typeof appointmentSchema>;

/** Adds calendar months, clamping to the last day (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(date: Date, months: number) {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return d;
}

type FollowUpDossier = { id: string; service: string; status: string; start_date: string };
type FollowUpAppointment = {
  dossier_id: string | null;
  kind: string;
  status: string;
  start_at: string;
};

/**
 * Service promise for budget dossiers: the first follow-up 3 months after the dossier
 * starts, each next one 6 months after the last completed follow-up. No proposal while a
 * follow-up is still planned, or when the dossier is not an open BUD dossier.
 */
export function followUpProposal(dossier: FollowUpDossier, appointments: FollowUpAppointment[]) {
  if (dossier.service !== "BUD" || dossier.status === "completed" || dossier.status === "archived")
    return null;
  const followUps = appointments.filter(
    (a) => a.dossier_id === dossier.id && a.kind === "bud_followup",
  );
  if (followUps.some((a) => a.status === "planned")) return null;
  const done = followUps
    .filter((a) => a.status === "completed")
    .sort((a, b) => b.start_at.localeCompare(a.start_at))[0];
  const base = done ? new Date(done.start_at) : new Date(`${dossier.start_date}T10:00:00`);
  const start = addMonths(base, done ? 6 : 3);
  if (!done) start.setHours(10, 0, 0, 0);
  return { start, months: done ? 6 : 3, first: !done };
}

/** Google events that the CRM itself created are already shown as CRM appointments. */
export function filterForeignGoogleEvents<
  T extends { id: string; crmId?: string | null },
>(events: T[], linkedIds: Set<string>) {
  return events.filter((e) => !e.crmId && !linkedIds.has(e.id));
}

/** Minutes since local midnight, clamped into the visible day grid. */
export function gridPosition(startIso: string, endIso: string, dayStartHour: number, dayEndHour: number) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const min = dayStartHour * 60;
  const max = dayEndHour * 60;
  const startMin = Math.max(min, Math.min(max, s.getHours() * 60 + s.getMinutes()));
  const endMin = Math.max(startMin + 15, Math.min(max, e.getHours() * 60 + e.getMinutes() || max));
  return { top: (startMin - min) / (max - min), height: (endMin - startMin) / (max - min) };
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function startOfWeek(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function toLocalInput(date: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}
