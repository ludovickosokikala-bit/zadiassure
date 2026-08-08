import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CalendarDays, FileText } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CtaBand } from "@/components/site/sections";
import { listLegislation } from "@/lib/library.functions";
import type { LegislationRow } from "@/lib/library.types";
import { libraryDictionaries, THEME_KEYS, type ThemeKey } from "@/i18n/library";
import { useLanguage } from "@/i18n";
import { pick, useLib } from "@/i18n/useLibrary";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/page-insights.jpg";

const meta = libraryDictionaries.nl.legislation;

export const Route = createFileRoute("/wetgeving/")({
  loader: () => listLegislation(),
  head: () => ({
    meta: [
      { title: meta.metaTitle },
      { name: "description", content: meta.metaDescription },
      { property: "og:title", content: meta.metaTitle },
      { property: "og:description", content: meta.metaDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/wetgeving" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/wetgeving" }],
  }),
  errorComponent: () => (
    <Section>
      <p className="text-muted-foreground">{meta.unavailable}</p>
    </Section>
  ),
  component: LegislationPage,
});

function LegislationPage() {
  const { items, error } = Route.useLoaderData() as {
    items: LegislationRow[];
    error: string | null;
  };

  const { locale } = useLanguage();
  const lib = useLib();
  const [theme, setTheme] = useState<ThemeKey | "all">("all");

  const filtered = theme === "all" ? items : items.filter((i) => i.theme === theme);

  return (
    <>
      <PageHero
        eyebrow={lib.legislation.eyebrow}
        title={lib.legislation.title}
        text={lib.legislation.intro}
        image={heroImage}
        imageAlt={lib.legislation.eyebrow}
      />

      <Section>
        <div className="flex flex-wrap gap-2.5">
          <FilterChip active={theme === "all"} onClick={() => setTheme("all")}>
            {lib.legislation.filterAll}
          </FilterChip>
          {THEME_KEYS.map((key) => (
            <FilterChip key={key} active={theme === key} onClick={() => setTheme(key)}>
              {lib.themes[key]}
            </FilterChip>
          ))}
        </div>

        {error && <p className="mt-8 text-muted-foreground">{lib.legislation.unavailable}</p>}
        {!error && filtered.length === 0 && (
          <p className="mt-8 text-muted-foreground">{lib.legislation.empty}</p>
        )}

        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-soft transition-shadow hover:shadow-lift"
            >
              <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                {lib.themes[item.theme as ThemeKey]}
              </span>
              <h2 className="mt-4 text-xl font-bold leading-snug text-primary">
                {pick(item, "title", locale)}
              </h2>
              {item.effective_date && (
                <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden />
                  {lib.legislation.effective} {formatDate(item.effective_date, locale)}
                </p>
              )}
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {pick(item, "summary", locale)}
              </p>
              <Link
                to="/wetgeving/$slug"
                params={{ slug: item.slug }}
                className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                {lib.legislation.read}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          {lib.legislation.disclaimer}
        </p>

        <Link
          to="/documenten"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-primary"
        >
          <FileText className="size-4" aria-hidden />
          {lib.legislation.relatedForms}
        </Link>
      </Section>

      <CtaBand />
    </>
  );
}

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}

export function formatDate(value: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === "nl" ? "nl-BE" : locale === "fr" ? "fr-BE" : "en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
