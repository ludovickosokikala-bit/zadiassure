import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Building2, CheckCircle2, ExternalLink, Printer } from "lucide-react";
import { Section } from "@/components/site/Section";
import { RequestForm } from "@/components/site/RequestForm";
import { getForm } from "@/lib/library.functions";
import type { FormRow } from "@/lib/library.types";
import { libraryDictionaries, type ThemeKey } from "@/i18n/library";
import { useLanguage } from "@/i18n";
import { pick, useLib } from "@/i18n/useLibrary";

const meta = libraryDictionaries.nl.forms;

export const Route = createFileRoute("/documenten/$slug")({
  loader: async ({ params }) => {
    const { item } = await getForm({ data: { slug: params.slug } });
    if (!item) throw notFound();
    return { item: item as FormRow };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: meta.metaTitle }, { name: "robots", content: "noindex" }] };
    }
    const title = `${String(loaderData.item["title_nl"])} — ZADIASSURE`;
    const description = String(loaderData.item["description_nl"]).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/documenten/${loaderData.item.slug}` }],
    };
  },
  notFoundComponent: () => (
    <Section>
      <p className="text-muted-foreground">{meta.empty}</p>
      <Link to="/documenten" className="mt-4 inline-block font-semibold text-primary">
        {meta.back}
      </Link>
    </Section>
  ),
  errorComponent: () => (
    <Section>
      <p className="text-muted-foreground">{meta.unavailable}</p>
    </Section>
  ),
  component: DocumentDetail,
});

function DocumentDetail() {
  const { item } = Route.useLoaderData();
  const { locale } = useLanguage();
  const lib = useLib();
  const checklist: string[] = item.checklist?.[locale] ?? item.checklist?.["nl"] ?? [];

  return (
    <>
      <Section tone="sand">
        <Link
          to="/documenten"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden /> {lib.forms.back}
        </Link>
        <span className="mt-6 block w-fit rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary">
          {lib.themes[item.theme as ThemeKey]}
        </span>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] text-primary sm:text-4xl">
          {pick(item, "title", locale)}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {pick(item, "description", locale)}
        </p>
        {item.authority && (
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Building2 className="size-4" aria-hidden /> {lib.forms.authority}: {item.authority}
          </p>
        )}
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            {pick(item, "who", locale) && (
              <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
                <h2 className="text-lg font-bold text-primary">{lib.forms.who}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {pick(item, "who", locale)}
                </p>
              </div>
            )}

            <div id="checklist" className="mt-6 rounded-3xl border border-border bg-card p-7 shadow-soft">
              <h2 className="text-lg font-bold text-primary">{lib.forms.checklist}</h2>
              <ul className="mt-4 grid gap-3">
                {checklist.map((doc) => (
                  <li key={doc} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => window.print()}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-primary hover:bg-secondary"
              >
                <Printer className="size-4" aria-hidden /> {lib.forms.print}
              </button>
            </div>

            {item.official_url && (
              <a
                href={item.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-primary"
              >
                <ExternalLink className="size-4" aria-hidden />
                {lib.forms.officialLink}
                {item.official_label ? ` — ${item.official_label}` : ""}
              </a>
            )}

            <p className="mt-6 rounded-2xl border border-border bg-secondary/60 p-5 text-sm leading-relaxed text-muted-foreground">
              {lib.forms.officialNote}
            </p>
          </div>

          <RequestForm slug={item.slug} checklist={checklist} />
        </div>
      </Section>
    </>
  );
}
