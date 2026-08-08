import { ArrowRight, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/site/Section";
import { Cta } from "@/components/ui/cta";
import { audienceIcons, serviceIcons } from "@/components/site/icons";
import { routes } from "@/config/site";
import { useT } from "@/i18n";
import heroPeople from "@/assets/people-hero.jpg";
import worryPeople from "@/assets/people-worry.jpg";
import person1 from "@/assets/person-1.jpg";
import person2 from "@/assets/person-2.jpg";
import person3 from "@/assets/person-3.jpg";

const portraits = [person1, person2, person3];


/* ---------------------------------- Hero ---------------------------------- */

export function Hero() {
  const t = useT();
  return (
    <section className="hero-mesh relative overflow-hidden">
      <div className="container-page relative py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="rise eyebrow inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-[0.7rem] text-primary">
              {t.hero.badge}
            </p>
            <h1 className="rise mt-7 text-4xl font-bold leading-[1.05] text-primary sm:text-5xl lg:text-6xl">
              {t.hero.title}{" "}
              <span className="block text-accent">
                {t.hero.titleAccent}
              </span>
            </h1>
            <p className="rise mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.hero.subtitle}
            </p>
            <div className="rise mt-9 flex flex-wrap gap-3">
              <Cta to={routes.contact} size="lg">
                {t.cta.primary}
              </Cta>
              <Cta to={routes.services} size="lg" variant="outline">
                {t.cta.secondary}
              </Cta>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Cta to={routes.audiences} size="sm" variant="ghost" withArrow={false}>
                {t.hero.segIndividual}
              </Cta>
              <Cta to={routes.audiences} size="sm" variant="ghost" withArrow={false}>
                {t.hero.segBusiness}
              </Cta>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroPeople}
              width={1280}
              height={960}
              alt="Adviseur van ZADIASSURE bespreekt administratieve documenten met een klant"
              className="aspect-[4/3] w-full rounded-[2rem] border border-border object-cover shadow-lift"
            />
            <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-soft backdrop-blur">
              <div className="flex -space-x-2">
                {portraits.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    width={816}
                    height={816}
                    loading="lazy"
                    alt=""
                    className="size-8 rounded-full border-2 border-card object-cover"
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-primary">NL · FR · EN</span>
            </div>
          </div>
        </div>

        <dl className="mt-20 grid gap-4 sm:grid-cols-3">
          {t.hero.stats.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card/80 p-5 shadow-soft backdrop-blur">
              <dt className="font-display text-lg font-bold text-primary">{s.title}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{s.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>

  );
}

/* ------------------------------ Positioning ------------------------------- */

export function Positioning() {
  const t = useT();
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <SectionHeader eyebrow={t.positioning.eyebrow} title={t.positioning.title} text={t.positioning.text} />
        <div className="flex flex-col gap-3">
          {t.positioning.chain.map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
              style={{ marginInlineStart: `${i * 1.5}rem` }}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary font-display text-sm font-bold text-primary">
                {i + 1}
              </span>
              <span className="font-display text-lg font-semibold text-primary">{step}</span>
              {i < t.positioning.chain.length - 1 && (
                <ArrowRight className="ml-auto size-4 shrink-0 text-accent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* --------------------------- Problem → solution --------------------------- */

export function ProblemSolution() {
  const t = useT();
  return (
    <Section tone="navy">
      <SectionHeader
        eyebrow={t.problem.eyebrow}
        title={t.problem.title}
        text={t.problem.text}
        invert
      />
      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <img
          src={worryPeople}
          width={1280}
          height={960}
          loading="lazy"
          alt="Persoon met een stapel onbeantwoorde brieven en rekeningen aan de keukentafel"
          className="aspect-[4/3] w-full rounded-[2rem] border border-navy-foreground/15 object-cover shadow-lift"
        />
        <ul className="flex flex-wrap gap-2.5">
          {t.problem.items.map((item) => (
            <li
              key={item}
              className="rounded-full border border-navy-foreground/15 bg-navy-foreground/5 px-4 py-2 text-sm text-navy-foreground/75"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>


      <div className="mt-14 rounded-3xl border border-navy-foreground/15 bg-navy-foreground/[0.04] p-6 sm:p-10">
        <h3 className="font-display text-2xl font-bold text-navy-foreground sm:text-3xl">
          {t.problem.answerTitle}
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-foreground/70 sm:text-base">
          {t.problem.answerText}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {t.problem.answers.map((a) => (
            <div key={a.title} className="rounded-2xl bg-navy-foreground/[0.07] p-5">
              <Check className="size-5 text-accent" />
              <p className="mt-3 font-display font-semibold text-navy-foreground">{a.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-foreground/65">{a.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-navy-foreground/55">
          {t.problem.flow.map((step, i) => (
            <span key={step} className="flex items-center gap-3">
              <span className={i === t.problem.flow.length - 1 ? "text-accent" : undefined}>{step}</span>
              {i < t.problem.flow.length - 1 && <ArrowRight className="size-3.5" />}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------- Audiences -------------------------------- */

export function AudienceCards({ withHeader = true }: { withHeader?: boolean }) {
  const t = useT();
  return (
    <Section tone="muted" id="voor-wie">
      {withHeader && (
        <SectionHeader
          eyebrow={t.audiencesSection.eyebrow}
          title={t.audiencesSection.title}
          text={t.audiencesSection.text}
        />
      )}
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {t.audiencesSection.items.map((a) => {
          const Icon = audienceIcons[a.slug]!;
          return (
            <article
              key={a.slug}
              className="group flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-primary">{a.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.tagline}</p>
              <Link
                to={routes.audiences}
                hash={a.slug}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-accent"
              >
                {t.cta.discover}
                <ArrowRight className="size-4" />
              </Link>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

/* -------------------------------- Services -------------------------------- */

export function ServiceCards({ withHeader = true }: { withHeader?: boolean }) {
  const t = useT();
  return (
    <Section>
      {withHeader && (
        <SectionHeader
          eyebrow={t.servicesSection.eyebrow}
          title={t.servicesSection.title}
          text={t.servicesSection.text}
        />
      )}
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {t.servicesSection.items.map((s) => {
          const Icon = serviceIcons[s.slug]!;
          return (
            <article
              key={s.slug}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-accent/20 to-sky/20 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-bold text-primary">{s.name}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{s.short}</p>
              <Link
                to="/begeleiding/$slug"
                params={{ slug: s.slug }}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-accent"
              >
                {t.cta.readMore}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </article>
          );
        })}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">{t.servicesSection.note}</p>
    </Section>
  );
}

/* -------------------------------- Process --------------------------------- */

export function ProcessSteps() {
  const t = useT();
  return (
    <Section tone="sand">
      <SectionHeader eyebrow={t.process.eyebrow} title={t.process.title} text={t.process.text} />
      <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {t.process.steps.map((step, i) => (
          <li key={step.title} className="relative rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className="font-display text-sm font-bold tracking-widest text-accent">
              0{i + 1}
            </span>
            <h3 className="mt-3 font-display text-lg font-bold text-primary">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            {i < t.process.steps.length - 1 && (
              <ArrowRight className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-accent lg:block" />
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ---------------------------------- Why ----------------------------------- */

export function WhyGrid() {
  const t = useT();
  return (
    <Section>
      <SectionHeader eyebrow={t.why.eyebrow} title={t.why.title} text={t.why.text} />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {t.why.items.map((item) => (
          <div key={item.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-lg font-bold text-primary">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ Client promise ---------------------------- */

export function PromiseBand() {
  const t = useT();
  return (
    <Section tone="navy">
      <div className="mx-auto max-w-4xl text-center">
        <p className="eyebrow text-navy-foreground/60">{t.promiseSection.eyebrow}</p>
        <blockquote className="mt-6 font-display text-2xl font-bold leading-tight text-navy-foreground sm:text-4xl lg:text-[2.75rem]">
          “{t.promiseSection.quote}”
        </blockquote>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-navy-foreground/70 sm:text-base">
          {t.promiseSection.text}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {t.promiseSection.words.map((w) => (
            <span
              key={w}
              className="rounded-full border border-accent/40 px-5 py-2 font-display text-sm font-semibold text-accent"
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ Testimonials ------------------------------ */

export function Testimonials() {
  const t = useT();
  return (
    <Section tone="muted">
      <SectionHeader
        eyebrow={t.testimonials.eyebrow}
        title={t.testimonials.title}
        text={t.testimonials.text}
        align="center"
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex min-h-48 flex-col justify-between rounded-3xl border border-dashed border-border bg-card/60 p-6"
          >
            <p className="text-sm leading-relaxed text-muted-foreground">{t.testimonials.placeholder}</p>
            <div className="mt-6 flex items-center gap-3">
              <span className="size-10 shrink-0 rounded-full bg-secondary" />
              <span className="h-3 w-24 rounded-full bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------------- CTA band -------------------------------- */

export function CtaBand() {
  const t = useT();
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="container-page">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-primary to-navy-soft px-6 py-12 text-center shadow-lift sm:px-12 sm:py-16">
          <h2 className="mx-auto max-w-2xl font-display text-2xl font-bold text-navy-foreground sm:text-4xl">
            {t.ctaSection.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-navy-foreground/75 sm:text-base">
            {t.ctaSection.text}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Cta to={routes.contact} size="lg" variant="accent">
              {t.cta.primary}
            </Cta>
            <Cta to={routes.contact} size="lg" variant="onNavy" withArrow={false}>
              {t.cta.contact}
            </Cta>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-navy-foreground/60">
            {t.ctaSection.reassurance.map((r) => (
              <li key={r} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-accent" /> {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
