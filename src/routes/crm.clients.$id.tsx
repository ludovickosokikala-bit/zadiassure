import { createFileRoute } from "@tanstack/react-router";
import { ClientDetailPage } from "@/components/crm-foundation/pages";
import { foundationQuery, crmHead } from "@/components/crm-foundation/data";
import { FoundationError, FoundationNotFound } from "@/components/crm-foundation/ui";
export const Route = createFileRoute("/crm/clients/$id")({
  loader: ({ context }) => context.queryClient.ensureQueryData(foundationQuery()),
  head: () => crmHead("Klant"),
  errorComponent: FoundationError,
  notFoundComponent: FoundationNotFound,
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  return <ClientDetailPage id={id} />;
}
