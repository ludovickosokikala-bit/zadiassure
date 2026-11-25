import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Copy, Pencil, Plus, Printer, Trash2, Wallet, Info, Send, CheckCircle2, Undo2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { displayClient } from "@/lib/foundation.schemas";
import {
  CREDITOR_TYPES,
  DEBT_STATUSES,
  FIXED_CATEGORIES,
  INCOME_CATEGORIES,
  REFERRALS,
  VARIABLE_CATEGORIES,
  budgetSchema,
  budgetTotals,
  debtSchema,
  debtSummary,
  formatEUR,
  generateInstalments,
  instalmentStatus,
  monthlyInstalmentTotal,
  outstandingSeries,
} from "@/lib/debtCore";
import {
  addInstalments,
  deleteBudget,
  deleteInstalment,
  getDebtData,
  referDebt,
  saveBudget,
  saveDebt,
  setInstalmentPaid,
} from "@/lib/debts.functions";
import { useFoundation, dateLabel } from "./context";
import { CrmModal, EmptyState, Field } from "./ui";
import { crmDictionary, type CrmLanguage } from "./dictionary";
import logoLight from "@/assets/zadiassure-mark-transparent.png.asset.json";

export const debtQuery = () => queryOptions({ queryKey: ["crm-debts"], queryFn: () => getDebtData(), staleTime: 0 });
type DebtData = Awaited<ReturnType<typeof getDebtData>>;
type Debt = DebtData["debts"][number];
type Inst = DebtData["instalments"][number];
type Budget = DebtData["budgets"][number];
type LineDraft = { kind: "income" | "fixed" | "variable"; category: string; label: string; amount: string };

export function todayIso() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const thisMonth = () => todayIso().slice(0, 7);
const ACTIVE = (s: string) => s !== "paid_off" && s !== "referred" && s !== "refused";

function useDebtRefresh() {
  const qc = useQueryClient();
  return async () => {
    await Promise.all([qc.invalidateQueries({ queryKey: ["crm-debts"] }), qc.invalidateQueries({ queryKey: ["crm-foundation"] })]);
  };
}

export function LegalNote({ text }: { text: string }) {
  return (
    <p className="crm-legal-note">
      <Info className="size-4 shrink-0" />
      {text}
    </p>
  );
}

function clientMath(data: DebtData | undefined, clientId: string, budgetId?: string) {
  const debts = data?.debts.filter((d) => d.client_id === clientId) ?? [];
  const ids = new Set(debts.map((d) => d.id));
  const inst = data?.instalments.filter((i) => ids.has(i.debt_id)) ?? [];
  const active = new Set(debts.filter((d) => ACTIVE(d.status)).map((d) => d.id));
  const monthly = monthlyInstalmentTotal(inst, active, thisMonth());
  const budgets = data?.budgets.filter((b) => b.client_id === clientId) ?? [];
  const current = budgets.find((b) => b.id === budgetId) ?? budgets[0];
  const lines = current ? (data?.lines.filter((l) => l.budget_id === current.id) ?? []) : [];
  return { debts, inst, monthly, budgets, current, lines };
}

/* ---------------- Budget ---------------- */

