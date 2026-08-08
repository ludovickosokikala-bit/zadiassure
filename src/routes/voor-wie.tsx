import { createFileRoute } from "@tanstack/react-router";
import pageImage from "@/assets/page-audiences.jpg";
import { PageHero } from "@/components/site/PageHero";
import { Check } from "lucide-react";
import { Section, SectionHeader } from "@/components/site/Section";
import { CtaBand } from "@/components/site/sections";
import { audienceIcons } from "@/components/site/icons";
import { Cta } from "@/components/ui/cta";
import { routes } from "@/config/site";
import { dictionaries, useT } from "@/i18n";

const meta = dictionaries.nl.meta.audiences;

export const Route = createFileRoute("/voor-wie")({
  head: () => ({
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/voor-wie" },
    ],
    links: [{ rel: "canonical", href: "/voor-wie" }],
  }),
  component: AudiencesPage,
});

function AudiencesPage() {
  const t = useT();
  return (
    <>
      <PageHero
        eyebrow={t.audiencesSection.eyebrow}
        title={t.audiencesSection.title}
        text={t.audiencesSection.text}
        image={pageImage}
        imageAlt="Divers publiek van ZADIASSURE in een licht kantoor"
      />

      {t.audiencesSection.items.map((a, index) => {
        const Icon = audienceIcons[a.slug]!;
        return (
          <Section key={a.slug} id={a.slug} tone={index % 2 === 1 ? "muted" : "default"}>
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div>
                <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-5 font-display text-2xl font-bold text-primary sm:text-3xl">{a.name}</h2>
                <p className="mt-2 font-display text-lg text-accent">{a.tagline}</p>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">{a.intro}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Cta to={routes.contact}>{t.cta.discuss}</Cta>
                  <Cta to={routes.services} variant="outline">
                    {t.cta.secondary}
                  </Cta>
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
                <h3 className="eyebrow">{t.audiencesSection.needsLabel}</h3>
                <ul className="mt-5 space-y-3">
                  {a.needs.map((need) => (
                    <li key={need} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span>{need}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>
        );
      })}

      <CtaBand />
    </>
  );
}
