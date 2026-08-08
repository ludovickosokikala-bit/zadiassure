import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { Section, SectionHeader } from "@/components/site/Section";
import { CtaBand, ProcessSteps } from "@/components/site/sections";
import { serviceIcons } from "@/components/site/icons";
import { Cta } from "@/components/ui/cta";
import { routes } from "@/config/site";
import { dictionaries, useT } from "@/i18n";

export const Route = createFileRoute("/begeleiding/$slug")({
  loader: ({ params }) => {
    const service = dictionaries.nl.servicesSection.items.find((s) => s.slug === params.slug);
    if (!service) throw notFound();
    return { slug: service.slug, seoTitle: service.seoTitle, seoDescription: service.seoDescription };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "ZADIASSURE" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: loaderData.seoTitle },
        { name: "description", content: loaderData.seoDescription },
        { property: "og:title", content: loaderData.seoTitle },
        { property: "og:description", content: loaderData.seoDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/begeleiding/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/begeleiding/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: loaderData.seoTitle,
            description: loaderData.seoDescription,
            provider: { "@type": "ProfessionalService", name: "ZADIASSURE" },
            areaServed: "BE",
          }),
        },
      ],
    };
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useLoaderData();
  const t = useT();
  const service = t.servicesSection.items.find((s) => s.slug === slug)!;
  const Icon = serviceIcons[slug]!;
  const others = t.servicesSection.items.filter((s) => s.slug !== slug);

  return (
    <>
      <Section tone="sand">
        <Link
          to={routes.services}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> {t.cta.backTo}
        </Link>
        <span className="mt-8 grid size-14 place-items-center rounded-2xl bg-card text-primary shadow-soft">
          <Icon className="size-6" />
        </span>
        <SectionHeader eyebrow={t.servicesSection.eyebrow} title={service.name} text={service.intro} as="h1" />
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <h2 className="font-display text-xl font-bold text-primary">{t.audiencesSection.needsLabel}</h2>
            <ul className="mt-6 space-y-3.5">
              {service.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Cta to={routes.contact}>{t.cta.discuss}</Cta>
            </div>
          </div>

          <div>
            <h2 className="eyebrow">{t.servicesSection.eyebrow}</h2>
            <div className="mt-5 flex flex-col gap-3">
              {others.map((s) => (
                <Link
                  key={s.slug}
                  to="/begeleiding/$slug"
                  params={{ slug: s.slug }}
                  className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <p className="font-display font-semibold text-primary">{s.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.short}</p>
                </Link>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">{t.servicesSection.note}</p>
          </div>
        </div>
      </Section>

      <ProcessSteps />
      <CtaBand />
    </>
  );
}
