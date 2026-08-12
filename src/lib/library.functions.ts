import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Public reads for the legislation library and the request-form library. */
export const listLegislation = createServerFn({ method: "GET" }).handler(async () => {
  const { publicClient, LEGISLATION_COLUMNS } = await import("./library.server");
  const { data, error } = await publicClient()
    .from("legislation_updates")
    .select(LEGISLATION_COLUMNS)
    .eq("published", true)
    .order("effective_date", { ascending: false })
    .limit(200);
  if (error) return { items: [], error: "unavailable" as const };
  return { items: data ?? [], error: null };
});

export const getLegislation = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().trim().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { publicClient, LEGISLATION_COLUMNS } = await import("./library.server");
    const { data: row } = await publicClient()
      .from("legislation_updates")
      .select(LEGISLATION_COLUMNS)
      .eq("published", true)
      .eq("slug", data.slug)
      .maybeSingle();
    return { item: row ?? null };
  });

export const listForms = createServerFn({ method: "GET" }).handler(async () => {
  const { publicClient, FORM_COLUMNS } = await import("./library.server");
  const { data, error } = await publicClient()
    .from("form_templates")
    .select(FORM_COLUMNS)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .limit(200);
  if (error) return { items: [], error: "unavailable" as const };
  return { items: data ?? [], error: null };
});

export const getForm = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().trim().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { publicClient, FORM_COLUMNS } = await import("./library.server");
    const { data: row } = await publicClient()
      .from("form_templates")
      .select(FORM_COLUMNS)
      .eq("published", true)
      .eq("slug", data.slug)
      .maybeSingle();
    return { item: row ?? null };
  });

/** Public intake submission — a preparation request, never an official filing. */
export const submitRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        templateSlug: z.string().trim().min(1).max(120),
        fullName: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(255),
        phone: z.string().trim().max(40).default(""),
        language: z.enum(["nl", "fr", "en"]),
        audience: z.string().trim().max(60).default(""),
        message: z.string().trim().max(3000).default(""),
        answers: z.record(z.string(), z.union([z.string().max(1000), z.boolean()])).default({}),
        /** Identity / supporting files: photo (camera) or PDF, base64 encoded. */
        attachments: z
          .array(
            z.object({
              name: z.string().trim().min(1).max(160),
              mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"]),
              /** Raw base64 (no data: prefix). ~8 MB per file. */
              data: z.string().min(16).max(11_000_000),
            }),
          )
          .max(5)
          .default([]),

      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { publicClient } = await import("./library.server");
    const { data: template } = await publicClient()
      .from("form_templates")
      .select("id")
      .eq("published", true)
      .eq("slug", data.templateSlug)
      .maybeSingle();

    if (!template?.id) return { ok: false as const };

    // Anonymous clients have no write access to form_submissions; the insert
    // happens server-side only, after validation above.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("form_submissions").insert({
      template_id: template.id,
      template_slug: data.templateSlug,
      status: "new",
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      language: data.language,
      audience: data.audience,
      message: data.message,
      answers: data.answers,
    });
    if (error) return { ok: false as const };
    return { ok: true as const };
  });
