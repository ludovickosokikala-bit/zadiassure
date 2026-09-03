import { Section, SectionHeader } from "@/components/site/Section";
import { useT } from "@/i18n";

export function LegalPage({ title }: { title: "privacy" | "terms" | "cookies" }) {
  const t = useT();
  const heading =
    title === "privacy" ? t.legal.privacyTitle : title === "terms" ? t.legal.termsTitle : t.legal.cookiesTitle;
  const intro =
    title === "privacy"
      ? t.legal.placeholder
      : title === "terms"
        ? t.legal.termsIntro
        : t.legal.cookiesIntro;
  const sections =
    title === "privacy"
      ? t.legal.sections
      : title === "terms"
        ? t.legal.termsSections
        : t.legal.cookiesSections;

  return (
    <Section>
      <SectionHeader title={heading} text={intro} as="h1" />
      <div className="mt-12 max-w-3xl space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-xl font-bold text-primary">{s.title}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
          </div>
        ))}
        {title === "privacy" && (
          <p className="rounded-2xl border border-dashed border-border bg-secondary/50 p-5 text-xs leading-relaxed text-muted-foreground">
            {t.legal.companyDataNote}
          </p>
        )}
      </div>
    </Section>
  );
}
