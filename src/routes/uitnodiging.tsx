import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/Logo";
import { acceptInvite, getInvite } from "@/lib/team.functions";
import { useMandateDict } from "@/components/crm/useMandate";
import { useCrmDict } from "@/components/crm/useCrm";

export const Route = createFileRoute("/uitnodiging")({
  ssr: false,
  validateSearch: z.object({ token: z.string().catch("") }),
  beforeLoad: async ({ search }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { invite: search.token } as never });
    }
  },
  head: () => ({
    meta: [
      { title: "Uitnodiging — ZADIASSURE" },
      { name: "description", content: "Aanvaard je uitnodiging als medewerker van ZADIASSURE." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Uitnodiging — ZADIASSURE" },
      { property: "og:description", content: "Aanvaard je uitnodiging als medewerker." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useSearch();
  const m = useMandateDict();
  const c = useCrmDict();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const fetchInvite = useServerFn(getInvite);
  const accept = useServerFn(acceptInvite);

  const invite = useQuery({
    queryKey: ["invite", token],
    queryFn: () => fetchInvite({ data: { token } }),
    enabled: token.length > 8,
  });

  const mutation = useMutation({
    mutationFn: () => accept({ data: { token } }),
    onSuccess: (res) => {
      if (res.ok) {
        setDone(true);
        window.setTimeout(() => navigate({ to: "/crm" }), 1200);
      }
    },
  });

  const state = token.length <= 8 ? "invalid" : (invite.data?.state ?? "loading");

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <LogoMark className="mx-auto h-12 w-auto" />

        {invite.isLoading && state === "loading" ? (
          <p className="mt-6 text-sm text-muted-foreground">{c.common.loading}</p>
        ) : done ? (
          <>
            <CheckCircle2 className="mx-auto mt-6 h-9 w-9 text-accent" />
            <p className="mt-3 text-sm text-foreground">{m.team.accepted}</p>
          </>
        ) : state === "ready" ? (
          <>
            <ShieldCheck className="mx-auto mt-6 h-9 w-9 text-accent" />
            <h1 className="mt-4 font-heading text-xl font-bold text-foreground">
              {m.team.acceptTitle}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{m.team.acceptText}</p>
            <p className="mt-3 text-sm font-medium text-foreground">
              {invite.data?.organization} · {invite.data?.invite?.role}
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {m.team.acceptButton}
            </Button>
          </>
        ) : state === "wrong_email" ? (
          <p className="mt-6 text-sm text-muted-foreground">{m.team.wrongEmail}</p>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">{m.team.acceptFailed}</p>
        )}
      </div>
    </main>
  );
}
