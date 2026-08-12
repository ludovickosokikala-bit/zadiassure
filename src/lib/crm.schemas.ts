import { z } from "zod";

export const LANGS = ["nl", "fr", "en"] as const;
export const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export const TASK_STATUSES = ["todo", "in_progress", "waiting", "completed", "cancelled"] as const;
export const DOC_STATUSES = [
  "requested",
  "received",
  "under_review",
  "approved",
  "rejected",
  "expired",
] as const;
export const CLIENT_TYPES = [
  "individual",
  "family",
  "self_employed",
  "organization",
  "other",
] as const;
export const CONTACT_PREFS = ["email", "phone", "whatsapp", "post", "portal"] as const;

const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .or(z.literal(""))
  .nullable()
  .default(null)
  .transform((v) => (v ? v : null));

export const clientSchema = z.object({
  id: z.string().uuid().optional(),
  client_type: z.enum(CLIENT_TYPES),
  first_name: z.string().trim().max(80).default(""),
  last_name: z.string().trim().max(80).default(""),
  company_name: z.string().trim().max(160).default(""),
  date_of_birth: optionalDate,
  email: z.string().trim().max(255).email().or(z.literal("")).default(""),
  phone: z.string().trim().max(40).default(""),
  address: z.string().trim().max(200).default(""),
  city: z.string().trim().max(80).default(""),
  postal_code: z.string().trim().max(16).default(""),
  country: z.string().trim().max(2).default("BE"),
  preferred_language: z.enum(LANGS),
  contact_preference: z.enum(CONTACT_PREFS),
  status: z.enum(["active", "prospect", "inactive"]),
  notes: z.string().trim().max(4000).default(""),
  assigned_to: z.string().uuid().nullable().default(null),
});
export type ClientInput = z.infer<typeof clientSchema>;

export const caseSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  case_type_id: z.string().uuid().nullable().default(null),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000).default(""),
  status_key: z.string().trim().min(1).max(60),
  stage: z.string().trim().max(60).default(""),
  priority: z.enum(PRIORITIES),
  assigned_to: z.string().uuid().nullable().default(null),
  progress: z.number().int().min(0).max(100).default(0),
  start_date: optionalDate,
  target_date: optionalDate,
  deadline: optionalDate,
  tags: z.array(z.string().trim().max(30)).max(12).default([]),
});
export type CaseInput = z.infer<typeof caseSchema>;

export const taskSchema = z.object({
  id: z.string().uuid().optional(),
  case_id: z.string().uuid().nullable().default(null),
  client_id: z.string().uuid().nullable().default(null),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).default(""),
  assigned_to: z.string().uuid().nullable().default(null),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(PRIORITIES),
  due_date: optionalDate,
});
export type TaskInput = z.infer<typeof taskSchema>;

export const noteSchema = z.object({
  case_id: z.string().uuid().nullable().default(null),
  client_id: z.string().uuid().nullable().default(null),
  body: z.string().trim().min(1).max(4000),
  is_internal: z.boolean().default(true),
});

export const documentSchema = z.object({
  id: z.string().uuid().optional(),
  case_id: z.string().uuid().nullable().default(null),
  client_id: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  document_type: z.string().trim().max(80).default(""),
  status: z.enum(DOC_STATUSES),
  requested_from_client: z.boolean().default(false),
  notes: z.string().trim().max(2000).default(""),
  expires_on: optionalDate,
});
export type DocumentInput = z.infer<typeof documentSchema>;

export const caseFilterSchema = z.object({
  search: z.string().trim().max(120).default(""),
  status_key: z.string().trim().max(60).default(""),
  priority: z.enum(PRIORITIES).nullable().default(null),
  assigned_to: z.string().uuid().nullable().default(null),
  case_type_id: z.string().uuid().nullable().default(null),
  only_open: z.boolean().default(false),
});

export const taskViewSchema = z.object({
  view: z.enum(["mine", "team", "today", "overdue", "upcoming"]).default("mine"),
});

export const MANDATE_SCOPE_KEYS = [
  "administration",
  "mail",
  "authorities",
  "budget",
  "banking",
  "insurance",
  "housing",
  "other",
] as const;

export const MANDATE_STATUS_KEYS = [
  "pending_signature",
  "signed",
  "active",
  "revoked",
  "expired",
] as const;

export const CRM_ROLE_KEYS = [
  "owner",
  "admin",
  "manager",
  "case_manager",
  "employee",
  "partner",
] as const;

export const mandateSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid().nullable().default(null),
  case_id: z.string().uuid().nullable().default(null),
  holder_user_id: z.string().uuid().nullable().default(null),
  holder_name: z.string().trim().max(160).default(""),
  scope: z.array(z.enum(MANDATE_SCOPE_KEYS)).max(8).default([]),
  purpose: z.string().trim().max(2000).default(""),
  starts_on: optionalDate,
  ends_on: optionalDate,
  status: z.enum(MANDATE_STATUS_KEYS),
  notes: z.string().trim().max(2000).default(""),
});
export type MandateInput = z.infer<typeof mandateSchema>;

/** Public volmacht form submitted from the website. */
export const publicMandateSchema = z.object({
  applicant_name: z.string().trim().min(2).max(160),
  applicant_email: z.string().trim().email().max(255),
  applicant_phone: z.string().trim().max(40).default(""),
  applicant_address: z.string().trim().max(240).default(""),
  applicant_birth_date: optionalDate,
  scope: z.array(z.enum(MANDATE_SCOPE_KEYS)).min(1).max(8),
  purpose: z.string().trim().max(2000).default(""),
  starts_on: optionalDate,
  ends_on: optionalDate,
  signed_full_name: z.string().trim().min(2).max(160),
  /** PNG data URL of the drawn signature. */
  signature_image: z.string().trim().min(32).max(400_000),
  consent: z.literal(true),
  language: z.enum(LANGS),
});

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  full_name: z.string().trim().max(160).default(""),
  role: z.enum(CRM_ROLE_KEYS),
});

export const MEETING_KINDS = ["office", "video", "phone", "home_visit", "external"] as const;
export const APPOINTMENT_STATUSES = ["scheduled", "confirmed", "cancelled", "completed"] as const;

export const appointmentSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid().nullable().default(null),
  case_id: z.string().uuid().nullable().default(null),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).default(""),
  location: z.string().trim().max(200).default(""),
  meeting_kind: z.enum(MEETING_KINDS),
  starts_at: z.string().trim().min(10).max(40),
  ends_at: z.string().trim().min(10).max(40),
  all_day: z.boolean().default(false),
  status: z.enum(APPOINTMENT_STATUSES),
  attendee_emails: z.array(z.string().trim().email().max(255)).max(20).default([]),
  assigned_to: z.string().uuid().nullable().default(null),
});
export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const agendaRangeSchema = z.object({
  from: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  mine: z.boolean().default(false),
});
