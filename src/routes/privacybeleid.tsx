import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { dictionaries } from "@/i18n";

const title = `${dictionaries.nl.legal.privacyTitle} — ZADIASSURE`;
const description = "Hoe ZADIASSURE uw persoonsgegevens verwerkt en welke rechten u heeft (GDPR).";

export const Route = createFileRoute("/privacybeleid")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacybeleid" },
    ],
    links: [{ rel: "canonical", href: "/privacybeleid" }],
  }),
  component: () => <LegalPage title="privacy" />,
});
