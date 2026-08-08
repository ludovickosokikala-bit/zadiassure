import { createFileRoute } from "@tanstack/react-router";
import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Section, SectionHeader } from "@/components/site/Section";
import { ContactForm } from "@/components/site/ContactForm";
import { site } from "@/config/site";
import { dictionaries, useT } from "@/i18n";

const meta = dictionaries.nl.meta.contact;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: meta.title,
          description: meta.description,
        }),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const t = useT();
  return (
    <>
      <Section tone="sand">
        <SectionHeader eyebrow={t.contact.eyebrow} title={t.contact.title} text={t.contact.text} as="h1" />
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
            <h2 className="font-display text-xl font-bold text-primary">{t.contact.infoTitle}</h2>
            <ul className="mt-6 space-y-5 text-sm">
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                <div className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.contact.phoneLabel}
                  </span>
                  <a href={site.phoneHref} className="font-semibold text-primary hover:text-accent">
                    {site.phone}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                <div className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.contact.emailLabel}
                  </span>
                  <a href={site.emailHref} className="break-all font-semibold text-primary hover:text-accent">
                    {site.email}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.contact.hoursLabel}
                  </span>
                  <span className="font-semibold text-primary">{t.contact.hoursValue}</span>
                </div>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.contact.locationLabel}
                  </span>
                  <span className="text-muted-foreground">{t.contact.locationValue}</span>
                </div>
              </li>
            </ul>

            <div className="mt-8">
              <span className="eyebrow">{t.contact.socialLabel}</span>
              <div className="mt-3 flex gap-2">
                {[
                  { href: site.social.facebook, Icon: Facebook, label: "Facebook" },
                  { href: site.social.instagram, Icon: Instagram, label: "Instagram" },
                  { href: site.social.linkedin, Icon: Linkedin, label: "LinkedIn" },
                ].map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-full border border-border text-primary transition-colors hover:border-accent hover:text-accent"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </Section>
    </>
  );
}
