import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StaffAuthFrame, staffAuthText, useStaffLang } from "@/components/crm-foundation/StaffAuth";
import { acceptInvite, getInvite } from "@/lib/team.functions";

export const Route = createFileRoute("/uitnodiging")({
  ssr: false,
  validateSearch: z.object({ token: z.string().catch("") }),
  beforeLoad: async ({ search }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      // Keep the token so the visitor can return after signing in.
      if (typeof window !== "undefined" && search.token) {
        window.sessionStorage.setItem("zadiassure.invite", search.token);
      }
      throw redirect({ to: "/auth" });
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
  const [lang, setLang] = useStaffLang();
  const t = staffAuthText[lang];
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
    <StaffAuthFrame lang={lang} onLang={setLang}>
      <div className="text-center">
        {invite.isLoading && state === "loading" ? (
          <p className="mt-6 text-sm text-muted-foreground">{t.loading}</p>
        ) : done ? (
          <>
            <CheckCircle2 className="mx-auto mt-6 h-9 w-9 text-[color:var(--crm-success)]" />
            <p className="mt-3 text-sm">{t.inviteAccepted}</p>
          </>
        ) : state === "ready" ? (
          <>
            <ShieldCheck className="mx-auto mt-6 h-9 w-9 text-[#f97316]" />
            <h1 className="mt-4 text-xl font-semibold tracking-tight">{t.inviteTitle}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t.inviteText}</p>
            <p className="mt-3 text-sm font-medium">
              {invite.data?.organization} · {invite.data?.invite?.role}
            </p>
            <Button className="mt-6 w-full" size="lg" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {t.inviteAccept}
            </Button>
          </>
        ) : state === "wrong_email" ? (
          <p className="mt-6 text-sm text-muted-foreground">{t.inviteWrongEmail}</p>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">{t.inviteFailed}</p>
        )}
      </div>
    </StaffAuthFrame>
  );
}
