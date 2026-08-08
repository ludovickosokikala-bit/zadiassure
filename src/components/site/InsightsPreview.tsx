import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@/components/site/Section";
import { routes } from "@/config/site";
import { useT } from "@/i18n";

export function InsightsPreview() {
  const t = useT();
  const articles = t.insightsSection.articles.slice(0, 3);

  return (
    <Section tone="sand">
      <SectionHeader
        eyebrow={t.insightsSection.eyebrow}
        title={t.insightsSection.title}
        text={t.insightsSection.text}
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {articles.map((a) => (
          <article
            key={a.slug}
            className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="eyebrow text-accent">{a.category}</span>
            <h3 className="mt-3 font-display text-lg font-bold leading-snug text-primary">{a.title}</h3>
            <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">{a.excerpt}</p>
            <Link
              to="/kenniscentrum/$slug"
              params={{ slug: a.slug }}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-accent"
            >
              {t.cta.readMore}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </article>
        ))}
      </div>
      <Link
        to={routes.insights}
        className="mt-9 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent"
      >
        {t.insightsSection.all}
        <ArrowRight className="size-4" />
      </Link>
    </Section>
  );
}
