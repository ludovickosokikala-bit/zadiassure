import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { budgetSchema, debtSchema, REFERRALS } from "./debtCore";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

async function member(ctx: { supabase: import("./crm.server").Db; userId: string }) {
  const { foundationMember } = await import("./foundation.server");
  return foundationMember(ctx.supabase, ctx.userId);
}

export const getDebtData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const m = await member(context);
    const org = m.organization_id;
    const [budgets, lines, debts, instalments] = await Promise.all([
      context.supabase.from("crm_budgets").select("*").eq("organization_id", org).order("budget_date", { ascending: false }).order("created_at", { ascending: false }).limit(5000),
      context.supabase.from("crm_budget_lines").select("*").eq("organization_id", org).order("sort_order").limit(20000),
      context.supabase.from("crm_debts").select("*").eq("organization_id", org).order("created_at").limit(5000),
      context.supabase.from("crm_instalments").select("*").eq("organization_id", org).order("due_date").limit(20000),
    ]);
    if (budgets.error || lines.error || debts.error || instalments.error) throw new Error("LOAD_FAILED");
    return { organizationId: org, budgets: budgets.data, lines: lines.data, debts: debts.data, instalments: instalments.data };
  });

export const saveBudget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => budgetSchema.parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const org = m.organization_id;
    const { id, lines, ...fields } = data;
    const res = id
      ? await context.supabase.from("crm_budgets").update({ label: fields.label, budget_date: fields.budget_date }).eq("id", id).eq("organization_id", org).select("id").single()
      : await context.supabase.from("crm_budgets").insert({ ...fields, organization_id: org }).select("id").single();
    if (res.error) throw new Error("SAVE_FAILED");
    const budgetId = res.data.id;
    const del = await context.supabase.from("crm_budget_lines").delete().eq("budget_id", budgetId).eq("organization_id", org);
    if (del.error) throw new Error("SAVE_FAILED");
    if (lines.length) {
      const ins = await context.supabase.from("crm_budget_lines").insert(lines.map((l, i) => ({ ...l, sort_order: i, budget_id: budgetId, organization_id: org })));
      if (ins.error) throw new Error("SAVE_FAILED");
    }
    return { id: budgetId };
  });

export const deleteBudget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const { error } = await context.supabase.from("crm_budgets").delete().eq("id", data.id).eq("organization_id", m.organization_id);
    if (error) throw new Error("SAVE_FAILED");
    return { ok: true };
  });

export const saveDebt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => debtSchema.parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const { id, ...fields } = data;
    const res = id
      ? await context.supabase.from("crm_debts").update(fields).eq("id", id).eq("organization_id", m.organization_id).select("id").single()
      : await context.supabase.from("crm_debts").insert({ ...fields, organization_id: m.organization_id }).select("id").single();
    if (res.error) throw new Error("SAVE_FAILED");
    return { id: res.data.id };
  });

export const referDebt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ id: z.string().uuid(), referral_type: z.enum(REFERRALS), referral_note: z.string().trim().max(2000).default("") }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const { error } = await context.supabase
      .from("crm_debts")
      .update({ status: "referred", referral_type: data.referral_type, referral_note: data.referral_note })
      .eq("id", data.id)
      .eq("organization_id", m.organization_id);
    if (error) throw new Error("SAVE_FAILED");
    return { ok: true };
  });

export const addInstalments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({
      debt_id: z.string().uuid(),
      items: z.array(z.object({ due_date: day, amount: z.coerce.number().positive().max(10_000_000) })).min(1).max(120),
    }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const { error } = await context.supabase.from("crm_instalments").insert(
      data.items.map((i) => ({ debt_id: data.debt_id, due_date: i.due_date, amount: Math.round(i.amount * 100) / 100, organization_id: m.organization_id })),
    );
    if (error) throw new Error("SAVE_FAILED");
    return { ok: true };
  });

export const setInstalmentPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ id: z.string().uuid(), paid_at: day.nullable(), proof_path: z.string().max(500).nullable().default(null) }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const m = await member(context);
    if (data.proof_path && !data.proof_path.startsWith(`${m.organization_id}/`)) throw new Error("INVALID_PROOF");
    const { error } = await context.supabase
      .from("crm_instalments")
      .update({ paid_at: data.paid_at, ...(data.paid_at ? (data.proof_path ? { proof_path: data.proof_path } : {}) : { proof_path: null }) })
      .eq("id", data.id)
      .eq("organization_id", m.organization_id);
    if (error) throw new Error("SAVE_FAILED");
    return { ok: true };
  });

export const deleteInstalment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const { error } = await context.supabase.from("crm_instalments").delete().eq("id", data.id).eq("organization_id", m.organization_id);
    if (error) throw new Error("SAVE_FAILED");
    return { ok: true };
  });
