import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addFoundationEntry } from "@/lib/foundation.functions";
import { useFoundation, dateLabel } from "./context";
import { formatEUR } from "@/lib/debtCore";
import { EmptyState, Field } from "./ui";
export function Timeline({ clientId, dossierId }: { clientId: string; dossierId?: string }) {
  const { data, c, language, refresh } = useFoundation();
  const add = useServerFn(addFoundationEntry);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const entries = data.timeline.filter(
    (v) => v.client_id === clientId && (!dossierId || v.dossier_id === dossierId),
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      await add({
        data: { client_id: clientId, dossier_id: dossierId ?? null, kind: "note", body: note },
      });
      setNote("");
      await refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="crm-timeline">
      <form onSubmit={submit} className="space-y-3">
        <Field label={c.manualNote}>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            aria-label={c.manualNote}
          />
        </Field>
        <div className="flex items-center justify-between gap-3">
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {c.failed}
            </p>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={busy || !note.trim()}>
            {busy ? c.saving : c.addNote}
          </Button>
        </div>
      </form>
      {entries.length === 0 ? (
        <EmptyState text={c.noTimeline} />
      ) : (
        <ol>
          {entries.map((v) => {
            const detail =
              v.detail && typeof v.detail === "object" && !Array.isArray(v.detail) ? v.detail : {};
            const get = (key: string) => String(detail[key] ?? "");
            const title =
              v.kind === "client_created"
                ? c.clientCreated
                : v.kind === "dossier_created"
                  ? c.dossierCreated
                  : v.kind === "status_changed"
                    ? c.statusChanged
                    : v.kind === "contact"
                      ? c.contactAction
                      : v.kind === "appointment_created"
                        ? c.agendaUi.appointmentCreated
                        : v.kind === "appointment_cancelled"
                          ? c.agendaUi.appointmentCancelled
                          : v.kind === "debt_added"
                            ? c.debtUi.debtAdded
                            : v.kind === "debt_status"
                              ? c.debtUi.debtStatus
                              : v.kind === "debt_referred"
                                ? c.debtUi.debtReferred
                                : v.kind === "instalment_paid"
                                  ? c.debtUi.instalmentPaid
                                  : v.kind === "imm_procedure"
                                    ? c.immUi.tl.procedure
                                    : v.kind === "imm_step_done"
                                      ? c.immUi.tl.step
                                      : v.kind === "imm_document"
                                        ? c.immUi.tl.document
                                        : v.kind === "imm_decision"
                                          ? c.immUi.tl.decision
                                          : v.kind === "imm_referred"
                                            ? c.immUi.tl.referred
                                            : c.manualNote;
            let extra = "";
            if (v.kind === "status_changed")
              extra = `${c.statuses[get("from") as keyof typeof c.statuses] ?? get("from")} → ${c.statuses[get("to") as keyof typeof c.statuses] ?? get("to")}`;
            if (v.kind === "contact")
              extra =
                get("action") === "phone"
                  ? c.call
                  : get("action") === "email"
                    ? c.sendEmail
                    : c.sendWhatsapp;
            if (v.kind === "appointment_created" || v.kind === "appointment_cancelled")
              extra = `${get("title")} · ${dateLabel(get("start_at"), language, true)}`;
            const d = c.debtUi;
            if (v.kind === "debt_added") extra = `${get("creditor")} · ${formatEUR(get("amount"))}`;
            if (v.kind === "debt_status")
              extra = `${get("creditor")}: ${d.statuses[get("from") as keyof typeof d.statuses] ?? get("from")} → ${d.statuses[get("to") as keyof typeof d.statuses] ?? get("to")}`;
            if (v.kind === "debt_referred")
              extra = `${get("creditor")} → ${d.referrals[get("referral") as keyof typeof d.referrals] ?? get("referral")}`;
            if (v.kind === "instalment_paid")
              extra = `${get("creditor")} · ${formatEUR(get("amount"))} · ${dateLabel(get("paid_at"), language)}`;
            const im = c.immUi;
            if (v.kind === "imm_procedure") extra = im.types[get("procedure") as keyof typeof im.types] ?? get("procedure");
            if (v.kind === "imm_step_done") extra = get("step");
            if (v.kind === "imm_document") extra = `${get("document")} · ${im.docStatus[get("status") as keyof typeof im.docStatus] ?? get("status")}`;
            if (v.kind === "imm_decision") extra = `${im.decisions[get("decision") as keyof typeof im.decisions] ?? get("decision")}${get("date") && get("date") !== "null" ? ` · ${dateLabel(get("date"), language)}` : ""}`;
            if (v.kind === "imm_referred") extra = get("lawyer");
            return (
              <li key={v.id}>
                <p className="font-medium">
                  {title}
                  {get("number") && (
                    <span className="ml-2 font-normal text-muted-foreground">{get("number")}</span>
                  )}
                </p>
                {extra && <p className="mt-1 text-sm">{extra}</p>}
                {v.body && <p className="mt-2 text-sm">{v.body}</p>}
                <small>
                  {v.actor_name} · {dateLabel(v.created_at, language, true)}
                </small>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
