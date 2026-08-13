import type { Db } from "./crm.server";

export interface ReportBucket {
  key: string;
  label: string;
  count: number;
}

export interface ReportResult {
  range: { from: string; days: number };
  kpis: {
    newCases: number;
    closedCases: number;
    openCases: number;
    newClients: number;
    tasksCompleted: number;
    tasksOpen: number;
    overdueTasks: number;
    avgDaysToClose: number | null;
    onTimeRate: number | null;
    documentsPending: number;
    leadsTotal: number;
    leadsConverted: number;
  };
  byStatus: ReportBucket[];
  byPriority: ReportBucket[];
  byType: ReportBucket[];
  byMember: ReportBucket[];
  monthly: { month: string; created: number; closed: number }[];
}

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

/** Aggregates CRM activity into the numbers shown on the reports page. */
export async function buildReport(
  supabase: Db,
  organizationId: string,
  days: number,
): Promise<ReportResult> {
  const fromDate = new Date(Date.now() - days * 86400000);
  const from = fromDate.toISOString();
  const fromDay = from.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const [statuses, types, team, cases, tasks, clients, docs, leads] = await Promise.all([
    supabase
      .from("case_statuses")
      .select("key, label_nl, is_open, sort_order")
      .eq("organization_id", organizationId)
      .order("sort_order"),
    supabase
      .from("case_types")
      .select("id, name_nl")
      .eq("organization_id", organizationId),
    supabase
      .from("org_members")
      .select("user_id, full_name, email")
      .eq("organization_id", organizationId)
      .eq("active", true),
    supabase
      .from("cases")
      .select(
        "id, status_key, priority, case_type_id, assigned_to, created_at, closed_at, deadline",
      )
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .limit(3000),
    supabase
      .from("tasks")
      .select("id, status, due_date, completed_at, created_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .limit(3000),
    supabase
      .from("clients")
      .select("id, created_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .limit(3000),
    supabase
      .from("case_documents")
      .select("id, status")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .in("status", ["requested", "rejected", "expired"])
      .limit(1000),
    supabase.from("form_submissions").select("id, status, created_at").gte("created_at", from),
  ]);

  const statusRows = statuses.data ?? [];
  const openKeys = new Set(statusRows.filter((s) => s.is_open).map((s) => s.key));
  const allCases = cases.data ?? [];
  const inRange = allCases.filter((c) => (c.created_at ?? "") >= from);
  const closedInRange = allCases.filter((c) => c.closed_at && c.closed_at >= from);
  const allTasks = tasks.data ?? [];

  const closeDurations = closedInRange
    .filter((c) => c.created_at && c.closed_at)
    .map(
      (c) =>
        (new Date(c.closed_at as string).getTime() - new Date(c.created_at as string).getTime()) /
        86400000,
    );
  const avgDaysToClose = closeDurations.length
    ? Math.round((closeDurations.reduce((a, b) => a + b, 0) / closeDurations.length) * 10) / 10
    : null;

  const withDeadline = closedInRange.filter((c) => c.deadline);
  const onTime = withDeadline.filter(
    (c) => (c.closed_at as string).slice(0, 10) <= (c.deadline as string),
  );
  const onTimeRate = withDeadline.length
    ? Math.round((onTime.length / withDeadline.length) * 100)
    : null;

  const count = <T,>(rows: T[], pick: (row: T) => string | null | undefined) => {
    const map = new Map<string, number>();
    for (const row of rows) {
      const key = pick(row) || "—";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  };

  const statusMap = count(allCases.filter((c) => openKeys.has(c.status_key)), (c) => c.status_key);
  const byStatus: ReportBucket[] = statusRows
    .filter((s) => s.is_open)
    .map((s) => ({ key: s.key, label: s.label_nl, count: statusMap.get(s.key) ?? 0 }));

  const prioMap = count(allCases.filter((c) => openKeys.has(c.status_key)), (c) => c.priority);
  const byPriority: ReportBucket[] = ["urgent", "high", "normal", "low"].map((p) => ({
    key: p,
    label: p,
    count: prioMap.get(p) ?? 0,
  }));

  const typeNames = new Map((types.data ?? []).map((t) => [t.id, t.name_nl]));
  const typeMap = count(inRange, (c) => c.case_type_id);
  const byType: ReportBucket[] = [...typeMap.entries()]
    .map(([key, value]) => ({ key, label: typeNames.get(key) ?? "Onbepaald", count: value }))
    .sort((a, b) => b.count - a.count);

  const memberNames = new Map(
    (team.data ?? []).map((m) => [m.user_id, m.full_name || m.email || m.user_id]),
  );
  const memberMap = count(allCases.filter((c) => openKeys.has(c.status_key)), (c) => c.assigned_to);
  const byMember: ReportBucket[] = [...memberMap.entries()]
    .map(([key, value]) => ({
      key,
      label: key === "—" ? "Niet toegewezen" : memberNames.get(key) ?? "Onbekend",
      count: value,
    }))
    .sort((a, b) => b.count - a.count);

  const months = new Map<string, { created: number; closed: number }>();
  const cursor = new Date(fromDate);
  cursor.setUTCDate(1);
  while (cursor.toISOString().slice(0, 7) <= new Date().toISOString().slice(0, 7)) {
    months.set(cursor.toISOString().slice(0, 7), { created: 0, closed: 0 });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  for (const c of inRange) {
    const key = monthKey(c.created_at as string);
    const row = months.get(key);
    if (row) row.created += 1;
  }
  for (const c of closedInRange) {
    const key = monthKey(c.closed_at as string);
    const row = months.get(key);
    if (row) row.closed += 1;
  }

  const leadRows = leads.data ?? [];

  return {
    range: { from: fromDay, days },
    kpis: {
      newCases: inRange.length,
      closedCases: closedInRange.length,
      openCases: allCases.filter((c) => openKeys.has(c.status_key)).length,
      newClients: (clients.data ?? []).filter((c) => (c.created_at ?? "") >= from).length,
      tasksCompleted: allTasks.filter((t) => t.completed_at && t.completed_at >= from).length,
      tasksOpen: allTasks.filter((t) => t.status !== "completed" && t.status !== "cancelled").length,
      overdueTasks: allTasks.filter(
        (t) =>
          t.due_date &&
          t.due_date < today &&
          t.status !== "completed" &&
          t.status !== "cancelled",
      ).length,
      avgDaysToClose,
      onTimeRate,
      documentsPending: (docs.data ?? []).length,
      leadsTotal: leadRows.length,
      leadsConverted: leadRows.filter((l) => l.status === "converted").length,
    },
    byStatus,
    byPriority,
    byType,
    byMember,
    monthly: [...months.entries()].map(([month, v]) => ({ month, ...v })),
  };
}
