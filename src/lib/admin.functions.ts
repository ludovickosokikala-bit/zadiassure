import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const legislationInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug"),
  theme: z.enum(["immigration", "budget", "business", "social"]),
  audiences: z.array(z.string().trim().max(40)).max(8).default([]),
  effective_date: z.string().trim().max(20).nullable().default(null),
  published: z.boolean().default(false),
  source_url: z.string().trim().url().max(500).nullable().default(null),
  source_label: z.string().trim().max(120).nullable().default(null),
  title_nl: z.string().trim().min(2).max(200),
  title_fr: z.string().trim().min(2).max(200),
  title_en: z.string().trim().min(2).max(200),
  summary_nl: z.string().trim().min(2).max(2000),
  summary_fr: z.string().trim().min(2).max(2000),
  summary_en: z.string().trim().min(2).max(2000),
  changes_nl: z.string().trim().max(4000).default(""),
  changes_fr: z.string().trim().max(4000).default(""),
  changes_en: z.string().trim().max(4000).default(""),
  action_nl: z.string().trim().max(4000).default(""),
  action_fr: z.string().trim().max(4000).default(""),
  action_en: z.string().trim().max(4000).default(""),
});

const formInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug"),
  theme: z.enum(["immigration", "budget", "business", "social"]),
  authority: z.string().trim().max(160).default(""),
  audiences: z.array(z.string().trim().max(40)).max(8).default([]),
  published: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(9999).default(0),
  official_url: z.string().trim().url().max(500).nullable().default(null),
  official_label: z.string().trim().max(120).nullable().default(null),
  title_nl: z.string().trim().min(2).max(200),
  title_fr: z.string().trim().min(2).max(200),
  title_en: z.string().trim().min(2).max(200),
  description_nl: z.string().trim().min(2).max(2000),
  description_fr: z.string().trim().min(2).max(2000),
  description_en: z.string().trim().min(2).max(2000),
  who_nl: z.string().trim().max(1000).default(""),
  who_fr: z.string().trim().max(1000).default(""),
  who_en: z.string().trim().max(1000).default(""),
  checklist: z.object({
    nl: z.array(z.string().trim().max(300)).max(30).default([]),
    fr: z.array(z.string().trim().max(300)).max(30).default([]),
    en: z.array(z.string().trim().max(300)).max(30).default([]),
  }),
});

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: data === true, userId: context.userId };
  });

export const adminListLegislation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("legislation_updates")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const adminListForms = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("form_templates")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const adminListSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("form_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const saveLegislation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => legislationInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...values } = data;
    const payload = {
      ...values,
      effective_date: values.effective_date || null,
      published_at: values.published ? new Date().toISOString() : null,
    };
    const query = id
      ? context.supabase.from("legislation_updates").update(payload).eq("id", id)
      : context.supabase.from("legislation_updates").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const saveForm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => formInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...values } = data;
    const query = id
      ? context.supabase.from("form_templates").update(values).eq("id", id)
      : context.supabase.from("form_templates").insert(values);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        table: z.enum(["legislation_updates", "form_templates", "form_submissions"]),
        id: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updateSubmissionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ id: z.string().uuid(), status: z.enum(["new", "in_progress", "done", "archived"]) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("form_submissions")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
