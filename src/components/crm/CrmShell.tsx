import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { LOCALES, useLanguage } from "@/i18n";
import { cn } from "@/lib/utils";
import { useCrmDict, useWorkspace } from "./useCrm";

const NAV: {
  to: string;
  key: "dashboard" | "clients" | "cases" | "tasks" | "documents" | "settings";
  icon: typeof Users;
  exact?: boolean;
}[] = [
  { to: "/crm", key: "dashboard", icon: LayoutDashboard, exact: true },
  { to: "/crm/clients", key: "clients", icon: Users },
  { to: "/crm/cases", key: "cases", icon: Briefcase },
  { to: "/crm/tasks", key: "tasks", icon: ListChecks },
  { to: "/crm/documents", key: "documents", icon: FileText },
  { to: "/crm/settings", key: "settings", icon: Settings },
];

export function CrmShell({ children }: { children: ReactNode }) {
  const c = useCrmDict();
  const { locale, setLocale } = useLanguage();
  const navigate = useNavigate();
  const workspace = useWorkspace();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const member = workspace.data?.member ?? null;

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
            {c.nav[item.key]}
          </Link>
        );
      })}
    </nav>
  );

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
          <div className="mt-8 flex-1">{nav}</div>
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

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
            <Link to="/crm" className="flex items-center gap-2">
              <LogoMark className="h-8 w-auto" />
            </Link>
            <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </header>
          {open && (
            <div className="border-b border-border bg-card px-4 py-4 lg:hidden">
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
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
