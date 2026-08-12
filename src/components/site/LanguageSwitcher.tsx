import { useLanguage, LOCALES } from "@/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={cn("flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-card p-0.5", className)}
      role="group"
      aria-label="Taal / Langue / Language"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors sm:px-2.5 sm:py-1 sm:text-xs",
            locale === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-primary",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
