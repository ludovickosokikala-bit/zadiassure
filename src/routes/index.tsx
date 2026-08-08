import { createFileRoute } from "@tanstack/react-router";
import {
  Hero,
  Positioning,
  ProblemSolution,
  AudienceCards,
  ServiceCards,
  ProcessSteps,
  WhyGrid,
  PromiseBand,
  Testimonials,
  FounderBlock,
  CtaBand,
} from "@/components/site/sections";
import { PartnersBlock } from "@/components/site/PartnersBlock";
import { InsightsPreview } from "@/components/site/InsightsPreview";
import { FaqList } from "@/components/site/FaqList";
import { dictionaries } from "@/i18n";

const meta = dictionaries.nl.meta.home;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { name: "keywords", content: "administratieve begeleiding België, administratieve hulp België, budgetbegeleiding, immigration support Belgium, administratieve ondersteuning zelfstandigen" },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "ZADIASSURE",
          description: meta.description,
          areaServed: "BE",
          availableLanguage: ["nl", "fr", "en"],
          telephone: "+32 471 98 67 64",
          email: "info@zadiassure.be",
          slogan: "Simplifier aujourd'hui. Sécuriser demain.",
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <Positioning />
      <ProblemSolution />
      <AudienceCards />
      <ServiceCards />
      <ProcessSteps />
      <WhyGrid />
      <FounderBlock />
      <PromiseBand />
      <Testimonials />
      <PartnersBlock compact />
      <InsightsPreview />
      <FaqList limit={6} />
      <CtaBand />
    </>
  );
}
