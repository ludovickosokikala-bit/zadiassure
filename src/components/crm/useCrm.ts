import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useLanguage } from "@/i18n";
import { crmDictionaries, type CrmDict } from "@/i18n/crm";
import { getWorkspace } from "@/lib/crm.functions";

export type Workspace = Awaited<ReturnType<typeof getWorkspace>>;

/** CRM dictionary in the active site language. */
export function useCrmDict(): CrmDict {
  const { locale } = useLanguage();
  return crmDictionaries[locale];
}

/** Loads membership, organization, team, case types and statuses. */
export function useWorkspace() {
  const fetchWorkspace = useServerFn(getWorkspace);
  return useQuery({
    queryKey: ["crm", "workspace"],
    queryFn: () => fetchWorkspace({}),
    staleTime: 5 * 60 * 1000,
  });
}

type LocalizedRow = Record<string, unknown>;

export function localized(row: LocalizedRow | null | undefined, base: string, locale: string) {
  if (!row) return "";
  return (row[`${base}_${locale}`] as string) || (row[`${base}_nl`] as string) || "";
}

export function clientName(row?: {
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
} | null) {
  if (!row) return "—";
  const person = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();
  return person || row.company_name || "—";
}

export function memberName(
  team: { user_id: string; full_name: string | null; email: string | null }[],
  id: string | null | undefined,
  fallback: string,
) {
  if (!id) return fallback;
  const found = team.find((m) => m.user_id === id);
  return found?.full_name || found?.email || fallback;
}

export const priorityTone: Record<string, string> = {
  low: "bg-secondary text-muted-foreground",
  normal: "bg-secondary text-foreground",
  high: "bg-accent/15 text-accent",
  urgent: "bg-destructive/15 text-destructive",
};

export const statusTone: Record<string, string> = {
  neutral: "bg-secondary text-foreground",
  info: "bg-primary/10 text-primary",
  warning: "bg-accent/15 text-accent",
  success: "bg-emerald-500/15 text-emerald-700",
  danger: "bg-destructive/15 text-destructive",
};

export function taskTone(status: string) {
  if (status === "completed") return statusTone["success"];
  if (status === "cancelled") return statusTone["neutral"];
  if (status === "waiting") return statusTone["warning"];
  if (status === "in_progress") return statusTone["info"];
  return statusTone["neutral"];
}

export function docTone(status: string) {
  if (status === "approved") return statusTone["success"];
  if (status === "rejected" || status === "expired") return statusTone["danger"];
  if (status === "requested") return statusTone["warning"];
  return statusTone["info"];
}

export function formatDate(value: string | null | undefined, locale = "nl-BE") {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

export function isOverdue(due: string | null | undefined, status?: string) {
  if (!due || status === "completed" || status === "cancelled") return false;
  return due < new Date().toISOString().slice(0, 10);
}
