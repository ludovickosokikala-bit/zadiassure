import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/components/site/Section";
import { CtaBand } from "@/components/site/sections";
import { routes } from "@/config/site";
import { dictionaries, useT } from "@/i18n";

export const Route = createFileRoute("/kenniscentrum/$slug")({
  loader: ({ params }) => {
    const article = dictionaries.nl.insightsSection.articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { slug: article.slug, title: article.title, excerpt: article.excerpt };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "ZADIASSURE" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} | ZADIASSURE`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/kenniscentrum/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/kenniscentrum/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.title,
            description: loaderData.excerpt,
            author: { "@type": "Organization", name: "ZADIASSURE" },
            publisher: { "@type": "Organization", name: "ZADIASSURE" },
          }),
        },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useLoaderData();
  const t = useT();
  const article = t.insightsSection.articles.find((a) => a.slug === slug)!;
  const related = t.insightsSection.articles.filter((a) => a.slug !== slug).slice(0, 2);

  return (
    <>
      <Section tone="sand">
        <div className="max-w-3xl">
          <Link
            to={routes.insights}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" /> {t.cta.backTo}
          </Link>
          <p className="eyebrow mt-8 text-accent">{article.category}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-primary sm:text-4xl">{article.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>
        </div>
      </Section>

      <Section>
        <div className="max-w-3xl space-y-5 text-base leading-relaxed text-muted-foreground">
          {article.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {related.map((a) => (
            <Link
              key={a.slug}
              to="/kenniscentrum/$slug"
              params={{ slug: a.slug }}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft transition-colors hover:border-primary/40"
            >
              <span className="eyebrow text-accent">{a.category}</span>
              <p className="mt-2 font-display text-lg font-bold text-primary">{a.title}</p>
            </Link>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
