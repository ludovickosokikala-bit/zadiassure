import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BellRing, CheckCircle2, Circle, Copy, Download, FileText, Inbox, ListTodo, Mail, MessageCircle,
  Paperclip, Pencil, Phone, Plus, Printer, Send, Sparkles, Trash2, UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { displayClient, whatsappHref } from "@/lib/foundation.schemas";
import { letterAnalysisSchema, requestStatus, toCsv, avgDurationDays, type LetterAnalysis } from "@/lib/phase5Core";
import {
  addDocument, addLetter, analyzeLetterFn, createDocRequest, deleteTask, draftLetterReply, getPhase5Data,
  getReportData, saveLetterReply, saveTask, sendClientReminder, setClientReminders, setInboxStatus, setTaskStatus,
} from "@/lib/phase5.functions";
import { useFoundation, dateLabel } from "./context";
import { CrmModal, EmptyState, Field, PageTitle } from "./ui";
import { LegalNote, todayIso, debtQuery } from "./Debts";
import { immQuery, useImmAlerts } from "./Immigration";
import { ClientForm } from "./forms";
import type { Client } from "./data";

export const phase5Query = () => queryOptions({ queryKey: ["crm-p5"], queryFn: () => getPhase5Data(), staleTime: 0 });
type P5 = Awaited<ReturnType<typeof getPhase5Data>>;
type Letter = P5["letters"][number];
type Task = P5["tasks"][number];
type InboxItem = P5["inbox"][number];

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const fileExt = (f: File) => (f.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
const emptyClient = { type: "person", first_name: "", last_name: "", company_name: "", household_name: "" };

function useRun() {
  const qc = useQueryClient();
  const [error, setError] = useState("");
  const run = async <T,>(p: Promise<T>): Promise<T | undefined> => {
    setError("");
    try {
      const r = await p;
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["crm-p5"] }),
        qc.invalidateQueries({ queryKey: ["crm-foundation"] }),
        qc.invalidateQueries({ queryKey: ["crm-imm"] }),
      ]);
      return r;
    } catch {
      setError("failed");
      return undefined;
    }
  };
  return { run, error, setError };
}

async function openFile(bucket: string, path: string) {
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 120);
  if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
}

