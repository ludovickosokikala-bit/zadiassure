import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  MapPin,
  Phone,
  Building2,
  Home,
  CalendarCheck2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { displayClient } from "@/lib/foundation.schemas";
import {
  LOCATION_TYPES,
  appointmentSchema,
  filterForeignGoogleEvents,
  followUpProposal,
  gridPosition,
  sameDay,
  startOfWeek,
  toLocalInput,
} from "@/lib/agendaCore";
import {
  completeGoogleCalendarConnection,
  disconnectGoogleCalendar,
  saveAppointment,
  setAppointmentStatus,
  startGoogleCalendarConnect,
} from "@/lib/crmAgenda.functions";
import { useFoundation } from "./context";
import { CrmModal, EmptyState, Field, PageTitle } from "./ui";
import type { Dossier } from "./data";
import {
  appointmentsQuery,
  googleEventsQuery,
  googleStatusQuery,
  useAgendaRefresh,
  type Appointment,
} from "./agendaData";

const DAY_START = 7;
const DAY_END = 21;
const locIcon = { office: Building2, client: Home, online: Video, phone: Phone } as const;

function locale(language: string) {
  return language === "fr" ? "fr-BE" : "nl-BE";
}
function timeLabel(iso: string, language: string) {
  return new Date(iso).toLocaleTimeString(locale(language), { hour: "2-digit", minute: "2-digit" });
}
function dayLabel(d: Date, language: string, long = false) {
  return d.toLocaleDateString(locale(language), long ? { weekday: "long", day: "numeric", month: "long" } : { weekday: "short", day: "numeric" });
}

export function useAppointments() {
  return useQuery(appointmentsQuery());
}

/* ---------- Form ---------- */

export type AppointmentDefaults = Partial<
  Pick<Appointment, "client_id" | "dossier_id" | "title" | "kind" | "start_at" | "end_at">
>;

