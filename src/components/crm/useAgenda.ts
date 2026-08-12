import { useLanguage } from "@/i18n";
import { agendaDictionaries } from "@/i18n/agenda";

export function useAgendaDict() {
  const { locale } = useLanguage();
  return agendaDictionaries[locale];
}
