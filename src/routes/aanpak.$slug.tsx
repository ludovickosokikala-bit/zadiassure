import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import imgComplexity from "@/assets/people-worry.jpg";
import imgSolution from "@/assets/page-services.jpg";
import imgAutonomy from "@/assets/page-audiences.jpg";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeader } from "@/components/site/Section";
import { CtaBand } from "@/components/site/sections";
import { ctaVariants } from "@/components/ui/cta";
import { useLanguage } from "@/i18n";
import { approachDictionaries, approachSlugs, type ApproachSlug } from "@/i18n/approach";

const images: Record<ApproachSlug, string> = {
  complexiteit: imgComplexity,
  oplossing: imgSolution,
  autonomie: imgAutonomy,
};

function isSlug(value: string): value is ApproachSlug {
  return (approachSlugs as string[]).includes(value);
}

export const Route = createFileRoute("/aanpak/$slug")({
  loader: ({ params }) => {
    if (!isSlug(params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ params }) => {
    const slug = isSlug(params.slug) ? params.slug : "complexiteit";
    const step = approachDictionaries.nl.steps[slug];
    const url = `/aanpak/${slug}`;
    return {
      meta: [
        { title: step.metaTitle },
        { name: "description", content: step.metaDescription },
        { property: "og:title", content: step.metaTitle },
        { property: "og:description", content: step.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ApproachPage,
});

function ApproachPage() {
  const { slug } = Route.useLoaderData();
  const dict = approachDictionaries[useLanguage().locale];
  const step = dict.steps[slug];
  const index = approachSlugs.indexOf(slug);
  const next = approachSlugs[(index + 1) % approachSlugs.length] ?? approachSlugs[0]!;
  const nextStep = dict.steps[next];

  return (
    <>
      <PageHero
        eyebrow={step.eyebrow}
        title={step.title}
        text={step.intro}
        image={images[slug]}
        imageAlt={step.imageAlt}
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {approachSlugs.map((s, i) => (
            <Link
              key={s}
              to="/aanpak/$slug"
              params={{ slug: s }}
              className={
                "flex items-center gap-2 rounded-full border px-4 py-2 font-display text-sm font-semibold transition " +
                (s === slug
                  ? "border-transparent bg-navy text-navy-foreground"
                  : "border-border bg-card text-primary hover:border-accent hover:text-accent")
              }
            >
              <span className="text-xs opacity-70">{i + 1}</span>
              {dict.steps[s].label}
            </Link>
          ))}
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="grid gap-4 sm:grid-cols-2">
            {step.blocks.map((block) => (
              <div key={block.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h3 className="font-display text-base font-bold text-primary">{block.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{block.text}</p>
              </div>
            ))}
          </div>
          <div>
            <SectionHeader title={step.listTitle} />
            <ul className="mt-6 space-y-3">
              {step.list.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                    <Check className="size-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/aanpak/$slug"
                params={{ slug: next }}
                className={ctaVariants({ variant: "primary" })}
              >
                <span>
                  {dict.nextLabel}: {nextStep.label}
                </span>
                <ArrowRight className="size-4 shrink-0" />
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent">
                <ArrowLeft className="size-4" />
                {dict.back}
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
