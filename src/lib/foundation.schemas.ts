import { z } from "zod";
export const CLIENT_TYPES = ["person", "household", "company"] as const;
export const SERVICES = ["IMM", "ADM", "BUD"] as const;
export const STATUSES = [
  "new",
  "ongoing",
  "waiting_client",
  "waiting_authority",
  "completed",
  "archived",
] as const;
export const PRIORITIES = ["normal", "high", "urgent"] as const;
export const LANGUAGES = ["nl", "fr", "en", "other"] as const;
const text = z.string().trim().max(1000);
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable();
export const clientSchema = z
  .object({
    id: z.string().uuid().optional(),
    type: z.enum(CLIENT_TYPES),
    first_name: text.default(""),
    last_name: text.default(""),
    company_name: text.default(""),
    household_name: text.default(""),
    enterprise_number: text.default(""),
    contact_person_id: z.string().uuid().nullable().default(null),
    preferred_language: z.enum(LANGUAGES).default("nl"),
    phone: text.default(""),
    email: z.union([z.literal(""), z.string().email()]).default(""),
    whatsapp: text.default(""),
    address: text.default(""),
    nationality: text.default(""),
    birth_date: date.default(null),
    notes: z.string().max(20000).default(""),
  })
  .superRefine((v, ctx) => {
    if (v.type === "person" && (!v.first_name || !v.last_name))
      ctx.addIssue({ code: "custom", message: "Name required", path: ["first_name"] });
    if (v.type === "company" && !v.company_name)
      ctx.addIssue({ code: "custom", message: "Name required", path: ["company_name"] });
    if (v.type === "household" && !v.household_name)
      ctx.addIssue({ code: "custom", message: "Name required", path: ["household_name"] });
  });
export const dossierSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  service: z.enum(SERVICES),
  title: z.string().trim().min(1).max(500),
  status: z.enum(STATUSES).default("new"),
  responsible_id: z.string().uuid().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  next_step: text.default(""),
  next_step_date: date.default(null),
  priority: z.enum(PRIORITIES).default("normal"),
});
export type ClientInput = z.input<typeof clientSchema>;
export type DossierInput = z.input<typeof dossierSchema>;
export function isOpenDossier(status: string) {
  return status !== "completed" && status !== "archived";
}
export function displayClient(c: {
  type: string;
  first_name: string;
  last_name: string;
  company_name: string;
  household_name: string;
}) {
  return c.type === "company"
    ? c.company_name
    : c.type === "household"
      ? c.household_name
      : `${c.first_name} ${c.last_name}`.trim();
}
export function whatsappHref(value: string) {
  let digits = value.replace(/\D/g, "").replace(/^00/, "");
  if (digits.startsWith("0")) digits = `32${digits.slice(1)}`;
  return digits ? `https://wa.me/${digits}` : "";
}
