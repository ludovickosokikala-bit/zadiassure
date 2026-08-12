import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/crm/ui";
import { DailyBriefing, LetterHelper } from "@/components/crm/ai";
import { useLanguage } from "@/i18n";

export const Route = createFileRoute("/crm/ai")({ component: AiPage });

const COPY = {
  nl: {
    title: "AI-assistent",
    intro:
      "AI helpt met samenvatten, uitleggen en plannen. Voorstellen worden nooit automatisch uitgevoerd.",
  },
  fr: {
    title: "Assistant IA",
    intro:
      "L'IA aide à résumer, expliquer et planifier. Les propositions ne sont jamais appliquées automatiquement.",
  },
  en: {
    title: "AI assistant",
    intro:
      "AI helps summarise, explain and plan. Suggestions are never applied automatically.",
  },
} as const;

function AiPage() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  return (
    <>
      <PageHead title={t.title} intro={t.intro} />
      <div className="grid gap-6 lg:grid-cols-2">
        <DailyBriefing />
        <LetterHelper />
      </div>
    </>
  );
}
