import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { APPOINTMENT_STATUSES, MEETING_KINDS } from "@/lib/crm.schemas";
import { saveAppointment } from "@/lib/agenda.functions";
import { listClients } from "@/lib/crm.functions";
import { Field, selectClass } from "./ui";
import { clientName, useCrmDict, useWorkspace } from "./useCrm";
import { useAgendaDict } from "./useAgenda";

type Row = Record<string, unknown>;

/** ISO -> value for <input type="datetime-local"> in the browser's timezone. */
function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string) {
  return value ? new Date(value).toISOString() : "";
}

function defaultStart() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

export function AppointmentDialog({
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
  const g = useAgendaDict();
  const ws = useWorkspace();
  const team = ws.data?.team ?? [];
  const save = useServerFn(saveAppointment);
  const fetchClients = useServerFn(listClients);
  const clients = useQuery({
    queryKey: ["crm", "clients", "picker"],
    queryFn: () => fetchClients({ data: { search: "" } }),
    enabled: open,
  });

  const [form, setForm] = useState<Row>({});
  const [attendees, setAttendees] = useState("");

  const mutation = useMutation({
    mutationFn: (input: Row) => save({ data: input as never }),
    onSuccess: () => {
      onOpenChange(false);
      onSaved();
    },
    onError: (e: Error) =>
      toast.error(e.message === "FORBIDDEN" ? c.noAccess.title : c.common.saveFailed),
  });

  useEffect(() => {
    if (!open) return;
    if (row) {
      setForm({ ...row });
      setAttendees(((row["attendee_emails"] as string[] | null) ?? []).join(", "));
      return;
    }
    const start = defaultStart();
    const end = new Date(start.getTime() + 60 * 60000);
    setForm({
      client_id: clientId ?? null,
      case_id: caseId ?? null,
      title: "",
      description: "",
      location: "",
      meeting_kind: "office",
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      all_day: false,
      status: "scheduled",
      assigned_to: ws.data?.member?.userId ?? null,
    });
    setAttendees("");
  }, [open, row, caseId, clientId, ws.data]);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const str = (key: string) => (form[key] as string) ?? "";

  const submit = () => {
    const emails = attendees
      .split(/[,;\s]+/)
      .map((v) => v.trim())
      .filter((v) => v.includes("@"));
    mutation.mutate({ ...form, attendee_emails: emails });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {row?.["id"] ? g.editAppointment : g.newAppointment}
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={g.fields.title} className="sm:col-span-2">
              <Input required value={str("title")} onChange={(e) => set("title", e.target.value)} />
            </Field>

            <Field label={g.fields.start}>
              <Input
                required
                type="datetime-local"
                value={toLocalInput(str("starts_at"))}
                onChange={(e) => set("starts_at", fromLocalInput(e.target.value))}
              />
            </Field>
            <Field label={g.fields.end}>
              <Input
                required
                type="datetime-local"
                value={toLocalInput(str("ends_at"))}
                onChange={(e) => set("ends_at", fromLocalInput(e.target.value))}
              />
            </Field>

            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                checked={form["all_day"] === true}
                onCheckedChange={(v) => set("all_day", v)}
              />
              <span className="text-sm text-muted-foreground">{g.fields.allDay}</span>
            </div>

            <Field label={g.fields.kind}>
              <select
                className={selectClass}
                value={str("meeting_kind")}
                onChange={(e) => set("meeting_kind", e.target.value)}
              >
                {MEETING_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {g.kinds[k]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={g.fields.status}>
              <select
                className={selectClass}
                value={str("status")}
                onChange={(e) => set("status", e.target.value)}
              >
                {APPOINTMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {g.statuses[s]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={g.fields.location} className="sm:col-span-2">
              <Input value={str("location")} onChange={(e) => set("location", e.target.value)} />
            </Field>

            <Field label={g.fields.client}>
              <select
                className={selectClass}
                value={(form["client_id"] as string) ?? ""}
                onChange={(e) => set("client_id", e.target.value || null)}
              >
                <option value="">{c.common.none}</option>
                {(clients.data?.items ?? []).map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {clientName(cl as never)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={g.fields.assignedTo}>
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

            <Field label={g.fields.attendees} className="sm:col-span-2">
              <Input
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="naam@voorbeeld.be, info@zadiassure.be"
              />
              <p className="text-xs text-muted-foreground">{g.fields.attendeesHint}</p>
            </Field>

            <Field label={g.fields.description} className="sm:col-span-2">
              <Textarea
                rows={3}
                value={str("description")}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>

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
              disabled={mutation.isPending}
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
