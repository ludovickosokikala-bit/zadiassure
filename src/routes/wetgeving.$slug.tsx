import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, ExternalLink, FileText } from "lucide-react";
import { Section } from "@/components/site/Section";
import { CtaBand } from "@/components/site/sections";
import { getLegislation } from "@/lib/library.functions";
import type { LegislationRow } from "@/lib/library.types";
import { libraryDictionaries, type ThemeKey } from "@/i18n/library";
import { useLanguage } from "@/i18n";
import { pick, useLib } from "@/i18n/useLibrary";
import { formatDate } from "./wetgeving.index";

const meta = libraryDictionaries.nl.legislation;

export const Route = createFileRoute("/wetgeving/$slug")({
  loader: async ({ params }) => {
    const { item } = await getLegislation({ data: { slug: params.slug } });
    if (!item) throw notFound();
    return { item: item as LegislationRow };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: meta.metaTitle }, { name: "robots", content: "noindex" }] };
    }
    const title = `${String(loaderData.item["title_nl"])} — ZADIASSURE`;
    const description = String(loaderData.item["summary_nl"]).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/wetgeving/${loaderData.item.slug}` }],
    };
  },
  notFoundComponent: () => (
    <Section>
      <p className="text-muted-foreground">{meta.empty}</p>
      <Link to="/wetgeving" className="mt-4 inline-block font-semibold text-primary">
        {meta.back}
      </Link>
    </Section>
  ),
  errorComponent: () => (
    <Section>
      <p className="text-muted-foreground">{meta.unavailable}</p>
    </Section>
  ),
  component: LegislationDetail,
});

function LegislationDetail() {
  const { item } = Route.useLoaderData();
  const { locale } = useLanguage();
  const lib = useLib();

  return (
    <>
      <Section tone="sand">
        <Link
          to="/wetgeving"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden /> {lib.legislation.back}
        </Link>
        <span className="mt-6 block w-fit rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary">
          {lib.themes[item.theme as ThemeKey]}
        </span>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] text-primary sm:text-4xl">
          {pick(item, "title", locale)}
        </h1>
        {item.effective_date && (
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden />
            {lib.legislation.effective} {formatDate(item.effective_date, locale)}
          </p>
        )}
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {pick(item, "summary", locale)}
        </p>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <Block title={lib.legislation.changes} text={pick(item, "changes", locale)} />
          <Block title={lib.legislation.action} text={pick(item, "action", locale)} accent />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {item.source_url && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-primary"
            >
              <ExternalLink className="size-4" aria-hidden />
              {lib.legislation.source}: {item.source_label ?? item.source_url}
            </a>
          )}
          <Link
            to="/documenten"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-primary"
          >
            <FileText className="size-4" aria-hidden />
            {lib.legislation.relatedForms}
          </Link>
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          {lib.legislation.disclaimer}
        </p>
      </Section>

      <CtaBand />
    </>
  );
}

function Block({ title, text, accent }: { title: string; text: string; accent?: boolean }) {
  if (!text) return null;
  return (
    <div
      className={
        accent
          ? "rounded-3xl border border-accent/30 bg-accent/10 p-7"
          : "rounded-3xl border border-border bg-card p-7 shadow-soft"
      }
    >
      <h2 className="text-lg font-bold text-primary">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
