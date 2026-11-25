import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Paperclip, Plus, Scale, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { displayClient, isOpenDossier } from "@/lib/foundation.schemas";
import {
  DECISIONS, DOC_STATUSES, PROCEDURE_TYPES, STEP_STATUSES,
  checklistProgress, defaultTemplate, immAlerts, type ImmAlert, type ProcedureType,
} from "@/lib/immCore";
import {
  deleteImmDocument, deleteImmPerson, deleteImmStep, getImmData, referImmLawyer,
  saveImmDocument, saveImmPerson, saveImmStep, saveImmTemplate, saveProcedure,
} from "@/lib/imm.functions";
import { useFoundation, dateLabel } from "./context";
import { CrmModal, EmptyState, Field } from "./ui";
import { LegalNote, todayIso } from "./Debts";

export const immQuery = () => queryOptions({ queryKey: ["crm-imm"], queryFn: () => getImmData(), staleTime: 0 });
type ImmData = Awaited<ReturnType<typeof getImmData>>;
type Step = ImmData["steps"][number];
type Doc = ImmData["documents"][number];
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

function useRun() {
  const qc = useQueryClient();
  const [error, setError] = useState(false);
  const run = (p: Promise<unknown>) => {
    setError(false);
    return p
      .then(() => Promise.all([qc.invalidateQueries({ queryKey: ["crm-imm"] }), qc.invalidateQueries({ queryKey: ["crm-foundation"] })]))
      .catch(() => setError(true));
  };
  return { run, error };
}

function templateFor(data: ImmData, type: ProcedureType, lang: "nl" | "fr") {
  return data.templates.find((t) => t.procedure_type === type) ?? defaultTemplate(type, lang);
}

export function useImmAlerts() {
  const { data: f } = useFoundation();
  const { data } = useQuery(immQuery());
  if (!data) return [] as ImmAlert[];
  const open = new Set(f.dossiers.filter((d) => d.service === "IMM" && isOpenDossier(d.status)).map((d) => d.id));
  return immAlerts(data.procedures, data.persons, open, todayIso());
}

function alertText(a: ImmAlert, c: ReturnType<typeof useFoundation>["c"], name: string) {
  const t = c.immUi;
  if (a.kind === "appeal") return fill(t.appealIn, { d: a.days });
  return `${name}${a.label ? ` · ${a.label}` : ""}: ${a.level === "expired" ? t.expired : fill(t.expiryIn, { d: a.days })}`;
}

