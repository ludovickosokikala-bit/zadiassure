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
