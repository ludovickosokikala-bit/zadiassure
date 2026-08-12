import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarPlus, Check, ChevronLeft, ChevronRight, Copy, Link2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ctaVariants } from "@/components/ui/cta";
import { cn } from "@/lib/utils";
import {
  deleteAppointment,
  getCalendarFeed,
  listAgenda,
  resetCalendarFeed,
} from "@/lib/agenda.functions";
import { Empty, PageHead, Panel, Pill } from "@/components/crm/ui";
import { clientName, useCrmDict } from "@/components/crm/useCrm";
import { useAgendaDict } from "@/components/crm/useAgenda";
import { AppointmentDialog } from "@/components/crm/AppointmentDialog";

export const Route = createFileRoute("/crm/agenda")({ component: AgendaPage });

function iso(day: Date) {
  return day.toISOString().slice(0, 10);
}

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function AgendaPage() {
  const c = useCrmDict();
  const g = useAgendaDict();
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()));
  const [span, setSpan] = useState<"week" | "month">("week");
  const [mine, setMine] = useState(true);
  const [open, setOpen] = useState(false);
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [copied, setCopied] = useState(false);

  const range = useMemo(() => {
    if (span === "week") {
      const to = new Date(anchor);
      to.setDate(to.getDate() + 6);
      return { from: iso(anchor), to: iso(to) };
    }
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return { from: iso(first), to: iso(last) };
  }, [anchor, span]);

  const fetchAgenda = useServerFn(listAgenda);
  const removeFn = useServerFn(deleteAppointment);
  const feedFn = useServerFn(getCalendarFeed);
  const resetFn = useServerFn(resetCalendarFeed);

  const agenda = useQuery({
    queryKey: ["crm", "agenda", range.from, range.to, mine],
    queryFn: () => fetchAgenda({ data: { ...range, mine } }),
  });
  const feed = useQuery({ queryKey: ["crm", "calendar-feed"], queryFn: () => feedFn() });

  const reset = useMutation({
    mutationFn: () => resetFn(),
    onSuccess: async () => {
      await feed.refetch();
      toast.success(g.sync.resetDone);
    },
  });

  const feedUrl =
    typeof window !== "undefined" && feed.data
      ? `${window.location.origin}/api/public/agenda/${feed.data.token}.ics`
      : "";

  const items = useMemo(() => {
    const list: {
      key: string;
      kind: "appointment" | "task";
      when: string;
      time: string;
      title: string;
      sub: string;
      status: string;
      row?: Record<string, unknown>;
      id: string;
    }[] = [];

    for (const a of agenda.data?.appointments ?? []) {
      const start = new Date(a.starts_at);
      const end = new Date(a.ends_at);
      const client = a.clients ? clientName(a.clients as never) : "";
      const kase = a.cases
        ? `#${(a.cases as { case_number: number }).case_number} — ${(a.cases as { title: string }).title}`
        : "";
      list.push({
        key: `a-${a.id}`,
        id: a.id,
        kind: "appointment",
        when: a.starts_at.slice(0, 10),
        time: a.all_day
          ? g.fields.allDay
          : `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        title: a.title,
        sub: [g.kinds[a.meeting_kind as keyof typeof g.kinds] ?? "", client || kase, a.location]
          .filter(Boolean)
          .join(" · "),
        status: g.statuses[a.status as keyof typeof g.statuses] ?? a.status,
        row: a as unknown as Record<string, unknown>,
      });
    }

    for (const t of agenda.data?.tasks ?? []) {
      if (!t.due_date) continue;
      list.push({
        key: `t-${t.id}`,
        id: t.id,
        kind: "task",
        when: t.due_date,
        time: g.task,
        title: t.title,
        sub: c.priority[t.priority as keyof typeof c.priority] ?? "",
        status: c.taskStatus[t.status as keyof typeof c.taskStatus] ?? t.status,
      });
    }

    return list.sort((a, b) => (a.when + a.time).localeCompare(b.when + b.time));
  }, [agenda.data, g, c]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const bucket = map.get(item.when) ?? [];
      bucket.push(item);
      map.set(item.when, bucket);
    }
    return [...map.entries()];
  }, [items]);

  const shift = (dir: -1 | 1) => {
    const next = new Date(anchor);
    if (span === "week") next.setDate(next.getDate() + dir * 7);
    else next.setMonth(next.getMonth() + dir);
    setAnchor(span === "week" ? startOfWeek(next) : next);
  };

  const remove = async (id: string) => {
    if (!window.confirm(c.common.confirmDelete)) return;
    await removeFn({ data: { id } });
    void agenda.refetch();
  };

  return (
    <>
      <PageHead
        title={g.title}
        intro={g.intro}
        action={
          <button
            onClick={() => {
              setRow(null);
              setOpen(true);
            }}
            className={cn(ctaVariants({ variant: "primary", size: "sm" }))}
          >
            <CalendarPlus className="mr-1 h-4 w-4" /> {g.newAppointment}
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => shift(-1)}
          aria-label={g.prev}
          className="rounded-full border border-border p-2 text-foreground hover:bg-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setAnchor(span === "week" ? startOfWeek(new Date()) : new Date())}
          className="rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-foreground"
        >
          {g.today}
        </button>
        <button
          onClick={() => shift(1)}
          aria-label={g.next}
          className="rounded-full border border-border p-2 text-foreground hover:bg-secondary"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="ml-1 text-sm font-semibold text-muted-foreground">
          {range.from} → {range.to}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          {(["week", "month"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setSpan(s);
                setAnchor(s === "week" ? startOfWeek(new Date()) : new Date());
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition",
                span === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "week" ? g.week : g.month}
            </button>
          ))}
          <button
            onClick={() => setMine((v) => !v)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              mine
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {g.mineOnly}
          </button>
        </div>
      </div>

      <Panel>
        {agenda.isLoading ? (
          <Empty text={c.common.loading} />
        ) : grouped.length === 0 ? (
          <Empty text={g.noItems} />
        ) : (
          <div className="space-y-6">
            {grouped.map(([day, dayItems]) => (
              <div key={day}>
                <h2 className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  {new Date(`${day}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h2>
                <ul className="divide-y divide-border">
                  {dayItems.map((item) => (
                    <li key={item.key} className="flex flex-wrap items-center gap-3 py-3">
                      <span className="w-32 shrink-0 text-xs font-semibold text-muted-foreground">
                        {item.time}
                      </span>
                      <div className="min-w-0 flex-1">
                        {item.kind === "appointment" ? (
                          <button
                            onClick={() => {
                              setRow(item.row ?? null);
                              setOpen(true);
                            }}
                            className="text-left font-medium text-foreground hover:text-primary"
                          >
                            {item.title}
                          </button>
                        ) : (
                          <Link to="/crm/tasks" className="font-medium text-foreground hover:text-primary">
                            {item.title}
                          </Link>
                        )}
                        {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
                      </div>
                      <Pill className="bg-secondary text-muted-foreground">{item.status}</Pill>
                      {item.kind === "appointment" && (
                        <button
                          onClick={() => void remove(item.id)}
                          aria-label={c.common.delete}
                          className="rounded-full border border-border p-2 text-foreground hover:bg-secondary"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel className="mt-6" title={g.sync.title}>
        <p className="text-sm text-muted-foreground">{g.sync.intro}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <code className="max-w-full flex-1 overflow-x-auto rounded-md border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">
            {feedUrl || "…"}
          </code>
          <button
            disabled={!feedUrl}
            onClick={async () => {
              await navigator.clipboard.writeText(feedUrl);
              setCopied(true);
              toast.success(g.sync.copied);
              setTimeout(() => setCopied(false), 2000);
            }}
            className={cn(ctaVariants({ variant: "primary", size: "sm" }))}
          >
            {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
            {g.sync.copy}
          </button>
          <button
            onClick={() => reset.mutate()}
            disabled={reset.isPending}
            className={cn(ctaVariants({ variant: "outline", size: "sm" }))}
          >
            <RefreshCw className="mr-1 h-4 w-4" /> {g.sync.reset}
          </button>
        </div>
        <ol className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          {g.sync.steps.map((step) => (
            <li key={step} className="flex gap-2">
              <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {step}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">{g.sync.note}</p>
      </Panel>

      <AppointmentDialog
        open={open}
        onOpenChange={setOpen}
        row={row}
        onSaved={() => void agenda.refetch()}
      />
    </>
  );
}
