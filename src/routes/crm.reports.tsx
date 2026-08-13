import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useLanguage } from "@/i18n";
import { getReports } from "@/lib/crm.functions";
import { cn } from "@/lib/utils";
import { Empty, PageHead, Panel, selectClass } from "@/components/crm/ui";
import { useCrmDict } from "@/components/crm/useCrm";

export const Route = createFileRoute("/crm/reports")({ component: ReportsPage });

const COPY = {
  nl: {
    title: "Rapporten",
    intro: "Cijfers over dossiers, taken en aanvragen van je kantoor.",
    period: "Periode",
    days: (n: number) => `Laatste ${n} dagen`,
    newCases: "Nieuwe dossiers",
    closedCases: "Afgesloten dossiers",
    openCases: "Open dossiers",
    newClients: "Nieuwe klanten",
    tasksCompleted: "Afgewerkte taken",
    tasksOpen: "Open taken",
    overdueTasks: "Taken te laat",
    avgDaysToClose: "Gem. doorlooptijd",
    onTimeRate: "Op tijd afgesloten",
    documentsPending: "Documenten in afwachting",
    leads: "Aanvragen via website",
    leadsConverted: "Omgezet in dossier",
    byStatus: "Open dossiers per status",
    byPriority: "Open dossiers per prioriteit",
    byType: "Nieuwe dossiers per type",
    byMember: "Open dossiers per medewerker",
    monthly: "Evolutie per maand",
    created: "Aangemaakt",
    closed: "Afgesloten",
    dayUnit: "dagen",
    none: "Nog geen gegevens",
  },
  fr: {
    title: "Rapports",
    intro: "Chiffres sur les dossiers, tâches et demandes de votre cabinet.",
    period: "Période",
    days: (n: number) => `Derniers ${n} jours`,
    newCases: "Nouveaux dossiers",
    closedCases: "Dossiers clôturés",
    openCases: "Dossiers ouverts",
    newClients: "Nouveaux clients",
    tasksCompleted: "Tâches terminées",
    tasksOpen: "Tâches ouvertes",
    overdueTasks: "Tâches en retard",
    avgDaysToClose: "Durée moyenne",
    onTimeRate: "Clôturés à temps",
    documentsPending: "Documents en attente",
    leads: "Demandes via le site",
    leadsConverted: "Converties en dossier",
    byStatus: "Dossiers ouverts par statut",
    byPriority: "Dossiers ouverts par priorité",
    byType: "Nouveaux dossiers par type",
    byMember: "Dossiers ouverts par collaborateur",
    monthly: "Évolution par mois",
    created: "Créés",
    closed: "Clôturés",
    dayUnit: "jours",
    none: "Pas encore de données",
  },
  en: {
    title: "Reports",
    intro: "Numbers on cases, tasks and requests across your office.",
    period: "Period",
    days: (n: number) => `Last ${n} days`,
    newCases: "New cases",
    closedCases: "Closed cases",
    openCases: "Open cases",
    newClients: "New clients",
    tasksCompleted: "Completed tasks",
    tasksOpen: "Open tasks",
    overdueTasks: "Overdue tasks",
    avgDaysToClose: "Avg. time to close",
    onTimeRate: "Closed on time",
    documentsPending: "Documents pending",
    leads: "Website requests",
    leadsConverted: "Converted to case",
    byStatus: "Open cases by status",
    byPriority: "Open cases by priority",
    byType: "New cases by type",
    byMember: "Open cases by team member",
    monthly: "Monthly evolution",
    created: "Created",
    closed: "Closed",
    dayUnit: "days",
    none: "No data yet",
  },
} as const;

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Bars({ rows }: { rows: { key: string; label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) return null;
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.key}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-foreground">{row.label}</span>
            <span className="font-semibold text-muted-foreground">{row.count}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ReportsPage() {
  const c = useCrmDict();
  const { locale } = useLanguage();
  const t = COPY[locale as keyof typeof COPY] ?? COPY.nl;
  const [days, setDays] = useState(90);
  const fetchReports = useServerFn(getReports);
  const report = useQuery({
    queryKey: ["crm", "reports", days],
    queryFn: () => fetchReports({ data: { days } }),
  });

  const d = report.data;
  const maxMonth = Math.max(1, ...(d?.monthly ?? []).map((m) => Math.max(m.created, m.closed)));

  return (
    <>
      <PageHead
        title={t.title}
        intro={t.intro}
        action={
          <select
            className={cn(selectClass, "max-w-44")}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            aria-label={t.period}
          >
            {[30, 90, 180, 365].map((n) => (
              <option key={n} value={n}>
                {t.days(n)}
              </option>
            ))}
          </select>
        }
      />

      {report.isLoading || !d ? (
        <Panel>
          <Empty text={c.common.loading} />
        </Panel>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label={t.newCases} value={String(d.kpis.newCases)} />
            <Kpi label={t.closedCases} value={String(d.kpis.closedCases)} />
            <Kpi label={t.openCases} value={String(d.kpis.openCases)} />
            <Kpi label={t.newClients} value={String(d.kpis.newClients)} />
            <Kpi
              label={t.avgDaysToClose}
              value={d.kpis.avgDaysToClose === null ? "—" : `${d.kpis.avgDaysToClose} ${t.dayUnit}`}
            />
            <Kpi
              label={t.onTimeRate}
              value={d.kpis.onTimeRate === null ? "—" : `${d.kpis.onTimeRate}%`}
            />
            <Kpi label={t.tasksCompleted} value={String(d.kpis.tasksCompleted)} />
            <Kpi
              label={t.overdueTasks}
              value={String(d.kpis.overdueTasks)}
              hint={`${d.kpis.tasksOpen} ${t.tasksOpen.toLowerCase()}`}
            />
            <Kpi label={t.documentsPending} value={String(d.kpis.documentsPending)} />
            <Kpi
              label={t.leads}
              value={String(d.kpis.leadsTotal)}
              hint={`${d.kpis.leadsConverted} ${t.leadsConverted.toLowerCase()}`}
            />
          </div>

          <Panel title={t.monthly}>
            {d.monthly.length === 0 ? (
              <Empty text={t.none} />
            ) : (
              <div className="flex items-end gap-4 overflow-x-auto pb-2">
                {d.monthly.map((m) => (
                  <div key={m.month} className="flex w-16 shrink-0 flex-col items-center gap-2">
                    <div className="flex h-40 items-end gap-1">
                      <div
                        className="w-5 rounded-t bg-primary"
                        style={{ height: `${(m.created / maxMonth) * 100}%` }}
                        title={`${t.created}: ${m.created}`}
                      />
                      <div
                        className="w-5 rounded-t bg-accent"
                        style={{ height: `${(m.closed / maxMonth) * 100}%` }}
                        title={`${t.closed}: ${m.closed}`}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground">{m.month.slice(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" /> {t.created}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" /> {t.closed}
              </span>
            </div>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title={t.byStatus}>
              {d.byStatus.length ? <Bars rows={d.byStatus} /> : <Empty text={t.none} />}
            </Panel>
            <Panel title={t.byPriority}>
              <Bars
                rows={d.byPriority.map((r) => ({
                  ...r,
                  label: c.priority[r.key as keyof typeof c.priority] ?? r.label,
                }))}
              />
            </Panel>
            <Panel title={t.byMember}>
              {d.byMember.length ? <Bars rows={d.byMember} /> : <Empty text={t.none} />}
            </Panel>
            <Panel title={t.byType}>
              {d.byType.length ? <Bars rows={d.byType} /> : <Empty text={t.none} />}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
