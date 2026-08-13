import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Columns3, List, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ctaVariants } from "@/components/ui/cta";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n";
import { PRIORITIES } from "@/lib/crm.schemas";
import { listCases, listClients } from "@/lib/crm.functions";
import { Empty, PageHead, Panel, Pill, selectClass } from "@/components/crm/ui";
import {
  clientName,
  formatDate,
  localized,
  priorityTone,
  useCrmDict,
  useWorkspace,
} from "@/components/crm/useCrm";
import { CaseBoard } from "@/components/crm/CaseBoard";
import { CaseDialog } from "@/components/crm/dialogs";

export const Route = createFileRoute("/crm/cases/")({ component: CasesPage });

const VIEW_COPY = {
  nl: { list: "Lijst", board: "Bord" },
  fr: { list: "Liste", board: "Tableau" },
  en: { list: "List", board: "Board" },
} as const;

function CasesPage() {
  const c = useCrmDict();
  const { locale } = useLanguage();
  const ws = useWorkspace();
  const statuses = ws.data?.caseStatuses ?? [];
  const [search, setSearch] = useState("");
  const [statusKey, setStatusKey] = useState("");
  const [priority, setPriority] = useState("");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "board">("list");
  const viewCopy = VIEW_COPY[locale as keyof typeof VIEW_COPY] ?? VIEW_COPY.nl;


  const fetchCases = useServerFn(listCases);
  const fetchClients = useServerFn(listClients);
  const cases = useQuery({
    queryKey: ["crm", "cases", search, statusKey, priority],
    queryFn: () =>
      fetchCases({
        data: {
          search,
          status_key: statusKey,
          priority: (priority || null) as never,
          assigned_to: null,
          case_type_id: null,
          only_open: false,
        },
      }),
  });
  const clients = useQuery({
    queryKey: ["crm", "clients", ""],
    queryFn: () => fetchClients({ data: { search: "" } }),
  });

  return (
    <>
      <PageHead
        title={c.cases.title}
        intro={c.cases.intro}
        action={
          <button
            onClick={() => setOpen(true)}
            className={cn(ctaVariants({ variant: "primary", size: "sm" }))}
          >
            <Plus className="mr-1 h-4 w-4" /> {c.cases.newCase}
          </button>
        }
      />
      <Panel>
        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={c.common.search}
            className="max-w-xs"
          />
          <select
            className={cn(selectClass, "max-w-48")}
            value={statusKey}
            onChange={(e) => setStatusKey(e.target.value)}
          >
            <option value="">{c.common.all}</option>
            {statuses.map((s) => (
              <option key={s.key} value={s.key}>
                {localized(s as never, "label", locale)}
              </option>
            ))}
          </select>
          <select
            className={cn(selectClass, "max-w-40")}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">{c.common.all}</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {c.priority[p]}
              </option>
            ))}
          </select>
          <div className="ml-auto inline-flex rounded-xl border border-border bg-secondary/50 p-1">
            {(["list", "board"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  view === mode
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode === "list" ? <List className="h-3.5 w-3.5" /> : <Columns3 className="h-3.5 w-3.5" />}
                {mode === "list" ? viewCopy.list : viewCopy.board}
              </button>
            ))}
          </div>
        </div>

        {cases.isLoading ? (
          <Empty text={c.common.loading} />
        ) : !cases.data || cases.data.items.length === 0 ? (
          <Empty text={c.cases.noCases} />
        ) : view === "board" ? (
          <CaseBoard
            cases={cases.data.items as never}
            statuses={statuses.filter((s) => s.is_open) as never}
            onChanged={() => void cases.refetch()}
          />
        ) : (

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4">{c.cases.caseTitle}</th>
                  <th className="py-2 pr-4">{c.cases.client}</th>
                  <th className="py-2 pr-4">{c.cases.status}</th>
                  <th className="py-2 pr-4">{c.cases.priority}</th>
                  <th className="py-2 pr-4">{c.cases.deadline}</th>
                  <th className="py-2">{c.cases.progress}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cases.data.items.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/40">
                    <td className="py-3 pr-4">
                      <Link
                        to="/crm/cases/$id"
                        params={{ id: row.id }}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {row.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">#{row.case_number}</p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {clientName(row.clients as never)}
                    </td>
                    <td className="py-3 pr-4">
                      <Pill className="bg-primary/10 text-primary">
                        {localized(
                          statuses.find((s) => s.key === row.status_key) as never,
                          "label",
                          locale,
                        ) || row.status_key}
                      </Pill>
                    </td>
                    <td className="py-3 pr-4">
                      <Pill className={priorityTone[row.priority] ?? ""}>
                        {c.priority[row.priority as keyof typeof c.priority]}
                      </Pill>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDate(row.deadline)}</td>
                    <td className="py-3 text-muted-foreground">{row.progress ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <CaseDialog
        open={open}
        onOpenChange={setOpen}
        clients={(clients.data?.items ?? []) as never}
        onSaved={() => cases.refetch()}
      />
    </>
  );
}
