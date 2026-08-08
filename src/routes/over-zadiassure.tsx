import { createFileRoute } from "@tanstack/react-router";
import founderPhoto from "@/assets/founder.png.asset.json";
import { Section, SectionHeader } from "@/components/site/Section";
import { CtaBand, PromiseBand } from "@/components/site/sections";
import { dictionaries, useT } from "@/i18n";

const meta = dictionaries.nl.meta.about;

export const Route = createFileRoute("/over-zadiassure")({
  head: () => ({
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/over-zadiassure" },
    ],
    links: [{ rel: "canonical", href: "/over-zadiassure" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const t = useT();
  return (
    <>
      <Section tone="sand">
        <SectionHeader eyebrow={t.about.eyebrow} title={t.about.title} as="h1" />
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <h2 className="font-display text-2xl font-bold text-primary">{t.about.storyTitle}</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
              {t.about.story.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <figure className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <img
              src={founderPhoto.url}
              alt={`${t.about.founderName} — ${t.about.founderRole} bij ZADIASSURE`}
              width={640}
              height={640}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="p-7">
              <blockquote className="font-display text-lg font-semibold leading-snug text-primary">
                “{t.about.founderQuote}”
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="block font-semibold text-primary">{t.about.founderName}</span>
                <span className="text-muted-foreground">{t.about.founderRole} — ZADIASSURE</span>
              </figcaption>
            </div>
          </figure>
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
            <h2 className="font-display text-xl font-bold text-primary">{t.about.missionTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.about.missionText}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
            <h2 className="font-display text-xl font-bold text-primary">{t.about.visionTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.about.visionText}</p>
          </div>
        </div>

        <h2 className="mt-14 font-display text-2xl font-bold text-primary">{t.about.valuesTitle}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.about.values.map((v) => (
            <div key={v.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h3 className="font-display text-lg font-bold text-primary">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader title={t.about.roadmapTitle} text={t.about.roadmapText} />
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.about.roadmap.map((r) => (
            <li key={r.year} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <span className="font-display text-sm font-bold tracking-widest text-accent">{r.year}</span>
              <h3 className="mt-2 font-display text-lg font-bold text-primary">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <PromiseBand />
      <CtaBand />
    </>
  );
}
