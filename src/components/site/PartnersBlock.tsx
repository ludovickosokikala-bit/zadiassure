import { Section, SectionHeader } from "@/components/site/Section";
import { Cta } from "@/components/ui/cta";
import { routes } from "@/config/site";
import { useT } from "@/i18n";

export function PartnersBlock({ compact = false }: { compact?: boolean }) {
  const t = useT();
  return (
    <Section tone={compact ? "default" : "muted"}>
      <SectionHeader
        eyebrow={t.partnersSection.eyebrow}
        title={t.partnersSection.title}
        text={t.partnersSection.text}
      />

      <ul className="mt-10 flex flex-wrap gap-2.5">
        {t.partnersSection.profiles.map((p) => (
          <li
            key={p}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
          >
            {p}
          </li>
        ))}
      </ul>

      {!compact && (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.partnersSection.values.map((v) => (
            <div key={v.title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h3 className="font-display text-lg font-bold text-primary">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {t.partnersSection.logosPlaceholder}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Cta to={routes.contact} size="lg">
          {t.cta.partner}
        </Cta>
        {compact && (
          <Cta to={routes.partners} size="lg" variant="outline">
            {t.cta.readMore}
          </Cta>
        )}
      </div>
    </Section>
  );
}
