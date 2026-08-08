import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { nl } from "./nl";
import { fr } from "./fr";
import { en } from "./en";
import { LOCALES, type Dict, type Locale } from "./types";

export type { Dict, Locale, ServiceContent, AudienceContent, ArticleContent, Item } from "./types";
export { LOCALES };

export const dictionaries: Record<Locale, Dict> = { nl, fr, en };

const STORAGE_KEY = "zadiassure.locale";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dict;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("nl");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && LOCALES.includes(stored)) {
      setLocaleState(stored);
      return;
    }
    const browser = window.navigator.language.slice(0, 2).toLowerCase();
    if (browser === "fr" || browser === "en") setLocaleState(browser);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}

/** Convenience hook for components that only need the dictionary. */
export function useT(): Dict {
  return useLanguage().t;
}
