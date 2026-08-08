import { Link } from "@tanstack/react-router";
import logo from "@/assets/zadiassure-logo.jpg.asset.json";
import mark from "@/assets/zadiassure-mark.jpg.asset.json";
import { cn } from "@/lib/utils";

/** Full logo (wordmark + baseline), used in the header on larger screens. */
export function LogoFull({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("inline-flex items-center", className)} aria-label="ZADIASSURE">
      <img
        src={logo.url}
        alt="ZADIASSURE — Service d'aide en administration"
        className="h-20 w-auto mix-blend-multiply sm:h-24"
        width={260}
        height={80}
      />
    </Link>
  );
}

/** Compact brand mark for tight spaces (mobile header, footer). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={mark.url}
      alt="ZADIASSURE"
      className={cn("h-10 w-10 object-contain mix-blend-multiply", className)}
      width={40}
      height={40}
    />
  );
}
