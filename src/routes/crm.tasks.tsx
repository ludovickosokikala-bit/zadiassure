import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "lucide-react";
import { ctaVariants } from "@/components/ui/cta";
import { cn } from "@/lib/utils";
import { listTasks } from "@/lib/crm.functions";
import { Empty, PageHead, Panel, Pill } from "@/components/crm/ui";
import {
  clientName,
  formatDate,
  isOverdue,
  priorityTone,
  taskTone,
  useCrmDict,
} from "@/components/crm/useCrm";
import { TaskDialog } from "@/components/crm/dialogs";

export const Route = createFileRoute("/crm/tasks")({ component: TasksPage });

type View = "mine" | "team" | "today" | "overdue" | "upcoming";
const VIEWS: View[] = ["mine", "team", "today", "overdue", "upcoming"];

function TasksPage() {
  const c = useCrmDict();
  const [view, setView] = useState<View>("mine");
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const fetchTasks = useServerFn(listTasks);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["crm", "tasks", view],
    queryFn: () => fetchTasks({ data: { view } }),
  });

  return (
    <>
      <PageHead
        title={c.tasks.title}
        intro={c.tasks.intro}
        action={
          <button
            onClick={() => {
              setRow(null);
              setOpen(true);
            }}
            className={cn(ctaVariants({ variant: "primary", size: "sm" }))}
          >
            <Plus className="mr-1 h-4 w-4" /> {c.tasks.newTask}
          </button>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              view === v
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {c.tasks.views[v]}
          </button>
        ))}
      </div>

      <Panel>
        {isLoading ? (
          <Empty text={c.common.loading} />
        ) : !data || data.items.length === 0 ? (
          <Empty text={c.tasks.noTasks} />
        ) : (
          <ul className="divide-y divide-border">
            {data.items.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <button
                    onClick={() => {
                      setRow(t as unknown as Record<string, unknown>);
                      setOpen(true);
                    }}
                    className="text-left font-medium text-foreground hover:text-primary"
                  >
                    {t.title}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {t.cases ? (
                      <Link
                        to="/crm/cases/$id"
                        params={{ id: (t.cases as { id: string }).id }}
                        className="hover:text-primary"
                      >
                        #{(t.cases as { case_number: number }).case_number} —{" "}
                        {(t.cases as { title: string }).title}
                      </Link>
                    ) : (
                      clientName(t.clients as never)
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "text-xs",
                      isOverdue(t.due_date, t.status)
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatDate(t.due_date)}
                    {t.due_time ? ` · ${String(t.due_time).slice(0, 5)}` : ""}
                  </span>
                  <Pill className={priorityTone[t.priority] ?? ""}>
                    {c.priority[t.priority as keyof typeof c.priority]}
                  </Pill>
                  <Pill className={taskTone(t.status)}>
                    {c.taskStatus[t.status as keyof typeof c.taskStatus]}
                  </Pill>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <TaskDialog open={open} onOpenChange={setOpen} row={row} onSaved={() => refetch()} />
    </>
  );
}
