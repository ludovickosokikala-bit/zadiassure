import { createFileRoute } from "@tanstack/react-router";
import pageImage from "@/assets/page-services.jpg";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { ServiceCards, ProcessSteps, CtaBand, WhyGrid } from "@/components/site/sections";
import { Cta } from "@/components/ui/cta";
import { dictionaries, useLanguage, useT } from "@/i18n";
import { budgetCoachingDictionaries } from "@/i18n/budgetCoaching";

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
  const { locale } = useLanguage();
  const budget = budgetCoachingDictionaries[locale];
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
      <Section tone="sand" className="py-12 sm:py-14 lg:py-16">
        <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">{budget.hero.eyebrow}</p>
            <h2 className="mt-3 font-display text-xl font-bold text-primary sm:text-2xl">
              {budget.hero.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{budget.intro.paragraphs[0]}</p>
          </div>
          <Cta to="/accompagnement-budgetaire-suivi-dettes" variant="accent" size="lg" className="shrink-0">
            {budget.hero.primaryCta}
          </Cta>
        </div>
      </Section>
      <ProcessSteps />
      <WhyGrid />
      <CtaBand />
    </>
  );
}

