import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  saveFoundationClient,
  saveFoundationDossier,
  saveFoundationLink,
} from "@/lib/foundation.functions";
import {
  CLIENT_TYPES,
  SERVICES,
  STATUSES,
  PRIORITIES,
  LANGUAGES,
  displayClient,
  clientSchema,
  dossierSchema,
} from "@/lib/foundation.schemas";
import { useFoundation } from "./context";
import { CrmModal, Field } from "./ui";
import type { Client, Dossier } from "./data";
export function ClientForm({ row, prefill, onCreated, onClose }: { row?: Client; prefill?: Partial<Client>; onCreated?: (id: string) => void; onClose: () => void }) {
  const init: Partial<Client> | undefined = row ?? prefill;
  const { c, data, refresh } = useFoundation();
  const save = useServerFn(saveFoundationClient);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState(row?.type ?? "person");
  const [phone, setPhone] = useState(init?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(init?.whatsapp ?? "");
  const [whatsappCustom, setWhatsappCustom] = useState(
    Boolean(row?.whatsapp && row.whatsapp !== row.phone),
  );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    const input = {
      ...(row ? { id: row.id } : {}),
      type,
      first_name: get("first_name"),
      last_name: get("last_name"),
      household_name: get("household_name"),
      company_name: get("company_name"),
      enterprise_number: get("enterprise_number"),
      contact_person_id: get("contact_person_id") || null,
      preferred_language: get("preferred_language"),
      phone,
      whatsapp: whatsapp || phone,
      email: get("email"),
      address: get("address"),
      nationality: get("nationality"),
      birth_date: get("birth_date") || null,
      notes: get("notes"),
    };
    const parsed = clientSchema.safeParse(input);
    if (!parsed.success) {
      setError(c.required);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await save({ data: parsed.data });
      await refresh();
      onClose();
      onCreated?.(result.id);
      if (!row) await navigate({ to: "/crm/clients/$id", params: { id: result.id } });
    } catch {
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <CrmModal open onClose={onClose} title={row ? c.edit : c.newClient}>
      <form onSubmit={submit} className="space-y-5">
        <Field label={c.type}>
          <select
            className="crm-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={!!row}
          >
            {CLIENT_TYPES.map((v) => (
              <option key={v} value={v}>
                {c.types[v]}
              </option>
            ))}
          </select>
        </Field>
        <div className="crm-form-grid">
          {type === "person" ? (
            <>
              <Field label={`${c.firstName} *`}>
                <Input name="first_name" required defaultValue={init?.first_name} />
              </Field>
              <Field label={`${c.lastName} *`}>
                <Input name="last_name" required defaultValue={init?.last_name} />
              </Field>
              <Field label={c.nationality}>
                <Input name="nationality" defaultValue={init?.nationality} />
              </Field>
              <Field label={c.birthDate}>
                <Input type="date" name="birth_date" defaultValue={init?.birth_date ?? ""} />
              </Field>
            </>
          ) : type === "household" ? (
            <Field label={`${c.householdName} *`}>
              <Input name="household_name" required defaultValue={init?.household_name} />
            </Field>
          ) : (
            <>
              <Field label={`${c.companyName} *`}>
                <Input name="company_name" required defaultValue={init?.company_name} />
              </Field>
              <Field label={c.enterpriseNumber}>
                <Input name="enterprise_number" defaultValue={init?.enterprise_number} />
              </Field>
              <Field label={c.contactPerson}>
                <select
                  className="crm-select"
                  name="contact_person_id"
                  defaultValue={init?.contact_person_id ?? ""}
                >
                  <option value="">{c.none}</option>
                  {data.clients
                    .filter((v) => v.type === "person")
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {displayClient(v)} · {v.number}
                      </option>
                    ))}
                </select>
              </Field>
            </>
          )}
          <Field label={c.preferredLanguage}>
            <select
              className="crm-select"
              name="preferred_language"
              defaultValue={init?.preferred_language ?? "nl"}
            >
              {LANGUAGES.map((v) => (
                <option key={v} value={v}>
                  {c.languages[v]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={c.phone}>
            <Input
              type="tel"
              name="phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (!whatsappCustom) setWhatsapp(e.target.value);
              }}
            />
          </Field>
          <Field label={c.email}>
            <Input type="email" name="email" defaultValue={init?.email} />
          </Field>
          <Field label={c.whatsapp}>
            <Input
              type="tel"
              value={whatsapp}
              onChange={(e) => {
                setWhatsapp(e.target.value);
                setWhatsappCustom(true);
              }}
            />
          </Field>
        </div>
        <Field label={c.address}>
          <Input name="address" defaultValue={init?.address} />
        </Field>
        <Field label={c.notes}>
          <Textarea name="notes" rows={3} defaultValue={init?.notes} />
        </Field>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <footer className="flex justify-end gap-2">
          <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>
            {c.cancel}
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? c.saving : c.save}
          </Button>
        </footer>
      </form>
    </CrmModal>
  );
}
export function DossierForm({
  clientId,
  row,
  onClose,
}: {
  clientId: string;
  row?: Dossier;
  onClose: () => void;
}) {
  const { c, data, refresh } = useFoundation();
  const save = useServerFn(saveFoundationDossier);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    const parsed = dossierSchema.safeParse({
      ...(row ? { id: row.id } : {}),
      client_id: clientId,
      service: row?.service ?? get("service"),
      title: get("title"),
      status: get("status"),
      responsible_id: get("responsible_id") || null,
      start_date: get("start_date"),
      next_step: get("next_step"),
      next_step_date: get("next_step_date") || null,
      priority: get("priority"),
    });
    if (!parsed.success) {
      setError(c.required);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await save({ data: parsed.data });
      await refresh();
      onClose();
      if (!row) await navigate({ to: "/crm/cases/$id", params: { id: result.id } });
    } catch {
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <CrmModal open onClose={onClose} title={row ? c.edit : c.newDossier}>
      <form onSubmit={submit} className="space-y-5">
        <Field label={`${c.title} *`}>
          <Input name="title" required defaultValue={row?.title} />
        </Field>
        <div className="crm-form-grid">
          <Field label={c.service}>
            <select
              className="crm-select"
              name="service"
              defaultValue={row?.service ?? "IMM"}
              disabled={!!row}
            >
              {SERVICES.map((v) => (
                <option key={v} value={v}>
                  {c.services[v]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={c.status}>
            <select className="crm-select" name="status" defaultValue={row?.status ?? "new"}>
              {STATUSES.map((v) => (
                <option key={v} value={v}>
                  {c.statuses[v]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={c.responsible}>
            <select
              className="crm-select"
              name="responsible_id"
              defaultValue={row?.responsible_id ?? data.member?.user_id ?? ""}
            >
              <option value="">{c.none}</option>
              {data.team.map((v) => (
                <option key={v.user_id} value={v.user_id}>
                  {v.full_name || v.email}
                </option>
              ))}
            </select>
          </Field>
          <Field label={c.startDate}>
            <Input
              type="date"
              name="start_date"
              required
              defaultValue={row?.start_date ?? new Date().toLocaleDateString("en-CA")}
            />
          </Field>
          <Field label={c.priority}>
            <select className="crm-select" name="priority" defaultValue={row?.priority ?? "normal"}>
              {PRIORITIES.map((v) => (
                <option key={v} value={v}>
                  {c.priorities[v]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={c.nextStepDate}>
            <Input type="date" name="next_step_date" defaultValue={row?.next_step_date ?? ""} />
          </Field>
        </div>
        <Field label={c.nextStep}>
          <Textarea name="next_step" defaultValue={row?.next_step} rows={2} />
        </Field>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <footer className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={busy}>
            {c.cancel}
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? c.saving : c.save}
          </Button>
        </footer>
      </form>
    </CrmModal>
  );
}
export function LinkPersonForm({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const { c, data, refresh } = useFoundation();
  const save = useServerFn(saveFoundationLink);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const persons = data.clients.filter(
    (v) =>
      v.type === "person" &&
      !data.links.some((l) => l.client_id === clientId && l.person_id === v.id),
  );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(false);
    try {
      await save({
        data: {
          client_id: clientId,
          person_id: String(form.get("person_id")),
          role: String(form.get("role")),
        },
      });
      await refresh();
      onClose();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <CrmModal open onClose={onClose} title={c.addPerson}>
      <form onSubmit={submit} className="space-y-5">
        <Field label={c.person}>
          <select name="person_id" className="crm-select" required defaultValue="">
            <option value="" disabled>
              {c.choosePerson}
            </option>
            {persons.map((v) => (
              <option key={v.id} value={v.id}>
                {displayClient(v)} · {v.number}
              </option>
            ))}
          </select>
        </Field>
        <Field label={c.role}>
          <Input name="role" required placeholder={c.roleExample} />
        </Field>
        {error && (
          <p role="alert" className="text-destructive">
            {c.failed}
          </p>
        )}
        <footer className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            {c.cancel}
          </Button>
          <Button type="submit" disabled={busy || persons.length === 0}>
            {busy ? c.saving : c.save}
          </Button>
        </footer>
      </form>
    </CrmModal>
  );
}
