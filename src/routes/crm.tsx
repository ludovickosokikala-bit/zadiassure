import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { CrmShell } from "@/components/crm/CrmShell";

export const Route = createFileRoute("/crm")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Dossierbeheer — ZADIASSURE" },
      {
        name: "description",
        content: "Beveiligd dossierbeheer van ZADIASSURE: klanten, dossiers, taken en documenten.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Dossierbeheer — ZADIASSURE" },
      {
        property: "og:description",
        content: "Beveiligd dossierbeheer van ZADIASSURE: klanten, dossiers, taken en documenten.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <CrmShell>
      <Outlet />
    </CrmShell>
  ),
});
