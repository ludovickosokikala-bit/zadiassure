import { z } from "zod";

/** Client-safe budget & debt rules (no money is ever received or held by ZADIASSURE). */
export const INCOME_CATEGORIES = ["salary", "unemployment", "sickness", "pension", "child", "alimony", "other"] as const;
export const FIXED_CATEGORIES = ["rent", "energy", "water", "insurance", "telecom", "transport", "school", "other"] as const;
export const VARIABLE_CATEGORIES = ["food", "other"] as const;
export const CREDITOR_TYPES = ["energy", "telecom", "health", "tax", "rent", "credit", "insurance", "other"] as const;
export const DEBT_STATUSES = ["new", "contacted", "plan_requested", "agreed", "refused", "paid_off", "referred"] as const;
export const REFERRALS = ["cpas", "mediation", "lawyer", "other"] as const;

const money = z.coerce.number().min(0).max(10_000_000).transform((v) => Math.round(v * 100) / 100);
export const debtSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  dossier_id: z.string().uuid().nullable().default(null),
  creditor: z.string().trim().min(1).max(200),
  creditor_type: z.enum(CREDITOR_TYPES),
  creditor_ref: z.string().trim().max(200).default(""),
  agency_name: z.string().trim().max(200).default(""),
  agency_ref: z.string().trim().max(200).default(""),
  contact: z.string().trim().max(300).default(""),
  original_amount: money,
  outstanding_amount: money,
  status: z.enum(DEBT_STATUSES),
  notes: z.string().trim().max(5000).default(""),
});
export const budgetLineSchema = z.object({
  kind: z.enum(["income", "fixed", "variable"]),
  category: z.string().trim().min(1).max(40),
  label: z.string().trim().max(200).default(""),
  amount: money,
});
export const budgetSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  label: z.string().trim().min(1).max(120),
  budget_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  lines: z.array(budgetLineSchema).max(200),
});

const cents = (v: number | string) => Math.round(Number(v) * 100);
export const round2 = (v: number) => Math.round(v * 100) / 100;

export function formatEUR(v: number | string) {
  const n = new Intl.NumberFormat("nl-BE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v) || 0);
  return `${n} €`;
}

type Line = { kind: string; amount: number | string };
export function budgetTotals(lines: Line[], monthlyInstalments: number) {
  const sum = (k: string[]) => lines.filter((l) => k.includes(l.kind)).reduce((s, l) => s + cents(l.amount), 0);
  const income = sum(["income"]);
  const expenses = sum(["fixed", "variable"]);
  const available = income - expenses;
  const room = available - cents(monthlyInstalments);
  return { income: income / 100, expenses: expenses / 100, available: available / 100, room: room / 100 };
}

type Inst = { due_date: string; amount: number | string; paid_at: string | null; debt_id: string };
/** "late" is automatic: due date passed and not marked paid by the client. */
export function instalmentStatus(i: { due_date: string; paid_at: string | null }, today: string) {
  if (i.paid_at) return "paid" as const;
  return i.due_date < today ? ("late" as const) : ("due" as const);
}

export function generateInstalments(amount: number, months: number, startDate: string) {
  const [y, m, d] = startDate.split("-").map(Number) as [number, number, number];
  return Array.from({ length: months }, (_, i) => {
    const last = new Date(y, m - 1 + i + 1, 0).getDate();
    const dt = new Date(y, m - 1 + i, Math.min(d, last));
    const p = (n: number) => String(n).padStart(2, "0");
    return { due_date: `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`, amount: round2(amount) };
  });
}

/** Sum of planned instalments per month for active (non-closed) debts: open instalments in the current month. */
export function monthlyInstalmentTotal(instalments: Inst[], activeDebtIds: Set<string>, month: string) {
  return (
    instalments
      .filter((i) => activeDebtIds.has(i.debt_id) && i.due_date.slice(0, 7) === month)
      .reduce((s, i) => s + cents(i.amount), 0) / 100
  );
}

type DebtRow = { id: string; original_amount: number | string; outstanding_amount: number | string; created_at: string; status: string };
export function debtSummary(debts: DebtRow[]) {
  const original = debts.reduce((s, d) => s + cents(d.original_amount), 0);
  const outstanding = debts.reduce((s, d) => s + cents(d.outstanding_amount), 0);
  return {
    original: original / 100,
    outstanding: outstanding / 100,
    paidPct: original > 0 ? Math.round(((original - outstanding) / original) * 1000) / 10 : 0,
  };
}

/** Month-end outstanding totals from the first debt until now, replaying paid instalments. */
export function outstandingSeries(debts: DebtRow[], instalments: Inst[], today: string) {
  if (!debts.length) return [];
  const first = debts.map((d) => d.created_at.slice(0, 7)).sort()[0]!;
  const paidTotal = new Map<string, number>();
  for (const i of instalments) if (i.paid_at) paidTotal.set(i.debt_id, (paidTotal.get(i.debt_id) ?? 0) + cents(i.amount));
  // Reductions not explained by instalments (manual corrections) are applied from the start.
  const base = debts.map((d) => ({ d, start: cents(d.original_amount) - Math.max(0, cents(d.original_amount) - cents(d.outstanding_amount) - (paidTotal.get(d.id) ?? 0)) }));
  const out: { month: string; value: number }[] = [];
  let [y, m] = first.split("-").map(Number) as [number, number];
  const end = today.slice(0, 7);
  for (let guard = 0; guard < 240; guard++) {
    const month = `${y}-${String(m).padStart(2, "0")}`;
    let total = 0;
    for (const { d, start } of base) {
      if (d.created_at.slice(0, 7) > month) continue;
      const paid = instalments.filter((i) => i.debt_id === d.id && i.paid_at && i.paid_at.slice(0, 7) <= month).reduce((s, i) => s + cents(i.amount), 0);
      total += Math.max(0, start - paid);
    }
    out.push({ month, value: total / 100 });
    if (month >= end) break;
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return out;
}
