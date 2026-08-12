import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { mandateSchema, publicMandateSchema, MANDATE_STATUS_KEYS } from "./crm.schemas";

const MANDATE_COLUMNS =
  "id, client_id, case_id, holder_user_id, holder_name, scope, purpose, starts_on, ends_on, status, source, applicant_name, applicant_email, applicant_phone, applicant_address, applicant_birth_date, signed_full_name, signed_at, signature_image, consent, language, notes, created_at, updated_at";

/** All mandates of the organization, newest first. */
export const listMandates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("mandates")
      .select(`${MANDATE_COLUMNS}, clients ( id, first_name, last_name, company_name, email )`)
      .eq("organization_id", member.organization_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const saveMandate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => mandateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, logActivity } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const { id, ...values } = data;
    const payload = { ...values, organization_id: member.organization_id };

    if (id) {
      const { error } = await context.supabase
        .from("mandates")
        .update(payload)
        .eq("id", id)
        .eq("organization_id", member.organization_id);
      if (error) throw new Error(error.message);
      await logActivity(context.supabase, member, context.userId, {
        client_id: values.client_id,
        case_id: values.case_id,
        kind: "mandate_updated",
        summary: "Volmacht bijgewerkt",
      });
      return { id };
    }

    const { data: created, error } = await context.supabase
      .from("mandates")
      .insert({ ...payload, created_by: context.userId, source: "crm" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, member, context.userId, {
      client_id: values.client_id,
      case_id: values.case_id,
      kind: "mandate_created",
      summary: "Volmacht aangemaakt",
    });
    return { id: created.id };
  });

export const setMandateStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(MANDATE_STATUS_KEYS) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff, logActivity } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("mandates")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("organization_id", member.organization_id)
      .select("client_id, case_id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, member, context.userId, {
      client_id: row?.client_id ?? null,
      case_id: row?.case_id ?? null,
      kind: "mandate_status",
      summary: `Volmacht status: ${data.status}`,
    });
    return { ok: true as const };
  });

export const deleteMandate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("mandates")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("organization_id", member.organization_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Turns a website mandate into a client record (or links an existing one). */
export const linkMandateClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, logActivity } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const org = member.organization_id;

    const { data: mandate, error } = await context.supabase
      .from("mandates")
      .select("id, client_id, applicant_name, applicant_email, applicant_phone, applicant_address, applicant_birth_date, language")
      .eq("id", data.id)
      .eq("organization_id", org)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!mandate) throw new Error("NOT_FOUND");
    if (mandate.client_id) return { clientId: mandate.client_id };

    const parts = (mandate.applicant_name ?? "").trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");

    const { data: existing } = await context.supabase
      .from("clients")
      .select("id")
      .eq("organization_id", org)
      .eq("email", mandate.applicant_email)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    let clientId = existing?.id ?? null;
    if (!clientId) {
      const { data: created, error: insErr } = await context.supabase
        .from("clients")
        .insert({
          organization_id: org,
          first_name: firstName,
          last_name: lastName,
          email: mandate.applicant_email,
          phone: mandate.applicant_phone ?? "",
          address: mandate.applicant_address ?? "",
          date_of_birth: mandate.applicant_birth_date,
          preferred_language: mandate.language,
          status: "prospect",
          assigned_to: context.userId,
        })
        .select("id")
        .single();
      if (insErr) throw new Error(insErr.message);
      clientId = created.id;
    }

    const { error: upErr } = await context.supabase
      .from("mandates")
      .update({ client_id: clientId })
      .eq("id", mandate.id)
      .eq("organization_id", org);
    if (upErr) throw new Error(upErr.message);

    await logActivity(context.supabase, member, context.userId, {
      client_id: clientId,
      kind: "mandate_linked",
      summary: `Volmacht gekoppeld aan klant: ${mandate.applicant_name}`,
    });
    return { clientId };
  });

/**
 * Public mandate form from the website. Anonymous visitors have no write
 * access to `mandates`; the insert happens server-side after validation.
 */
export const submitMandate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => publicMandateSchema.parse(input))
  .handler(async ({ data }) => {
    if (!data.signature_image.startsWith("data:image/png;base64,")) {
      return { ok: false as const };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("id, name")
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!org?.id) return { ok: false as const };

    const { error } = await supabaseAdmin.from("mandates").insert({
      organization_id: org.id,
      source: "public_form",
      status: "signed",
      holder_name: org.name,
      scope: data.scope,
      purpose: data.purpose,
      starts_on: data.starts_on,
      ends_on: data.ends_on,
      applicant_name: data.applicant_name,
      applicant_email: data.applicant_email,
      applicant_phone: data.applicant_phone,
      applicant_address: data.applicant_address,
      applicant_birth_date: data.applicant_birth_date,
      signed_full_name: data.signed_full_name,
      signed_at: new Date().toISOString(),
      signature_image: data.signature_image,
      consent: true,
      language: data.language,
    });
    if (error) return { ok: false as const };
    return { ok: true as const };
  });
