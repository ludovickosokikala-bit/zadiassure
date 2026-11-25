import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Users,
  FolderOpen,
  CalendarDays,
  Plus,
  ArrowUpRight,
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  MessageCircle,
  Trash2,
  Inbox,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  displayClient,
  isOpenDossier,
  whatsappHref,
  STATUSES,
  CLIENT_TYPES,
} from "@/lib/foundation.schemas";
import {
  addFoundationEntry,
  recordFoundationAccess,
  removeFoundationLink,
} from "@/lib/foundation.functions";
import { useFoundation, dateLabel } from "./context";
import { PageTitle, EmptyState, Status, FoundationNotFound } from "./ui";
import { ClientForm, DossierForm, LinkPersonForm } from "./forms";
import { Timeline } from "./Timeline";
import { AppointmentsSection, FollowUpBanner, TodayAppointments } from "./Agenda";
import type { Dossier } from "./data";
export function TodayPage() {
  const { data, c, language } = useFoundation();
  const [create, setCreate] = useState(false);
  const open = data.dossiers.filter((v) => isOpenDossier(v.status));
  const steps = open
    .filter((v) => v.next_step_date)
    .sort((a, b) => (a.next_step_date ?? "").localeCompare(b.next_step_date ?? ""));
  return (
    <>
      <PageTitle
        title={c.today}
        subtitle={new Date().toLocaleDateString(language === "fr" ? "fr-BE" : "nl-BE", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        action={
          <Button onClick={() => setCreate(true)}>
            <Plus />
            {c.newClient}
          </Button>
        }
      />
      <TodayAppointments />
      <div className="crm-metrics">
        {[
          { label: c.totalClients, value: data.clients.length, icon: Users },
          { label: c.activeDossiers, value: open.length, icon: FolderOpen },
          { label: c.plannedSteps, value: steps.length, icon: CalendarDays },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="crm-card crm-metric">
            <Icon />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="crm-overview-grid">
        <section>
          <h2 className="crm-section-title">{c.nextSteps}</h2>
          {steps.length ? (
            <div className="crm-card">
              {steps.slice(0, 6).map((v) => (
                <Link key={v.id} to="/crm/cases/$id" params={{ id: v.id }} className="crm-list-row">
                  <div>
                    <strong>{v.next_step || v.title}</strong>
                    <small>
                      {v.number} ·{" "}
                      {displayClient(
                        data.clients.find((k) => k.id === v.client_id) ?? {
                          type: "person",
                          first_name: "",
                          last_name: "",
                          company_name: "",
                          household_name: "",
                        },
                      )}
                    </small>
                  </div>
                  <div className="text-right">
                    <p className="text-xs">{dateLabel(v.next_step_date, language)}</p>
                    <div className="mt-2">
                      <Status value={v.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<CalendarDays />} text={c.noNextSteps} />
          )}
          <h2 className="crm-section-title mt-9">{c.openDossiers}</h2>
          <DossierList dossiers={open.slice(0, 5)} />
        </section>
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="crm-section-title mb-0">{c.recentClients}</h2>
            <Button asChild variant="ghost" size="icon" title={c.allClients}>
              <Link to="/crm/clients" aria-label={c.allClients}>
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
          {data.clients.length ? (
            <div className="crm-card">
              {data.clients.slice(0, 5).map((v) => (
                <Link
                  key={v.id}
                  to="/crm/clients/$id"
                  params={{ id: v.id }}
                  className="crm-list-row"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="crm-avatar">{displayClient(v).slice(0, 2).toUpperCase()}</span>
                    <div className="min-w-0">
                      <strong>{displayClient(v)}</strong>
                      <small>
                        {v.number} · {c.types[v.type as keyof typeof c.types]}
                      </small>
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Users />} text={c.noClients} />
          )}
          <h2 className="crm-section-title mt-9">{c.dossiersByStatus}</h2>
          <div className="space-y-3">
            {STATUSES.map((s) => (
              <div
                key={s}
                className="flex items-center justify-between border-b border-border pb-3"
              >
                <Status value={s} />
                <span className="font-medium tabular-nums">
                  {data.dossiers.filter((v) => v.status === s).length}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
      {create && <ClientForm onClose={() => setCreate(false)} />}
    </>
  );
}
export type ClientFilters = { q?: string; type?: string; sort?: string };
export function ClientsPage({
  filters,
  onFilters,
}: {
  filters: ClientFilters;
  onFilters: (v: ClientFilters) => void;
}) {
  const { data, c, language } = useFoundation();
  const [create, setCreate] = useState(false);
  const q = (filters.q ?? "").toLocaleLowerCase();
  const type = filters.type ?? "";
  const sort = filters.sort ?? "newest";
  const rows = data.clients
    .filter(
      (v) =>
        (!type || v.type === type) &&
        [displayClient(v), v.number, v.phone, v.email].join(" ").toLocaleLowerCase().includes(q),
    )
    .sort((a, b) =>
      sort === "nameAsc"
        ? displayClient(a).localeCompare(displayClient(b), language)
        : sort === "nameDesc"
          ? displayClient(b).localeCompare(displayClient(a), language)
          : b.created_at.localeCompare(a.created_at),
    );
  return (
    <>
      <PageTitle
        title={c.clients}
        subtitle={`${data.clients.length}`}
        action={
          <Button onClick={() => setCreate(true)}>
            <Plus />
            {c.newClient}
          </Button>
        }
      />
      <div className="crm-toolbar">
        <Input
          value={filters.q ?? ""}
          onChange={(e) => onFilters({ q: e.target.value })}
          placeholder={c.search}
          aria-label={c.search}
        />
        <select
          className="crm-select"
          value={type}
          onChange={(e) => onFilters({ type: e.target.value })}
          aria-label={c.type}
        >
          <option value="">{c.allTypes}</option>
          {CLIENT_TYPES.map((v) => (
            <option key={v} value={v}>
              {c.types[v]}
            </option>
          ))}
        </select>
        <select
          className="crm-select"
          value={sort}
          onChange={(e) => onFilters({ sort: e.target.value })}
          aria-label={c.sort}
        >
          <option value="newest">{c.newest}</option>
          <option value="nameAsc">{c.nameAsc}</option>
          <option value="nameDesc">{c.nameDesc}</option>
        </select>
      </div>
      {rows.length ? (
        <>
          <div className="crm-card crm-desktop-table">
            <table className="crm-table">
              <thead>
                <tr>
                  <th className="w-[30%]">{c.name}</th>
                  <th className="w-[16%]">{c.number}</th>
                  <th className="w-[14%]">{c.type}</th>
                  <th className="w-[25%]">{c.email}</th>
                  <th>{c.phone}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <Link to="/crm/clients/$id" params={{ id: v.id }} className="font-medium">
                        {displayClient(v)}
                      </Link>
                    </td>
                    <td className="text-muted-foreground">{v.number}</td>
                    <td className="text-muted-foreground">
                      {c.types[v.type as keyof typeof c.types]}
                    </td>
                    <td>{v.email || "—"}</td>
                    <td>{v.phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="crm-client-mobile space-y-3">
            {rows.map((v) => (
              <Link
                key={v.id}
                to="/crm/clients/$id"
                params={{ id: v.id }}
                className="crm-card crm-list-row"
              >
                <div>
                  <strong>{displayClient(v)}</strong>
                  <small>
                    {v.number} · {c.types[v.type as keyof typeof c.types]}
                  </small>
                  <p className="mt-3 break-all text-xs text-muted-foreground">
                    {v.phone || v.email || "—"}
                  </p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </>
      ) : (
        <EmptyState icon={<Users />} text={data.clients.length ? c.noResults : c.noClients} />
      )}{" "}
      {create && <ClientForm onClose={() => setCreate(false)} />}
    </>
  );
}
export function DossierList({ dossiers }: { dossiers: Dossier[] }) {
  const { c, language } = useFoundation();
  return dossiers.length ? (
    <div className="crm-card">
      {dossiers.map((v) => (
        <Link key={v.id} to="/crm/cases/$id" params={{ id: v.id }} className="crm-list-row">
          <div>
            <strong>{v.title}</strong>
            <small>
              {v.number} · {dateLabel(v.next_step_date, language)}
            </small>
          </div>
          <Status value={v.status} />
        </Link>
      ))}
    </div>
  ) : (
    <EmptyState icon={<FolderOpen />} text={c.noDossiers} />
  );
}
export function ClientDetailPage({ id }: { id: string }) {
  const { data, c, language, refresh } = useFoundation();
  const row = data.clients.find((v) => v.id === id);
  const [tab, setTab] = useState<"overview" | "dossiers" | "timeline">("overview");
  const [edit, setEdit] = useState(false);
  const [dossier, setDossier] = useState(false);
  const [link, setLink] = useState(false);
  const [error, setError] = useState(false);
  const log = useServerFn(recordFoundationAccess);
  const contact = useServerFn(addFoundationEntry);
  const remove = useServerFn(removeFoundationLink);
  useEffect(() => {
    if (row) void log({ data: { id } }).catch(() => setError(true));
  }, [id, Boolean(row), log]);
  if (!row) return <FoundationNotFound />;
  const dossiers = data.dossiers.filter((v) => v.client_id === id);
  const links = data.links.filter((v) => v.client_id === id || v.person_id === id);
  async function quick(
    e: React.MouseEvent<HTMLAnchorElement>,
    action: "phone" | "email" | "whatsapp",
    href: string,
  ) {
    e.preventDefault();
    setError(false);
    try {
      await contact({ data: { client_id: id, kind: "contact", action } });
      await refresh();
      window.location.assign(href);
    } catch {
      setError(true);
    }
  }
  const details: [[string, string], ...Array<[string, string]>] = [
    [c.phone, row.phone],
    [c.email, row.email],
    [c.whatsapp, row.whatsapp],
    [c.address, row.address],
    [
      c.preferredLanguage,
      c.languages[row.preferred_language as keyof typeof c.languages] ?? row.preferred_language,
    ],
    ...(row.type === "person"
      ? ([
          [c.nationality, row.nationality],
          [c.birthDate, dateLabel(row.birth_date, language)],
        ] as [string, string][])
      : row.type === "company"
        ? ([
            [c.enterpriseNumber, row.enterprise_number],
            [
              c.contactPerson,
              displayClient(
                data.clients.find((v) => v.id === row.contact_person_id) ?? {
                  type: "person",
                  first_name: "",
                  last_name: "",
                  company_name: "",
                  household_name: "",
                },
              ),
            ],
          ] as [string, string][])
        : []),
  ];
  return (
    <>
      <Button asChild variant="ghost" className="mb-5 px-0">
        <Link to="/crm/clients">
          <ArrowLeft />
          {c.clients}
        </Link>
      </Button>
      <PageTitle
        title={displayClient(row)}
        subtitle={`${row.number} · ${c.types[row.type as keyof typeof c.types]}`}
        action={
          <Button
            variant="secondary"
            onClick={() => setEdit(true)}
            title={c.edit}
            aria-label={c.edit}
            size="icon"
          >
            <Pencil />
          </Button>
        }
      />
      <div className="flex flex-wrap gap-2">
        {row.phone && (
          <Button asChild variant="secondary">
            <a
              href={`tel:${row.phone}`}
              onClick={(e) => void quick(e, "phone", `tel:${row.phone}`)}
            >
              <Phone />
              {c.call}
            </a>
          </Button>
        )}
        {row.email && (
          <Button asChild variant="secondary">
            <a
              href={`mailto:${row.email}`}
              onClick={(e) => void quick(e, "email", `mailto:${row.email}`)}
            >
              <Mail />
              {c.sendEmail}
            </a>
          </Button>
        )}
        {row.whatsapp && (
          <Button asChild variant="secondary">
            <a
              href={whatsappHref(row.whatsapp)}
              onClick={(e) => void quick(e, "whatsapp", whatsappHref(row.whatsapp))}
            >
              <MessageCircle />
              {c.sendWhatsapp}
            </a>
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-destructive">
          {c.failed}
        </p>
      )}
      <div className="crm-tabs" role="tablist">
        {(["overview", "dossiers", "timeline"] as const).map((t) => (
          <Button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            variant="ghost"
          >
            {c[t]}
          </Button>
        ))}
      </div>
      {tab === "overview" ? (
        <div className="crm-detail-grid">
          <section>
            <h2 className="crm-section-title">{c.details}</h2>
            <dl className="crm-details">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || "—"}</dd>
                </div>
              ))}
            </dl>
            {row.notes && (
              <div className="mt-8">
                <h2 className="crm-section-title">{c.notes}</h2>
                <p className="whitespace-pre-wrap break-words">{row.notes}</p>
              </div>
            )}
            <div className="mt-9">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="crm-section-title mb-0">
                  {row.type === "company"
                    ? c.employees
                    : row.type === "household"
                      ? c.members
                      : c.types.household + " / " + c.types.company}
                </h2>
                {row.type !== "person" && (
                  <Button
                    size="icon"
                    variant="secondary"
                    title={c.addPerson}
                    aria-label={c.addPerson}
                    onClick={() => setLink(true)}
                  >
                    <Plus />
                  </Button>
                )}
              </div>
              {links.length ? (
                <ul className="divide-y divide-border">
                  {links.map((v) => {
                    const other = data.clients.find(
                      (k) => k.id === (v.client_id === id ? v.person_id : v.client_id),
                    );
                    return (
                      <li key={v.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          {other && (
                            <Link
                              to="/crm/clients/$id"
                              params={{ id: other.id }}
                              className="font-medium"
                            >
                              {displayClient(other)}
                            </Link>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">{v.role}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={c.removeLink}
                          aria-label={c.removeLink}
                          onClick={() =>
                            void remove({ data: { id: v.id } })
                              .then(refresh)
                              .catch(() => setError(true))
                          }
                        >
                          <Trash2 />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{c.none}</p>
              )}
            </div>
          </section>
          <section>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="crm-section-title mb-0">{c.openDossiers}</h2>
              <Button
                variant="secondary"
                size="icon"
                title={c.newDossier}
                aria-label={c.newDossier}
                onClick={() => setDossier(true)}
              >
                <Plus />
              </Button>
            </div>
            <DossierList dossiers={dossiers.filter((v) => isOpenDossier(v.status))} />
            <AppointmentsSection clientId={id} />
          </section>
        </div>
      ) : tab === "dossiers" ? (
        <section>
          <div className="mb-5 flex justify-end">
            <Button onClick={() => setDossier(true)}>
              <Plus />
              {c.newDossier}
            </Button>
          </div>
          <DossierList dossiers={dossiers} />
        </section>
      ) : (
        <Timeline clientId={id} />
      )}
      {edit && <ClientForm row={row} onClose={() => setEdit(false)} />}{" "}
      {dossier && <DossierForm clientId={id} onClose={() => setDossier(false)} />}{" "}
      {link && <LinkPersonForm clientId={id} onClose={() => setLink(false)} />}
    </>
  );
}
export function DossierDetailPage({ id }: { id: string }) {
  const { data, c, language } = useFoundation();
  const row = data.dossiers.find((v) => v.id === id);
  const [edit, setEdit] = useState(false);
  if (!row) return <FoundationNotFound />;
  const client = data.clients.find((v) => v.id === row.client_id);
  const member = data.team.find((v) => v.user_id === row.responsible_id);
  return (
    <>
      <Button asChild variant="ghost" className="mb-5 px-0">
        <Link to="/crm/clients/$id" params={{ id: row.client_id }}>
          <ArrowLeft />
          {client ? displayClient(client) : c.clients}
        </Link>
      </Button>
      <PageTitle
        title={row.title}
        subtitle={row.number}
        action={
          <Button variant="secondary" onClick={() => setEdit(true)}>
            <Pencil />
            {c.edit}
          </Button>
        }
      />
      <FollowUpBanner dossier={row} />
      <div className="mb-8 flex gap-3">
        <Status value={row.status} />
        <span className="crm-status">
          {c.priorities[row.priority as keyof typeof c.priorities]}
        </span>
      </div>
      <div className="crm-detail-grid">
        <section>
          <h2 className="crm-section-title">{c.overview}</h2>
          <dl className="crm-details">
            {[
              [c.service, c.services[row.service as keyof typeof c.services]],
              [c.responsible, member?.full_name || member?.email],
              [c.startDate, dateLabel(row.start_date, language)],
              [c.nextStepDate, dateLabel(row.next_step_date, language)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "—"}</dd>
              </div>
            ))}
          </dl>
          <h2 className="crm-section-title mt-8 flex items-center gap-2">
            <Clock3 className="size-4 text-muted-foreground" />
            {c.nextStep}
          </h2>
          <p className="whitespace-pre-wrap break-words">{row.next_step || "—"}</p>
          <AppointmentsSection clientId={row.client_id} dossierId={row.id} />
        </section>
        <section>
          <h2 className="crm-section-title">{c.timeline}</h2>
          <Timeline clientId={row.client_id} dossierId={row.id} />
        </section>
      </div>
      {edit && <DossierForm row={row} clientId={row.client_id} onClose={() => setEdit(false)} />}
    </>
  );
}
export function ComingPage({ kind }: { kind: "agenda" | "inbox" }) {
  const { c } = useFoundation();
  const Icon = kind === "agenda" ? CalendarDays : Inbox;
  return (
    <>
      <PageTitle title={c[kind]} />
      <section className="crm-coming">
        <Icon />
        <h2>{c.comingSoon}</h2>
        <p className="text-center">{kind === "agenda" ? c.agendaSoon : c.inboxSoon}</p>
      </section>
    </>
  );
}
