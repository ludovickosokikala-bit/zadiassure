import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail, MailPlus, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ctaVariants } from "@/components/ui/cta";
import { Empty, Panel, Pill } from "@/components/crm/ui";
import { GmailConnectButton, useMailDict } from "@/components/crm/GmailConnect";
import { listClientMail, sendClientMail } from "@/lib/gmail.functions";

function shortDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("nl-BE", { dateStyle: "short", timeStyle: "short" });
}

export function MailPanel({
  email,
  clientId,
  caseId = null,
  className,
}: {
  email: string;
  clientId?: string | null;
  caseId?: string | null;
  className?: string;
}) {
  const m = useMailDict();
  const fetchMail = useServerFn(listClientMail);
  const send = useServerFn(sendClientMail);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const mail = useQuery({
    queryKey: ["crm", "mail", email],
    queryFn: () => fetchMail({ data: { email, max: 12 } }),
    enabled: Boolean(email),
  });

  async function onSend() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    try {
      await send({
        data: {
          to: email,
          subject,
          body,
          in_reply_to: "",
          client_id: clientId ?? null,
          case_id: caseId ?? null,
        },
      });
      toast.success(m.sent);
      setSubject("");
      setBody("");
      setComposing(false);
      await mail.refetch();
    } catch {
      toast.error(m.failed);
    } finally {
      setSending(false);
    }
  }

  return (
    <Panel
      title={m.title}
      className={className}
      action={
        mail.data?.connected && email ? (
          <button
            onClick={() => setComposing((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <MailPlus className="h-3.5 w-3.5" /> {m.newMail}
          </button>
        ) : undefined
      }
    >
      {!email ? (
        <Empty text={m.noEmail} />
      ) : mail.isLoading ? (
        <Empty text={m.loading} />
      ) : !mail.data?.connected ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{m.notConnected}</p>
          <GmailConnectButton onChanged={() => mail.refetch()} />
        </div>
      ) : (
        <>
          <p className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" /> {mail.data.mailbox}
          </p>

          {composing && (
            <div className="mb-4 space-y-2 rounded-xl border border-border bg-muted/30 p-3">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={m.subject}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={m.message}
                rows={5}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={onSend}
                disabled={sending}
                className={cn(ctaVariants({ variant: "primary", size: "sm" }))}
              >
                <Send className="mr-1 h-4 w-4" /> {sending ? m.sending : m.send}
              </button>
            </div>
          )}

          {mail.data.messages.length === 0 ? (
            <Empty text={m.noMessages} />
          ) : (
            <ul className="divide-y divide-border">
              {mail.data.messages.map((msg) => (
                <li key={msg.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-medium text-foreground">
                      {msg.subject || "(geen onderwerp)"}
                    </p>
                    <Pill
                      className={
                        msg.outgoing
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }
                    >
                      {msg.outgoing ? m.outgoing : m.incoming}
                    </Pill>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{msg.snippet}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{shortDate(msg.date)}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Panel>
  );
}
