import { Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section, SectionHeader } from "@/components/site/Section";
import { routes } from "@/config/site";
import { useT } from "@/i18n";

export function FaqList({ limit, withHeader = true }: { limit?: number; withHeader?: boolean }) {
  const t = useT();
  const items = limit ? t.faqSection.items.slice(0, limit) : t.faqSection.items;

  return (
    <Section>
      {withHeader && (
        <SectionHeader eyebrow={t.faqSection.eyebrow} title={t.faqSection.title} text={t.faqSection.text} />
      )}
      <div className="mt-10 max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={item.title} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-display text-base font-semibold text-primary">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {limit && limit < t.faqSection.items.length && (
          <Link
            to={routes.faq}
            className="mt-8 inline-flex text-sm font-semibold text-primary hover:text-accent"
          >
            {t.nav.faq} →
          </Link>
        )}
      </div>
    </Section>
  );
}
