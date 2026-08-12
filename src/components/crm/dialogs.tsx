import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ctaVariants } from "@/components/ui/cta";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n";
import {
  CLIENT_TYPES,
  CONTACT_PREFS,
  DOC_STATUSES,
  LANGS,
  PRIORITIES,
  TASK_STATUSES,
} from "@/lib/crm.schemas";
import { saveCase, saveClient, saveDocument, saveTask } from "@/lib/crm.functions";
import { Field, selectClass } from "./ui";
import { clientName, localized, useCrmDict, useWorkspace } from "./useCrm";

type Row = Record<string, unknown>;

function useSaver<T>(fn: (input: T) => Promise<unknown>, onDone: () => void) {
  const c = useCrmDict();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => onDone(),
    onError: (e: Error) => toast.error(e.message === "FORBIDDEN" ? c.noAccess.title : c.common.saveFailed),
  });
}

function Shell({
  open,
  onOpenChange,
  title,
  children,
  onSubmit,
  busy,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: React.ReactNode;
  onSubmit: () => void;
  busy: boolean;
}) {
  const c = useCrmDict();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">{title}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {children}
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={cn(ctaVariants({ variant: "outline", size: "sm" }))}
            >
              {c.common.cancel}
            </button>
            <button
              type="submit"
              disabled={busy}
              className={cn(ctaVariants({ variant: "primary", size: "sm" }))}
            >
              {c.common.save}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const emptyClient = {
  client_type: "individual",
  first_name: "",
  last_name: "",
  company_name: "",
  date_of_birth: null,
  email: "",
  phone: "",
  address: "",
  city: "",
  postal_code: "",
  country: "BE",
  preferred_language: "nl",
  contact_preference: "email",
  status: "prospect",
  notes: "",
  assigned_to: null,
} as Row;

export function ClientDialog({
  open,
  onOpenChange,
  row,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row?: Row | null;
  onSaved: (id: string) => void;
}) {
  const c = useCrmDict();
  const ws = useWorkspace();
  const team = ws.data?.team ?? [];
  const [form, setForm] = useState<Row>(emptyClient);
  const save = useServerFn(saveClient);
  const mutation = useSaver(
    (input: Row) => save({ data: input as never }),
    () => onOpenChange(false),
  );

  useEffect(() => {
    if (open) setForm(row ? { ...emptyClient, ...row } : emptyClient);
  }, [open, row]);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const str = (key: string) => (form[key] as string) ?? "";

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={row?.["id"] ? c.clients.editClient : c.clients.newClient}
      busy={mutation.isPending}
      onSubmit={() =>
        mutation.mutate(form, {
          onSuccess: (res) => onSaved((res as { id: string }).id),
        })
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.clients.type}>
          <select
            className={selectClass}
            value={str("client_type")}
            onChange={(e) => set("client_type", e.target.value)}
          >
            {CLIENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {c.clientType[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.clients.status}>
          <select
            className={selectClass}
            value={str("status")}
            onChange={(e) => set("status", e.target.value)}
          >
            {["prospect", "active", "inactive"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.clients.firstName}>
          <Input value={str("first_name")} onChange={(e) => set("first_name", e.target.value)} />
        </Field>
        <Field label={c.clients.lastName}>
          <Input value={str("last_name")} onChange={(e) => set("last_name", e.target.value)} />
        </Field>
        <Field label={c.clients.companyName} className="sm:col-span-2">
          <Input value={str("company_name")} onChange={(e) => set("company_name", e.target.value)} />
        </Field>
        <Field label={c.clients.email}>
          <Input type="email" value={str("email")} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label={c.clients.phone}>
          <Input value={str("phone")} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label={c.clients.address} className="sm:col-span-2">
          <Input value={str("address")} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field label={c.clients.postalCode}>
          <Input value={str("postal_code")} onChange={(e) => set("postal_code", e.target.value)} />
        </Field>
        <Field label={c.clients.city}>
          <Input value={str("city")} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label={c.clients.dateOfBirth}>
          <Input
            type="date"
            value={str("date_of_birth")}
            onChange={(e) => set("date_of_birth", e.target.value || null)}
          />
        </Field>
        <Field label={c.clients.language}>
          <select
            className={selectClass}
            value={str("preferred_language")}
            onChange={(e) => set("preferred_language", e.target.value)}
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.clients.contactPreference}>
          <select
            className={selectClass}
            value={str("contact_preference")}
            onChange={(e) => set("contact_preference", e.target.value)}
          >
            {CONTACT_PREFS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.clients.assignedTo}>
          <select
            className={selectClass}
            value={(form["assigned_to"] as string) ?? ""}
            onChange={(e) => set("assigned_to", e.target.value || null)}
          >
            <option value="">{c.common.unassigned}</option>
            {team.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.full_name || m.email}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.clients.notes} className="sm:col-span-2">
          <Textarea
            rows={3}
            value={str("notes")}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>
      </div>
    </Shell>
  );
}

export function CaseDialog({
  open,
  onOpenChange,
  row,
  clients,
  defaultClientId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row?: Row | null;
  clients: Row[];
  defaultClientId?: string;
  onSaved: (id: string) => void;
}) {
  const c = useCrmDict();
  const { locale } = useLanguage();
  const ws = useWorkspace();
  const team = ws.data?.team ?? [];
  const types = ws.data?.caseTypes ?? [];
  const statuses = ws.data?.caseStatuses ?? [];
  const save = useServerFn(saveCase);
  const [form, setForm] = useState<Row>({});
  const mutation = useSaver(
    (input: Row) => save({ data: input as never }),
    () => onOpenChange(false),
  );

  useEffect(() => {
    if (!open) return;
    setForm(
      row
        ? { ...row }
        : {
            client_id: defaultClientId ?? "",
            case_type_id: null,
            title: "",
            description: "",
            status_key: statuses[0]?.key ?? "new",
            stage: "",
            priority: "normal",
            assigned_to: null,
            progress: 0,
            start_date: null,
            target_date: null,
            deadline: null,
            tags: [],
          },
    );
  }, [open, row, defaultClientId, statuses]);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const str = (key: string) => (form[key] as string) ?? "";
  const selectedType = types.find((t) => t.id === form["case_type_id"]);
  const stages = (selectedType?.workflow_stages as string[] | null) ?? [];

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={row?.["id"] ? c.cases.editCase : c.cases.newCase}
      busy={mutation.isPending}
      onSubmit={() =>
        mutation.mutate(
          {
            ...form,
            progress: Number(form["progress"] ?? 0),
            case_type_id: form["case_type_id"] || null,
          },
          { onSuccess: (res) => onSaved((res as { id: string }).id) },
        )
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.cases.caseTitle} className="sm:col-span-2">
          <Input required value={str("title")} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label={c.cases.client}>
          <select
            required
            className={selectClass}
            value={str("client_id")}
            onChange={(e) => set("client_id", e.target.value)}
          >
            <option value="">—</option>
            {clients.map((cl) => (
              <option key={cl["id"] as string} value={cl["id"] as string}>
                {clientName(cl as never)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.cases.type}>
          <select
            className={selectClass}
            value={(form["case_type_id"] as string) ?? ""}
            onChange={(e) => set("case_type_id", e.target.value || null)}
          >
            <option value="">{c.common.none}</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {localized(t as never, "name", locale)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.cases.status}>
          <select
            className={selectClass}
            value={str("status_key")}
            onChange={(e) => set("status_key", e.target.value)}
          >
            {statuses.map((s) => (
              <option key={s.key} value={s.key}>
                {localized(s as never, "label", locale)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.cases.stage}>
          {stages.length ? (
            <select
              className={selectClass}
              value={str("stage")}
              onChange={(e) => set("stage", e.target.value)}
            >
              <option value="">{c.common.none}</option>
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <Input value={str("stage")} onChange={(e) => set("stage", e.target.value)} />
          )}
        </Field>
        <Field label={c.cases.priority}>
          <select
            className={selectClass}
            value={str("priority")}
            onChange={(e) => set("priority", e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {c.priority[p]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.cases.assignedTo}>
          <select
            className={selectClass}
            value={(form["assigned_to"] as string) ?? ""}
            onChange={(e) => set("assigned_to", e.target.value || null)}
          >
            <option value="">{c.common.unassigned}</option>
            {team.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.full_name || m.email}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.cases.startDate}>
          <Input
            type="date"
            value={str("start_date")}
            onChange={(e) => set("start_date", e.target.value || null)}
          />
        </Field>
        <Field label={c.cases.targetDate}>
          <Input
            type="date"
            value={str("target_date")}
            onChange={(e) => set("target_date", e.target.value || null)}
          />
        </Field>
        <Field label={c.cases.deadline}>
          <Input
            type="date"
            value={str("deadline")}
            onChange={(e) => set("deadline", e.target.value || null)}
          />
        </Field>
        <Field label={`${c.cases.progress} (%)`}>
          <Input
            type="number"
            min={0}
            max={100}
            value={String(form["progress"] ?? 0)}
            onChange={(e) => set("progress", e.target.value)}
          />
        </Field>
        <Field label={c.cases.description} className="sm:col-span-2">
          <Textarea
            rows={3}
            value={str("description")}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
      </div>
    </Shell>
  );
}

export function TaskDialog({
  open,
  onOpenChange,
  row,
  caseId,
  clientId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row?: Row | null;
  caseId?: string | null;
  clientId?: string | null;
  onSaved: () => void;
}) {
  const c = useCrmDict();
  const ws = useWorkspace();
  const team = ws.data?.team ?? [];
  const save = useServerFn(saveTask);
  const [form, setForm] = useState<Row>({});
  const mutation = useSaver(
    (input: Row) => save({ data: input as never }),
    () => onOpenChange(false),
  );

  useEffect(() => {
    if (!open) return;
    setForm(
      row
        ? { ...row }
        : {
            case_id: caseId ?? null,
            client_id: clientId ?? null,
            title: "",
            description: "",
            assigned_to: ws.data?.member?.userId ?? null,
            status: "todo",
            priority: "normal",
            due_date: null,
            due_time: null,
          },
    );
  }, [open, row, caseId, clientId, ws.data]);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const str = (key: string) => (form[key] as string) ?? "";

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={row?.["id"] ? c.common.edit : c.tasks.newTask}
      busy={mutation.isPending}
      onSubmit={() => mutation.mutate(form, { onSuccess: () => onSaved() })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.tasks.taskTitle} className="sm:col-span-2">
          <Input required value={str("title")} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label={c.tasks.status}>
          <select
            className={selectClass}
            value={str("status")}
            onChange={(e) => set("status", e.target.value)}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {c.taskStatus[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.tasks.priority}>
          <select
            className={selectClass}
            value={str("priority")}
            onChange={(e) => set("priority", e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {c.priority[p]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.tasks.dueDate}>
          <Input
            type="date"
            value={str("due_date")}
            onChange={(e) => set("due_date", e.target.value || null)}
          />
        </Field>
        <Field label={c.tasks.dueTime}>
          <Input
            type="time"
            value={str("due_time").slice(0, 5)}
            onChange={(e) => set("due_time", e.target.value || null)}
          />
        </Field>
        <Field label={c.tasks.assignedTo}>
          <select
            className={selectClass}
            value={(form["assigned_to"] as string) ?? ""}
            onChange={(e) => set("assigned_to", e.target.value || null)}
          >
            <option value="">{c.common.unassigned}</option>
            {team.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.full_name || m.email}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.tasks.description} className="sm:col-span-2">
          <Textarea
            rows={3}
            value={str("description")}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
      </div>
    </Shell>
  );
}

export function DocumentDialog({
  open,
  onOpenChange,
  row,
  caseId,
  clientId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row?: Row | null;
  caseId?: string | null;
  clientId: string;
  onSaved: () => void;
}) {
  const c = useCrmDict();
  const save = useServerFn(saveDocument);
  const [form, setForm] = useState<Row>({});
  const mutation = useSaver(
    (input: Row) => save({ data: input as never }),
    () => onOpenChange(false),
  );

  useEffect(() => {
    if (!open) return;
    setForm(
      row
        ? { ...row }
        : {
            case_id: caseId ?? null,
            client_id: clientId,
            name: "",
            document_type: "",
            status: "requested",
            requested_from_client: true,
            notes: "",
            expires_on: null,
          },
    );
  }, [open, row, caseId, clientId]);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const str = (key: string) => (form[key] as string) ?? "";

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={row?.["id"] ? c.common.edit : c.documents.request}
      busy={mutation.isPending}
      onSubmit={() => mutation.mutate(form, { onSuccess: () => onSaved() })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.documents.name} className="sm:col-span-2">
          <Input required value={str("name")} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label={c.documents.type}>
          <Input
            value={str("document_type")}
            onChange={(e) => set("document_type", e.target.value)}
          />
        </Field>
        <Field label={c.documents.status}>
          <select
            className={selectClass}
            value={str("status")}
            onChange={(e) => set("status", e.target.value)}
          >
            {DOC_STATUSES.map((s) => (
              <option key={s} value={s}>
                {c.docStatus[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.documents.expiresOn}>
          <Input
            type="date"
            value={str("expires_on")}
            onChange={(e) => set("expires_on", e.target.value || null)}
          />
        </Field>
        <div className="flex items-center gap-3 pt-6">
          <Switch
            checked={Boolean(form["requested_from_client"])}
            onCheckedChange={(v) => set("requested_from_client", v)}
          />
          <span className="text-sm text-muted-foreground">{c.documents.request}</span>
        </div>
        <Field label={c.documents.notes} className="sm:col-span-2">
          <Textarea rows={3} value={str("notes")} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
    </Shell>
  );
}
