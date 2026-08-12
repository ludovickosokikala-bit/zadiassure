import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  deleteMandate,
  linkMandateClient,
  listMandates,
  saveMandate,
  setMandateStatus,
} from "@/lib/mandates.functions";
import { listClients } from "@/lib/crm.functions";
import { Empty, Field, PageHead, Panel, Pill, selectClass } from "@/components/crm/ui";
import { clientName, formatDate, useCrmDict, useWorkspace } from "@/components/crm/useCrm";
import { useMandateDict } from "@/components/crm/useMandate";
import {
  MANDATE_SCOPES,
  MANDATE_STATUSES,
  type MandateScope,
  type MandateStatus,
} from "@/i18n/mandate";

export const Route = createFileRoute("/crm/mandates")({ component: MandatesPage });

type MandateRow = {
  id: string;
  client_id: string | null;
  holder_user_id: string | null;
  holder_name: string | null;
  scope: string[] | null;
  purpose: string | null;
  starts_on: string | null;
  ends_on: string | null;
  status: MandateStatus;
  source: string | null;
  applicant_name: string | null;
  applicant_email: string | null;
  signed_full_name: string | null;
  signed_at: string | null;
  signature_image: string | null;
  notes: string | null;
  clients?: { id: string; first_name: string; last_name: string; company_name: string } | null;
};

