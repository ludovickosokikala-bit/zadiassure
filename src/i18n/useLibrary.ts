import { useLanguage } from "@/i18n";
import { libraryDictionaries, type LibraryDict } from "./library";

/** Dictionary for the legislation / documents / admin surfaces. */
export function useLib(): LibraryDict {
  return libraryDictionaries[useLanguage().locale];
}

/** Reads a localised column such as title_nl / title_fr / title_en. */
export function pick<T extends Record<string, unknown>>(
  row: T,
  field: string,
  locale: string,
): string {
  const value = row[`${field}_${locale}`] ?? row[`${field}_nl`];
  return typeof value === "string" ? value : "";
}