export function BudgetPanel({ clientId }: { clientId: string }) {
  const { c, language } = useFoundation();
  const t = c.debtUi;
  const { data } = useQuery(debtQuery());
  const [selected, setSelected] = useState<string | undefined>();
  const [form, setForm] = useState<{ budget?: Budget; copy?: boolean } | null>(null);
  const del = useServerFn(deleteBudget);
  const refresh = useDebtRefresh();
  const { budgets, current, lines, monthly } = clientMath(data, clientId, selected);
  if (!data) return <p className="text-sm text-muted-foreground">…</p>;
  const totals = budgetTotals(lines, monthly);
  const group = (kind: string, title: string, cats: Record<string, string>) => {
    const rows = lines.filter((l) => l.kind === kind);
    return (
      <section className="crm-card p-5">
        <h3 className="mb-3 text-sm font-semibold">{title}</h3>
        {rows.length ? (
          <ul className="divide-y divide-border text-sm">
            {rows.map((l) => (
              <li key={l.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2">
                <span className="min-w-0 truncate">
                  {cats[l.category] ?? l.category}
                  {l.label && <span className="text-muted-foreground"> · {l.label}</span>}
                </span>
                <span className="tabular-nums">{formatEUR(l.amount)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </section>
    );
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {budgets.length > 0 && (
          <select className="crm-select max-w-xs" value={current?.id} onChange={(e) => setSelected(e.target.value)} aria-label={t.versions}>
            {budgets.map((b) => (
              <option key={b.id} value={b.id}>
                {dateLabel(b.budget_date, language)} · {b.label}
              </option>
            ))}
          </select>
        )}
        <Button onClick={() => setForm(current ? { budget: current, copy: true } : {})}>
          {current ? <Copy /> : <Plus />}
          {current ? t.copyVersion : t.newVersion}
        </Button>
        {current && (
          <>
            <Button variant="secondary" size="icon" title={t.editVersion} aria-label={t.editVersion} onClick={() => setForm({ budget: current })}>
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title={t.deleteVersion}
              aria-label={t.deleteVersion}
              onClick={() => {
                if (window.confirm(t.deleteVersion + "?")) void del({ data: { id: current.id } }).then(refresh).then(() => setSelected(undefined));
              }}
            >
              <Trash2 />
            </Button>
          </>
        )}
      </div>
      {!current ? (
        <EmptyState icon={<Wallet />} text={t.noBudget} />
      ) : (
        <>
          <div className="crm-metrics">
            {[
              [t.totalIncome, totals.income],
              [t.totalExpenses, totals.expenses],
              [t.available, totals.available],
              [t.roomAfter, totals.room],
            ].map(([label, v]) => (
              <div key={label as string} className="crm-card crm-metric">
                <span>{label}</span>
                <strong className={`text-2xl tabular-nums ${(v as number) < 0 ? "text-destructive" : ""}`}>{formatEUR(v as number)}</strong>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {t.instalmentsMonth}: {formatEUR(monthly)}
          </p>
          {totals.room < 0 && (
            <p role="alert" className="crm-warning-note">
              <AlertTriangle className="size-4 shrink-0" />
              {t.negativeWarning}
            </p>
          )}
          <div className="grid gap-4 lg:grid-cols-3">
            {group("income", t.income, t.incomeCats)}
            {group("fixed", t.fixed, t.fixedCats)}
            {group("variable", t.variable, t.variableCats)}
          </div>
        </>
      )}
      {form && (
        <BudgetForm
          clientId={clientId}
          budget={form.budget}
          copy={form.copy ?? false}
          lines={form.budget ? data.lines.filter((l) => l.budget_id === form.budget!.id) : []}
          onClose={() => setForm(null)}
          onSaved={(id) => setSelected(id)}
        />
      )}
    </div>
  );
}

function BudgetForm({
  clientId,
  budget,
  copy,
  lines,
  onClose,
  onSaved,
}: {
  clientId: string;
  budget?: Budget | undefined;
  copy: boolean;
  lines: DebtData["lines"];
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { c } = useFoundation();
  const t = c.debtUi;
  const save = useServerFn(saveBudget);
  const refresh = useDebtRefresh();
  const [label, setLabel] = useState(copy ? "" : (budget?.label ?? t.labelStart));
  const [date, setDate] = useState(copy || !budget ? todayIso() : budget.budget_date);
  const [rows, setRows] = useState<LineDraft[]>(
    lines.length
      ? lines.map((l) => ({ kind: l.kind as LineDraft["kind"], category: l.category, label: l.label, amount: String(l.amount) }))
      : [
          { kind: "income", category: "salary", label: "", amount: "" },
          { kind: "fixed", category: "rent", label: "", amount: "" },
          { kind: "variable", category: "food", label: "", amount: "" },
        ],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const cats = { income: [INCOME_CATEGORIES, t.incomeCats], fixed: [FIXED_CATEGORIES, t.fixedCats], variable: [VARIABLE_CATEGORIES, t.variableCats] } as const;
  const preview = budgetTotals(rows.map((r) => ({ kind: r.kind, amount: Number(r.amount.replace(",", ".")) || 0 })), 0);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = budgetSchema.safeParse({
      ...(budget && !copy ? { id: budget.id } : {}),
      client_id: clientId,
      label,
      budget_date: date,
      lines: rows.filter((r) => r.amount.trim()).map((r) => ({ ...r, amount: r.amount.replace(",", ".") })),
    });
    if (!parsed.success) {
      setError(c.required);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await save({ data: parsed.data });
      await refresh();
      onSaved(res.id);
      onClose();
    } catch {
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <CrmModal open onClose={onClose} title={budget && !copy ? t.editVersion : t.newVersion}>
      <form onSubmit={submit} className="max-h-[75dvh] space-y-5 overflow-y-auto pr-1">
        <div className="crm-form-grid">
          <Field label={`${t.label} *`}>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} required maxLength={120} placeholder="Opvolging 3 maanden" />
          </Field>
          <Field label={t.date}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>
        </div>
        {(["income", "fixed", "variable"] as const).map((kind) => (
          <section key={kind}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{t[kind]}</h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => setRows([...rows, { kind, category: cats[kind][0][0], label: "", amount: "" }])}>
                <Plus />
                {t.addLine}
              </Button>
            </div>
            <div className="space-y-2">
              {rows.map((r, i) =>
                r.kind !== kind ? null : (
                  <div key={i} className="crm-budget-line">
                    <select className="crm-select" aria-label={t.creditorType} value={r.category} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)))}>
                      {cats[kind][0].map((k) => (
                        <option key={k} value={k}>
                          {(cats[kind][1] as Record<string, string>)[k]}
                        </option>
                      ))}
                    </select>
                    <Input aria-label={t.description} placeholder={t.description} value={r.label} maxLength={200} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                    <Input aria-label={t.amountMonth} placeholder="0,00" inputMode="decimal" value={r.amount} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} />
                    <Button type="button" variant="ghost" size="icon" aria-label={t.remove} onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                      <Trash2 />
                    </Button>
                  </div>
                ),
              )}
            </div>
          </section>
        ))}
        <p className="text-sm">
          {t.available}: <strong className={preview.available < 0 ? "text-destructive" : ""}>{formatEUR(preview.available)}</strong>
        </p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>{c.cancel}</Button>
          <Button type="submit" disabled={busy}>{busy ? c.saving : c.save}</Button>
        </div>
      </form>
    </CrmModal>
  );
}

/* ---------------- Debts ---------------- */

function Chart({ points, label }: { points: { month: string; value: number }[]; label: string }) {
  if (points.length < 2) return null;
  const max = Math.max(...points.map((p) => p.value), 1);
  const w = 600;
  const h = 140;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * w, h - (p.value / max) * (h - 10) - 5] as const);
  const path = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <figure className="crm-card p-5">
      <figcaption className="mb-3 text-sm font-semibold">{label}</figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full" role="img" aria-label={label} preserveAspectRatio="none">
        <path d={`${path} L${w},${h} L0,${h} Z`} className="crm-chart-area" />
        <path d={path} className="crm-chart-line" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{points[0]!.month}</span>
        <span>{formatEUR(points[points.length - 1]!.value)}</span>
        <span>{points[points.length - 1]!.month}</span>
      </div>
    </figure>
  );
}

export function DebtsPanel({ clientId, dossierId }: { clientId: string; dossierId?: string }) {
  const { c, language } = useFoundation();
  const t = c.debtUi;
  const { data } = useQuery(debtQuery());
  const [form, setForm] = useState<{ debt?: Debt } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const today = todayIso();
  const { debts: all, inst, monthly } = clientMath(data, clientId);
  const debts = dossierId ? all.filter((d) => d.dossier_id === dossierId || !d.dossier_id) : all;
  const sum = debtSummary(debts);
  const series = useMemo(() => outstandingSeries(debts, inst, today), [debts, inst, today]);
  if (!data) return <p className="text-sm text-muted-foreground">…</p>;
  const next = inst.filter((i) => !i.paid_at && debts.some((d) => d.id === i.debt_id)).slice(0, 4);
  return (
    <div className="space-y-6">
      <LegalNote text={t.legalNote} />
      <div className="flex flex-wrap justify-end gap-2">
        <Button asChild variant="secondary">
          <Link to="/crm/print/$id" params={{ id: clientId }}>
            <Printer />
            {t.print}
          </Link>
        </Button>
        <Button onClick={() => setForm({})}>
          <Plus />
          {t.newDebt}
        </Button>
      </div>
      <div className="crm-metrics">
        {[
          [t.totalOriginal, formatEUR(sum.original)],
          [t.totalOutstanding, formatEUR(sum.outstanding)],
          [t.paidPct, `${sum.paidPct.toLocaleString("nl-BE")} %`],
          [t.monthlyTotal, formatEUR(monthly)],
        ].map(([l, v]) => (
          <div key={l} className="crm-card crm-metric">
            <span>{l}</span>
            <strong className="text-2xl tabular-nums">{v}</strong>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Chart points={series} label={t.chart} />
        {next.length > 0 && (
          <section className="crm-card p-5">
            <h3 className="mb-3 text-sm font-semibold">{t.nextDue}</h3>
            <ul className="space-y-2 text-sm">
              {next.map((i) => {
                const st = instalmentStatus(i, today);
                return (
                  <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <span className="min-w-0 truncate">
                      {dateLabel(i.due_date, language)} · {debts.find((d) => d.id === i.debt_id)?.creditor}
                    </span>
                    <span className={st === "late" ? "text-destructive" : ""}>{formatEUR(i.amount)}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
      {debts.length === 0 ? (
        <EmptyState icon={<Wallet />} text={t.noDebts} />
      ) : (
        <div className="space-y-3">
          {debts.map((d) => (
            <DebtCard key={d.id} debt={d} instalments={inst.filter((i) => i.debt_id === d.id)} open={open === d.id} onToggle={() => setOpen(open === d.id ? null : d.id)} onEdit={() => setForm({ debt: d })} />
          ))}
        </div>
      )}
      {form && <DebtForm clientId={clientId} debt={form.debt} dossierId={dossierId} onClose={() => setForm(null)} />}
    </div>
  );
}

function DebtCard({ debt, instalments, open, onToggle, onEdit }: { debt: Debt; instalments: Inst[]; open: boolean; onToggle: () => void; onEdit: () => void }) {
  const { c, data } = useFoundation();
  const t = c.debtUi;
  const [refer, setRefer] = useState(false);
  const dossier = data.dossiers.find((v) => v.id === debt.dossier_id);
  return (
    <article className="crm-card">
      <button type="button" className="crm-list-row w-full text-left" onClick={onToggle} aria-expanded={open}>
        <div className="min-w-0">
          <strong>{debt.creditor}</strong>
          <small>
            {t.types[debt.creditor_type as keyof typeof t.types]}
            {debt.creditor_ref && ` · ${debt.creditor_ref}`}
            {dossier && ` · ${dossier.number}`}
          </small>
        </div>
        <div className="text-right">
          <p className="tabular-nums font-medium">{formatEUR(debt.outstanding_amount)}</p>
          <span className={`crm-status crm-debt-${debt.status} mt-1`}>{t.statuses[debt.status as keyof typeof t.statuses]}</span>
        </div>
      </button>
      {open && (
        <div className="space-y-5 border-t border-border p-5">
          <dl className="crm-details">
            {[
              [t.original, formatEUR(debt.original_amount)],
              [t.agency, [debt.agency_name, debt.agency_ref].filter(Boolean).join(" · ")],
              [t.contact, debt.contact],
              ...(debt.status === "referred" ? [[t.referTo, `${t.referrals[debt.referral_type as keyof typeof t.referrals] ?? ""} ${debt.referral_note}`]] : []),
            ].map(([l, v]) => (
              <div key={l}>
                <dt>{l}</dt>
                <dd className="break-words">{v || "—"}</dd>
              </div>
            ))}
          </dl>
          {debt.notes && <p className="whitespace-pre-wrap break-words text-sm">{debt.notes}</p>}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onEdit}>
              <Pencil />
              {c.edit}
            </Button>
            {debt.status !== "referred" && (
              <Button variant="secondary" onClick={() => setRefer(true)}>
                <Send />
                {t.refer}
              </Button>
            )}
          </div>
          <InstalmentList debt={debt} instalments={instalments} />
        </div>
      )}
      {refer && <ReferForm debt={debt} onClose={() => setRefer(false)} />}
    </article>
  );
}

function InstalmentList({ debt, instalments }: { debt: Debt; instalments: Inst[] }) {
  const { c, language } = useFoundation();
  const t = c.debtUi;
  const today = todayIso();
  const [adding, setAdding] = useState<"one" | "gen" | null>(null);
  const [paying, setPaying] = useState<Inst | null>(null);
  const setPaid = useServerFn(setInstalmentPaid);
  const remove = useServerFn(deleteInstalment);
  const refresh = useDebtRefresh();
  const [error, setError] = useState(false);
  const run = (p: Promise<unknown>) => {
    setError(false);
    void p.then(refresh).catch(() => setError(true));
  };
  async function openProof(path: string) {
    const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 120);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  }
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t.instalments}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setAdding("gen")}>{t.generate}</Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding("one")}>
            <Plus />
            {t.addInstalment}
          </Button>
        </div>
      </div>
      {instalments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.noInstalments}</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border text-sm">
          {instalments.map((i) => {
            const st = instalmentStatus(i, today);
            return (
              <li key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:grid-cols-[8rem_7rem_minmax(0,1fr)_auto]">
                <span>{dateLabel(i.due_date, language)}</span>
                <span className="tabular-nums">{formatEUR(i.amount)}</span>
                <span className="col-span-2 sm:col-span-1">
                  <span className={`crm-status crm-inst-${st}`}>{t.instStatus[st]}</span>
                  {i.paid_at && <span className="ml-2 text-xs text-muted-foreground">{t.paidOn} {dateLabel(i.paid_at, language)}</span>}
                </span>
                <span className="col-span-2 flex justify-end gap-1 sm:col-span-1">
                  {i.proof_path && (
                    <Button size="icon" variant="ghost" title={t.viewProof} aria-label={t.viewProof} onClick={() => void openProof(i.proof_path!)}>
                      <Paperclip />
                    </Button>
                  )}
                  {i.paid_at ? (
                    <Button size="icon" variant="ghost" title={t.undoPaid} aria-label={t.undoPaid} onClick={() => run(setPaid({ data: { id: i.id, paid_at: null, proof_path: null } }))}>
                      <Undo2 />
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setPaying(i)}>
                      <CheckCircle2 />
                      {t.markPaid}
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" title={t.remove} aria-label={t.remove} onClick={() => run(remove({ data: { id: i.id } }))}>
                    <Trash2 />
                  </Button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{c.failed}</p>}
      {adding && <InstalmentForm debt={debt} mode={adding} onClose={() => setAdding(null)} />}
      {paying && <PaidForm inst={paying} onClose={() => setPaying(null)} />}
    </section>
  );
}

function InstalmentForm({ debt, mode, onClose }: { debt: Debt; mode: "one" | "gen"; onClose: () => void }) {
  const { c } = useFoundation();
  const t = c.debtUi;
  const add = useServerFn(addInstalments);
  const refresh = useDebtRefresh();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const amount = Number(String(f.get("amount") ?? "").replace(",", "."));
    const start = String(f.get("start") ?? "");
    const months = mode === "gen" ? Number(f.get("months")) : 1;
    if (!(amount > 0) || !start || !(months >= 1 && months <= 120)) {
      setError(c.required);
      return;
    }
    setBusy(true);
    try {
      await add({ data: { debt_id: debt.id, items: generateInstalments(amount, months, start) } });
      await refresh();
      onClose();
    } catch {
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <CrmModal open onClose={onClose} title={mode === "gen" ? t.generate : t.addInstalment}>
      <form onSubmit={submit} className="space-y-5">
        <div className="crm-form-grid">
          <Field label={`${t.amount} *`}>
            <Input name="amount" inputMode="decimal" placeholder="0,00" required />
          </Field>
          <Field label={`${mode === "gen" ? t.startDate : t.dueDate} *`}>
            <Input name="start" type="date" defaultValue={todayIso()} required />
          </Field>
          {mode === "gen" && (
            <Field label={`${t.months} *`}>
              <Input name="months" type="number" min={1} max={120} defaultValue={6} required />
            </Field>
          )}
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>{c.cancel}</Button>
          <Button type="submit" disabled={busy}>{busy ? c.saving : c.save}</Button>
        </div>
      </form>
    </CrmModal>
  );
}

function PaidForm({ inst, onClose }: { inst: Inst; onClose: () => void }) {
  const { c } = useFoundation();
  const t = c.debtUi;
  const { data } = useQuery(debtQuery());
  const setPaid = useServerFn(setInstalmentPaid);
  const refresh = useDebtRefresh();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const paidAt = String(f.get("paid_at") ?? "");
    const file = f.get("proof");
    setBusy(true);
    setError("");
    try {
      let proofPath: string | null = null;
      if (file instanceof File && file.size > 0) {
        if (file.size > 10 * 1024 * 1024) throw new Error("TOO_BIG");
        const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
        proofPath = `${data!.organizationId}/${inst.debt_id}/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from("payment-proofs").upload(proofPath, file, { contentType: file.type });
        if (up.error) throw up.error;
      }
      await setPaid({ data: { id: inst.id, paid_at: paidAt, proof_path: proofPath } });
      await refresh();
      onClose();
    } catch {
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <CrmModal open onClose={onClose} title={`${t.markPaid} · ${formatEUR(inst.amount)}`}>
      <form onSubmit={submit} className="space-y-5">
        <Field label={`${t.paidOn} *`}>
          <Input name="paid_at" type="date" defaultValue={todayIso()} required />
        </Field>
        <Field label={t.proof}>
          <Input name="proof" type="file" accept="application/pdf,image/*" />
        </Field>
        <LegalNote text={t.legalNote} />
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>{c.cancel}</Button>
          <Button type="submit" disabled={busy}>{busy ? c.saving : c.save}</Button>
        </div>
      </form>
    </CrmModal>
  );
}

function ReferForm({ debt, onClose }: { debt: Debt; onClose: () => void }) {
  const { c } = useFoundation();
  const t = c.debtUi;
  const refer = useServerFn(referDebt);
  const refresh = useDebtRefresh();
  const [type, setType] = useState<(typeof REFERRALS)[number]>("cpas");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  return (
    <CrmModal open onClose={onClose} title={`${t.refer} · ${debt.creditor}`}>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          void refer({ data: { id: debt.id, referral_type: type, referral_note: note } })
            .then(refresh)
            .then(onClose)
            .catch(() => setError(true))
            .finally(() => setBusy(false));
        }}
      >
        <Field label={t.referTo}>
          <select className="crm-select" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            {REFERRALS.map((r) => (
              <option key={r} value={r}>{t.referrals[r]}</option>
            ))}
          </select>
        </Field>
        <Field label={t.referNote}>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={2000} />
        </Field>
        {error && <p role="alert" className="text-sm text-destructive">{c.failed}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>{c.cancel}</Button>
          <Button type="submit" disabled={busy}>{t.refer}</Button>
        </div>
      </form>
    </CrmModal>
  );
}

function DebtForm({ clientId, debt, dossierId, onClose }: { clientId: string; debt?: Debt | undefined; dossierId?: string | undefined; onClose: () => void }) {
  const { c, data } = useFoundation();
  const t = c.debtUi;
  const save = useServerFn(saveDebt);
  const refresh = useDebtRefresh();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bud = data.dossiers.filter((d) => d.client_id === clientId && d.service === "BUD");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "").trim();
    const original = g("original_amount").replace(",", ".");
    const parsed = debtSchema.safeParse({
      ...(debt ? { id: debt.id } : {}),
      client_id: clientId,
      dossier_id: g("dossier_id") || null,
      creditor: g("creditor"),
      creditor_type: g("creditor_type"),
      creditor_ref: g("creditor_ref"),
      agency_name: g("agency_name"),
      agency_ref: g("agency_ref"),
      contact: g("contact"),
      original_amount: original,
      outstanding_amount: (g("outstanding_amount") || original).replace(",", "."),
      status: g("status"),
      notes: g("notes"),
    });
    if (!parsed.success) {
      setError(c.required);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await save({ data: parsed.data });
      await refresh();
      onClose();
    } catch {
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <CrmModal open onClose={onClose} title={debt ? t.editDebt : t.newDebt}>
      <form onSubmit={submit} className="max-h-[75dvh] space-y-5 overflow-y-auto pr-1">
        <div className="crm-form-grid">
          <Field label={`${t.creditor} *`}><Input name="creditor" required maxLength={200} defaultValue={debt?.creditor} /></Field>
          <Field label={t.creditorType}>
            <select className="crm-select" name="creditor_type" defaultValue={debt?.creditor_type ?? "other"}>
              {CREDITOR_TYPES.map((v) => <option key={v} value={v}>{t.types[v]}</option>)}
            </select>
          </Field>
          <Field label={t.creditorRef}><Input name="creditor_ref" maxLength={200} defaultValue={debt?.creditor_ref} /></Field>
          <Field label={t.contact}><Input name="contact" maxLength={300} defaultValue={debt?.contact} /></Field>
          <Field label={t.agency}><Input name="agency_name" maxLength={200} defaultValue={debt?.agency_name} /></Field>
          <Field label={t.agencyRef}><Input name="agency_ref" maxLength={200} defaultValue={debt?.agency_ref} /></Field>
          <Field label={`${t.original} *`}><Input name="original_amount" inputMode="decimal" required defaultValue={debt ? String(debt.original_amount) : ""} placeholder="0,00" /></Field>
          <Field label={t.outstanding}><Input name="outstanding_amount" inputMode="decimal" defaultValue={debt ? String(debt.outstanding_amount) : ""} placeholder="0,00" /></Field>
          <Field label={t.status}>
            <select className="crm-select" name="status" defaultValue={debt?.status ?? "new"}>
              {DEBT_STATUSES.map((v) => <option key={v} value={v}>{t.statuses[v]}</option>)}
            </select>
          </Field>
          <Field label={t.budDossier}>
            <select className="crm-select" name="dossier_id" defaultValue={debt?.dossier_id ?? dossierId ?? ""}>
              <option value="">{t.noneOption}</option>
              {bud.map((d) => <option key={d.id} value={d.id}>{d.number} · {d.title}</option>)}
            </select>
          </Field>
        </div>
        <Field label={t.notes}><Textarea name="notes" rows={3} maxLength={5000} defaultValue={debt?.notes} /></Field>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>{c.cancel}</Button>
          <Button type="submit" disabled={busy}>{busy ? c.saving : c.save}</Button>
        </div>
      </form>
    </CrmModal>
  );
}

/* ---------------- Today ---------------- */

export function WeekPayments() {
  const { c, data: f, language } = useFoundation();
  const t = c.debtUi;
  const { data } = useQuery(debtQuery());
  if (!data) return null;
  const today = todayIso();
  const end = new Date();
  end.setDate(end.getDate() + 7);
  const endIso = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
  const debts = new Map(data.debts.map((d) => [d.id, d]));
  const rows = data.instalments.filter((i) => !i.paid_at && i.due_date <= endIso && ACTIVE(debts.get(i.debt_id)?.status ?? ""));
  return (
    <section className="mb-9">
      <h2 className="crm-section-title">{t.weekPayments}</h2>
      {rows.length ? (
        <div className="crm-card">
          {rows.slice(0, 12).map((i) => {
            const d = debts.get(i.debt_id)!;
            const client = f.clients.find((k) => k.id === d.client_id);
            const st = instalmentStatus(i, today);
            return (
              <Link key={i.id} to="/crm/clients/$id" params={{ id: d.client_id }} className="crm-list-row">
                <div className="min-w-0">
                  <strong>{client ? displayClient(client) : "—"}</strong>
                  <small>{d.creditor} · {dateLabel(i.due_date, language)}</small>
                </div>
                <div className="text-right">
                  <p className="tabular-nums">{formatEUR(i.amount)}</p>
                  <span className={`crm-status crm-inst-${st} mt-1`}>{t.instStatus[st]}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t.noWeekPayments}</p>
      )}
    </section>
  );
}

/* ---------------- Print ---------------- */

export function PrintOverview({ clientId, lang }: { clientId: string; lang: CrmLanguage }) {
  const { data: f } = useFoundation();
  const t = crmDictionary[lang].debtUi;
  const { data } = useQuery(debtQuery());
  const client = f.clients.find((k) => k.id === clientId);
  if (!client || !data) return null;
  const { debts, inst, monthly, current, lines } = clientMath(data, clientId);
  const totals = budgetTotals(lines, monthly);
  const sum = debtSummary(debts);
  const today = todayIso();
  const catLabel = (kind: string, cat: string) =>
    ((kind === "income" ? t.incomeCats : kind === "fixed" ? t.fixedCats : t.variableCats) as Record<string, string>)[cat] ?? cat;
  return (
    <article className="crm-print" lang={lang}>
      <header className="flex items-start justify-between gap-6 border-b pb-5">
        <div>
          <h1 className="text-2xl font-semibold">{displayClient(client)}</h1>
          <p className="text-sm">{client.number} · {dateLabel(today, lang)}</p>
        </div>
        <div className="text-right text-xs leading-5">
          <PrintLogo />
          <p className="font-semibold">ZADIASSURE</p>
          <p>Kortrijkstraat 145, 8560 Wevelgem</p>
          <p>BE 0783.444.650</p>
        </div>
      </header>
      <p className="my-5 rounded-lg border p-3 text-sm">{t.legalNote}</p>
      <h2>{t.budget}{current ? ` — ${current.label} (${dateLabel(current.budget_date, lang)})` : ""}</h2>
      {current ? (
        <table>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id}>
                <td>{t[l.kind as "income" | "fixed" | "variable"]}</td>
                <td>{catLabel(l.kind, l.category)}{l.label ? ` · ${l.label}` : ""}</td>
                <td className="num">{formatEUR(l.amount)}</td>
              </tr>
            ))}
            <tr className="total"><td colSpan={2}>{t.totalIncome}</td><td className="num">{formatEUR(totals.income)}</td></tr>
            <tr className="total"><td colSpan={2}>{t.totalExpenses}</td><td className="num">{formatEUR(totals.expenses)}</td></tr>
            <tr className="total"><td colSpan={2}>{t.available}</td><td className="num">{formatEUR(totals.available)}</td></tr>
            <tr className="total"><td colSpan={2}>{t.instalmentsMonth}</td><td className="num">{formatEUR(monthly)}</td></tr>
            <tr className="total"><td colSpan={2}>{t.roomAfter}</td><td className="num">{formatEUR(totals.room)}</td></tr>
          </tbody>
        </table>
      ) : (
        <p>{t.noBudget}</p>
      )}
      <h2>{t.debts}</h2>
      <p className="text-sm">
        {t.totalOriginal}: {formatEUR(sum.original)} · {t.totalOutstanding}: {formatEUR(sum.outstanding)} · {t.paidPct}: {sum.paidPct.toLocaleString("nl-BE")} %
      </p>
      <table>
        <thead>
          <tr><th>{t.creditor}</th><th>{t.status}</th><th className="num">{t.original}</th><th className="num">{t.outstanding}</th></tr>
        </thead>
        <tbody>
          {debts.map((d) => (
            <tr key={d.id}>
              <td>{d.creditor}{d.creditor_ref ? ` (${d.creditor_ref})` : ""}{d.agency_name ? ` — ${d.agency_name}` : ""}</td>
              <td>{t.statuses[d.status as keyof typeof t.statuses]}</td>
              <td className="num">{formatEUR(d.original_amount)}</td>
              <td className="num">{formatEUR(d.outstanding_amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>{t.instalments}</h2>
      {inst.length ? (
        <table>
          <thead>
            <tr><th>{t.dueDate}</th><th>{t.creditor}</th><th>{t.status}</th><th className="num">{t.amount}</th></tr>
          </thead>
          <tbody>
            {inst.map((i) => {
              const st = instalmentStatus(i, today);
              return (
                <tr key={i.id}>
                  <td>{dateLabel(i.due_date, lang)}</td>
                  <td>{debts.find((d) => d.id === i.debt_id)?.creditor}</td>
                  <td>{t.instStatus[st]}{i.paid_at ? ` (${dateLabel(i.paid_at, lang)})` : ""}</td>
                  <td className="num">{formatEUR(i.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>{t.noInstalments}</p>
      )}
      <footer className="mt-8 border-t pt-3 text-xs">ZADIASSURE · Kortrijkstraat 145, 8560 Wevelgem · BE 0783.444.650 — {t.legalNote}</footer>
    </article>
  );
}

function PrintLogo() {
  return <img src={logoLight.url} alt="ZADIASSURE" width={44} height={44} className="mb-1 ml-auto size-11 object-contain" />;
}