function statusTone(status: MandateStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800";
    case "signed":
      return "bg-amber-100 text-amber-900";
    case "pending_signature":
      return "bg-secondary text-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function MandatesPage() {
  const c = useCrmDict();
  const m = useMandateDict();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<MandateStatus | "">("");
  const [editing, setEditing] = useState<MandateRow | "new" | null>(null);

  const fetchMandates = useServerFn(listMandates);
  const { data, isLoading } = useQuery({
    queryKey: ["crm", "mandates"],
    queryFn: () => fetchMandates(),
  });

  const changeStatus = useServerFn(setMandateStatus);
  const link = useServerFn(linkMandateClient);
  const remove = useServerFn(deleteMandate);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["crm"] });
  const statusMutation = useMutation({
    mutationFn: (v: { id: string; status: MandateStatus }) => changeStatus({ data: v }),
    onSuccess: invalidate,
  });
  const linkMutation = useMutation({
    mutationFn: (id: string) => link({ data: { id } }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: invalidate,
  });

  const items = useMemo(() => {
    const rows = (data?.items ?? []) as unknown as MandateRow[];
    return filter ? rows.filter((r) => r.status === filter) : rows;
  }, [data, filter]);

  const soon = (row: MandateRow) => {
    if (!row.ends_on || row.status !== "active") return false;
    const days = (new Date(row.ends_on).getTime() - Date.now()) / 86_400_000;
    return days >= 0 && days <= 30;
  };

  return (
    <>
      <PageHead
        title={m.crm.title}
        intro={m.crm.intro}
        action={
          <Button onClick={() => setEditing("new")} className="gap-2">
            <Plus className="h-4 w-4" /> {m.crm.newMandate}
          </Button>
        }
      />

      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            className={cn(selectClass, "max-w-56")}
            value={filter}
            onChange={(e) => setFilter(e.target.value as MandateStatus | "")}
          >
            <option value="">{c.common.all}</option>
            {MANDATE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {m.statuses[s]}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <Empty text={c.common.loading} />
        ) : items.length === 0 ? (
          <Empty text={m.crm.empty} />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((row) => (
              <li key={row.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      <ShieldCheck className="h-4 w-4 text-accent" />
                      {row.clients ? (
                        <Link
                          to="/crm/clients/$id"
                          params={{ id: row.clients.id }}
                          className="hover:text-primary"
                        >
                          {clientName(row.clients as never)}
                        </Link>
                      ) : (
                        <span>{row.applicant_name || m.crm.noClient}</span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(row.scope ?? [])
                        .map((s) => m.scopes[s as MandateScope] ?? s)
                        .join(" · ") || "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {m.crm.startsOn}: {formatDate(row.starts_on) || "—"} · {m.crm.endsOn}:{" "}
                      {formatDate(row.ends_on) || "—"}
                      {row.signed_at && ` · ${m.crm.signedAt}: ${formatDate(row.signed_at)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {row.source === "public_form" && (
                      <Pill className="bg-secondary text-foreground">{m.crm.fromWebsite}</Pill>
                    )}
                    {soon(row) && (
                      <Pill className="bg-amber-100 text-amber-900">{m.crm.expiringSoon}</Pill>
                    )}
                    <Pill className={statusTone(row.status)}>{m.statuses[row.status]}</Pill>
                  </div>
                </div>

                {row.signature_image && (
                  <img
                    src={row.signature_image}
                    alt={m.crm.signature}
                    className="mt-3 h-16 w-auto rounded-lg border border-border bg-card"
                  />
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(row)}>
                    {c.common.edit}
                  </Button>
                  {!row.client_id && row.applicant_email && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={linkMutation.isPending}
                      onClick={() => linkMutation.mutate(row.id)}
                    >
                      <UserPlus className="h-3.5 w-3.5" /> {m.crm.linkClient}
                    </Button>
                  )}
                  {row.status !== "active" && row.status !== "revoked" && (
                    <Button
                      size="sm"
                      onClick={() => statusMutation.mutate({ id: row.id, status: "active" })}
                    >
                      {m.crm.activate}
                    </Button>
                  )}
                  {row.status !== "revoked" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => statusMutation.mutate({ id: row.id, status: "revoked" })}
                    >
                      {m.crm.revoke}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate(row.id)}
                  >
                    {m.crm.delete}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {editing && (
        <MandateDialog row={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

function MandateDialog({ row, onClose }: { row: MandateRow | null; onClose: () => void }) {
  const m = useMandateDict();
  const c = useCrmDict();
  const queryClient = useQueryClient();
  const workspace = useWorkspace();
  const team = workspace.data?.team ?? [];

  const fetchClients = useServerFn(listClients);
  const clients = useQuery({
    queryKey: ["crm", "clients", "picker"],
    queryFn: () => fetchClients({ data: { search: "", status: "" } }),
  });

  const [clientId, setClientId] = useState(row?.client_id ?? "");
  const [holder, setHolder] = useState(row?.holder_user_id ?? "");
  const [scopes, setScopes] = useState<MandateScope[]>(
    ((row?.scope ?? []) as MandateScope[]).filter((s) => MANDATE_SCOPES.includes(s)),
  );
  const [purpose, setPurpose] = useState(row?.purpose ?? "");
  const [startsOn, setStartsOn] = useState(row?.starts_on ?? "");
  const [endsOn, setEndsOn] = useState(row?.ends_on ?? "");
  const [status, setStatus] = useState<MandateStatus>(row?.status ?? "pending_signature");
  const [notes, setNotes] = useState(row?.notes ?? "");

  const save = useServerFn(saveMandate);
  const mutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          id: row?.id,
          client_id: clientId || null,
          case_id: null,
          holder_user_id: holder || null,
          holder_name: team.find((t) => t.user_id === holder)?.full_name ?? "",
          scope: scopes,
          purpose,
          starts_on: startsOn || null,
          ends_on: endsOn || null,
          status,
          notes,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crm"] });
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{row ? m.crm.editMandate : m.crm.newMandate}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Field label={m.crm.client}>
            <select
              className={selectClass}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">{m.crm.noClient}</option>
              {(clients.data?.items ?? []).map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {clientName(cl as never)}
                </option>
              ))}
            </select>
          </Field>

          <Field label={m.crm.holder}>
            <select className={selectClass} value={holder} onChange={(e) => setHolder(e.target.value)}>
              <option value="">—</option>
              {team.map((t) => (
                <option key={t.user_id} value={t.user_id}>
                  {t.full_name || t.email}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">{m.crm.holderHint}</p>
          </Field>

          <Field label={m.crm.scope}>
            <div className="grid gap-2 sm:grid-cols-2">
              {MANDATE_SCOPES.map((scope) => (
                <label key={scope} className="flex cursor-pointer items-start gap-2 text-sm">
                  <Checkbox
                    checked={scopes.includes(scope)}
                    onCheckedChange={() =>
                      setScopes((prev) =>
                        prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
                      )
                    }
                  />
                  <span>{m.scopes[scope]}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label={m.crm.purpose}>
            <Textarea rows={3} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={m.crm.startsOn}>
              <Input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} />
            </Field>
            <Field label={m.crm.endsOn}>
              <Input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
            </Field>
          </div>

          <Field label={m.crm.status}>
            <select
              className={selectClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as MandateStatus)}
            >
              {MANDATE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {m.statuses[s]}
                </option>
              ))}
            </select>
          </Field>

          <Field label={m.crm.notes}>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {c.common.cancel}
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {c.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
