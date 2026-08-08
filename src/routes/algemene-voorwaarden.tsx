import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { dictionaries } from "@/i18n";

const title = `${dictionaries.nl.legal.termsTitle} — ZADIASSURE`;
const description = "De algemene voorwaarden voor de begeleiding en dienstverlening van ZADIASSURE.";

export const Route = createFileRoute("/algemene-voorwaarden")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/algemene-voorwaarden" },
    ],
    links: [{ rel: "canonical", href: "/algemene-voorwaarden" }],
  }),
  component: () => <LegalPage title="terms" />,
});