export function ImmAlertsBlock() {
  const { c, data: f, language } = useFoundation();
  const alerts = useImmAlerts();
  const t = c.immUi;
  return (
    <section className="mb-9">
      <h2 className="crm-section-title">{t.alerts}</h2>
      {alerts.length ? (
        <div className="crm-card">
          {alerts.slice(0, 12).map((a, i) => {
            const d = f.dossiers.find((x) => x.id === a.dossierId);
            const person = f.clients.find((x) => x.id === a.personId);
            return (
              <Link key={i} to="/crm/cases/$id" params={{ id: a.dossierId }} className="crm-list-row">
                <div className="min-w-0">
                  <strong>{alertText(a, c, person ? displayClient(person) : "")}</strong>
                  <small>{d?.number} · {d?.title}</small>
                </div>
                <div className="text-right">
                  <p className="text-xs">{dateLabel(a.date, language)}</p>
                  <span className={`crm-status crm-imm-alert-${a.level === "expired" || a.level === 7 || a.level === 30 ? "high" : "mid"} mt-1`}>
                    {a.level === "expired" ? t.expired : `≤ ${a.level} d`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t.noAlerts}</p>
      )}
    </section>
  );
}

export function ImmBadge({ clientId, dossierId }: { clientId?: string; dossierId?: string }) {
  const { c, data: f } = useFoundation();
  const alerts = useImmAlerts().filter((a) =>
    dossierId ? a.dossierId === dossierId : f.dossiers.find((d) => d.id === a.dossierId)?.client_id === clientId || a.personId === clientId,
  );
  if (!alerts.length) return null;
  return (
    <span className="crm-status crm-imm-alert-high" title={c.immUi.alerts}>
      <AlertTriangle className="mr-1 inline size-3.5" />
      {fill(c.immUi.deadlines, { n: alerts.length })}
    </span>
  );
}

/** Client page tab: list of IMM dossiers with progress. */
export function ImmClientTab({ clientId }: { clientId: string }) {
  const { c, data: f, language } = useFoundation();
  const { data } = useQuery(immQuery());
  const t = c.immUi;
  const concerned = new Set(data?.persons.filter((p) => p.person_id === clientId).map((p) => p.dossier_id));
  const dossiers = f.dossiers.filter((d) => d.service === "IMM" && (d.client_id === clientId || concerned.has(d.id)));
  return (
    <section>
      <LegalNote text={t.legalNote} />
      {dossiers.length ? (
        <div className="crm-card mt-5">
          {dossiers.map((d) => {
            const proc = data?.procedures.find((p) => p.dossier_id === d.id);
            const prog = checklistProgress(data?.documents.filter((x) => x.dossier_id === d.id) ?? []);
            return (
              <Link key={d.id} to="/crm/cases/$id" params={{ id: d.id }} className="crm-list-row">
                <div className="min-w-0">
                  <strong>{d.title}</strong>
                  <small>{d.number} · {proc?.procedure_type ? t.types[proc.procedure_type as ProcedureType] : t.choose}</small>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  {prog.total > 0 && <span className="text-xs tabular-nums">{fill(t.progress, prog)}</span>}
                  {proc?.appeal_until && <span className="text-xs">{t.appealUntil}: {dateLabel(proc.appeal_until, language)}</span>}
                  <ImmBadge dossierId={d.id} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-5"><EmptyState text={t.noImm} /></div>
      )}
    </section>
  );
}

/** Full immigration section on an IMM dossier. */
export function ImmDossierSection({ dossierId }: { dossierId: string }) {
  const { c, data: f, language } = useFoundation();
  const t = c.immUi;
  const { data } = useQuery(immQuery());
  const { run, error } = useRun();
  const save = useServerFn(saveProcedure);
  const [refer, setRefer] = useState(false);
  const dossier = f.dossiers.find((d) => d.id === dossierId);
  if (!data || !dossier) return null;
  const proc = data.procedures.find((p) => p.dossier_id === dossierId);
  const base = {
    dossier_id: dossierId,
    procedure_type: (proc?.procedure_type ?? "") as "" | ProcedureType,
    submitted_on: proc?.submitted_on ?? null,
    decision_on: proc?.decision_on ?? null,
    decision: (proc?.decision ?? "") as (typeof DECISIONS)[number],
    appeal_until: proc?.appeal_until ?? null,
  };
  const update = (patch: Partial<typeof base>) => {
    const next = { ...base, ...patch };
    const seed = patch.procedure_type ? templateFor(data, patch.procedure_type, language) : undefined;
    void run(save({ data: { ...next, seed } }));
  };
  const steps = data.steps.filter((s) => s.dossier_id === dossierId);
  const docs = data.documents.filter((d) => d.dossier_id === dossierId);
  const prog = checklistProgress(docs);
  return (
    <section className="mt-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="crm-section-title mb-0">{t.tab}</h2>
        <Button variant="secondary" onClick={() => setRefer(true)}><Scale />{t.refer}</Button>
      </div>
      <LegalNote text={t.legalNote} />
      {proc?.referred_at && (
        <p className="text-sm text-muted-foreground">{fill(t.referredTo, { name: proc.lawyer_name })} · {dateLabel(proc.referred_at, language)}</p>
      )}
      {error && <p role="alert" className="text-destructive">{c.failed}</p>}
      <div className="crm-card p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t.procedureType}>
            <select className="crm-select" value={base.procedure_type} onChange={(e) => update({ procedure_type: e.target.value as ProcedureType })}>
              <option value="" disabled>{t.choose}</option>
              {PROCEDURE_TYPES.map((p) => <option key={p} value={p}>{t.types[p]}</option>)}
            </select>
          </Field>
          <Field label={t.decision}>
            <select className="crm-select" value={base.decision} onChange={(e) => update({ decision: e.target.value as typeof base.decision })}>
              {DECISIONS.map((p) => <option key={p} value={p}>{t.decisions[p]}</option>)}
            </select>
          </Field>
          <Field label={t.submittedOn}>
            <Input type="date" value={base.submitted_on ?? ""} onChange={(e) => update({ submitted_on: e.target.value || null })} />
          </Field>
          <Field label={t.decisionOn}>
            <Input type="date" value={base.decision_on ?? ""} onChange={(e) => update({ decision_on: e.target.value || null })} />
          </Field>
          <Field label={t.appealUntil}>
            <Input type="date" value={base.appeal_until ?? ""} onChange={(e) => update({ appeal_until: e.target.value || null })} />
          </Field>
          <p className="self-end pb-2 text-xs text-muted-foreground">{t.appealHint}</p>
        </div>
      </div>
      <Persons dossierId={dossierId} clientId={dossier.client_id} data={data} run={run} />
      <Steps dossierId={dossierId} steps={steps} run={run} />
      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold">{t.checklist}</h3>
          {prog.total > 0 && <span className="text-sm tabular-nums">{fill(t.progress, prog)}</span>}
        </div>
        {prog.total > 0 && (
          <div className="crm-progress mb-3" aria-hidden><span style={{ width: `${Math.round((prog.done / prog.total) * 100)}%` }} /></div>
        )}
        <p className="mb-3 text-xs text-muted-foreground">{t.templateHint}</p>
        <Checklist dossierId={dossierId} docs={docs} orgId={data.organizationId} run={run} />
      </div>
      {refer && <ReferModal dossierId={dossierId} run={run} onClose={() => setRefer(false)} />}
    </section>
  );
}

type Run = (p: Promise<unknown>) => Promise<unknown>;

function Persons({ dossierId, clientId, data, run }: { dossierId: string; clientId: string; data: ImmData; run: Run }) {
  const { c, data: f } = useFoundation();
  const t = c.immUi;
  const savePerson = useServerFn(saveImmPerson);
  const remove = useServerFn(deleteImmPerson);
  const rows = data.persons.filter((p) => p.dossier_id === dossierId);
  const client = f.clients.find((k) => k.id === clientId);
  const candidates = [
    ...(client?.type === "person" ? [client] : []),
    ...f.links.filter((l) => l.client_id === clientId).map((l) => f.clients.find((k) => k.id === l.person_id)).filter((k): k is NonNullable<typeof k> => !!k),
  ].filter((k) => !rows.some((r) => r.person_id === k.id));
  const [pick, setPick] = useState("");
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{t.persons}</h3>
      <div className="crm-card divide-y divide-border">
        {rows.map((r) => {
          const p = f.clients.find((k) => k.id === r.person_id);
          const base = { id: r.id, dossier_id: dossierId, person_id: r.person_id, document_label: r.document_label, expires_on: r.expires_on };
          return (
            <div key={r.id} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_10rem_auto] md:items-center">
              <Link to="/crm/clients/$id" params={{ id: r.person_id }} className="min-w-0 truncate font-medium">{p ? displayClient(p) : "—"}</Link>
              <Input aria-label={t.documentLabel} placeholder={t.documentLabel} defaultValue={r.document_label} onBlur={(e) => e.target.value !== r.document_label && void run(savePerson({ data: { ...base, document_label: e.target.value } }))} />
              <Input aria-label={t.expiresOn} type="date" value={r.expires_on ?? ""} onChange={(e) => void run(savePerson({ data: { ...base, expires_on: e.target.value || null } }))} />
              <Button size="icon" variant="ghost" aria-label={t.remove} title={t.remove} onClick={() => void run(remove({ data: { id: r.id } }))}><Trash2 /></Button>
            </div>
          );
        })}
        {candidates.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4">
            <select className="crm-select max-w-xs" aria-label={t.person} value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">{t.person}…</option>
              {candidates.map((k) => <option key={k.id} value={k.id}>{displayClient(k)}</option>)}
            </select>
            <Button variant="secondary" disabled={!pick} onClick={() => { void run(savePerson({ data: { dossier_id: dossierId, person_id: pick, document_label: "", expires_on: null } })); setPick(""); }}>
              <Plus />{t.addPerson}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Steps({ dossierId, steps, run }: { dossierId: string; steps: Step[]; run: Run }) {
  const { c } = useFoundation();
  const t = c.immUi;
  const saveStep = useServerFn(saveImmStep);
  const remove = useServerFn(deleteImmStep);
  const base = (s: Step) => ({ id: s.id, dossier_id: dossierId, label: s.label, status: s.status as (typeof STEP_STATUSES)[number], step_date: s.step_date, sort_order: s.sort_order });
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{t.steps}</h3>
        <Button size="sm" variant="secondary" onClick={() => void run(saveStep({ data: { dossier_id: dossierId, label: t.newStep, status: "todo", step_date: null, sort_order: steps.length } }))}><Plus />{t.addStep}</Button>
      </div>
      <div className="crm-card divide-y divide-border">
        {steps.map((s) => (
          <div key={s.id} className={`grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_9rem_10rem_auto] md:items-center ${s.status === "done" ? "opacity-70" : ""}`}>
            <Input aria-label={t.steps} defaultValue={s.label} onBlur={(e) => e.target.value.trim() && e.target.value !== s.label && void run(saveStep({ data: { ...base(s), label: e.target.value } }))} />
            <select className="crm-select" aria-label={t.stepStatus.todo} value={s.status} onChange={(e) => void run(saveStep({ data: { ...base(s), status: e.target.value as Step["status"] as (typeof STEP_STATUSES)[number], step_date: e.target.value === "done" && !s.step_date ? todayIso() : s.step_date } }))}>
              {STEP_STATUSES.map((x) => <option key={x} value={x}>{t.stepStatus[x]}</option>)}
            </select>
            <Input type="date" aria-label={c.startDate} value={s.step_date ?? ""} onChange={(e) => void run(saveStep({ data: { ...base(s), step_date: e.target.value || null } }))} />
            <Button size="icon" variant="ghost" aria-label={t.remove} title={t.remove} onClick={() => void run(remove({ data: { id: s.id } }))}><Trash2 /></Button>
          </div>
        ))}
        {!steps.length && <p className="p-4 text-sm text-muted-foreground">{t.choose}</p>}
      </div>
    </div>
  );
}

function Checklist({ dossierId, docs, orgId, run }: { dossierId: string; docs: Doc[]; orgId: string; run: Run }) {
  const { c } = useFoundation();
  const t = c.immUi;
  const saveDoc = useServerFn(saveImmDocument);
  const remove = useServerFn(deleteImmDocument);
  const base = (d: Doc) => ({ id: d.id, dossier_id: dossierId, label: d.label, status: d.status as (typeof DOC_STATUSES)[number], notes: d.notes, needs_translation: d.needs_translation, file_path: d.file_path, sort_order: d.sort_order });
  async function upload(d: Doc, file: File) {
    if (file.size > 20 * 1024 * 1024) throw new Error("TOO_BIG");
    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
    const path = `${orgId}/${dossierId}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage.from("imm-documents").upload(path, file, { contentType: file.type });
    if (up.error) throw up.error;
    await saveDoc({ data: { ...base(d), file_path: path, status: d.status === "missing" || d.status === "requested" ? "received" : base(d).status } });
  }
  async function open(path: string) {
    const { data } = await supabase.storage.from("imm-documents").createSignedUrl(path, 120);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  }
  return (
    <div className="crm-card divide-y divide-border">
      {docs.map((d) => (
        <div key={d.id} className="space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_auto] md:items-center">
            <Input aria-label={t.checklist} defaultValue={d.label} onBlur={(e) => e.target.value.trim() && e.target.value !== d.label && void run(saveDoc({ data: { ...base(d), label: e.target.value } }))} />
            <select className={`crm-select crm-doc-${d.status}`} aria-label={t.docStatus.missing} value={d.status} onChange={(e) => void run(saveDoc({ data: { ...base(d), status: e.target.value as (typeof DOC_STATUSES)[number] } }))}>
              {DOC_STATUSES.map((x) => <option key={x} value={x}>{t.docStatus[x]}</option>)}
            </select>
            <Button size="icon" variant="ghost" aria-label={t.remove} title={t.remove} onClick={() => void run(remove({ data: { id: d.id } }))}><Trash2 /></Button>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={d.needs_translation} onChange={(e) => void run(saveDoc({ data: { ...base(d), needs_translation: e.target.checked } }))} />
              {t.needsTranslation}
            </label>
            {d.file_path ? (
              <button type="button" className="crm-link inline-flex items-center gap-1" onClick={() => void open(d.file_path!)}><Paperclip className="size-4" />{t.openFile}</button>
            ) : (
              <label className="crm-link inline-flex cursor-pointer items-center gap-1">
                <Paperclip className="size-4" />{t.upload}
                <input type="file" className="sr-only" accept="image/*,application/pdf" onChange={(e) => { const file = e.target.files?.[0]; if (file) void run(upload(d, file)); }} />
              </label>
            )}
          </div>
          <Textarea aria-label={t.notes} placeholder={t.notes} rows={1} defaultValue={d.notes} onBlur={(e) => e.target.value !== d.notes && void run(saveDoc({ data: { ...base(d), notes: e.target.value } }))} />
        </div>
      ))}
      <div className="p-4">
        <Button size="sm" variant="secondary" onClick={() => void run(saveDoc({ data: { dossier_id: dossierId, label: t.newDocument, status: "missing", notes: "", needs_translation: false, file_path: null, sort_order: docs.length } }))}><Plus />{t.addDocument}</Button>
      </div>
    </div>
  );
}

function ReferModal({ dossierId, run, onClose }: { dossierId: string; run: Run; onClose: () => void }) {
  const { c } = useFoundation();
  const t = c.immUi;
  const refer = useServerFn(referImmLawyer);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  return (
    <CrmModal title={t.refer} open onClose={onClose}>
      <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void run(refer({ data: { dossier_id: dossierId, lawyer_name: name, referral_note: note } })).then(onClose); }}>
        <Field label={t.lawyer}><Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} /></Field>
        <Field label={t.referNote}><Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} /></Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>{c.cancel}</Button>
          <Button type="submit">{t.refer}</Button>
        </div>
      </form>
    </CrmModal>
  );
}

/** Settings: admin-editable templates per procedure type. */
export function ImmTemplatesSettings() {
  const { c, language } = useFoundation();
  const t = c.immUi;
  const { data } = useQuery(immQuery());
  const { run, error } = useRun();
  const saveTpl = useServerFn(saveImmTemplate);
  const [type, setType] = useState<ProcedureType>("residence");
  const [draft, setDraft] = useState<{ type: ProcedureType; steps: string; documents: string } | null>(null);
  const [saved, setSaved] = useState(false);
  if (!data) return null;
  const tpl = templateFor(data, type, language);
  const cur = draft?.type === type ? draft : { type, steps: tpl.steps.join("\n"), documents: tpl.documents.join("\n") };
  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  return (
    <section className="mt-12 max-w-4xl">
      <h2 className="crm-section-title">{t.templates}</h2>
      <p className="mb-4 text-sm text-muted-foreground">{data.isAdmin ? t.templatesHint : t.adminOnly}</p>
      <select className="crm-select mb-4 max-w-xs" aria-label={t.procedureType} value={type} onChange={(e) => { setType(e.target.value as ProcedureType); setSaved(false); }}>
        {PROCEDURE_TYPES.map((p) => <option key={p} value={p}>{t.types[p]}</option>)}
      </select>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t.steps}><Textarea rows={9} value={cur.steps} disabled={!data.isAdmin} onChange={(e) => setDraft({ ...cur, steps: e.target.value })} /></Field>
        <Field label={t.checklist}><Textarea rows={9} value={cur.documents} disabled={!data.isAdmin} onChange={(e) => setDraft({ ...cur, documents: e.target.value })} /></Field>
      </div>
      {data.isAdmin && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => void run(saveTpl({ data: { procedure_type: type, steps: lines(cur.steps), documents: lines(cur.documents) } })).then(() => { setDraft(null); setSaved(true); })}>{t.save}</Button>
          <Button variant="ghost" onClick={() => { const d = defaultTemplate(type, language); setDraft({ type, steps: d.steps.join("\n"), documents: d.documents.join("\n") }); }}>{t.resetDefault}</Button>
        </div>
      )}
      {saved && !error && <p role="status" className="mt-3 text-sm">{t.saved}</p>}
      {error && <p role="alert" className="mt-3 text-destructive">{c.failed}</p>}
    </section>
  );
}
