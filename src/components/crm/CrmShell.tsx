import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CalendarClock,
  FileText,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Mail,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
  Menu,
} from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { LOCALES, useLanguage } from "@/i18n";
import { crmSearch, listClients } from "@/lib/crm.functions";
import { cn } from "@/lib/utils";
import { useCrmApp, useCrmBadges, useCrmDict, useWorkspace } from "./useCrm";
import { CaseDialog, ClientDialog, TaskDialog } from "./dialogs";

type BadgeKey = "inbox" | "cases" | "tasks" | "documents" | null;

const NAV: {
  to: string;
  key: "dashboard" | "inbox" | "clients" | "cases" | "tasks" | "documents" | "ai" | "settings";
  icon: typeof Users;
  exact?: boolean;
  badge?: BadgeKey;
  primary?: boolean;
}[] = [
  { to: "/crm", key: "dashboard", icon: LayoutDashboard, exact: true, primary: true },
  { to: "/crm/inbox", key: "inbox", icon: Inbox, badge: "inbox", primary: true },
  { to: "/crm/clients", key: "clients", icon: Users, primary: true },
  { to: "/crm/cases", key: "cases", icon: Briefcase, badge: "cases", primary: true },
  { to: "/crm/tasks", key: "tasks", icon: ListChecks, badge: "tasks", primary: true },
  { to: "/crm/documents", key: "documents", icon: FileText, badge: "documents" },
  { to: "/crm/ai", key: "ai", icon: Sparkles },
  { to: "/crm/settings", key: "settings", icon: Settings },
];


