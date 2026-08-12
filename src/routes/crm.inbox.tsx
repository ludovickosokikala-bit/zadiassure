import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Paperclip, Phone, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Empty, PageHead, Panel, Pill } from "@/components/crm/ui";
import { formatDate, useCrmApp, useCrmDict } from "@/components/crm/useCrm";
import { convertInbox, listInbox, setInboxStatus } from "@/lib/crm.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crm/inbox")({ component: InboxPage });

type Kind = "all" | "contact" | "request";
type Status = "all" | "new" | "in_progress" | "done" | "archived";

const statusTone: Record<string, string> = {
  new: "bg-accent/15 text-accent",
  in_progress: "bg-primary/10 text-primary",
  done: "bg-emerald-500/15 text-emerald-700",
  archived: "bg-secondary text-muted-foreground",
};

function InboxPage() {
  const c = useCrmDict();
  const a = useCrmApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<Kind>("all");
  const [status, setStatus] = useState<Status>("new");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const fetchInbox = useServerFn(listInbox);
  const updateStatus = useServerFn(setInboxStatus);
  const convert = useServerFn(convertInbox);

  const { data, isLoading } = useQuery({
    queryKey: ["crm", "inbox", kind, status, search],
    queryFn: () => fetchInbox({ data: { kind, status, search } }),
    refetchInterval: 60_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["crm"] });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: Exclude<Status, "all"> }) =>
      updateStatus({ data: input }),
    onSuccess: invalidate,
  });

  const convertMutation = useMutation({
    mutationFn: (input: { id: string; withCase: boolean }) => convert({ data: input }),
    onSuccess: async (res) => {
      await invalidate();
      if (res.caseId) navigate({ to: "/crm/cases/$id", params: { id: res.caseId } });
      else if (res.clientId) navigate({ to: "/crm/clients/$id", params: { id: res.clientId } });
    },
  });

  const label = (s: string) =>
    s === "new"
      ? a.inbox.statusNew
      : s === "in_progress"
        ? a.inbox.statusInProgress
        : s === "done"
          ? a.inbox.statusDone
          : a.inbox.statusArchived;

  const tabs: { key: Kind; label: string }[] = [
    { key: "all", label: a.inbox.all },
    { key: "contact", label: a.inbox.contact },
    { key: "request", label: a.inbox.requests },
  ];

  return (
    <>
      <PageHead title={a.inbox.title} intro={a.inbox.intro} />
      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-border p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setKind(t.key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                  kind === t.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl border border-border p-1">
            {(["new", "in_progress", "done", "all"] as Status[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                  status === s
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s === "all" ? c.common.all : label(s)}
              </button>
            ))}
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={c.common.search}
            className="max-w-xs"
          />
        </div>

        {isLoading ? (
          <Empty text={c.common.loading} />
        ) : !data || data.items.length === 0 ? (
          <Empty text={a.inbox.empty} />
        ) : (
          <ul className="divide-y divide-border">
            {data.items.map((item) => {
              const isContact = item.template_slug === "contact";
              const attachments = Array.isArray(item.attachments) ? item.attachments : [];
              const expanded = openId === item.id;
              return (
                <li key={item.id} className="py-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(expanded ? null : item.id)}
                    className="flex w-full flex-wrap items-center gap-3 text-left"
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                        item.status === "new"
                          ? "bg-accent/15 text-accent"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {isContact ? <Mail className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "truncate",
                            item.status === "new"
                              ? "font-bold text-foreground"
                              : "font-medium text-foreground",
                          )}
                        >
                          {item.full_name || item.email}
                        </span>
                        {attachments.length > 0 && (
                          <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {isContact ? a.inbox.contact : item.template_slug.replace(/-/g, " ")} ·{" "}
                        {item.email}
                        {item.phone ? ` · ${item.phone}` : ""}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs uppercase text-muted-foreground">
                        {item.language}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.created_at)}
                      </span>
                      <Pill className={statusTone[item.status] ?? ""}>{label(item.status)}</Pill>
                    </span>
                  </button>

                  {expanded && (
                    <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-4">
                      <p className="whitespace-pre-wrap text-sm text-foreground">
                        {item.message || "—"}
                      </p>
                      {attachments.length > 0 && (
                        <p className="mt-3 text-xs font-semibold text-muted-foreground">
                          {a.inbox.attachments}: {attachments.length}
                        </p>
                      )}
                      <div className="mt-4">
                        <InboxTriage submissionId={item.id} />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={convertMutation.isPending}
                          onClick={() => convertMutation.mutate({ id: item.id, withCase: true })}
                          className="rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-foreground shadow-soft"
                        >
                          {a.inbox.convertWithCase}
                        </button>
                        <button
                          type="button"
                          disabled={convertMutation.isPending}
                          onClick={() => convertMutation.mutate({ id: item.id, withCase: false })}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground"
                        >
                          {a.inbox.convert}
                        </button>
                        <a
                          href={`mailto:${item.email}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground"
                        >
                          <Mail className="h-3.5 w-3.5" /> {a.inbox.reply}
                        </a>
                        {item.phone && (
                          <a
                            href={`tel:${item.phone}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground"
                          >
                            <Phone className="h-3.5 w-3.5" /> {a.inbox.call}
                          </a>
                        )}
                        {item.status !== "in_progress" && (
                          <button
                            type="button"
                            onClick={() =>
                              statusMutation.mutate({ id: item.id, status: "in_progress" })
                            }
                            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground"
                          >
                            {a.inbox.markInProgress}
                          </button>
                        )}
                        {item.status !== "done" && (
                          <button
                            type="button"
                            onClick={() => statusMutation.mutate({ id: item.id, status: "done" })}
                            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground"
                          >
                            {a.inbox.markDone}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => statusMutation.mutate({ id: item.id, status: "archived" })}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground"
                        >
                          {a.inbox.archive}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}