function printText(title: string, text: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  const esc = (s: string) => s.replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[ch] ?? ch);
  w.document.write(`<!doctype html><html><head><title>${esc(title)}</title><style>body{font:12pt/1.55 Georgia,serif;max-width:42rem;margin:3rem auto;white-space:pre-wrap}</style></head><body>${esc(text)}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

function AiNote() {
  const { c } = useFoundation();
  return (
    <p className="crm-legal-note">
      <Sparkles className="size-4 shrink-0" />
      {c.p5Ui.aiNote}
    </p>
  );
}

/* ---------------- Letters ---------------- */
export function LettersPanel({ clientId, dossierId }: { clientId: string; dossierId?: string }) {
  const { c } = useFoundation();
  const t = c.p5Ui;
  const { data } = useQuery(phase5Query());
  const [adding, setAdding] = useState(false);
  const letters = (data?.letters ?? []).filter((l) => l.client_id === clientId && (!dossierId || l.dossier_id === dossierId));
  return (
    <section className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAdding(true)}>
          <Plus />
          {t.addLetter}
        </Button>
      </div>
      {letters.length ? letters.map((l) => <LetterCard key={l.id} letter={l} />) : <EmptyState icon={<FileText />} text={t.noLetters} />}
      {adding && data && <LetterUpload orgId={data.organizationId} clientId={clientId} dossierId={dossierId ?? null} onClose={() => setAdding(false)} />}
    </section>
  );
}

function aiMessage(code: string, t: ReturnType<typeof useFoundation>["c"]["p5Ui"]) {
  return code === "AI_RATE" ? t.aiBusy : code === "AI_CREDITS" ? t.aiCredits : t.aiFailed;
}

function LetterUpload({ orgId, clientId, dossierId, onClose }: { orgId: string; clientId: string; dossierId: string | null; onClose: () => void }) {
  const { c, language } = useFoundation();
  const t = c.p5Ui;
  const add = useServerFn(addLetter);
  const analyze = useServerFn(analyzeLetterFn);
  const { run } = useRun();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = String(new FormData(e.currentTarget).get("title") ?? "").trim();
    if (!files.length) return setError(c.required);
    if (files.some((f) => f.size > 20 * 1024 * 1024)) return setError(c.failed);
    setError("");
    setBusy(t.upload);
    try {
      const paths: string[] = [];
      for (const f of files) {
        const path = `${orgId}/${clientId}/letters/${crypto.randomUUID()}.${fileExt(f)}`;
        const up = await supabase.storage.from("crm-documents").upload(path, f, { contentType: f.type });
        if (up.error) throw up.error;
        paths.push(path);
      }
      const r = await add({ data: { client_id: clientId, dossier_id: dossierId, title, paths, mimes: files.map((f) => f.type) } });
      setBusy(t.analyzing);
      const a = await run(analyze({ data: { id: r.id, uiLanguage: language } }));
      if (a && !a.ok) setError(aiMessage(a.error, t));
      else onClose();
    } catch {
      setError(c.failed);
    } finally {
      setBusy("");
    }
  }
  return (
    <CrmModal open onClose={onClose} title={t.addLetter}>
      <form onSubmit={submit} className="space-y-5">
        <Field label={t.letterTitle}>
          <Input name="title" maxLength={200} />
        </Field>
        <Field label={t.letterFiles}>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <label>
                <Paperclip />
                {t.letterFiles}
                <input type="file" multiple className="sr-only" accept="image/*,application/pdf" onChange={(e) => setFiles((p) => [...p, ...Array.from(e.target.files ?? [])].slice(0, 10))} />
              </label>
            </Button>
            <Button asChild variant="secondary">
              <label>
                <Plus />
                {t.takePhoto}
                <input type="file" capture="environment" className="sr-only" accept="image/*" onChange={(e) => setFiles((p) => [...p, ...Array.from(e.target.files ?? [])].slice(0, 10))} />
              </label>
            </Button>
          </div>
        </Field>
        {files.length > 0 && (
          <ul className="space-y-1 text-sm">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2">
                <span className="truncate">{i + 1}. {f.name}</span>
                <Button type="button" size="icon" variant="ghost" aria-label={c.delete} onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}>
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <AiNote />
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>{c.cancel}</Button>
          <Button type="submit" disabled={!!busy}>{busy || t.analyze}</Button>
        </div>
      </form>
    </CrmModal>
  );
}

function LetterCard({ letter }: { letter: Letter }) {
  const { c, language, data: f } = useFoundation();
  const t = c.p5Ui;
  const analyze = useServerFn(analyzeLetterFn);
  const draft = useServerFn(draftLetterReply);
  const saveReply = useServerFn(saveLetterReply);
  const task = useServerFn(saveTask);
  const { data } = useQuery(phase5Query());
  const { run } = useRun();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [reply, setReply] = useState(letter.reply_draft);
  const [instr, setInstr] = useState("");
  const parsed = letterAnalysisSchema.safeParse(letter.analysis);
  const a: LetterAnalysis | null = parsed.success ? parsed.data : null;
  const client = f.clients.find((k) => k.id === letter.client_id);
  const clientLang = client?.preferred_language ?? "nl";
  const langs = Array.from(new Set([clientLang, language]));
  const summaries = a ? langs.map((l) => a.summaries.find((s) => s.language === l)).filter((s): s is NonNullable<typeof s> => !!s) : [];
  const hasTask = (data?.tasks ?? []).some((x) => x.letter_id === letter.id);
  async function doAnalyze() {
    setBusy(t.analyzing);
    const r = await run(analyze({ data: { id: letter.id, uiLanguage: language } }));
    setBusy("");
    setMsg(r && !r.ok ? aiMessage(r.error, t) : "");
  }
  async function doDraft() {
    setBusy(t.analyzing);
    const r = await run(draft({ data: { id: letter.id, instructions: instr } }));
    setBusy("");
    if (r?.ok) setReply(r.reply);
    else setMsg(r ? aiMessage(r.error, t) : c.failed);
  }
  return (
    <article className="crm-card space-y-4 p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{letter.title || a?.sender || t.letters}</h3>
          <p className="text-xs text-muted-foreground">
            {dateLabel(letter.created_at, language, true)} · {letter.file_paths.length} p.
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {letter.file_paths.map((p, i) => (
            <Button key={p} size="icon" variant="ghost" title={`${t.open} ${i + 1}`} aria-label={`${t.open} ${i + 1}`} onClick={() => void openFile("crm-documents", p)}>
              <FileText />
            </Button>
          ))}
        </div>
      </div>
      {a ? (
        <>
          <dl className="crm-details">
            <div><dt>{t.sender}</dt><dd>{a.sender || "—"}</dd></div>
            <div><dt>{t.reference}</dt><dd>{a.sender_reference || "—"}</dd></div>
            <div><dt>{t.deadline}</dt><dd>{a.deadline ? dateLabel(a.deadline, language) : t.noDeadline}</dd></div>
          </dl>
          {summaries.map((s) => (
            <div key={s.language} className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{s.language}</p>
              <p><strong>{t.about}: </strong>{s.about}</p>
              <p><strong>{t.asked}: </strong>{s.asked}</p>
            </div>
          ))}
          {a.amounts.length > 0 && (
            <div className="text-sm">
              <p className="font-semibold">{t.amounts}</p>
              <ul className="mt-1 list-disc pl-5">
                {a.amounts.map((m, i) => <li key={i}>{m.amount} — {m.description}</li>)}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {a.deadline && (
              <Button variant="secondary" disabled={hasTask} onClick={() => void run(task({ data: { title: fill(t.replyTaskTitle, { t: letter.title || a.sender }), due_date: a.deadline, assignee_id: f.member?.user_id ?? null, client_id: letter.client_id, dossier_id: letter.dossier_id, letter_id: letter.id } }))}>
                <ListTodo />
                {hasTask ? t.taskMade : t.makeTask}
              </Button>
            )}
            <Button variant="ghost" onClick={() => void doAnalyze()} disabled={!!busy}>
              <Sparkles />
              {t.reanalyze}
            </Button>
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <Field label={t.replyInstructions}>
              <Input value={instr} maxLength={1000} onChange={(e) => setInstr(e.target.value)} />
            </Field>
            <Button onClick={() => void doDraft()} disabled={!!busy}>
              <Sparkles />
              {busy || t.suggestReply}
            </Button>
            {reply && (
              <>
                <Field label={t.reply}>
                  <Textarea rows={12} value={reply} onChange={(e) => setReply(e.target.value)} onBlur={() => reply !== letter.reply_draft && void run(saveReply({ data: { id: letter.id, reply } }))} />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => void navigator.clipboard.writeText(reply).then(() => setMsg(t.copied))}>
                    <Copy />
                    {t.copy}
                  </Button>
                  <Button variant="secondary" onClick={() => printText(letter.title || t.reply, reply)}>
                    <Printer />
                    {t.print}
                  </Button>
                </div>
              </>
            )}
          </div>
          <AiNote />
        </>
      ) : (
        <div className="space-y-2">
          {letter.analysis_error && <p className="text-sm text-destructive">{aiMessage(letter.analysis_error, t)}</p>}
          <Button onClick={() => void doAnalyze()} disabled={!!busy}>
            <Sparkles />
            {busy || t.analyze}
          </Button>
        </div>
      )}
      {msg && <p role="status" className="text-sm text-muted-foreground">{msg}</p>}
    </article>
  );
}

/* ---------------- Documents ---------------- */
type DocRow = { key: string; name: string; category: keyof ReturnType<typeof useFoundation>["c"]["p5Ui"]["cats"]; date: string; by: string; bucket: string; path: string };

export function DocumentsPanel({ client }: { client: Client }) {
  const { c, language, data: f } = useFoundation();
  const t = c.p5Ui;
  const clientId = client.id;
  const { data } = useQuery(phase5Query());
  const { data: imm } = useQuery(immQuery());
  const { data: debts } = useQuery(debtQuery());
  const upload = useServerFn(addDocument);
  const remind = useServerFn(sendClientReminder);
  const setRem = useServerFn(setClientReminders);
  const { run, error } = useRun();
  const [reqOpen, setReqOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const member = (id: string | null) => {
    const m = f.team.find((x) => x.user_id === id);
    return m?.full_name || m?.email || "";
  };
  const rows = useMemo<DocRow[]>(() => {
    const out: DocRow[] = [];
    for (const d of data?.documents ?? []) if (d.client_id === clientId) out.push({ key: d.id, name: d.name, category: d.request_id ? "request" : "other", date: d.created_at, by: d.uploaded_by_label, bucket: "crm-documents", path: d.storage_path });
    for (const l of data?.letters ?? []) if (l.client_id === clientId) l.file_paths.forEach((p, i) => out.push({ key: `${l.id}-${i}`, name: `${l.title || t.cats.letter}${l.file_paths.length > 1 ? ` (${i + 1})` : ""}`, category: "letter", date: l.created_at, by: member(l.created_by), bucket: "crm-documents", path: p }));
    const immDossiers = new Set(f.dossiers.filter((d) => d.client_id === clientId && d.service === "IMM").map((d) => d.id));
    for (const d of imm?.documents ?? []) if (d.file_path && immDossiers.has(d.dossier_id)) out.push({ key: d.id, name: d.label, category: "immigration", date: d.updated_at ?? d.created_at, by: "", bucket: "imm-documents", path: d.file_path });
    const debtIds = new Map((debts?.debts ?? []).filter((d) => d.client_id === clientId).map((d) => [d.id, d.creditor]));
    for (const i of debts?.instalments ?? []) if (i.proof_path && debtIds.has(i.debt_id)) out.push({ key: i.id, name: `${debtIds.get(i.debt_id) ?? ""} · ${dateLabel(i.due_date, language)}`, category: "payment", date: i.paid_at ?? i.created_at, by: "", bucket: "payment-proofs", path: i.proof_path });
    return out.sort((a, b) => b.date.localeCompare(a.date));
  }, [data, imm, debts, clientId, f, language, t]);
  async function onUpload(file: File) {
    if (!data) return;
    if (file.size > 20 * 1024 * 1024) throw new Error("TOO_BIG");
    const path = `${data.organizationId}/${clientId}/docs/${crypto.randomUUID()}.${fileExt(file)}`;
    const up = await supabase.storage.from("crm-documents").upload(path, file, { contentType: file.type });
    if (up.error) throw up.error;
    await upload({ data: { client_id: clientId, dossier_id: null, name: file.name.slice(0, 250), path, mime: file.type, size: file.size } });
  }
  const requests = (data?.requests ?? []).filter((r) => r.client_id === clientId);
  const mandates = (data?.mandates ?? []).filter((m) => client.email && m.applicant_email.toLowerCase() === client.email.toLowerCase());
  const now = new Date();
  return (
    <section className="space-y-8">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={() => setReqOpen(true)}>
          <Send />
          {t.requestDocs}
        </Button>
        <Button asChild>
          <label>
            <Paperclip />
            {t.upload}
            <input type="file" className="sr-only" accept="image/*,application/pdf" onChange={(e) => { const file = e.target.files?.[0]; if (file) void run(onUpload(file)); e.target.value = ""; }} />
          </label>
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{c.failed}</p>}
      {rows.length ? (
        <div className="crm-card divide-y divide-border">
          {rows.map((r) => (
            <button key={r.key} type="button" className="crm-list-row w-full text-left" onClick={() => void openFile(r.bucket, r.path)}>
              <div className="min-w-0">
                <strong className="block truncate">{r.name}</strong>
                <small>{t.cats[r.category]} · {dateLabel(r.date, language)}{r.by ? ` · ${t.uploadedBy} ${r.by}` : ""}</small>
              </div>
              <Download className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      ) : (
        <EmptyState icon={<FileText />} text={t.noDocuments} />
      )}

      <div>
        <h2 className="crm-section-title">{t.requests}</h2>
        {requests.length ? (
          <div className="crm-card divide-y divide-border">
            {requests.map((r) => {
              const st = requestStatus(r, now);
              return (
                <div key={r.id} className="crm-list-row">
                  <div className="min-w-0">
                    <strong className="block">{r.items.map((i) => `${i.received ? "✓" : "○"} ${i.label}`).join(" · ")}</strong>
                    <small>{dateLabel(r.created_at, language)} · {t.expires} {dateLabel(r.expires_at, language)}</small>
                  </div>
                  <span className={`crm-status crm-status-${st === "complete" ? "completed" : st === "expired" ? "archived" : "in_progress"}`}>{t.reqStatus[st]}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.none}</p>
        )}
      </div>

      <div className="crm-card space-y-3 p-5">
        <label className="flex items-center gap-3 font-medium">
          <input type="checkbox" className="size-4" checked={client.email_reminders} onChange={(e) => void run(setRem({ data: { client_id: clientId, on: e.target.checked } }))} />
          <BellRing className="size-4" />
          {t.reminders}
        </label>
        <p className="text-sm text-muted-foreground">{t.remindersHelp}</p>
        {client.email_reminders && (
          <Button variant="secondary" onClick={() => void run(remind({ data: { client_id: clientId } })).then((r) => r && setMsg(fill(t.reminderResult, { n: r.docs + r.instalments })))}>
            <Mail />
            {t.sendReminderNow}
          </Button>
        )}
        {msg && <p role="status" className="text-sm">{msg}</p>}
      </div>

      <div>
        <h2 className="crm-section-title">{t.mandates}</h2>
        {mandates.length ? (
          <div className="crm-card divide-y divide-border">
            {mandates.map((m) => (
              <Link key={m.id} to="/crm/mandates" className="crm-list-row">
                <div className="min-w-0">
                  <strong className="block truncate">{m.applicant_name} → {m.holder_name}</strong>
                  <small>{dateLabel(m.signed_at ?? m.created_at, language)} · {dateLabel(m.starts_on, language)} – {dateLabel(m.ends_on, language)}</small>
                </div>
                <span className="crm-status">{m.status}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{client.email ? t.noMandates : t.noEmail}</p>
        )}
      </div>
      {reqOpen && <RequestForm client={client} onClose={() => setReqOpen(false)} />}
    </section>
  );
}

function RequestForm({ client, onClose }: { client: Client; onClose: () => void }) {
  const { c, data: f } = useFoundation();
  const t = c.p5Ui;
  const { data: imm } = useQuery(immQuery());
  const create = useServerFn(createDocRequest);
  const { run } = useRun();
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const immDossiers = new Map(f.dossiers.filter((d) => d.client_id === client.id && d.service === "IMM").map((d) => [d.id, d.number]));
  const checklist = (imm?.documents ?? []).filter((d) => immDossiers.has(d.dossier_id) && (d.status === "missing" || d.status === "requested"));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const items = [
      ...text.split("\n").map((s) => s.trim()).filter(Boolean).map((label) => ({ label: label.slice(0, 200), imm_document_id: null })),
      ...checklist.filter((d) => picked.has(d.id)).map((d) => ({ label: d.label.slice(0, 200), imm_document_id: d.id })),
    ];
    if (!items.length) return setError(c.required);
    const dossierIds = new Set(checklist.filter((d) => picked.has(d.id)).map((d) => d.dossier_id));
    setBusy(true);
    const r = await run(create({ data: { client_id: client.id, dossier_id: dossierIds.size === 1 ? [...dossierIds][0]! : null, items } }));
    setBusy(false);
    if (!r) return setError(c.failed);
    if (!r.ok) return setError(r.error === "NO_EMAIL" ? t.noEmail : t.emailFailed);
    onClose();
  }
  return (
    <CrmModal open onClose={onClose} title={t.requestDocs}>
      <form onSubmit={submit} className="space-y-5">
        {!client.email && <p className="text-sm text-destructive">{t.noEmail}</p>}
        <Field label={t.requestItems}>
          <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        {checklist.length > 0 && (
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">{t.fromChecklist}</legend>
            {checklist.map((d) => (
              <label key={d.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4" checked={picked.has(d.id)} onChange={(e) => setPicked((p) => { const n = new Set(p); if (e.target.checked) n.add(d.id); else n.delete(d.id); return n; })} />
                {d.label} <span className="text-muted-foreground">({immDossiers.get(d.dossier_id)})</span>
              </label>
            ))}
          </fieldset>
        )}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>{c.cancel}</Button>
          <Button type="submit" disabled={busy || !client.email}>{busy ? c.saving : t.sendRequest}</Button>
        </div>
      </form>
    </CrmModal>
  );
}

/* ---------------- Tasks ---------------- */
export function TasksPanel({ clientId, dossierId, mine }: { clientId?: string; dossierId?: string; mine?: boolean }) {
  const { c, data: f } = useFoundation();
  const t = c.p5Ui;
  const { data } = useQuery(phase5Query());
  const [form, setForm] = useState<Task | "new" | null>(null);
  const [showDone, setShowDone] = useState(false);
  const today = todayIso();
  const me = f.member?.user_id;
  let tasks = (data?.tasks ?? []).filter((x) => (!clientId || x.client_id === clientId) && (!dossierId || x.dossier_id === dossierId));
  if (mine) tasks = tasks.filter((x) => x.status === "open" && x.assignee_id === me && (!x.due_date || x.due_date <= today) && x.due_date !== null);
  const open = tasks.filter((x) => x.status === "open");
  const done = tasks.filter((x) => x.status !== "open");
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="crm-section-title mb-0">{mine ? t.myTasks : t.tasks}</h2>
        <Button size="icon" variant="secondary" title={t.newTask} aria-label={t.newTask} onClick={() => setForm("new")}>
          <Plus />
        </Button>
      </div>
      {open.length ? (
        <div className="crm-card divide-y divide-border">{open.map((x) => <TaskRow key={x.id} task={x} onEdit={() => setForm(x)} />)}</div>
      ) : (
        <EmptyState icon={<ListTodo />} text={t.noTasks} />
      )}
      {!mine && done.length > 0 && (
        <div className="mt-3">
          <Button variant="ghost" size="sm" onClick={() => setShowDone((v) => !v)}>{t.showDone} ({done.length})</Button>
          {showDone && <div className="crm-card mt-2 divide-y divide-border">{done.map((x) => <TaskRow key={x.id} task={x} onEdit={() => setForm(x)} />)}</div>}
        </div>
      )}
      {form && <TaskForm task={form === "new" ? null : form} clientId={clientId ?? null} dossierId={dossierId ?? null} onClose={() => setForm(null)} />}
    </section>
  );
}

function TaskRow({ task, onEdit }: { task: Task; onEdit: () => void }) {
  const { c, language, data: f } = useFoundation();
  const t = c.p5Ui;
  const setStatus = useServerFn(setTaskStatus);
  const { run } = useRun();
  const overdue = task.status === "open" && !!task.due_date && task.due_date < todayIso();
  const client = f.clients.find((k) => k.id === task.client_id);
  const who = f.team.find((m) => m.user_id === task.assignee_id);
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
      <Button size="icon" variant="ghost" aria-label={task.status === "open" ? t.done : t.open_} onClick={() => void run(setStatus({ data: { id: task.id, status: task.status === "open" ? "done" : "open" } }))}>
        {task.status === "open" ? <Circle /> : <CheckCircle2 className="text-primary" />}
      </Button>
      <div className="min-w-0">
        <p className={`truncate font-medium ${task.status !== "open" ? "text-muted-foreground line-through" : ""}`}>{task.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          <span className={overdue ? "font-semibold text-destructive" : ""}>{task.due_date ? dateLabel(task.due_date, language) : "—"}{overdue ? ` · ${t.overdue}` : ""}</span>
          {who ? ` · ${who.full_name || who.email}` : ""}
          {client ? " · " : ""}
          {client && <Link to="/crm/clients/$id" params={{ id: client.id }} className="underline-offset-2 hover:underline">{displayClient(client)}</Link>}
        </p>
      </div>
      <Button size="icon" variant="ghost" title={t.editTask} aria-label={t.editTask} onClick={onEdit}>
        <Pencil />
      </Button>
    </div>
  );
}

function TaskForm({ task, clientId, dossierId, onClose }: { task: Task | null; clientId: string | null; dossierId: string | null; onClose: () => void }) {
  const { c, data: f } = useFoundation();
  const t = c.p5Ui;
  const save = useServerFn(saveTask);
  const del = useServerFn(deleteTask);
  const { run } = useRun();
  const [client, setClient] = useState(task?.client_id ?? clientId ?? "");
  const [error, setError] = useState("");
  const dossiers = f.dossiers.filter((d) => d.client_id === client);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    if (!get("title")) return setError(c.required);
    const r = await run(save({ data: { ...(task ? { id: task.id } : {}), title: get("title"), due_date: get("due_date") || null, assignee_id: get("assignee_id") || null, client_id: client || null, dossier_id: get("dossier_id") || null, letter_id: task?.letter_id ?? null } }));
    if (r) onClose();
    else setError(c.failed);
  }
  return (
    <CrmModal open onClose={onClose} title={task ? t.editTask : t.newTask}>
      <form onSubmit={submit} className="space-y-5">
        <Field label={`${t.title} *`}><Input name="title" required maxLength={300} defaultValue={task?.title} /></Field>
        <div className="crm-form-grid">
          <Field label={t.dueDate}><Input type="date" name="due_date" defaultValue={task?.due_date ?? todayIso()} /></Field>
          <Field label={t.assignee}>
            <select name="assignee_id" className="crm-select" defaultValue={task ? (task.assignee_id ?? "") : (f.member?.user_id ?? "")}>
              <option value="">{t.nobody}</option>
              {f.team.filter((m) => m.active).map((m) => <option key={m.user_id} value={m.user_id}>{m.full_name || m.email}</option>)}
            </select>
          </Field>
          <Field label={t.client}>
            <select className="crm-select" value={client} onChange={(e) => setClient(e.target.value)} disabled={!!clientId}>
              <option value="">{t.none}</option>
              {f.clients.map((k) => <option key={k.id} value={k.id}>{k.number} · {displayClient(k)}</option>)}
            </select>
          </Field>
          <Field label={t.dossier}>
            <select name="dossier_id" className="crm-select" defaultValue={task?.dossier_id ?? dossierId ?? ""}>
              <option value="">{t.none}</option>
              {dossiers.map((d) => <option key={d.id} value={d.id}>{d.number} · {d.title}</option>)}
            </select>
          </Field>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-between gap-2">
          {task ? <Button type="button" variant="ghost" onClick={() => void run(del({ data: { id: task.id } })).then(onClose)}><Trash2 />{c.delete}</Button> : <span />}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>{c.cancel}</Button>
            <Button type="submit">{c.save}</Button>
          </div>
        </div>
      </form>
    </CrmModal>
  );
}

/* ---------------- Today blocks ---------------- */
export function TodayLetters() {
  const { c, language, data: f } = useFoundation();
  const { data } = useQuery(phase5Query());
  const today = todayIso();
  const limit = addDays(today, 7);
  const due = (data?.letters ?? []).filter((l) => l.deadline && l.deadline >= today && l.deadline <= limit).sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""));
  if (!due.length) return null;
  return (
    <section className="mb-9">
      <h2 className="crm-section-title">{c.p5Ui.lettersDue}</h2>
      <div className="crm-card">
        {due.map((l) => {
          const k = f.clients.find((x) => x.id === l.client_id);
          return (
            <Link key={l.id} to="/crm/clients/$id" params={{ id: l.client_id }} className="crm-list-row">
              <div className="min-w-0">
                <strong className="block truncate">{l.title}</strong>
                <small>{displayClient(k ?? emptyClient)}</small>
              </div>
              <span className="text-xs font-medium">{dateLabel(l.deadline, language)}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function TodayInbox() {
  const { c, language } = useFoundation();
  const { data } = useQuery(phase5Query());
  const items = (data?.inbox ?? []).filter((i) => i.status === "new");
  if (!items.length) return null;
  return (
    <section className="mb-9">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="crm-section-title mb-0">{c.p5Ui.inboxNew} ({items.length})</h2>
        <Button asChild variant="ghost" size="sm"><Link to="/crm/inbox">{c.inbox}</Link></Button>
      </div>
      <div className="crm-card">
        {items.slice(0, 5).map((i) => (
          <Link key={i.id} to="/crm/inbox" className="crm-list-row">
            <div className="min-w-0">
              <strong className="block truncate">{i.full_name || i.email}</strong>
              <small className="block truncate">{i.message || i.template_slug}</small>
            </div>
            <span className="text-xs">{dateLabel(i.created_at, language)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function useInboxBadge() {
  const { data } = useQuery(phase5Query());
  return (data?.inbox ?? []).filter((i) => i.status === "new").length;
}

/* ---------------- Inbox page ---------------- */
const INBOX = ["new", "in_progress", "handled", "archived"] as const;
export function InboxPage() {
  const { c, language, data: f } = useFoundation();
  const t = c.p5Ui;
  const { data } = useQuery(phase5Query());
  const [filter, setFilter] = useState<(typeof INBOX)[number] | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const items = (data?.inbox ?? []).filter((i) => filter === "all" || i.status === filter);
  const current = data?.inbox.find((i) => i.id === openId);
  return (
    <>
      <PageTitle title={c.inbox} />
      <div className="crm-tabs" role="tablist">
        {(["all", ...INBOX] as const).map((s) => (
          <Button key={s} role="tab" variant="ghost" aria-selected={filter === s} onClick={() => setFilter(s)}>
            {s === "all" ? t.all : t.inboxStatus[s]}
            {s !== "all" && ` (${(data?.inbox ?? []).filter((i) => i.status === s).length})`}
          </Button>
        ))}
      </div>
      {items.length ? (
        <div className="crm-card divide-y divide-border">
          {items.map((i) => {
            const k = f.clients.find((x) => x.id === i.crm_client_id);
            return (
              <button key={i.id} type="button" className="crm-list-row w-full text-left" onClick={() => setOpenId(i.id)}>
                <div className="min-w-0">
                  <strong className="block truncate">{i.full_name || i.email || "—"}</strong>
                  <small className="block truncate">{i.template_slug} · {i.message.slice(0, 120)}</small>
                  {k && <small className="block">{t.linkedTo} {k.number}</small>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs">{dateLabel(i.created_at, language, true)}</p>
                  <span className={`crm-status mt-2 inline-block ${i.status === "new" ? "crm-status-in_progress" : ""}`}>{t.inboxStatus[i.status as (typeof INBOX)[number]] ?? i.status}</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<Inbox />} text={t.noInbox} />
      )}
      {current && <InboxDetail item={current} onClose={() => setOpenId(null)} />}
    </>
  );
}

function InboxDetail({ item, onClose }: { item: InboxItem; onClose: () => void }) {
  const { c, language, data: f } = useFoundation();
  const t = c.p5Ui;
  const setStatus = useServerFn(setInboxStatus);
  const { run, error } = useRun();
  const [create, setCreate] = useState(false);
  const [linkTo, setLinkTo] = useState(item.crm_client_id ?? "");
  const answers = item.answers && typeof item.answers === "object" && !Array.isArray(item.answers) ? Object.entries(item.answers) : [];
  const [first, ...rest] = item.full_name.trim().split(/\s+/);
  const status = (s: (typeof INBOX)[number], client?: string | null) => run(setStatus({ data: { id: item.id, status: s, ...(client !== undefined ? { crm_client_id: client } : {}) } }));
  if (create)
    return (
      <ClientForm
        prefill={{ first_name: first ?? "", last_name: rest.join(" "), email: item.email, phone: item.phone, preferred_language: item.language === "fr" ? "fr" : item.language === "en" ? "en" : "nl", notes: item.message }}
        onCreated={(id) => void status(item.status === "new" ? "in_progress" : (item.status as (typeof INBOX)[number]), id)}
        onClose={() => { setCreate(false); onClose(); }}
      />
    );
  return (
    <CrmModal open onClose={onClose} title={item.full_name || item.email}>
      <div className="space-y-5">
        <p className="text-xs text-muted-foreground">{t.form}: {item.template_slug} · {dateLabel(item.created_at, language, true)}</p>
        <div className="flex flex-wrap gap-2">
          {item.email && <Button asChild variant="secondary" size="sm"><a href={`mailto:${item.email}`}><Mail />{t.reply_}</a></Button>}
          {item.phone && <Button asChild variant="secondary" size="sm"><a href={`tel:${item.phone}`}><Phone />{c.call}</a></Button>}
          {item.phone && <Button asChild variant="secondary" size="sm"><a href={whatsappHref(item.phone)} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button>}
        </div>
        {item.message && <div><p className="text-sm font-semibold">{t.message}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm">{item.message}</p></div>}
        {answers.length > 0 && (
          <dl className="crm-details">
            {answers.map(([k, v]) => <div key={k}><dt>{k}</dt><dd className="break-words">{typeof v === "string" ? v : JSON.stringify(v)}</dd></div>)}
          </dl>
        )}
        <Field label={c.status}>
          <select className="crm-select" value={item.status} onChange={(e) => void status(e.target.value as (typeof INBOX)[number])}>
            {INBOX.map((s) => <option key={s} value={s}>{t.inboxStatus[s]}</option>)}
          </select>
        </Field>
        <Field label={t.linkClient}>
          <div className="flex gap-2">
            <select className="crm-select" value={linkTo} onChange={(e) => setLinkTo(e.target.value)}>
              <option value="">{t.none}</option>
              {f.clients.map((k) => <option key={k.id} value={k.id}>{k.number} · {displayClient(k)}</option>)}
            </select>
            <Button variant="secondary" onClick={() => void status(item.status as (typeof INBOX)[number], linkTo || null)}>{c.save}</Button>
          </div>
        </Field>
        {item.crm_client_id && <Button asChild variant="ghost" size="sm"><Link to="/crm/clients/$id" params={{ id: item.crm_client_id }}>{t.linkedTo} →</Link></Button>}
        {error && <p role="alert" className="text-sm text-destructive">{c.failed}</p>}
        <div className="flex justify-end">
          <Button onClick={() => setCreate(true)}><UserPlus />{t.createClient}</Button>
        </div>
      </div>
    </CrmModal>
  );
}

/* ---------------- Reports ---------------- */
export const reportQuery = () => queryOptions({ queryKey: ["crm-reports"], queryFn: () => getReportData(), staleTime: 0 });
export function ReportsPage() {
  const { c, language, data: f } = useFoundation();
  const t = c.p5Ui;
  const isAdmin = f.member?.foundation_role === "admin";
  const { data } = useQuery({ ...reportQuery(), enabled: isAdmin });
  const alerts = useImmAlerts();
  if (!isAdmin) return <><PageTitle title={t.reportsTitle} /><p>{t.adminOnly}</p></>;
  if (!data) return <PageTitle title={t.reportsTitle} />;
  const eur = (n: number) => n.toLocaleString(language === "fr" ? "fr-BE" : "nl-BE", { style: "currency", currency: "EUR" });
  const services = Array.from(new Set(data.dossiers.map((d) => d.service))).sort();
  const statuses = Array.from(new Set(data.dossiers.map((d) => d.status))).sort();
  const months = new Map<string, number>();
  for (const k of data.clients) months.set(k.created_at.slice(0, 7), (months.get(k.created_at.slice(0, 7)) ?? 0) + 1);
  const monthRows = [...months.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  const orig = data.debts.reduce((s, d) => s + Number(d.original_amount), 0);
  const out = data.debts.reduce((s, d) => s + Number(d.outstanding_amount), 0);
  const avg = avgDurationDays(data.dossiers);
  const svc = (s: string) => c.services[s as keyof typeof c.services] ?? s;
  const stl = (s: string) => c.statuses[s as keyof typeof c.statuses] ?? s;
  const dossierNum = (id: string) => f.dossiers.find((d) => d.id === id)?.number ?? "";
  function csv() {
    const rows: (string | number)[][] = [
      [t.byService], ["", ...statuses.map(stl)],
      ...services.map((s) => [svc(s), ...statuses.map((st) => data!.dossiers.filter((d) => d.service === s && d.status === st).length)]),
      [], [t.newClients], ...monthRows.map(([m, n]) => [m, n]),
      [], [t.avgDuration, avg ?? ""],
      [], [t.debtsTotals], [t.original, orig.toFixed(2)], [t.outstanding, out.toFixed(2)], [t.paid, (orig - out).toFixed(2)],
      [], [t.immDeadlines], ...alerts.map((a) => [dossierNum(a.dossierId), a.label, a.date, a.days]),
    ];
    const blob = new Blob(["\ufeff" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `zadiassure-rapport-${todayIso()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return (
    <>
      <PageTitle title={t.reportsTitle} action={<Button onClick={csv}><Download />{t.csv}</Button>} />
      <div className="crm-metrics">
        <div className="crm-card crm-metric"><span>{t.avgDuration}</span><strong>{avg === null ? "—" : `${avg} ${t.days}`}</strong></div>
        <div className="crm-card crm-metric"><span>{t.original}</span><strong>{eur(orig)}</strong></div>
        <div className="crm-card crm-metric"><span>{t.outstanding}</span><strong>{eur(out)}</strong></div>
        <div className="crm-card crm-metric"><span>{t.paid}</span><strong>{eur(orig - out)}</strong></div>
      </div>
      <h2 className="crm-section-title mt-8">{t.byService}</h2>
      <div className="crm-card overflow-x-auto">
        <table className="crm-table">
          <thead><tr><th />{statuses.map((s) => <th key={s}>{stl(s)}</th>)}</tr></thead>
          <tbody>{services.map((s) => <tr key={s}><td>{svc(s)}</td>{statuses.map((st) => <td key={st} className="tabular-nums">{data.dossiers.filter((d) => d.service === s && d.status === st).length}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="crm-overview-grid mt-8">
        <section>
          <h2 className="crm-section-title">{t.newClients}</h2>
          <div className="crm-card">{monthRows.length ? monthRows.map(([m, n]) => <div key={m} className="crm-list-row"><span>{m}</span><strong className="tabular-nums">{n}</strong></div>) : <p className="p-4 text-sm text-muted-foreground">{t.none}</p>}</div>
        </section>
        <section>
          <h2 className="crm-section-title">{t.immDeadlines}</h2>
          <div className="crm-card">{alerts.length ? alerts.map((a, i) => <Link key={i} to="/crm/cases/$id" params={{ id: a.dossierId }} className="crm-list-row"><div className="min-w-0"><strong className="block truncate">{a.label}</strong><small>{dossierNum(a.dossierId)}</small></div><span className="text-xs">{dateLabel(a.date, language)}</span></Link>) : <p className="p-4 text-sm text-muted-foreground">{t.none}</p>}</div>
        </section>
      </div>
    </>
  );
}