function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-bold leading-none text-accent-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function CrmShell({ children }: { children: ReactNode }) {
  const c = useCrmDict();
  const a = useCrmApp();
  const { locale, setLocale } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const workspace = useWorkspace();
  const badges = useCrmBadges();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [creating, setCreating] = useState(false);
  const [palette, setPalette] = useState(false);
  const [dialog, setDialog] = useState<"client" | "case" | "task" | null>(null);

  const member = workspace.data?.member ?? null;
  const b = badges.data;

  const counts = {
    inbox: (b?.requests ?? 0) + (b?.mails ?? 0),
    cases: b?.newCases ?? 0,
    tasks: (b?.myTasksToday ?? 0) + (b?.myTasksOverdue ?? 0),
    documents: b?.documents ?? 0,
  };
  const totalAlerts = counts.inbox + counts.cases + (b?.myTasksOverdue ?? 0);

  // Keyboard shortcuts: Ctrl/Cmd+K search, Ctrl/Cmd+J quick create.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setCreating((v) => !v);
      }
      if (e.key === "Escape") {
        setPalette(false);
        setCreating(false);
        setBell(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Live updates: refresh badges + lists when data changes in the database.
  useEffect(() => {
    const channel = supabase
      .channel("crm-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "form_submissions" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["crm"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "cases" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["crm"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["crm", "badges"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // App-like tab title with the pending count.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = "ZADIASSURE CRM";
    document.title = totalAlerts > 0 ? `(${totalAlerts}) ${base}` : base;
  }, [totalAlerts]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (workspace.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">{c.common.loading}</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <LogoMark className="mx-auto h-12 w-auto" />
          <h1 className="mt-5 font-heading text-xl font-bold text-foreground">{c.noAccess.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{c.noAccess.text}</p>
          <button
            type="button"
            onClick={signOut}
            className="mt-6 text-sm font-semibold text-primary hover:underline"
          >
            {c.nav.signOut}
          </button>
        </div>
      </div>
    );
  }

  const label = (key: (typeof NAV)[number]["key"]) =>
    key === "inbox"
      ? a.nav.inbox
      : key === "ai"
        ? "AI"
        : c.nav[key as keyof typeof c.nav];

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label(item.key)}
            {item.badge && <Badge count={counts[item.badge]} />}
          </Link>
        );
      })}
    </nav>
  );

  const notifications = [
    { icon: Inbox, count: b?.requests ?? 0, text: a.notify.newRequests, to: "/crm/inbox" },
    { icon: Mail, count: b?.mails ?? 0, text: a.notify.newMails, to: "/crm/inbox" },
    { icon: Briefcase, count: b?.newCases ?? 0, text: a.notify.newCases, to: "/crm/cases" },
    { icon: AlertTriangle, count: b?.myTasksOverdue ?? 0, text: a.notify.tasksOverdue, to: "/crm/tasks" },
    { icon: CalendarClock, count: b?.myTasksToday ?? 0, text: a.notify.tasksToday, to: "/crm/tasks" },
    { icon: FileText, count: b?.documents ?? 0, text: a.notify.documentsPending, to: "/crm/documents" },
  ].filter((n) => n.count > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
          <Link to="/crm" className="flex items-center gap-2 px-2">
            <LogoMark className="h-9 w-auto" />
            <span className="font-heading text-sm font-bold leading-tight text-foreground">
              {c.brand}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-bold text-accent-foreground shadow-soft transition hover:brightness-105"
          >
            <Plus className="h-4 w-4" /> {a.topbar.create}
          </button>
          <div className="mt-6 flex-1 overflow-y-auto">{nav}</div>
          <footer className="space-y-3 border-t border-border pt-4">
            <div className="px-2">
              <p className="truncate text-sm font-semibold text-foreground">
                {member.full_name || member.email}
              </p>
              <p className="text-xs capitalize text-muted-foreground">
                {member.role.replace("_", " ")}
              </p>
            </div>
            <div className="flex gap-1 px-2">
              {LOCALES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-semibold uppercase",
                    l === locale
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {c.nav.website}
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> {c.nav.signOut}
            </button>
          </footer>
        </aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col border-r border-border bg-card px-4 py-5 shadow-lg">
              <div className="flex items-center justify-between">
                <Link to="/crm" onClick={() => setOpen(false)} className="flex items-center gap-2">
                  <LogoMark className="h-8 w-auto" />
                  <span className="font-heading text-sm font-bold text-foreground">{c.brand}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5 flex-1 overflow-y-auto">{nav}</div>
              <footer className="space-y-3 border-t border-border pt-4">
                <div className="flex gap-1 px-1">
                  {LOCALES.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLocale(l)}
                      className={cn(
                        "rounded-md px-2 py-1 text-xs font-semibold uppercase",
                        l === locale
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {c.nav.website}
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" /> {c.nav.signOut}
                </button>
              </footer>
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* App bar */}
          <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur sm:px-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={c.brand}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:border-primary/40 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/crm" className="flex items-center gap-2 lg:hidden">
              <LogoMark className="h-7 w-auto" />
            </Link>
            <button
              type="button"
              onClick={() => setPalette(true)}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left text-sm text-muted-foreground transition hover:border-primary/40"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="truncate">{a.topbar.searchPlaceholder}</span>
              <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold sm:block">
                {a.topbar.searchHint}
              </kbd>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setBell((v) => !v)}
                aria-label={a.topbar.notifications}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground transition hover:border-primary/40"
              >
                <Bell className="h-4 w-4" />
                {totalAlerts > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1 py-0.5 text-[10px] font-bold leading-none text-accent-foreground ring-2 ring-card">
                    {totalAlerts > 99 ? "99+" : totalAlerts}
                  </span>
                )}
              </button>
              {bell && (
                <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">{a.topbar.notifications}</p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase text-emerald-600">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      {a.topbar.online}
                    </span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-muted-foreground">
                      {a.topbar.noNotifications}
                    </p>
                  ) : (
                    <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                      {notifications.map((n) => {
                        const Icon = n.icon;
                        return (
                          <li key={n.text}>
                            <Link
                              to={n.to}
                              onClick={() => setBell(false)}
                              className="flex items-start gap-3 px-4 py-3 transition hover:bg-secondary"
                            >
                              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="text-sm text-foreground">
                                <strong className="font-bold">{n.count}</strong> {n.text}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCreating(true)}
              aria-label={a.topbar.create}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-soft lg:hidden"
            >
              <Plus className="h-5 w-5" />
            </button>
          </header>

          <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-10 lg:pb-10">
            {children}
          </main>

          {/* Mobile bottom tab bar */}
          <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card/95 backdrop-blur lg:hidden">
            {NAV.filter((i) => i.primary).map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              const count = item.badge ? counts[item.badge] : 0;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <span className="relative">
                    <Icon className="h-5 w-5" />
                    {count > 0 && (
                      <span className="absolute -right-2 -top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-tight text-accent-foreground">
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </span>
                  <span className="truncate">{label(item.key)}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-muted-foreground"
            >
              {open ? <X className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
              <span>{a.nav.more}</span>
            </button>
          </nav>

          {open && (
            <div className="fixed inset-x-0 bottom-14 z-30 border-y border-border bg-card px-4 py-4 shadow-lg lg:hidden">
              {nav}
              <button
                type="button"
                onClick={signOut}
                className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground"
              >
                <LogOut className="h-3.5 w-3.5" /> {c.nav.signOut}
              </button>
            </div>
          )}
        </div>
      </div>

      {creating && (
        <QuickCreate
          onClose={() => setCreating(false)}
          onPick={(kind) => {
            setCreating(false);
            setDialog(kind);
          }}
        />
      )}
      {palette && <CommandPalette onClose={() => setPalette(false)} />}

      <ClientDialog
        open={dialog === "client"}
        onOpenChange={(v) => !v && setDialog(null)}
        onSaved={(id) => {
          setDialog(null);
          void queryClient.invalidateQueries({ queryKey: ["crm"] });
          navigate({ to: "/crm/clients/$id", params: { id } });
        }}
      />
      <QuickCaseDialog open={dialog === "case"} onClose={() => setDialog(null)} />
      <TaskDialog
        open={dialog === "task"}
        onOpenChange={(v) => !v && setDialog(null)}
        onSaved={() => {
          setDialog(null);
          void queryClient.invalidateQueries({ queryKey: ["crm"] });
        }}
      />
    </div>
  );
}

/** Quick create sheet: the "+" that makes the CRM feel like an app. */
function QuickCreate({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (kind: "client" | "case" | "task") => void;
}) {
  const a = useCrmApp();
  const items: { kind: "client" | "case" | "task"; label: string; icon: typeof Users }[] = [
    { kind: "client", label: a.create.client, icon: Users },
    { kind: "case", label: a.create.case, icon: Briefcase },
    { kind: "task", label: a.create.task, icon: ListChecks },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-heading text-sm font-bold text-foreground">{a.topbar.create}</p>
          <button type="button" onClick={onClose} aria-label="Sluiten">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="grid gap-2">
          {items.map((i) => {
            const Icon = i.icon;
            return (
              <button
                key={i.kind}
                type="button"
                onClick={() => onPick(i.kind)}
                className="flex items-center gap-3 rounded-xl border border-border px-3 py-3 text-left text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-secondary"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                {i.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Case dialog needs the client list; loaded lazily only when opened. */
function QuickCaseDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const fetchClients = useServerFn(listClients);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clients = useQuery({
    queryKey: ["crm", "clients", ""],
    queryFn: () => fetchClients({ data: { search: "" } }),
    enabled: open,
  });
  if (!open) return null;
  return (
    <CaseDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      clients={(clients.data?.items ?? []) as never}
      onSaved={(id) => {
        onClose();
        void queryClient.invalidateQueries({ queryKey: ["crm"] });
        navigate({ to: "/crm/cases/$id", params: { id } });
      }}
    />
  );
}

/** Ctrl+K global search across clients, cases and tasks. */
function CommandPalette({ onClose }: { onClose: () => void }) {
  const a = useCrmApp();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const search = useServerFn(crmSearch);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useQuery({
    queryKey: ["crm", "search", q],
    queryFn: () => search({ data: { q } }),
    enabled: q.trim().length >= 2,
  });

  const groups = useMemo(() => {
    const d = results.data;
    if (!d) return [];
    return [
      {
        title: a.search.clients,
        items: d.clients.map((r) => ({
          id: r.id,
          label:
            `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || r.company_name || r.email || "—",
          hint: r.email ?? "",
          go: () => navigate({ to: "/crm/clients/$id", params: { id: r.id } }),
        })),
      },
      {
        title: a.search.cases,
        items: d.cases.map((r) => ({
          id: r.id,
          label: r.title,
          hint: r.case_number ? `#${r.case_number}` : "",
          go: () => navigate({ to: "/crm/cases/$id", params: { id: r.id } }),
        })),
      },
      {
        title: a.search.tasks,
        items: d.tasks.map((r) => ({
          id: r.id,
          label: r.title,
          hint: r.due_date ?? "",
          go: () => navigate({ to: "/crm/tasks" }),
        })),
      },
    ].filter((g) => g.items.length > 0);
  }, [results.data, a, navigate]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 p-4 pt-[10vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={a.topbar.searchPlaceholder}
            className="w-full bg-transparent text-sm text-foreground outline-none"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {q.trim().length < 2 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">{a.search.typing}</p>
          ) : groups.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">{a.search.noResults}</p>
          ) : (
            groups.map((g) => (
              <div key={g.title} className="mb-2">
                <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {g.title}
                </p>
                {g.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      item.go();
                      onClose();
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground transition hover:bg-secondary"
                  >
                    <span className="truncate font-medium">{item.label}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{item.hint}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
