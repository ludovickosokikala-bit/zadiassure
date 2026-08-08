import { createFileRoute } from "@tanstack/react-router";
import pageImage from "@/assets/page-services.jpg";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeader } from "@/components/site/Section";
import { ServiceCards, ProcessSteps, CtaBand, WhyGrid } from "@/components/site/sections";
import { dictionaries, useT } from "@/i18n";

const meta = dictionaries.nl.meta.services;

export const Route = createFileRoute("/begeleiding/")({
  head: () => ({
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/begeleiding" },
    ],
    links: [{ rel: "canonical", href: "/begeleiding" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const t = useT();
  return (
    <>
      <PageHero
        eyebrow={t.servicesSection.eyebrow}
        title={t.servicesSection.title}
        text={t.servicesSection.text}
        image={pageImage}
        imageAlt="Adviseur van ZADIASSURE bespreekt documenten met een klant"
      />
      <ServiceCards withHeader={false} />
      <ProcessSteps />
      <WhyGrid />
      <CtaBand />
    </>
  );
}
