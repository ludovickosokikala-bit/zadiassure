import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Section } from "@/components/site/Section";
import { ctaVariants } from "@/components/ui/cta";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListForms,
  adminListLegislation,
  adminListSubmissions,
  deleteRecord,
  getMyAdminStatus,
  saveForm,
  saveLegislation,
  updateSubmissionStatus,
} from "@/lib/admin.functions";
import {
  AdminEditor,
  emptyForm,
  emptyLegislation,
  type Row,
} from "@/components/admin/AdminEditor";
import { libraryDictionaries, type ThemeKey } from "@/i18n/library";
import { useLanguage } from "@/i18n";
import { pick, useLib } from "@/i18n/useLibrary";

const meta = libraryDictionaries.nl.admin;

export const Route = createFileRoute("/_authenticated/beheer")({
  head: () => ({
    meta: [
      { title: `${meta.title} — ZADIASSURE` },
      { name: "description", content: meta.intro },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: `${meta.title} — ZADIASSURE` },
      { property: "og:description", content: meta.intro },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => (
    <Section>
      <p className="text-muted-foreground">{meta.saveFailed}</p>
    </Section>
  ),
  component: AdminPage,
});

type Tab = "legislation" | "forms" | "submissions";

function AdminPage() {
  const lib = useLib();
  const a = lib.admin;
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("legislation");
  const [editing, setEditing] = useState<{ kind: "legislation" | "form"; row: Row } | null>(null);

  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => getMyAdminStatus() });
  const isAdmin = status.data?.isAdmin === true;

  const legislation = useQuery({
    queryKey: ["admin-legislation"],
    queryFn: () => adminListLegislation(),
    enabled: isAdmin,
  });
  const forms = useQuery({
    queryKey: ["admin-forms"],
    queryFn: () => adminListForms(),
    enabled: isAdmin,
  });
  const submissions = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: () => adminListSubmissions(),
    enabled: isAdmin,
  });

  const tabs = useMemo(
    () =>
      [
        ["legislation", a.tabs.legislation],
        ["forms", a.tabs.forms],
        ["submissions", a.tabs.submissions],
      ] as const,
    [a],
  );

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  const remove = async (table: "legislation_updates" | "form_templates" | "form_submissions", id: string) => {
    if (!window.confirm(a.confirmDelete)) return;
    await deleteRecord({ data: { table, id } });
    void queryClient.invalidateQueries();
  };

  if (status.isLoading) {
    return (
      <Section>
        <Loader2 className="size-6 animate-spin text-primary" />
      </Section>
    );
  }

  if (!isAdmin) {
    return (
      <Section tone="sand">
        <h1 className="text-2xl font-bold text-primary">{a.notAdminTitle}</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">{a.notAdminText}</p>
        <button type="button" onClick={signOut} className={cn(ctaVariants({ variant: "outline" }), "mt-6")}>
          {a.signOut}
        </button>
      </Section>
    );
  }

  return (
    <Section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{a.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{a.intro}</p>
        </div>
        <button type="button" onClick={signOut} className={cn(ctaVariants({ variant: "outline" }))}>
          {a.signOut}
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2.5">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              setEditing(null);
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              tab === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-primary hover:bg-secondary",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {editing && (
        <AdminEditor
          kind={editing.kind}
          row={editing.row}
          dict={lib}
          onCancel={() => setEditing(null)}
          onSave={async (values) => {
            if (editing.kind === "legislation") {
              await saveLegislation({ data: values });
            } else {
              await saveForm({ data: values });
            }
            setEditing(null);
            void queryClient.invalidateQueries();
          }}
        />
      )}

      {!editing && tab === "legislation" && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setEditing({ kind: "legislation", row: { ...emptyLegislation } })}
            className={cn(ctaVariants({ variant: "accent" }))}
          >
            <Plus className="size-4" /> {a.newLegislation}
          </button>
          <ul className="mt-6 grid gap-3">
            {(legislation.data?.items ?? []).map((item: Row) => (
              <RowCard
                key={String(item["id"])}
                title={pick(item, "title", locale)}
                badge={lib.themes[item["theme"] as ThemeKey]}
                published={item["published"] === true}
                labels={a}
                onEdit={() =>
                  setEditing({
                    kind: "legislation",
                    row: { ...item, effective_date: item["effective_date"] ?? "" },
                  })
                }
                onDelete={() => void remove("legislation_updates", String(item["id"]))}
              />
            ))}
          </ul>
        </div>
      )}

      {!editing && tab === "forms" && (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setEditing({ kind: "form", row: { ...emptyForm } })}
            className={cn(ctaVariants({ variant: "accent" }))}
          >
            <Plus className="size-4" /> {a.newForm}
          </button>
          <ul className="mt-6 grid gap-3">
            {(forms.data?.items ?? []).map((item: Row) => (
              <RowCard
                key={String(item["id"])}
                title={pick(item, "title", locale)}
                badge={lib.themes[item["theme"] as ThemeKey]}
                published={item["published"] === true}
                labels={a}
                onEdit={() => setEditing({ kind: "form", row: { ...item } })}
                onDelete={() => void remove("form_templates", String(item["id"]))}
              />
            ))}
          </ul>
        </div>
      )}

      {!editing && tab === "submissions" && (
        <div className="mt-8 grid gap-3">
          {(submissions.data?.items ?? []).length === 0 && (
            <p className="text-muted-foreground">{a.noSubmissions}</p>
          )}
          {(submissions.data?.items ?? []).map((item: Row) => (
            <article
              key={String(item["id"])}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-primary">
                    {String(item["full_name"] ?? "")} — {String(item["form_slug"] ?? "")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {String(item["email"] ?? "")} · {String(item["phone"] ?? "")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={String(item["status"] ?? "new")}
                    onChange={async (e) => {
                      await updateSubmissionStatus({
                        data: {
                          id: String(item["id"]),
                          status: e.target.value as "new" | "in_progress" | "done" | "archived",
                        },
                      });
                      void queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
                    }}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="new">new</option>
                    <option value="in_progress">in_progress</option>
                    <option value="done">done</option>
                    <option value="archived">archived</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => void remove("form_submissions", String(item["id"]))}
                    className="rounded-full border border-border p-2 text-primary hover:bg-secondary"
                    aria-label={a.delete}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              {item["message"] ? (
                <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                  {String(item["message"])}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}

function RowCard({
  title,
  badge,
  published,
  labels,
  onEdit,
  onDelete,
}: {
  title: string;
  badge: string;
  published: boolean;
  labels: { edit: string; delete: string; published: string; draft: string };
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div>
        <h2 className="font-bold text-primary">{title}</h2>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          {badge} · {published ? labels.published : labels.draft}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary"
        >
          <Pencil className="size-4" /> {labels.edit}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full border border-border p-2 text-primary hover:bg-secondary"
          aria-label={labels.delete}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </li>
  );
}
