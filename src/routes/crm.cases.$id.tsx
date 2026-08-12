import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ctaVariants } from "@/components/ui/cta";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n";
import { addNote, getCase } from "@/lib/crm.functions";
import { Empty, PageHead, Panel, Pill } from "@/components/crm/ui";
import { CaseAssistant } from "@/components/crm/ai";
import {
  clientName,
  docTone,
  formatDate,
  localized,
  priorityTone,
  taskTone,
  useCrmDict,
  useWorkspace,
} from "@/components/crm/useCrm";
import { CaseDialog, DocumentDialog, TaskDialog } from "@/components/crm/dialogs";

export const Route = createFileRoute("/crm/cases/$id")({ component: CaseDetail });

type Tab = "overview" | "tasks" | "documents" | "timeline" | "notes";

function CaseDetail() {
  const { id } = Route.useParams();
  const c = useCrmDict();
  const { locale } = useLanguage();
  const ws = useWorkspace();
  const fetchCase = useServerFn(getCase);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["crm", "case", id],
    queryFn: () => fetchCase({ data: { id } }),
  });
  const [tab, setTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [note, setNote] = useState("");
  const [internal, setInternal] = useState(true);
  const submitNote = useServerFn(addNote);
  const noteMutation = useMutation({
    mutationFn: () =>
      submitNote({ data: { case_id: id, client_id: null, body: note, is_internal: internal } }),
    onSuccess: () => {
      setNote("");
      refetch();
    },
    onError: () => toast.error(c.common.saveFailed),
  });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{c.common.loading}</p>;
  const row = data.case;
  const statuses = ws.data?.caseStatuses ?? [];
  const statusLabel =
    localized(statuses.find((s) => s.key === row.status_key) as never, "label", locale) ||
    row.status_key;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: c.cases.tabs.overview },
    { key: "tasks", label: c.cases.tabs.tasks },
    { key: "documents", label: c.cases.tabs.documents },
    { key: "timeline", label: c.cases.tabs.timeline },
    { key: "notes", label: c.cases.tabs.notes },
  ];

  return (
    <>
      <Link
        to="/crm/cases"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {c.common.back}
      </Link>
      <PageHead
        title={row.title}
        intro={`#${row.case_number} · ${clientName(row.clients ?? undefined)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Pill className="bg-primary/10 text-primary">{statusLabel}</Pill>
            <Pill className={priorityTone[row.priority] ?? ""}>
              {c.priority[row.priority as keyof typeof c.priority]}
            </Pill>
            <button
              onClick={() => setEditOpen(true)}
              className={cn(ctaVariants({ variant: "outline", size: "sm" }))}
            >
              <Pencil className="mr-1 h-4 w-4" /> {c.common.edit}
            </button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title={c.cases.tabs.overview} className="lg:col-span-2">
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              {[
                [c.cases.client, clientName(row.clients ?? undefined)],
                [c.cases.stage, row.stage],
                [c.cases.startDate, formatDate(row.start_date)],
                [c.cases.targetDate, formatDate(row.target_date)],
                [c.cases.deadline, formatDate(row.deadline)],
                [c.cases.progress, `${row.progress ?? 0}%`],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium text-foreground">{value || "—"}</dd>
                </div>
              ))}
            </dl>
            {row.description && (
              <p className="mt-4 whitespace-pre-line rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                {row.description}
              </p>
            )}
            <div className="mt-5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.min(100, Math.max(0, row.progress ?? 0))}%` }}
                />
              </div>
            </div>
          </Panel>
          <Panel title={c.cases.workflow}>
            <ol className="space-y-2 text-sm">
              {statuses.map((s) => (
                <li
                  key={s.key}
                  className={cn(
                    "rounded-lg px-3 py-2",
                    s.key === row.status_key
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {localized(s as never, "label", locale)}
                </li>
              ))}
            </ol>
          </Panel>
          <div className="lg:col-span-3">
            <CaseAssistant caseId={data.case.id} />
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <Panel
          title={c.cases.tabs.tasks}
          action={
            <button
              onClick={() => setTaskOpen(true)}
              className={cn(ctaVariants({ variant: "primary", size: "sm" }))}
            >
              <Plus className="mr-1 h-4 w-4" /> {c.tasks.newTask}
            </button>
          }
        >
          {data.tasks.length === 0 ? (
            <Empty text={c.tasks.noTasks} />
          ) : (
            <ul className="divide-y divide-border">
              {data.tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.due_date)}</p>
                  </div>
                  <Pill className={taskTone(t.status)}>
                    {c.taskStatus[t.status as keyof typeof c.taskStatus]}
                  </Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {tab === "documents" && (
        <Panel
          title={c.cases.tabs.documents}
          action={
            <button
              onClick={() => setDocOpen(true)}
              className={cn(ctaVariants({ variant: "primary", size: "sm" }))}
            >
              <Plus className="mr-1 h-4 w-4" /> {c.documents.request}
            </button>
          }
        >
          {data.documents.length === 0 ? (
            <Empty text={c.documents.noDocuments} />
          ) : (
            <ul className="divide-y divide-border">
              {data.documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.document_type || "—"} · {formatDate(d.expires_on)}
                    </p>
                  </div>
                  <Pill className={docTone(d.status)}>
                    {c.docStatus[d.status as keyof typeof c.docStatus]}
                  </Pill>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">{c.documents.uploadHint}</p>
        </Panel>
      )}

      {tab === "timeline" && (
        <Panel title={c.cases.tabs.timeline}>
          {data.activities.length === 0 ? (
            <Empty text={c.common.empty} />
          ) : (
            <ol className="space-y-3">
              {data.activities.map((a) => (
                <li key={a.id} className="border-l-2 border-border pl-3">
                  <p className="text-sm text-foreground">{a.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.actor_label} · {formatDate(a.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      )}

      {tab === "notes" && (
        <Panel title={c.cases.tabs.notes}>
          <div className="space-y-3">
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={c.notes.placeholder}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={internal} onCheckedChange={setInternal} />
                {internal ? c.notes.internal : c.notes.clientVisible}
              </label>
              <button
                disabled={!note.trim() || noteMutation.isPending}
                onClick={() => noteMutation.mutate()}
                className={cn(ctaVariants({ variant: "primary", size: "sm" }))}
              >
                {c.notes.addNote}
              </button>
            </div>
          </div>
          <div className="mt-5">
            {data.notes.length === 0 ? (
              <Empty text={c.notes.noNotes} />
            ) : (
              <ul className="space-y-3">
                {data.notes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-border p-3">
                    <p className="whitespace-pre-line text-sm text-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.is_internal ? c.notes.internal : c.notes.clientVisible} ·{" "}
                      {formatDate(n.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>
      )}

      <CaseDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        row={row}
        clients={row.clients ? [{ ...row.clients, id: row.client_id }] : []}
        onSaved={() => refetch()}
      />
      <TaskDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        caseId={row.id}
        clientId={row.client_id}
        onSaved={() => refetch()}
      />
      <DocumentDialog
        open={docOpen}
        onOpenChange={setDocOpen}
        caseId={row.id}
        clientId={row.client_id}
        onSaved={() => refetch()}
      />
    </>
  );
}
