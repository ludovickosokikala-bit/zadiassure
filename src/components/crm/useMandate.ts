import { useLanguage } from "@/i18n";
import { mandateDictionaries } from "@/i18n/mandate";

export function useMandateDict() {
  const { locale } = useLanguage();
  return mandateDictionaries[locale];
}
