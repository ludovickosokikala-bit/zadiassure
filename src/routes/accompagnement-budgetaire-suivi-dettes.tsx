import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Check } from "lucide-react";
import pageImage from "@/assets/page-services.jpg";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeader } from "@/components/site/Section";
import { CtaBand } from "@/components/site/sections";
import { Cta } from "@/components/ui/cta";
import { routes } from "@/config/site";
import { useLanguage } from "@/i18n";
import { budgetCoachingDictionaries } from "@/i18n/budgetCoaching";

const path = "/accompagnement-budgetaire-suivi-dettes";
const meta = budgetCoachingDictionaries.fr.meta;

export const Route = createFileRoute("/accompagnement-budgetaire-suivi-dettes")({
  head: () => ({
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      {
        name: "keywords",
        content:
          "accompagnement budgétaire, suivi des dettes, budgetbegeleiding, administratieve opvolging schulden, ZADIASSURE",
      },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: path },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: meta.title },
      { name: "twitter:description", content: meta.description },
    ],
    links: [{ rel: "canonical", href: path }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Accompagnement budgétaire & suivi administratif des dettes",
          description: meta.description,
          serviceType: "Accompagnement budgétaire",
          areaServed: "BE",
          provider: { "@type": "ProfessionalService", name: "ZADIASSURE" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: budgetCoachingDictionaries.fr.faq.items.map((i) => ({
            "@type": "Question",
            name: i.title,
            acceptedAnswer: { "@type": "Answer", text: i.text },
          })),
        }),
      },
    ],
  }),
  component: BudgetCoachingPage,
});

function BudgetCoachingPage() {
  const { locale } = useLanguage();
  const c = budgetCoachingDictionaries[locale];

  return (
    <>
      <PageHero
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        text={c.hero.text}
        image={pageImage}
        imageAlt="Adviseur van ZADIASSURE overloopt een budgetoverzicht met een klant"
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Cta to={routes.contact} size="lg" variant="accent" className="ring-2 ring-accent/30">
            {c.hero.primaryCta}
          </Cta>
          <Cta to={routes.contact} size="lg" variant="outline">
            {c.hero.secondaryCta}
          </Cta>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <SectionHeader title={c.intro.title} />
            <div className="mt-6 space-y-4">
              {c.intro.paragraphs.map((p) => (
                <p key={p} className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <h3 className="font-display text-lg font-bold text-primary">{c.includes.title}</h3>
            <ul className="mt-5 space-y-3">
              {c.includes.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="navy">
        <div className="mx-auto max-w-3xl rounded-3xl border border-accent/40 bg-navy-foreground/[0.05] p-6 sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent">
            <AlertTriangle className="size-3.5" />
            {c.limits.label}
          </p>
          <h2 className="mt-5 font-display text-2xl font-bold text-navy-foreground sm:text-3xl">
            {c.limits.title}
          </h2>
          <div className="mt-5 space-y-4">
            {c.limits.paragraphs.map((p) => (
              <p key={p} className="text-sm leading-relaxed text-navy-foreground/75 sm:text-base">
                {p}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <SectionHeader eyebrow={c.journey.eyebrow} title={c.journey.title} />
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.journey.steps.map((step, i) => (
            <li key={step.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <span className="font-display text-sm font-bold tracking-widest text-accent">0{i + 1}</span>
              <h3 className="mt-3 font-display text-lg font-bold text-primary">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="muted">
        <SectionHeader eyebrow={c.faq.eyebrow} title={c.faq.title} align="center" />
        <div className="mx-auto mt-12 max-w-3xl space-y-4">
          {c.faq.items.map((item) => (
            <details
              key={item.title}
              className="group rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <summary className="cursor-pointer font-display font-semibold text-primary">
                {item.title}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {c.legalLinksTitle}:{" "}
          <Link to={routes.terms} className="font-semibold text-primary underline hover:text-accent">
            {routes.terms}
          </Link>{" "}
          ·{" "}
          <Link to={routes.privacy} className="font-semibold text-primary underline hover:text-accent">
            {routes.privacy}
          </Link>
        </p>
      </Section>

      <CtaBand />
    </>
  );
}
