import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Copy, Mail, UserPlus, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listTeam,
  inviteMember,
  createMemberAccount,
  revokeInvite,
  updateMember,
} from "@/lib/team.functions";
import { useFoundation, dateLabel } from "./context";
import { PageTitle, Field, EmptyState } from "./ui";
export const teamQuery = () =>
  queryOptions({ queryKey: ["crm-foundation-team"], queryFn: () => listTeam() });
const legacyAdmin = (role: string) => ["owner", "super_admin", "admin"].includes(role);
export function TeamPage() {
  const { data: team } = useSuspenseQuery(teamQuery());
  const { c, language, refresh } = useFoundation();
  const client = useQueryClient();
  const invite = useServerFn(inviteMember);
  const create = useServerFn(createMemberAccount);
  const revoke = useServerFn(revokeInvite);
  const update = useServerFn(updateMember);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "employee">("employee");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState<{
    email: string;
    password: string | null;
    existed: boolean;
  } | null>(null);
  const invalidate = async () => {
    await Promise.all([refresh(), client.invalidateQueries({ queryKey: ["crm-foundation-team"] })]);
  };
  const origin = () => window.location.origin;
  const login = () => `${origin()}/auth`;
  const invitation = (token: string) =>
    `${origin()}/uitnodiging?token=${encodeURIComponent(token)}`;
  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
      await invalidate();
    } catch {
      setMessage(c.failed);
    } finally {
      setBusy(false);
    }
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(c.copied);
    } catch {
      setMessage(c.failed);
    }
  }
  if (!team.isAdmin)
    return (
      <>
        <PageTitle title={c.team} />
        <EmptyState text={c.noAccess} />
      </>
    );
  return (
    <>
      <PageTitle title={c.team} />
      <section className="mb-10">
        <h2 className="crm-section-title">{c.team}</h2>
        <div className="crm-card">
          {team.members.map((v) => (
            <div key={v.id} className="crm-list-row">
              <div className="min-w-0">
                <strong>{v.full_name || v.email}</strong>
                <small className="break-all">
                  {v.email} · {v.active ? c.active : c.inactive}
                </small>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <select
                  className="crm-select max-w-36"
                  aria-label={`${c.role} ${v.full_name}`}
                  disabled={busy || v.user_id === team.me}
                  value={legacyAdmin(v.role) ? "admin" : "employee"}
                  onChange={(e) => {
                    const nextRole = e.target.value === "admin" ? "admin" : "employee";
                    void run(() => update({ data: { id: v.id, role: nextRole } }));
                  }}
                >
                  <option value="admin">{c.admin}</option>
                  <option value="employee">{c.staff}</option>
                </select>
                {v.user_id !== team.me && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() =>
                      void run(() => update({ data: { id: v.id, active: !v.active } }))
                    }
                  >
                    {v.active ? c.deactivate : c.activate}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="crm-section-title">
            {c.invite} / {c.createAccount}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await invite({ data: { email, full_name: name, role } });
                setEmail("");
                setName("");
              });
            }}
            className="space-y-5"
          >
            <Field label={c.fullName}>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label={c.email}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label={c.role}>
              <select
                className="crm-select"
                value={role}
                onChange={(e) => setRole(e.target.value === "admin" ? "admin" : "employee")}
              >
                <option value="employee">{c.staff}</option>
                <option value="admin">{c.admin}</option>
              </select>
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy}>
                <UserPlus />
                {c.invite}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busy || !email || !name}
                onClick={() =>
                  void run(async () => {
                    const result = await create({ data: { email, full_name: name, role } });
                    setAccount(result);
                  })
                }
              >
                <KeyRound />
                {c.createAccount}
              </Button>
            </div>
            {account && (
              <div className="border-t border-border pt-5">
                <p>{account.existed ? c.existingAccount : c.accountCreated}</p>
                <p className="mt-2 break-all text-sm text-muted-foreground">{account.email}</p>
                {account.password && (
                  <>
                    <p className="mt-2 text-sm">
                      {c.defaultPassword}: {account.password}
                    </p>
                    <Button
                      className="mt-4"
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        void copy(
                          c.accountMailSubject +
                            "\n\n" +
                            c.accountMail
                              .replaceAll("{name}", name || account.email)
                              .replaceAll("{login}", login())
                              .replaceAll("{email}", account.email)
                              .replaceAll("{password}", account.password ?? ""),
                        )
                      }
                    >
                      <Mail />
                      {c.copyMail}
                    </Button>
                  </>
                )}
              </div>
            )}
          </form>
        </section>
        <section>
          <h2 className="crm-section-title">{c.invitations}</h2>
          {team.invites.length === 0 ? (
            <EmptyState text={c.none} />
          ) : (
            <ul className="divide-y divide-border">
              {team.invites.map((v) => (
                <li key={v.id} className="py-5">
                  <p className="break-all font-medium">{v.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.expires} {dateLabel(v.expires_at, language)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      title={c.copyInvite}
                      onClick={() => void copy(invitation(v.token))}
                    >
                      <Copy />
                      {c.copyInvite}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      title={c.copyMail}
                      onClick={() =>
                        void copy(
                          c.invitationMailSubject +
                            "\n\n" +
                            c.invitationMail
                              .replaceAll("{name}", v.full_name || v.email)
                              .replaceAll("{login}", login())
                              .replaceAll("{email}", v.email)
                              .replaceAll("{link}", invitation(v.token))
                              .replaceAll("{expires}", dateLabel(v.expires_at, language)),
                        )
                      }
                    >
                      <Mail />
                      {c.copyMail}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => void run(() => revoke({ data: { id: v.id } }))}
                    >
                      {c.revoke}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {message && (
        <p role="status" className="mt-6 text-sm">
          {message}
        </p>
      )}
    </>
  );
}
