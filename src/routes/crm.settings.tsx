import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/crm-foundation/Settings";
import { foundationQuery, crmHead } from "@/components/crm-foundation/data";
import { FoundationError, FoundationNotFound } from "@/components/crm-foundation/ui";
export const Route = createFileRoute("/crm/settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(foundationQuery()),
  head: () => crmHead("Instellingen"),
  errorComponent: FoundationError,
  notFoundComponent: FoundationNotFound,
  component: Page,
});
function Page() {
  return <SettingsPage />;
}
