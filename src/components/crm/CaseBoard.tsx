import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n";
import { setCaseStatus } from "@/lib/crm.functions";
import { cn } from "@/lib/utils";
import { Pill } from "./ui";
import { clientName, formatDate, localized, priorityTone, useCrmDict } from "./useCrm";

const BOARD_COPY = {
  nl: { empty: "Geen dossiers", moved: "Dossier verplaatst", failed: "Verplaatsen mislukt" },
  fr: { empty: "Aucun dossier", moved: "Dossier déplacé", failed: "Déplacement échoué" },
  en: { empty: "No cases", moved: "Case moved", failed: "Move failed" },
} as const;

type CaseRow = {
  id: string;
  case_number: number | null;
  title: string;
  status_key: string;
  priority: string;
  deadline: string | null;
  clients?: unknown;
};

type StatusRow = {
  key: string;
  is_open: boolean;
  sort_order: number;
  label_nl: string;
  label_fr: string;
  label_en: string;
};

export function CaseBoard({
  cases,
  statuses,
  onChanged,
}: {
  cases: CaseRow[];
  statuses: StatusRow[];
  onChanged?: () => void;
}) {
  const c = useCrmDict();
  const { locale } = useLanguage();
  const copy = BOARD_COPY[locale as keyof typeof BOARD_COPY] ?? BOARD_COPY.nl;
  const queryClient = useQueryClient();
  const move = useServerFn(setCaseStatus);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const columns = useMemo(
    () => [...statuses].sort((a, b) => a.sort_order - b.sort_order),
    [statuses],
  );

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status_key: string }) => move({ data: vars }),
    onSuccess: () => {
      toast.success(copy.moved);
      void queryClient.invalidateQueries({ queryKey: ["crm"] });
      onChanged?.();
    },
    onError: () => toast.error(copy.failed),
  });

  function drop(statusKey: string) {
    const id = dragging;
    setDragging(null);
    setOver(null);
    if (!id) return;
    const row = cases.find((x) => x.id === id);
    if (!row || row.status_key === statusKey) return;
    mutation.mutate({ id, status_key: statusKey });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((status) => {
        const items = cases.filter((row) => row.status_key === status.key);
        return (
          <div
            key={status.key}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(status.key);
            }}
            onDragLeave={() => setOver((v) => (v === status.key ? null : v))}
            onDrop={() => drop(status.key)}
            className={cn(
              "flex min-h-64 w-72 shrink-0 flex-col rounded-2xl border bg-secondary/40 p-3 transition-colors",
              over === status.key ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <header className="mb-3 flex items-center justify-between gap-2 px-1">
              <span className="font-heading text-sm font-semibold text-foreground">
                {localized(status as never, "label", locale)}
              </span>
              <span className="rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {items.length}
              </span>
            </header>

            <div className="flex flex-1 flex-col gap-2">
              {items.length === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">{copy.empty}</p>
              ) : (
                items.map((row) => (
                  <article
                    key={row.id}
                    draggable
                    onDragStart={() => setDragging(row.id)}
                    onDragEnd={() => setDragging(null)}
                    className={cn(
                      "group cursor-grab rounded-xl border border-border bg-card p-3 shadow-soft transition-opacity active:cursor-grabbing",
                      dragging === row.id && "opacity-50",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/crm/cases/$id"
                          params={{ id: row.id }}
                          className="block truncate text-sm font-semibold text-foreground hover:text-primary"
                        >
                          {row.title}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                          #{row.case_number} · {clientName(row.clients as never)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Pill className={priorityTone[row.priority] ?? ""}>
                            {c.priority[row.priority as keyof typeof c.priority]}
                          </Pill>
                          {row.deadline && (
                            <span className="text-[11px] text-muted-foreground">
                              {formatDate(row.deadline)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
