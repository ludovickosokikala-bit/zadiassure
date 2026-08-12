import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Lock, Mail, Phone } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { routes, site } from "@/config/site";
import { useLanguage, useT } from "@/i18n";

export function Footer() {
  const t = useT();
  const { locale } = useLanguage();
  const staffLabel =
    locale === "fr" ? "Espace collaborateurs" : locale === "en" ? "Staff area" : "Medewerkers";
  const year = new Date().getFullYear();

  const nav = [
    { to: routes.home, label: t.nav.home },
    { to: routes.audiences, label: t.nav.audiences },
    { to: routes.services, label: t.nav.services },
    { to: routes.partners, label: t.nav.partners },
    { to: routes.insights, label: t.nav.insights },
    { to: routes.faq, label: t.nav.faq },
    { to: routes.about, label: t.nav.about },
    { to: routes.contact, label: t.nav.contact },
  ];

  const legal = [
    { to: routes.privacy, label: t.footer.privacy },
    { to: routes.terms, label: t.footer.terms },
    { to: routes.cookies, label: t.footer.cookies },
  ];

  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container-page py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-4 rounded-2xl bg-navy-foreground px-5 py-4">
              <LogoMark className="size-14" />
              <div className="min-w-0">
                <p className="font-display text-xl font-bold tracking-tight text-primary">ZADIASSURE</p>
                <p className="truncate text-xs text-primary/60">{t.brand.tagline}</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-navy-foreground/70">
              {t.footer.about}
            </p>
            <p className="mt-4 text-xs italic text-accent">{t.brand.promise}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-foreground">{t.footer.navTitle}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {nav.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-navy-foreground/70 transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-foreground">{t.footer.legalTitle}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {legal.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-navy-foreground/70 transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-foreground">{t.footer.contactTitle}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={site.phoneHref} className="inline-flex items-center gap-2 text-navy-foreground/70 hover:text-accent">
                  <Phone className="size-4 shrink-0" /> {site.phone}
                </a>
              </li>
              <li>
                <a href={site.emailHref} className="inline-flex items-center gap-2 text-navy-foreground/70 hover:text-accent">
                  <Mail className="size-4 shrink-0" /> {site.email}
                </a>
              </li>
            </ul>
            <div className="mt-5 flex gap-2">
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
                  className="grid size-10 place-items-center rounded-full border border-navy-foreground/20 text-navy-foreground/80 transition-colors hover:border-accent hover:text-accent"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
            <p className="mt-5 text-xs text-navy-foreground/45">{t.footer.placeholderNote}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-navy-foreground/15 pt-6 text-xs text-navy-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} ZADIASSURE — {t.footer.rights}</p>
          <p className="italic">{t.brand.statement}</p>
          <Link
            to="/crm"
            className="inline-flex items-center gap-1.5 text-navy-foreground/45 transition-colors hover:text-accent"
          >
            <Lock className="size-3" />
            {staffLabel}
          </Link>
        </div>
      </div>
    </footer>
  );
}
