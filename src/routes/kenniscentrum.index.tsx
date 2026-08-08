import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/site/Section";
import { CtaBand } from "@/components/site/sections";
import { dictionaries, useT } from "@/i18n";

const meta = dictionaries.nl.meta.insights;

export const Route = createFileRoute("/kenniscentrum/")({
  head: () => ({
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/kenniscentrum" },
    ],
    links: [{ rel: "canonical", href: "/kenniscentrum" }],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const t = useT();
  return (
    <>
      <Section tone="sand">
        <SectionHeader
          eyebrow={t.insightsSection.eyebrow}
          title={t.insightsSection.title}
          text={t.insightsSection.text}
          as="h1"
        />
        <ul className="mt-8 flex flex-wrap gap-2.5">
          {t.insightsSection.categories.map((c) => (
            <li
              key={c}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground"
            >
              {c}
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {t.insightsSection.articles.map((a) => (
            <article
              key={a.slug}
              className="group flex flex-col rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="eyebrow text-accent">{a.category}</span>
              <h2 className="mt-3 font-display text-xl font-bold leading-snug text-primary">{a.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{a.excerpt}</p>
              <Link
                to="/kenniscentrum/$slug"
                params={{ slug: a.slug }}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent"
              >
                {t.cta.readMore}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
