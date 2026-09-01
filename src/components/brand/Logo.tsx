import { Link } from "@tanstack/react-router";
import logoNl from "@/assets/zadiassure-logo-nl.png.asset.json";
import logoFr from "@/assets/zadiassure-logo-fr.png.asset.json";
import mark from "@/assets/zadiassure-mark-new.png.asset.json";
import { useLanguage } from "@/i18n";
import { cn } from "@/lib/utils";

/** Full logo (wordmark + baseline), used in the header on larger screens. */
export function LogoFull({ className }: { className?: string }) {
  const { locale } = useLanguage();
  const src = locale === "fr" ? logoFr.url : logoNl.url;
  const alt =
    locale === "fr"
      ? "ZADIASSURE — Cabinet d'accompagnement administratif & budgétaire"
      : "ZADIASSURE — Kantoor voor administratieve en budgettaire begeleiding";

  return (
    <Link to="/" className="inline-flex items-center" aria-label="ZADIASSURE">
      <img src={src} alt={alt} className={cn("h-16 w-auto sm:h-20", className)} width={1920} height={720} />
    </Link>
  );
}

/** Compact brand mark for tight spaces (mobile header, footer). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={mark.url}
      alt="ZADIASSURE"
      className={cn("h-10 w-10 object-contain", className)}
      width={40}
      height={40}
    />
  );
}
