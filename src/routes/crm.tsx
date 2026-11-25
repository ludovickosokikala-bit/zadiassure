import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { FoundationShell } from "@/components/crm-foundation/Shell";
import { foundationQuery } from "@/components/crm-foundation/data";
import { FoundationError, FoundationNotFound } from "@/components/crm-foundation/ui";

export const Route = createFileRoute("/crm")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(foundationQuery()),
  errorComponent: FoundationError,
  notFoundComponent: FoundationNotFound,
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
      { name: "theme-color", content: "#0b1b33" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "ZADIASSURE CRM" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [{ rel: "manifest", href: "/crm.webmanifest" }],
  }),
  component: () => (
    <FoundationShell>
      <Outlet />
    </FoundationShell>
  ),
});
