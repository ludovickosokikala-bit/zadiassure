import { BASE_URL } from "@/config/site";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { dictionaries } from "@/i18n";

const title = `${dictionaries.nl.legal.cookiesTitle} — ZADIASSURE`;
const description = "Welke cookies en voorkeuren deze website gebruikt.";

export const Route = createFileRoute("/cookiebeleid")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${BASE_URL}/cookiebeleid` },
    ],
    links: [{ rel: "canonical", href: `${BASE_URL}/cookiebeleid` }],
  }),
  component: () => <LegalPage title="cookies" />,
});
