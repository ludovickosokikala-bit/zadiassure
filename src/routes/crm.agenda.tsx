import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AgendaPage, type AgendaSearch } from "@/components/crm-foundation/Agenda";
import { foundationQuery, crmHead } from "@/components/crm-foundation/data";
import { appointmentsQuery } from "@/components/crm-foundation/agendaData";
import { FoundationError, FoundationNotFound } from "@/components/crm-foundation/ui";
export const Route = createFileRoute("/crm/agenda")({
  validateSearch: (s: Record<string, unknown>): AgendaSearch => ({
    ...(typeof s["view"] === "string" ? { view: s["view"] } : {}),
    ...(typeof s["date"] === "string" ? { date: s["date"] } : {}),
    ...(typeof s["scope"] === "string" ? { scope: s["scope"] } : {}),
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(foundationQuery()),
      context.queryClient.ensureQueryData(appointmentsQuery()),
    ]),
  head: () => crmHead("Agenda"),
  errorComponent: FoundationError,
  notFoundComponent: FoundationNotFound,
  component: Page,
});
function Page() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  return (
    <AgendaPage
      search={search}
      onSearch={(v) =>
        void navigate({ to: "/crm/agenda", search: (prev) => ({ ...prev, ...v }), replace: true })
      }
    />
  );
}
