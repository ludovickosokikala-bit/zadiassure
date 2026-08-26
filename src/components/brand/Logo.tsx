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
      ? "ZADIASSURE — Cabinet d'accompagnement administratif & de résolution amiable"
      : "ZADIASSURE — Kantoor voor administratieve begeleiding & minnelijke geschillenbeslechting";

  return (
    <Link to="/" className={cn("inline-flex items-center", className)} aria-label="ZADIASSURE">
      <img src={src} alt={alt} className="h-16 w-auto sm:h-20" width={1920} height={720} />
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
