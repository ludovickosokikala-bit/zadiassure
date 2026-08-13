import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ctaVariants } from "@/components/ui/cta";
import { useLanguage } from "@/i18n";
import { mailDictionaries } from "@/i18n/mail";
import { disconnectGmail, gmailStatus, startGmailConnect } from "@/lib/gmail.functions";

export function useMailDict() {
  const { locale } = useLanguage();
  return mailDictionaries[locale];
}

export function useGmailStatus() {
  const fetchStatus = useServerFn(gmailStatus);
  return useQuery({ queryKey: ["crm", "gmail", "status"], queryFn: () => fetchStatus() });
}

function waitForOAuthCompletion(popup: Window) {
  return new Promise<void>((resolve, reject) => {
    let poll: number | undefined;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (poll !== undefined) window.clearInterval(poll);
    };
    const onMessage = (event: MessageEvent) => {
      const type = (event.data as { type?: string; connectorId?: string })?.type;
      if (
        event.origin !== window.location.origin ||
        event.source !== popup ||
        (event.data as { connectorId?: string })?.connectorId !== "google_mail" ||
        (type !== "appUserConnectorOAuthComplete" && type !== "appUserConnectorOAuthFailed")
      )
        return;
      cleanup();
      if (type === "appUserConnectorOAuthComplete") return resolve();
      popup.close();
      reject(new Error("OAuth connection failed."));
    };
    window.addEventListener("message", onMessage);
    poll = window.setInterval(() => {
      if (!popup.closed) return;
      cleanup();
      reject(new Error("OAuth window closed before completion."));
    }, 500);
  });
}

export function GmailConnectButton({
  onChanged,
  size = "sm",
}: {
  onChanged?: () => void;
  size?: "sm" | "md";
}) {
  const m = useMailDict();
  const status = useGmailStatus();
  const start = useServerFn(startGmailConnect);
  const stop = useServerFn(disconnectGmail);
  const [busy, setBusy] = useState(false);

  async function connect() {
    const popup = window.open("", "zadiassure-gmail-oauth", "width=600,height=720");
    if (!popup) {
      toast.error(m.popupBlocked);
      return;
    }
    setBusy(true);
    try {
      const { authorizationUrl } = await start();
      const done = waitForOAuthCompletion(popup);
      popup.location.href = authorizationUrl;
      await done;
      await status.refetch();
      onChanged?.();
      toast.success(m.connected);
    } catch {
      popup.close();
      toast.error(m.failed);
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await stop();
      await status.refetch();
      onChanged?.();
    } finally {
      setBusy(false);
    }
  }

  if (status.data?.connected) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <Mail className="h-3.5 w-3.5 text-primary" /> {status.data.email || m.connected}
        </span>
        <button onClick={disconnect} disabled={busy} className="hover:text-destructive">
          {m.disconnect}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={busy}
      className={cn(ctaVariants({ variant: "outline", size }))}
    >
      <Mail className="mr-1 h-4 w-4" /> {busy ? m.connecting : m.connect}
    </button>
  );
}
