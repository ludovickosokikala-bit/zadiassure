import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { LogoFull, LogoMark } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { Cta } from "@/components/ui/cta";
import { routes, site } from "@/config/site";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { to: routes.home, label: t.nav.home },
    { to: routes.audiences, label: t.nav.audiences },
    { to: routes.services, label: t.nav.services },
    { to: routes.about, label: t.nav.about },
    { to: routes.partners, label: t.nav.partners },
    { to: routes.insights, label: t.nav.insights },
    { to: routes.contact, label: t.nav.contact },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled ? "border-border bg-background/90 backdrop-blur-md" : "border-transparent bg-background",
      )}
    >
      <div className="container-page">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 lg:gap-6">
          <div className="flex min-w-0 items-center">
            <LogoFull className="shrink-0" />
          </div>

          <nav className="hidden items-center gap-1 xl:flex" aria-label={t.nav.menu}>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === routes.home }}
                activeProps={{ className: "text-primary bg-secondary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="rounded-full px-3 py-2 text-sm font-medium transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 justify-self-end">
            <LanguageSwitcher className="hidden sm:flex" />
            <Cta to={routes.contact} size="sm" className="hidden md:inline-flex" withArrow={false}>
              {t.cta.primary}
            </Cta>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={t.nav.menu}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border text-primary xl:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-[var(--header-h,76px)] bottom-0 z-50 overflow-y-auto border-t border-border bg-background xl:hidden">
          <div className="container-page flex flex-col gap-1 py-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <LogoMark />
              <LanguageSwitcher />
            </div>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: link.to === routes.home }}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-foreground" }}
                className="border-b border-border py-3.5 text-lg font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              <Cta to={routes.contact} size="lg" onClick={() => setOpen(false)}>
                {t.cta.primary}
              </Cta>
              <a
                href={site.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold text-primary"
              >
                <Phone className="size-4" /> {site.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
