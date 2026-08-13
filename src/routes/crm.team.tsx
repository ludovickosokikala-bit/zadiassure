import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, KeyRound, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CRM_ROLE_KEYS } from "@/lib/crm.schemas";
import {
  createMemberAccount,
  inviteMember,
  listTeam,
  revokeInvite,
  updateMember,
} from "@/lib/team.functions";
import { Empty, Field, PageHead, Panel, Pill, selectClass } from "@/components/crm/ui";
import { formatDate, useCrmDict } from "@/components/crm/useCrm";
import { useMandateDict } from "@/components/crm/useMandate";
import { useAccountDict } from "@/components/crm/PasswordPanel";


export const Route = createFileRoute("/crm/team")({ component: TeamPage });

type Role = (typeof CRM_ROLE_KEYS)[number];

function TeamPage() {
  const c = useCrmDict();
  const m = useMandateDict();
  const queryClient = useQueryClient();

  const fetchTeam = useServerFn(listTeam);
  const { data, isLoading } = useQuery({ queryKey: ["crm", "team"], queryFn: () => fetchTeam() });

  const invite = useServerFn(inviteMember);
  const revoke = useServerFn(revokeInvite);
  const update = useServerFn(updateMember);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["crm", "team"] });

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("employee");
  const [copied, setCopied] = useState<string | null>(null);
  const [account, setAccount] = useState<{
    email: string;
    password: string | null;
    existed: boolean;
  } | null>(null);


  const inviteMutation = useMutation({
    mutationFn: () => invite({ data: { email, full_name: fullName, role } }),
    onSuccess: () => {
      setEmail("");
      setFullName("");
      void invalidate();
    },
  });
  const revokeMutation = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: invalidate,
  });
  const memberMutation = useMutation({
    mutationFn: (v: { id: string; role?: Role; active?: boolean }) => update({ data: v }),
    onSuccess: invalidate,
  });
  const accountMutation = useMutation({
    mutationFn: () => createAccount({ data: { email, full_name: fullName, role } }),
    onSuccess: (res) => {
      setAccount(res);
      void invalidate();
    },
  });

  async function copyCredentials(mail: string, password: string) {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const body = a.mailBody
      .replaceAll("{name}", fullName || mail)
      .replaceAll("{loginUrl}", `${origin}/auth`)
      .replaceAll("{email}", mail)
      .replaceAll("{password}", password);
    await navigator.clipboard.writeText(`${a.mailSubject}\n\n${body}`);
    setCopied("account");
    window.setTimeout(() => setCopied(null), 2000);
  }


  function inviteLink(token: string) {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `${origin}/uitnodiging?token=${token}`;
  }

  function loginUrl() {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `${origin}/auth`;
  }

  type Invite = { token: string; email: string; full_name: string | null; role: string; expires_at: string };

  function mailBody(i: Invite) {
    return m.team.mailBody
      .replaceAll("{name}", i.full_name || i.email)
      .replaceAll("{role}", i.role)
      .replaceAll("{link}", inviteLink(i.token))
      .replaceAll("{email}", i.email)
      .replaceAll("{loginUrl}", loginUrl())
      .replaceAll("{expires}", formatDate(i.expires_at));
  }

  async function copy(token: string) {
    await navigator.clipboard.writeText(inviteLink(token));
    setCopied(token);
    window.setTimeout(() => setCopied(null), 2000);
  }

  async function copyMail(i: Invite) {
    await navigator.clipboard.writeText(`${m.team.mailSubject}\n\n${mailBody(i)}`);
    setCopied(`mail-${i.token}`);
    window.setTimeout(() => setCopied(null), 2000);
  }


  if (isLoading) return <p className="text-sm text-muted-foreground">{c.common.loading}</p>;
  if (!data?.isAdmin) {
    return (
      <>
        <PageHead title={m.team.title} />
        <Panel>
          <Empty text={m.team.onlyAdmins} />
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHead title={m.team.title} intro={m.team.intro} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={m.team.inviteTitle}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              inviteMutation.mutate();
            }}
          >
            <Field label={m.team.email}>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label={m.team.fullName}>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            <Field label={m.team.role}>
              <select
                className={selectClass}
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                {CRM_ROLE_KEYS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="gap-2" disabled={inviteMutation.isPending}>
                <UserPlus className="h-4 w-4" /> {m.team.send}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="gap-2"
                disabled={accountMutation.isPending || !email}
                onClick={() => accountMutation.mutate()}
              >
                <KeyRound className="h-4 w-4" />
                {accountMutation.isPending ? a.creating : a.create}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{m.team.inviteHint}</p>
            <p className="text-xs text-muted-foreground">{a.createIntro}</p>

            {account && (
              <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
                <p className="font-medium text-foreground">
                  {account.existed ? a.existed : a.created}
                </p>
                <p className="text-muted-foreground">{account.email}</p>
                {account.password && (
                  <p className="text-muted-foreground">
                    {a.defaultPassword}:{" "}
                    <span className="font-semibold text-foreground">{account.password}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{a.loginHint}</p>
                {account.password && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="gap-1.5"
                    onClick={() => copyCredentials(account.email, account.password as string)}
                  >
                    {copied === "account" ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> {a.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> {a.copyCredentials}
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

          </form>
        </Panel>

        <Panel title={m.team.pending}>
          {data.invites.length === 0 ? (
            <Empty text={m.team.noPending} />
          ) : (
            <ul className="divide-y divide-border">
              {data.invites.map((i) => (
                <li key={i.id} className="space-y-2 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{i.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.role} · {m.team.expires} {formatDate(i.expires_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => copy(i.token)}>
                        {copied === i.token ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> {m.team.copied}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> {m.team.copyLink}
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => revokeMutation.mutate(i.id)}
                      >
                        {m.team.revoke}
                      </Button>
                    </div>
                  </div>
                  <p className="break-all rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    {inviteLink(i.token)}
                  </p>

                  <div className="rounded-xl border border-border bg-background p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.team.mailTitle}</p>
                        <p className="text-xs text-muted-foreground">{m.team.mailHint}</p>
                      </div>
                      <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => copyMail(i)}>
                        {copied === `mail-${i.token}` ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> {m.team.copied}
                          </>
                        ) : (
                          <>
                            <Mail className="h-3.5 w-3.5" /> {m.team.copyMail}
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {m.team.mailSubjectLabel}
                    </p>
                    <p className="text-sm text-foreground">{m.team.mailSubject}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {m.team.mailBodyLabel}
                    </p>
                    <pre className="whitespace-pre-wrap break-words font-body text-sm text-muted-foreground">
                      {mailBody(i)}
                    </pre>
                  </div>

                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={m.team.members} className="lg:col-span-2">
          <ul className="divide-y divide-border">
            {data.members.map((mem) => (
              <li key={mem.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {mem.full_name || mem.email}
                    {!mem.active && (
                      <Pill className="ml-2 bg-muted text-muted-foreground">{m.team.inactive}</Pill>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{mem.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <select
                    className={cn(selectClass, "h-9 w-44")}
                    value={mem.role}
                    disabled={mem.user_id === data.me}
                    onChange={(e) =>
                      memberMutation.mutate({ id: mem.id, role: e.target.value as Role })
                    }
                  >
                    {CRM_ROLE_KEYS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {mem.user_id !== data.me && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => memberMutation.mutate({ id: mem.id, active: !mem.active })}
                    >
                      {mem.active ? m.team.deactivate : m.team.activate}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