export function AppointmentForm({
  row,
  defaults,
  onClose,
  onSaved,
}: {
  row?: Appointment;
  defaults?: AppointmentDefaults;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { c, data } = useFoundation();
  const a = c.agendaUi;
  const save = useServerFn(saveAppointment);
  const refresh = useAgendaRefresh();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const initialStart = row?.start_at ?? defaults?.start_at ?? (() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d.toISOString();
  })();
  const initialEnd = row?.end_at ?? defaults?.end_at ?? new Date(new Date(initialStart).getTime() + 3600_000).toISOString();
  const [clientId, setClientId] = useState(row?.client_id ?? defaults?.client_id ?? "");
  const [dossierId, setDossierId] = useState(row?.dossier_id ?? defaults?.dossier_id ?? "");
  const [locationType, setLocationType] = useState(row?.location_type ?? "office");
  const [members, setMembers] = useState<string[]>(row?.member_ids ?? []);
  const owner0 = row?.owner_id ?? data.member?.user_id ?? "";
  const [owner, setOwner] = useState(owner0);
  const dossiers = data.dossiers.filter((d) => !clientId || d.client_id === clientId);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    const start = get("start_at");
    const end = get("end_at");
    if (start && end && new Date(end) <= new Date(start)) {
      setError(a.endBeforeStart);
      return;
    }
    const parsed = appointmentSchema.safeParse({
      ...(row ? { id: row.id } : {}),
      title: get("title"),
      client_id: clientId || null,
      dossier_id: dossierId || null,
      owner_id: owner,
      member_ids: members.filter((m) => m !== owner),
      start_at: start ? new Date(start).toISOString() : "",
      end_at: end ? new Date(end).toISOString() : "",
      location_type: locationType,
      location_note: get("location_note"),
      meet_link: get("meet_link"),
      status: row?.status ?? "planned",
      kind: row?.kind ?? defaults?.kind ?? "regular",
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
      onSaved?.();
      onClose();
    } catch {
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <CrmModal open onClose={onClose} title={row ? a.editAppointment : a.newAppointment}>
      <form onSubmit={submit} className="space-y-5">
        <Field label={`${a.title} *`}>
          <Input name="title" required maxLength={200} defaultValue={row?.title ?? defaults?.title ?? ""} />
        </Field>
        <div className="crm-form-grid">
          <Field label={`${a.start} *`}>
            <Input type="datetime-local" name="start_at" required defaultValue={toLocalInput(new Date(initialStart))} />
          </Field>
          <Field label={`${a.end} *`}>
            <Input type="datetime-local" name="end_at" required defaultValue={toLocalInput(new Date(initialEnd))} />
          </Field>
          <Field label={a.client}>
            <select
              className="crm-select"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setDossierId("");
              }}
            >
              <option value="">{a.noneOption}</option>
              {data.clients.map((v) => (
                <option key={v.id} value={v.id}>
                  {displayClient(v)} · {v.number}
                </option>
              ))}
            </select>
          </Field>
          <Field label={a.dossier}>
            <select
              className="crm-select"
              value={dossierId}
              onChange={(e) => {
                setDossierId(e.target.value);
                const d = data.dossiers.find((v) => v.id === e.target.value);
                if (d) setClientId(d.client_id);
              }}
            >
              <option value="">{a.noneOption}</option>
              {dossiers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.number} · {v.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label={a.owner}>
            <select className="crm-select" value={owner} onChange={(e) => setOwner(e.target.value)}>
              {data.team.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.full_name || m.email}
                </option>
              ))}
            </select>
          </Field>
          <Field label={a.locationType}>
            <select className="crm-select" value={locationType} onChange={(e) => setLocationType(e.target.value)}>
              {LOCATION_TYPES.map((v) => (
                <option key={v} value={v}>
                  {a.locations[v]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {data.team.length > 1 && (
          <fieldset className="crm-field">
            <span>{a.members}</span>
            <div className="flex flex-wrap gap-2">
              {data.team
                .filter((m) => m.user_id !== owner)
                .map((m) => {
                  const on = members.includes(m.user_id);
                  return (
                    <button
                      type="button"
                      key={m.user_id}
                      aria-pressed={on}
                      className="crm-chip"
                      data-active={on}
                      onClick={() => setMembers(on ? members.filter((x) => x !== m.user_id) : [...members, m.user_id])}
                    >
                      {m.full_name || m.email}
                    </button>
                  );
                })}
            </div>
          </fieldset>
        )}
        <Field label={a.locationNote}>
          <Textarea name="location_note" rows={2} maxLength={1000} defaultValue={row?.location_note ?? ""} />
        </Field>
        {locationType === "online" && (
          <Field label={a.meetLink}>
            <div>
              <Input name="meet_link" type="url" placeholder="https://meet.google.com/…" defaultValue={row?.meet_link ?? ""} />
              <p className="mt-2 text-xs text-muted-foreground">{a.meetAuto}</p>
            </div>
          </Field>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {c.cancel}
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? c.saving : c.save}
          </Button>
        </div>
      </form>
    </CrmModal>
  );
}

/* ---------- Detail ---------- */

export function AppointmentDetail({ row, onClose }: { row: Appointment; onClose: () => void }) {
  const { c, data, language } = useFoundation();
  const a = c.agendaUi;
  const setStatus = useServerFn(setAppointmentStatus);
  const refresh = useAgendaRefresh();
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const client = data.clients.find((v) => v.id === row.client_id);
  const dossier = data.dossiers.find((v) => v.id === row.dossier_id);
  const owner = data.team.find((m) => m.user_id === row.owner_id);
  const others = data.team.filter((m) => row.member_ids.includes(m.user_id));
  const Icon = locIcon[row.location_type as keyof typeof locIcon] ?? MapPin;
  async function change(status: "planned" | "cancelled" | "completed") {
    setBusy(true);
    setError(false);
    try {
      await setStatus({ data: { id: row.id, status } });
      await refresh();
      onClose();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  if (edit) return <AppointmentForm row={row} onClose={onClose} />;
  return (
    <CrmModal open onClose={onClose} title={row.title}>
      <div className="space-y-4 text-sm">
        <p className="font-medium">
          {dayLabel(new Date(row.start_at), language, true)} · {timeLabel(row.start_at, language)}–{timeLabel(row.end_at, language)}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className={`crm-status crm-appt-${row.status}`}>{a.statuses[row.status as keyof typeof a.statuses]}</span>
          <span className="crm-status inline-flex items-center gap-1">
            <Icon className="size-3.5" />
            {a.locations[row.location_type as keyof typeof a.locations]}
          </span>
          {row.google_event_id && <span className="crm-status crm-google-tag">{a.synced}</span>}
        </div>
        {row.google_sync_error && (
          <p className="flex items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="size-4" />
            {a.syncError}
          </p>
        )}
        {row.location_note && <p className="whitespace-pre-wrap break-words">{row.location_note}</p>}
        <dl className="crm-details">
          <div>
            <dt>{a.owner}</dt>
            <dd>{owner?.full_name || owner?.email || "—"}</dd>
          </div>
          {others.length > 0 && (
            <div>
              <dt>{a.members}</dt>
              <dd>{others.map((m) => m.full_name || m.email).join(", ")}</dd>
            </div>
          )}
        </dl>
        <div className="flex flex-wrap gap-2">
          {row.meet_link && (
            <Button asChild variant="secondary">
              <a href={row.meet_link} target="_blank" rel="noreferrer">
                <Video />
                {a.joinMeet}
              </a>
            </Button>
          )}
          {client && (
            <Button asChild variant="secondary">
              <Link to="/crm/clients/$id" params={{ id: client.id }} onClick={onClose}>
                {a.openClient}: {displayClient(client)}
              </Link>
            </Button>
          )}
          {dossier && (
            <Button asChild variant="secondary">
              <Link to="/crm/cases/$id" params={{ id: dossier.id }} onClick={onClose}>
                {a.openDossier}: {dossier.number}
              </Link>
            </Button>
          )}
        </div>
        {error && (
          <p role="alert" className="text-destructive">
            {c.failed}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          {row.status === "planned" ? (
            <>
              <Button variant="ghost" className="text-destructive" disabled={busy} onClick={() => void change("cancelled")}>
                {a.cancelAppointment}
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => void change("completed")}>
                {a.markDone}
              </Button>
              <Button disabled={busy} onClick={() => setEdit(true)}>
                {c.edit}
              </Button>
            </>
          ) : (
            <Button variant="secondary" disabled={busy} onClick={() => void change("planned")}>
              {a.reopen}
            </Button>
          )}
        </div>
      </div>
    </CrmModal>
  );
}

/* ---------- Lists for client, dossier and today ---------- */

function ApptRow({ row, onOpen }: { row: Appointment; onOpen: (r: Appointment) => void }) {
  const { c, language, data } = useFoundation();
  const a = c.agendaUi;
  const Icon = locIcon[row.location_type as keyof typeof locIcon] ?? MapPin;
  const client = data.clients.find((v) => v.id === row.client_id);
  return (
    <button type="button" className="crm-list-row w-full text-left" onClick={() => onOpen(row)} data-status={row.status}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="crm-appt-icon">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <strong className={row.status === "cancelled" ? "line-through opacity-60" : ""}>{row.title}</strong>
          <small>
            {dayLabel(new Date(row.start_at), language)} · {timeLabel(row.start_at, language)}
            {client ? ` · ${displayClient(client)}` : ""}
          </small>
        </div>
      </div>
      <span className={`crm-status crm-appt-${row.status} shrink-0`}>{a.statuses[row.status as keyof typeof a.statuses]}</span>
    </button>
  );
}

export function AppointmentsSection({ clientId, dossierId }: { clientId: string; dossierId?: string }) {
  const { c } = useFoundation();
  const a = c.agendaUi;
  const { data: rows = [] } = useAppointments();
  const [create, setCreate] = useState(false);
  const [open, setOpen] = useState<Appointment | null>(null);
  const mine = rows.filter((r) => (dossierId ? r.dossier_id === dossierId : r.client_id === clientId));
  const now = Date.now();
  const upcoming = mine.filter((r) => new Date(r.end_at).getTime() >= now);
  const past = mine.filter((r) => new Date(r.end_at).getTime() < now).reverse();
  return (
    <section className="mt-9">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="crm-section-title mb-0">{a.upcoming}</h2>
        <Button variant="secondary" onClick={() => setCreate(true)}>
          <Plus />
          {a.newAppointment}
        </Button>
      </div>
      {upcoming.length ? (
        <div className="crm-card">{upcoming.map((r) => <ApptRow key={r.id} row={r} onOpen={setOpen} />)}</div>
      ) : (
        <p className="text-sm text-muted-foreground">{a.noAppointments}</p>
      )}
      {past.length > 0 && (
        <>
          <h2 className="crm-section-title mt-7">{a.past}</h2>
          <div className="crm-card">{past.slice(0, 10).map((r) => <ApptRow key={r.id} row={r} onOpen={setOpen} />)}</div>
        </>
      )}
      {create && <AppointmentForm defaults={{ client_id: clientId, dossier_id: dossierId ?? null }} onClose={() => setCreate(false)} />}
      {open && <AppointmentDetail row={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

export function FollowUpBanner({ dossier }: { dossier: Dossier }) {
  const { c, language } = useFoundation();
  const a = c.agendaUi;
  const { data: rows, isSuccess } = useAppointments();
  const [form, setForm] = useState(false);
  const [done, setDone] = useState(false);
  if (!isSuccess) return null;
  const proposal = followUpProposal(dossier, rows);
  if (!proposal)
    return done ? (
      <p role="status" className="crm-followup">
        <CalendarCheck2 />
        {a.followUpDone}
      </p>
    ) : null;
  const end = new Date(proposal.start.getTime() + 3600_000);
  return (
    <div className="crm-followup" role="region" aria-label={a.followUpTitle}>
      <CalendarCheck2 />
      <div className="min-w-0 flex-1">
        <strong>{proposal.first ? a.followUpFirst : a.followUpNext}</strong>
        <small>{proposal.start.toLocaleString(locale(language), { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</small>
      </div>
      <Button onClick={() => setForm(true)}>{a.followUpAccept}</Button>
      {form && (
        <AppointmentForm
          defaults={{
            client_id: dossier.client_id,
            dossier_id: dossier.id,
            title: `${a.followUpTitle} · ${dossier.number}`,
            kind: "bud_followup",
            start_at: proposal.start.toISOString(),
            end_at: end.toISOString(),
          }}
          onClose={() => setForm(false)}
          onSaved={() => setDone(true)}
        />
      )}
    </div>
  );
}

export function TodayAppointments() {
  const { c, data } = useFoundation();
  const a = c.agendaUi;
  const { data: rows = [] } = useAppointments();
  const [open, setOpen] = useState<Appointment | null>(null);
  const me = data.member?.user_id;
  const today = new Date();
  const list = rows.filter(
    (r) =>
      r.status !== "cancelled" &&
      sameDay(new Date(r.start_at), today) &&
      (r.owner_id === me || (me ? r.member_ids.includes(me) : false)),
  );
  return (
    <section className="mb-9">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="crm-section-title mb-0">{a.todayAppointments}</h2>
        <Button asChild variant="ghost" size="icon" title={c.agenda}>
          <Link to="/crm/agenda" aria-label={c.agenda}>
            <CalendarDays />
          </Link>
        </Button>
      </div>
      {list.length ? (
        <div className="crm-card">{list.map((r) => <ApptRow key={r.id} row={r} onOpen={setOpen} />)}</div>
      ) : (
        <p className="text-sm text-muted-foreground">{a.noToday}</p>
      )}
      {open && <AppointmentDetail row={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

/* ---------- Agenda page ---------- */

export type AgendaSearch = { view?: string; date?: string; scope?: string };

type Block =
  | { type: "crm"; id: string; title: string; start: string; end: string; row: Appointment }
  | { type: "google"; id: string; title: string; start: string; end: string; allDay: boolean };

export function AgendaPage({ search, onSearch }: { search: AgendaSearch; onSearch: (v: AgendaSearch) => void }) {
  const { c, data, language } = useFoundation();
  const a = c.agendaUi;
  const view = search.view === "day" || search.view === "list" ? search.view : "week";
  const scope = search.scope === "all" ? "all" : "mine";
  const parsed = search.date ? new Date(`${search.date}T12:00:00`) : new Date();
  const cursor = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const me = data.member?.user_id ?? "";
  const { data: rows = [] } = useAppointments();
  const [create, setCreate] = useState<AppointmentDefaults | null>(null);
  const [open, setOpen] = useState<Appointment | null>(null);
  const [selectedGoogle, setSelectedGoogle] = useState<string | null>(null);

  const days = useMemo(() => {
    if (view === "day") return [new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())];
    const s = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => new Date(s.getFullYear(), s.getMonth(), s.getDate() + i));
  }, [view, cursor.toDateString()]);
  const rangeStart = view === "list" ? new Date(new Date().setHours(0, 0, 0, 0)) : days[0]!;
  const rangeEnd =
    view === "list"
      ? new Date(rangeStart.getTime() + 60 * 86400_000)
      : new Date(days[days.length - 1]!.getTime() + 86400_000);
  const google = useQuery(googleEventsQuery(rangeStart, rangeEnd));
  const linked = useMemo(() => new Set(rows.map((r) => r.google_event_id).filter(Boolean) as string[]), [rows]);
  const googleEvents = filterForeignGoogleEvents(google.data?.events ?? [], linked);

  const visible = rows.filter(
    (r) => r.status !== "cancelled" && (scope === "all" || r.owner_id === me || r.member_ids.includes(me)),
  );
  const blocks: Block[] = [
    ...visible.map((r) => ({ type: "crm" as const, id: r.id, title: r.title, start: r.start_at, end: r.end_at, row: r })),
    ...googleEvents.map((g) => ({ type: "google" as const, id: g.id, title: g.title, start: g.start, end: g.end, allDay: g.allDay })),
  ];
  const fmt = (d: Date) => toLocalInput(d).slice(0, 10);
  const move = (dir: number) => {
    const d = new Date(cursor);
    d.setDate(d.getDate() + dir * (view === "day" ? 1 : 7));
    onSearch({ date: fmt(d) });
  };
  const heading =
    view === "day"
      ? dayLabel(cursor, language, true)
      : view === "week"
        ? `${days[0]!.toLocaleDateString(locale(language), { day: "numeric", month: "short" })} – ${days[6]!.toLocaleDateString(locale(language), { day: "numeric", month: "short", year: "numeric" })}`
        : a.upcoming;

  return (
    <>
      <PageTitle
        title={c.agenda}
        subtitle={heading}
        action={
          <Button onClick={() => setCreate({})}>
            <Plus />
            {a.newAppointment}
          </Button>
        }
      />
      <div className="crm-agenda-toolbar">
        <div className="crm-segmented" role="tablist" aria-label={c.agenda}>
          {(["day", "week", "list"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => onSearch({ view: v })}>
              {a[v]}
            </button>
          ))}
        </div>
        <div className="crm-segmented" role="tablist" aria-label={a.everyone}>
          {(["mine", "all"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={scope === v} onClick={() => onSearch({ scope: v })}>
              {v === "mine" ? a.mine : a.everyone}
            </button>
          ))}
        </div>
        {view !== "list" && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label={a.previous} onClick={() => move(-1)}>
              <ChevronLeft />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onSearch({ date: fmt(new Date()) })}>
              {a.todayBtn}
            </Button>
            <Button variant="ghost" size="icon" aria-label={a.next} onClick={() => move(1)}>
              <ChevronRight />
            </Button>
          </div>
        )}
      </div>
      {google.data && "error" in google.data && google.data.error && (
        <p className="mb-3 text-xs text-muted-foreground">{a.syncError}</p>
      )}
      {view === "list" ? (
        <ListView blocks={blocks.filter((b) => new Date(b.end) >= rangeStart)} onOpen={setOpen} onGoogle={setSelectedGoogle} selectedGoogle={selectedGoogle} />
      ) : (
        <GridView
          days={days}
          blocks={blocks}
          onOpen={setOpen}
          onSlot={(d) => setCreate({ start_at: d.toISOString(), end_at: new Date(d.getTime() + 3600_000).toISOString() })}
        />
      )}
      {create && <AppointmentForm defaults={create} onClose={() => setCreate(null)} />}
      {open && <AppointmentDetail row={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function GridView({
  days,
  blocks,
  onOpen,
  onSlot,
}: {
  days: Date[];
  blocks: Block[];
  onOpen: (r: Appointment) => void;
  onSlot: (d: Date) => void;
}) {
  const { c, language } = useFoundation();
  const a = c.agendaUi;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);
  const hours = Array.from({ length: DAY_END - DAY_START }, (_, i) => DAY_START + i);
  const allDay = (d: Date) => blocks.filter((b) => b.type === "google" && b.allDay && new Date(b.start) <= d && new Date(b.end) > d);
  return (
    <div className="crm-card crm-calendar" style={{ ["--days" as string]: days.length }}>
      <div className="crm-cal-head">
        <span />
        {days.map((d) => (
          <div key={d.toISOString()} data-today={sameDay(d, now)}>
            <span>{d.toLocaleDateString(locale(language), { weekday: "short" })}</span>
            <strong>{d.getDate()}</strong>
            {allDay(d).map((b) => (
              <em key={b.id} className="crm-cal-allday" title={a.googleBusy}>
                {b.title || a.google}
              </em>
            ))}
          </div>
        ))}
      </div>
      <div className="crm-cal-body">
        <div className="crm-cal-hours">
          {hours.map((h) => (
            <span key={h}>{String(h).padStart(2, "0")}:00</span>
          ))}
        </div>
        {days.map((d) => {
          const items = blocks.filter((b) => !(b.type === "google" && b.allDay) && sameDay(new Date(b.start), d));
          return (
            <div key={d.toISOString()} className="crm-cal-day">
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  className="crm-cal-slot"
                  aria-label={`${a.newAppointment} ${dayLabel(d, language)} ${h}:00`}
                  onClick={() => onSlot(new Date(d.getFullYear(), d.getMonth(), d.getDate(), h))}
                />
              ))}
              {sameDay(d, now) && now.getHours() >= DAY_START && now.getHours() < DAY_END && (
                <span className="crm-cal-now" style={{ top: `${gridPosition(now.toISOString(), now.toISOString(), DAY_START, DAY_END).top * 100}%` }} />
              )}
              {items.map((b) => {
                const pos = gridPosition(b.start, b.end, DAY_START, DAY_END);
                const style = { top: `${pos.top * 100}%`, height: `${pos.height * 100}%` };
                return b.type === "crm" ? (
                  <button key={b.id} type="button" className="crm-cal-event" data-kind={b.row.kind} style={style} onClick={() => onOpen(b.row)}>
                    <strong>{b.title}</strong>
                    <span>{timeLabel(b.start, language)}</span>
                  </button>
                ) : (
                  <div key={b.id} className="crm-cal-event crm-cal-google" style={style} title={a.googleBusy}>
                    <strong>{b.title || a.googleBusy}</strong>
                    <span>{a.google} · {timeLabel(b.start, language)}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListView({
  blocks,
  onOpen,
}: {
  blocks: Block[];
  onOpen: (r: Appointment) => void;
  onGoogle: (id: string | null) => void;
  selectedGoogle: string | null;
}) {
  const { c, language } = useFoundation();
  const a = c.agendaUi;
  const sorted = [...blocks].sort((x, y) => x.start.localeCompare(y.start));
  if (!sorted.length) return <EmptyState icon={<CalendarDays />} text={a.noAppointments} />;
  const groups = new Map<string, Block[]>();
  for (const b of sorted) {
    const key = new Date(b.start).toDateString();
    groups.set(key, [...(groups.get(key) ?? []), b]);
  }
  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([key, items]) => (
        <section key={key}>
          <h2 className="crm-section-title">{dayLabel(new Date(key), language, true)}</h2>
          <div className="crm-card">
            {items.map((b) =>
              b.type === "crm" ? (
                <ApptRow key={b.id} row={b.row} onOpen={onOpen} />
              ) : (
                <div key={b.id} className="crm-list-row crm-list-google">
                  <div className="min-w-0">
                    <strong>{b.title || a.googleBusy}</strong>
                    <small>{b.allDay ? a.allDay : `${timeLabel(b.start, language)}–${timeLabel(b.end, language)}`}</small>
                  </div>
                  <span className="crm-status crm-google-tag shrink-0">{a.google}</span>
                </div>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------- Google Calendar connection ---------- */

function waitForCode(popup: Window) {
  return new Promise<string | null>((resolve, reject) => {
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(poll);
    };
    const onMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      if (
        event.origin !== window.location.origin ||
        event.source !== popup ||
        event.data?.connectorId !== "google_calendar" ||
        (type !== "appUserConnectorOAuthComplete" && type !== "appUserConnectorOAuthFailed")
      )
        return;
      cleanup();
      if (type === "appUserConnectorOAuthComplete") resolve(typeof event.data?.code === "string" ? event.data.code : null);
      else reject(new Error("OAUTH_FAILED"));
    };
    window.addEventListener("message", onMessage);
    const poll = window.setInterval(() => {
      if (!popup.closed) return;
      cleanup();
      reject(new Error("POPUP_CLOSED"));
    }, 500);
  });
}

export function GoogleCalendarDialog({ onClose }: { onClose: () => void }) {
  const { c } = useFoundation();
  const g = c.googleCal;
  const qc = useQueryClient();
  const status = useQuery(googleStatusQuery());
  const google = useQuery({ ...googleEventsQuery(new Date(new Date().setHours(0, 0, 0, 0)), new Date(new Date().setHours(23, 59, 0, 0))), enabled: status.data?.connected ?? false });
  const start = useServerFn(startGoogleCalendarConnect);
  const complete = useServerFn(completeGoogleCalendarConnection);
  const disconnect = useServerFn(disconnectGoogleCalendar);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const reconnect = Boolean(google.data && "reconnectRequired" in google.data && google.data.reconnectRequired);
  const refreshAll = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["crm-google-status"] }),
      qc.invalidateQueries({ queryKey: ["crm-google"] }),
      qc.invalidateQueries({ queryKey: ["crm-appointments"] }),
    ]);
  };
  async function connect() {
    setErr("");
    setMsg("");
    const popup = window.open("", "zadiassure-google-calendar", "width=600,height=720");
    if (!popup) {
      setErr(g.popupBlocked);
      return;
    }
    setBusy(true);
    try {
      const { authorizationUrl } = await start();
      const wait = waitForCode(popup);
      popup.location.href = authorizationUrl;
      const code = await wait;
      if (code) await complete({ data: { code } });
      await refreshAll();
      setMsg(g.done);
    } catch {
      popup.close();
      setErr(c.failed);
    } finally {
      setBusy(false);
    }
  }
  async function unlink() {
    setBusy(true);
    setErr("");
    try {
      await disconnect();
      await refreshAll();
    } catch {
      setErr(c.failed);
    } finally {
      setBusy(false);
    }
  }
  const s = status.data;
  return (
    <CrmModal open onClose={onClose} title={g.title}>
      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground">{g.intro}</p>
        {s && !s.configured && !s.connected ? (
          <p className="crm-followup">{g.notConfigured}</p>
        ) : (
          <>
            <p className="flex items-center gap-2 font-medium">
              <span className={`crm-dot ${s?.connected && !reconnect ? "crm-dot-on" : ""}`} />
              {s?.connected ? (reconnect ? g.reconnectNeeded : `${g.connectedAs} ${s.email || g.connected}`) : g.notConnected}
            </p>
            <div className="flex flex-wrap gap-2">
              {(!s?.connected || reconnect) && (
                <Button disabled={busy || !s} onClick={() => void connect()}>
                  {reconnect ? g.reconnect : g.connect}
                </Button>
              )}
              {s?.connected && (
                <Button variant="secondary" disabled={busy} onClick={() => void unlink()}>
                  {g.disconnect}
                </Button>
              )}
            </div>
          </>
        )}
        {msg && <p role="status" className="text-[color:var(--crm-success)]">{msg}</p>}
        {err && <p role="alert" className="text-destructive">{err}</p>}
      </div>
    </CrmModal>
  );
}
