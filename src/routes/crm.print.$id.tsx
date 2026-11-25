import { createFileRoute, Link } from "@tanstack/react-router";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintOverview, debtQuery } from "@/components/crm-foundation/Debts";
import { foundationQuery, crmHead } from "@/components/crm-foundation/data";
import { useFoundation } from "@/components/crm-foundation/context";
import { FoundationError, FoundationNotFound } from "@/components/crm-foundation/ui";
export const Route = createFileRoute("/crm/print/$id")({
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(foundationQuery()), context.queryClient.ensureQueryData(debtQuery())]),
  head: () => crmHead("Overzicht"),
  errorComponent: FoundationError,
  notFoundComponent: FoundationNotFound,
  component: Page,
});
function Page() {
  const { id } = Route.useParams();
  const { data, c } = useFoundation();
  const client = data.clients.find((k) => k.id === id);
  if (!client) return <FoundationNotFound />;
  return (
    <>
      <div className="crm-no-print mb-6 flex flex-wrap gap-2">
        <Button asChild variant="ghost">
          <Link to="/crm/clients/$id" params={{ id }}>
            <ArrowLeft />
            {c.clients}
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer />
          {c.debtUi.print}
        </Button>
      </div>
      <PrintOverview clientId={id} lang={client.preferred_language === "fr" ? "fr" : "nl"} />
    </>
  );
}
