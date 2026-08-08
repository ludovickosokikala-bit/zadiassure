import { createFileRoute } from "@tanstack/react-router";
import pageImage from "@/assets/page-insights.jpg";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeader } from "@/components/site/Section";
import { FaqList } from "@/components/site/FaqList";
import { CtaBand } from "@/components/site/sections";
import { dictionaries, useT } from "@/i18n";

const meta = dictionaries.nl.meta.faq;

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: dictionaries.nl.faqSection.items.map((item) => ({
            "@type": "Question",
            name: item.title,
            acceptedAnswer: { "@type": "Answer", text: item.text },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const t = useT();
  return (
    <>
      <PageHero
        eyebrow={t.faqSection.eyebrow}
        title={t.faqSection.title}
        text={t.faqSection.text}
        image={pageImage}
        imageAlt="Vrouw leest een officiële brief aan haar bureau"
      />
      <FaqList withHeader={false} />
      <CtaBand />
    </>
  );
}
