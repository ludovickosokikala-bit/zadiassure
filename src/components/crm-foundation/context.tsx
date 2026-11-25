import { createContext, useContext, type ReactNode } from "react";
import type { Foundation } from "./data";
import type { CrmDictionary, CrmLanguage } from "./dictionary";
export type Theme = "system" | "light" | "dark";
export type CrmContextValue = {
  data: Foundation;
  c: CrmDictionary;
  language: CrmLanguage;
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setPreferences: (language: CrmLanguage, theme: Theme) => Promise<void>;
  refresh: () => Promise<void>;
};
const Context = createContext<CrmContextValue | null>(null);
export const CrmProvider = ({
  value,
  children,
}: {
  value: CrmContextValue;
  children: ReactNode;
}) => <Context.Provider value={value}>{children}</Context.Provider>;
export function useFoundation() {
  const context = useContext(Context);
  if (!context) throw new Error("CRM context unavailable");
  return context;
}
export function dateLabel(value: string | null, language: CrmLanguage, time = false) {
  if (!value) return "—";
  return new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleString(
    language === "fr" ? "fr-BE" : "nl-BE",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
    },
  );
}
