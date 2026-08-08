import { createFileRoute } from "@tanstack/react-router";
import pageImage from "@/assets/page-partners.jpg";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeader } from "@/components/site/Section";
import { PartnersBlock } from "@/components/site/PartnersBlock";
import { CtaBand } from "@/components/site/sections";
import { dictionaries, useT } from "@/i18n";

const meta = dictionaries.nl.meta.partners;

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/partners" },
    ],
    links: [{ rel: "canonical", href: "/partners" }],
  }),
  component: PartnersPage,
});

function PartnersPage() {
  const t = useT();
  return (
    <>
      <PageHero
        eyebrow={t.partnersSection.eyebrow}
        title={t.partnersSection.title}
        text={t.partnersSection.text}
        image={pageImage}
        imageAlt="Partners van ZADIASSURE in overleg"
      />
      <PartnersBlock />
      <CtaBand />
    </>
  );
}
