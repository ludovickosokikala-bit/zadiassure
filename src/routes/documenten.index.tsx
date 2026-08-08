import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Building2, ScrollText } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CtaBand } from "@/components/site/sections";
import { listForms } from "@/lib/library.functions";
import type { FormRow } from "@/lib/library.types";
import { libraryDictionaries, THEME_KEYS, type ThemeKey } from "@/i18n/library";
import { useLanguage } from "@/i18n";
import { pick, useLib } from "@/i18n/useLibrary";
import { FilterChip } from "./wetgeving.index";
import heroImage from "@/assets/page-services.jpg";

const meta = libraryDictionaries.nl.forms;

export const Route = createFileRoute("/documenten/")({
  loader: () => listForms(),
  head: () => ({
    meta: [
      { title: meta.metaTitle },
      { name: "description", content: meta.metaDescription },
      { property: "og:title", content: meta.metaTitle },
      { property: "og:description", content: meta.metaDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/documenten" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/documenten" }],
  }),
  errorComponent: () => (
    <Section>
      <p className="text-muted-foreground">{meta.unavailable}</p>
    </Section>
  ),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { items, error } = Route.useLoaderData() as { items: FormRow[]; error: string | null };
  const { locale } = useLanguage();
  const lib = useLib();
  const [theme, setTheme] = useState<ThemeKey | "all">("all");

  const filtered = theme === "all" ? items : items.filter((i) => i.theme === theme);

  return (
    <>
      <PageHero
        eyebrow={lib.forms.eyebrow}
        title={lib.forms.title}
        text={lib.forms.intro}
        image={heroImage}
        imageAlt={lib.forms.eyebrow}
      />

      <Section>
        <div className="flex flex-wrap gap-2.5">
          <FilterChip active={theme === "all"} onClick={() => setTheme("all")}>
            {lib.forms.filterAll}
          </FilterChip>
          {THEME_KEYS.map((key) => (
            <FilterChip key={key} active={theme === key} onClick={() => setTheme(key)}>
              {lib.themes[key]}
            </FilterChip>
          ))}
        </div>

        {error && <p className="mt-8 text-muted-foreground">{lib.forms.unavailable}</p>}
        {!error && filtered.length === 0 && (
          <p className="mt-8 text-muted-foreground">{lib.forms.empty}</p>
        )}

        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-3xl border border-border bg-card p-7 shadow-soft transition-shadow hover:shadow-lift"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                  <ScrollText className="size-5" aria-hidden />
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                  {lib.themes[item.theme as ThemeKey]}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-bold leading-snug text-primary">
                {pick(item, "title", locale)}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {pick(item, "description", locale)}
              </p>
              {item.authority && (
                <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Building2 className="size-4" aria-hidden />
                  {lib.forms.authority}: {item.authority}
                </p>
              )}
              <Link
                to="/documenten/$slug"
                params={{ slug: item.slug }}
                className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                {lib.forms.open}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-3xl rounded-2xl border border-border bg-secondary/60 p-5 text-sm leading-relaxed text-muted-foreground">
          {lib.forms.officialNote}
        </p>
      </Section>

      <CtaBand />
    </>
  );
}
