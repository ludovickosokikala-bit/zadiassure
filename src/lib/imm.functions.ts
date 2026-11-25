import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { documentSchema, personSchema, procedureSchema, stepSchema, templateSchema } from "./immCore";

type Ctx = { supabase: import("./crm.server").Db; userId: string };
async function member(ctx: Ctx) {
  const { foundationMember } = await import("./foundation.server");
  return foundationMember(ctx.supabase, ctx.userId);
}
const ok = (r: { error: unknown }) => {
  if (r.error) throw new Error("SAVE_FAILED");
};
type Table = "crm_imm_steps" | "crm_imm_documents" | "crm_imm_persons";

export const getImmData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const m = await member(context);
    const org = m.organization_id;
    const db = context.supabase;
    const [procedures, persons, steps, documents, templates] = await Promise.all([
      db.from("crm_imm_procedures").select("*").eq("organization_id", org).limit(5000),
      db.from("crm_imm_persons").select("*").eq("organization_id", org).order("created_at").limit(10000),
      db.from("crm_imm_steps").select("*").eq("organization_id", org).order("sort_order").order("created_at").limit(20000),
      db.from("crm_imm_documents").select("*").eq("organization_id", org).order("sort_order").order("created_at").limit(20000),
      db.from("crm_imm_templates").select("*").eq("organization_id", org).limit(50),
    ]);
    if (procedures.error || persons.error || steps.error || documents.error || templates.error) throw new Error("LOAD_FAILED");
    return {
      organizationId: org,
      isAdmin: m.foundation_role === "admin",
      procedures: procedures.data,
      persons: persons.data,
      steps: steps.data,
      documents: documents.data,
      templates: templates.data.map((t) => ({ procedure_type: t.procedure_type, steps: (t.steps as string[]) ?? [], documents: (t.documents as string[]) ?? [] })),
    };
  });

export const saveProcedure = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => procedureSchema.parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const org = m.organization_id;
    const db = context.supabase;
    const { seed, ...fields } = data;
    const existing = await db.from("crm_imm_procedures").select("id").eq("dossier_id", data.dossier_id).eq("organization_id", org).maybeSingle();
    ok(existing);
    // client_id is overwritten by the database trigger from the dossier.
    ok(existing.data
      ? await db.from("crm_imm_procedures").update(fields).eq("id", existing.data.id)
      : await db.from("crm_imm_procedures").insert({ ...fields, organization_id: org, client_id: m.organization_id }));
    if (seed) {
      const [s, d] = await Promise.all([
        db.from("crm_imm_steps").select("id", { count: "exact", head: true }).eq("dossier_id", data.dossier_id),
        db.from("crm_imm_documents").select("id", { count: "exact", head: true }).eq("dossier_id", data.dossier_id),
      ]);
      if (!s.count && seed.steps.length)
        ok(await db.from("crm_imm_steps").insert(seed.steps.map((label, i) => ({ label, sort_order: i, dossier_id: data.dossier_id, organization_id: org }))));
      if (!d.count && seed.documents.length)
        ok(await db.from("crm_imm_documents").insert(seed.documents.map((label, i) => ({ label, sort_order: i, dossier_id: data.dossier_id, organization_id: org }))));
    }
    return { ok: true };
  });

async function upsert(ctx: Ctx, table: Table, row: { id?: string | undefined } & Record<string, unknown>) {
  const m = await member(ctx);
  const { id, ...fields } = row;
  ok(id
    ? await ctx.supabase.from(table).update(fields as never).eq("id", id).eq("organization_id", m.organization_id)
    : await ctx.supabase.from(table).insert({ ...fields, organization_id: m.organization_id } as never));
  return { ok: true };
}
async function remove(ctx: Ctx, table: Table, id: string) {
  const m = await member(ctx);
  ok(await ctx.supabase.from(table).delete().eq("id", id).eq("organization_id", m.organization_id));
  return { ok: true };
}
const del = z.object({ id: z.string().uuid() });

export const saveImmStep = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => stepSchema.parse(v)).handler(({ data, context }) => upsert(context, "crm_imm_steps", data));
export const deleteImmStep = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => del.parse(v)).handler(({ data, context }) => remove(context, "crm_imm_steps", data.id));
export const saveImmDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => documentSchema.parse(v)).handler(({ data, context }) => upsert(context, "crm_imm_documents", data));
export const deleteImmDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => del.parse(v)).handler(({ data, context }) => remove(context, "crm_imm_documents", data.id));
export const saveImmPerson = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => personSchema.parse(v)).handler(({ data, context }) => upsert(context, "crm_imm_persons", data));
export const deleteImmPerson = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => del.parse(v)).handler(({ data, context }) => remove(context, "crm_imm_persons", data.id));

export const referImmLawyer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ dossier_id: z.string().uuid(), lawyer_name: z.string().trim().min(1).max(200), referral_note: z.string().trim().max(2000) }).parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const db = context.supabase;
    const fields = { lawyer_name: data.lawyer_name, referral_note: data.referral_note, referred_at: new Date().toISOString() };
    const existing = await db.from("crm_imm_procedures").select("id").eq("dossier_id", data.dossier_id).eq("organization_id", m.organization_id).maybeSingle();
    ok(existing);
    ok(existing.data
      ? await db.from("crm_imm_procedures").update(fields).eq("id", existing.data.id)
      : await db.from("crm_imm_procedures").insert({ ...fields, dossier_id: data.dossier_id, organization_id: m.organization_id, client_id: m.organization_id }));
    return { ok: true };
  });

export const saveImmTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => templateSchema.parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    if (m.foundation_role !== "admin") throw new Error("FORBIDDEN");
    ok(await context.supabase.from("crm_imm_templates").upsert({ ...data, organization_id: m.organization_id, updated_at: new Date().toISOString() }, { onConflict: "organization_id,procedure_type" }));
    return { ok: true };
  });
