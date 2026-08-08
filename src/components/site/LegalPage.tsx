import { Section, SectionHeader } from "@/components/site/Section";
import { useT } from "@/i18n";

export function LegalPage({ title }: { title: "privacy" | "terms" | "cookies" }) {
  const t = useT();
  const heading =
    title === "privacy" ? t.legal.privacyTitle : title === "terms" ? t.legal.termsTitle : t.legal.cookiesTitle;

  return (
    <Section>
      <SectionHeader title={heading} text={t.legal.placeholder} as="h1" />
      <div className="mt-12 max-w-3xl space-y-8">
        {t.legal.sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-xl font-bold text-primary">{s.title}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
