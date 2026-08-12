import { createFileRoute } from "@tanstack/react-router";
import { useLanguage } from "@/i18n";
import { Empty, PageHead, Panel, Pill } from "@/components/crm/ui";
import { localized, useCrmDict, useWorkspace } from "@/components/crm/useCrm";

export const Route = createFileRoute("/crm/settings")({ component: SettingsPage });

function SettingsPage() {
  const c = useCrmDict();
  const { locale } = useLanguage();
  const ws = useWorkspace();

  if (ws.isLoading || !ws.data)
    return <p className="text-sm text-muted-foreground">{c.common.loading}</p>;

  const { organization, member } = ws.data;
  const team = ws.data.team ?? [];
  const caseTypes = ws.data.caseTypes ?? [];
  const caseStatuses = ws.data.caseStatuses ?? [];

  return (
    <>
      <PageHead title={c.settings.title} intro={c.settings.intro} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={c.settings.organization}>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{c.settings.organization}</dt>
              <dd className="font-medium text-foreground">{organization?.name ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{c.nav.settings}</dt>
              <dd className="font-medium text-foreground">{member?.role ?? "—"}</dd>
            </div>
          </dl>
        </Panel>

        <Panel title={c.settings.team}>
          {team.length === 0 ? (
            <Empty text={c.common.empty} />
          ) : (
            <ul className="divide-y divide-border">
              {team.map((m) => (
                <li key={m.user_id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">
                    {m.full_name || m.email}
                    <span className="ml-2 text-xs text-muted-foreground">{m.email}</span>
                  </span>
                  <Pill className="bg-secondary text-foreground">{m.role}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={c.settings.caseTypes}>
          {caseTypes.length === 0 ? (
            <Empty text={c.common.empty} />
          ) : (
            <ul className="divide-y divide-border">
              {caseTypes.map((t) => (
                <li key={t.id} className="py-2 text-sm">
                  <p className="font-medium text-foreground">{localized(t as never, "name", locale)}</p>
                  {Array.isArray(t.workflow_stages) && t.workflow_stages.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {(t.workflow_stages as string[]).join(" → ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={c.settings.caseStatuses}>
          {caseStatuses.length === 0 ? (
            <Empty text={c.common.empty} />
          ) : (
            <ol className="space-y-2 text-sm">
              {caseStatuses.map((s) => (
                <li key={s.key} className="rounded-lg bg-muted/40 px-3 py-2 text-foreground">
                  {localized(s as never, "label", locale)}
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">{c.settings.comingSoon}</p>
    </>
  );
}
