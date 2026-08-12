import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { getDashboard } from "@/lib/crm.functions";
import { Empty, Panel, PageHead, Pill, StatCard } from "@/components/crm/ui";
import { DailyBriefing } from "@/components/crm/ai";
import {
  clientName,
  formatDate,
  isOverdue,
  priorityTone,
  useCrmDict,
} from "@/components/crm/useCrm";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crm/")({ component: Dashboard });

function Dashboard() {
  const c = useCrmDict();
  const fetchDashboard = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["crm", "dashboard"],
    queryFn: () => fetchDashboard({}),
  });

  if (isLoading || !data) return <p className="text-sm text-muted-foreground">{c.common.loading}</p>;

  return (
    <>
      <PageHead title={c.dashboard.title} intro={c.dashboard.intro} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label={c.dashboard.activeCases} value={data.kpis.activeCases} />
        <StatCard label={c.dashboard.newRequests} value={data.kpis.newRequests} />
        <StatCard label={c.dashboard.dueToday} value={data.kpis.dueToday} />
        <StatCard
          label={c.dashboard.overdue}
          value={data.kpis.overdue}
          tone={data.kpis.overdue > 0 ? "text-destructive" : ""}
        />
        <StatCard label={c.dashboard.deadlinesWeek} value={data.kpis.deadlinesThisWeek} />
      </div>

      <div className="mt-6">
        <DailyBriefing />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title={c.dashboard.attention}>
          {data.attention.length === 0 ? (
            <Empty text={c.common.empty} />
          ) : (
            <ul className="divide-y divide-border">
              {data.attention.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      to="/crm/cases/$id"
                      params={{ id: row.id }}
                      className="truncate font-medium text-foreground hover:text-primary"
                    >
                      {row.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      #{row.case_number} · {clientName(row.clients as never)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {row.deadline && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatDate(row.deadline)}
                      </span>
                    )}
                    <Pill className={priorityTone[row.priority] ?? ""}>
                      {c.priority[row.priority as keyof typeof c.priority]}
                    </Pill>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={c.tasks.views.mine}>
          {data.myTasks.length === 0 ? (
            <Empty text={c.tasks.noTasks} />
          ) : (
            <ul className="divide-y divide-border">
              {data.myTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0 truncate text-sm text-foreground">{t.title}</span>
                  <span
                    className={cn(
                      "shrink-0 text-xs",
                      isOverdue(t.due_date, t.status)
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatDate(t.due_date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={c.dashboard.missingDocuments}>
          {data.missingDocuments.length === 0 ? (
            <Empty text={c.documents.noDocuments} />
          ) : (
            <ul className="divide-y divide-border">
              {data.missingDocuments.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 truncate">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-accent" />
                    {d.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {c.docStatus[d.status as keyof typeof c.docStatus] ?? d.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={c.dashboard.recentActivity}>
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
      </div>
    </>
  );
}
