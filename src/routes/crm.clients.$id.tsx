import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { ctaVariants } from "@/components/ui/cta";
import { cn } from "@/lib/utils";
import { getClient } from "@/lib/crm.functions";
import { ContactActions } from "@/components/crm/ContactActions";
import { MailPanel } from "@/components/crm/MailPanel";

import { Empty, PageHead, Panel, Pill } from "@/components/crm/ui";
import {
  clientName,
  docTone,
  formatDate,
  priorityTone,
  taskTone,
  useCrmDict,
} from "@/components/crm/useCrm";
import { CaseDialog, ClientDialog, DocumentDialog, TaskDialog } from "@/components/crm/dialogs";

export const Route = createFileRoute("/crm/clients/$id")({ component: ClientDetail });

function ClientDetail() {
  const { id } = Route.useParams();
  const c = useCrmDict();
  const fetchClient = useServerFn(getClient);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["crm", "client", id],
    queryFn: () => fetchClient({ data: { id } }),
  });
  const [editOpen, setEditOpen] = useState(false);
  const [caseOpen, setCaseOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{c.common.loading}</p>;
  const client = data.client;

  return (
    <>
      <Link
        to="/crm/clients"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> {c.common.back}
      </Link>
      <PageHead
        title={clientName(client)}
        intro={`${c.clientType[client.client_type as keyof typeof c.clientType] ?? client.client_type} · ${client.status}`}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className={cn(ctaVariants({ variant: "outline", size: "sm" }))}
            >
              <Pencil className="mr-1 h-4 w-4" /> {c.common.edit}
            </button>
            <button
              onClick={() => setCaseOpen(true)}
              className={cn(ctaVariants({ variant: "primary", size: "sm" }))}
            >
              <Plus className="mr-1 h-4 w-4" /> {c.cases.newCase}
            </button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title={c.clients.overview}>
          <dl className="space-y-2 text-sm">
            {[
              [c.clients.email, client.email],
              [c.clients.phone, client.phone],
              [c.clients.address, [client.address, client.postal_code, client.city].filter(Boolean).join(", ")],
              [c.clients.dateOfBirth, formatDate(client.date_of_birth)],
              [c.clients.language, (client.preferred_language ?? "").toUpperCase()],
              [c.clients.contactPreference, client.contact_preference],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium text-foreground">{value || "—"}</dd>
              </div>
            ))}
          </dl>
          <ContactActions phone={client.phone} email={client.email} className="mt-4" />
          {client.notes && (
            <p className="mt-4 whitespace-pre-line rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              {client.notes}
            </p>
          )}
        </Panel>

        <Panel title={c.clients.cases} className="lg:col-span-2">
          {data.cases.length === 0 ? (
            <Empty text={c.cases.noCases} />
          ) : (
            <ul className="divide-y divide-border">
              {data.cases.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      to="/crm/cases/$id"
                      params={{ id: row.id }}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {row.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      #{row.case_number} · {row.status_key} · {formatDate(row.deadline)}
                    </p>
                  </div>
                  <Pill className={priorityTone[row.priority] ?? ""}>
                    {c.priority[row.priority as keyof typeof c.priority]}
                  </Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={c.clients.tasks}
          action={
            <button
              onClick={() => setTaskOpen(true)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {c.tasks.newTask}
            </button>
          }
        >
          {data.tasks.length === 0 ? (
            <Empty text={c.tasks.noTasks} />
          ) : (
            <ul className="divide-y divide-border">
              {data.tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{t.title}</span>
                  <Pill className={taskTone(t.status)}>
                    {c.taskStatus[t.status as keyof typeof c.taskStatus]}
                  </Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={c.clients.documents}
          action={
            <button
              onClick={() => setDocOpen(true)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {c.documents.request}
            </button>
          }
        >
          {data.documents.length === 0 ? (
            <Empty text={c.documents.noDocuments} />
          ) : (
            <ul className="divide-y divide-border">
              {data.documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{d.name}</span>
                  <Pill className={docTone(d.status)}>
                    {c.docStatus[d.status as keyof typeof c.docStatus]}
                  </Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <MailPanel
          email={client.email}
          clientId={client.id}
          className="lg:col-span-2"
        />

        <Panel title={c.clients.activity}>

          {data.activities.length === 0 ? (
            <Empty text={c.common.empty} />
          ) : (
            <ol className="space-y-3">
              {data.activities.slice(0, 12).map((a) => (
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
      </div>

      <ClientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        row={client}
        onSaved={() => refetch()}
      />
      <CaseDialog
        open={caseOpen}
        onOpenChange={setCaseOpen}
        clients={[client]}
        defaultClientId={client.id}
        onSaved={() => refetch()}
      />
      <TaskDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        clientId={client.id}
        onSaved={() => refetch()}
      />
      <DocumentDialog
        open={docOpen}
        onOpenChange={setDocOpen}
        clientId={client.id}
        onSaved={() => refetch()}
      />
    </>
  );
}
