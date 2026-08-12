import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Coins, Loader2, Send, Sparkles } from "lucide-react";
import { Panel } from "@/components/crm/ui";
import { useLanguage } from "@/i18n";
import type { Locale } from "@/i18n/types";
import { cn } from "@/lib/utils";
import {
  caseAssistant,
  dailyBriefing,
  explainDocument,
  triageSubmission,
} from "@/lib/crmAi.functions";

/* ---------------------------------- copy ---------------------------------- */

const COPY = {
  nl: {
    assistant: "Dossier-assistent",
    assistantIntro: "Stel een vraag over dit dossier. De AI stelt voor, jij beslist.",
    ask: "Vraag over dit dossier…",
    send: "Vragen",
    thinking: "Denkt na…",
    suggestions: [
      "Wat is de stand van zaken?",
      "Wat ontbreekt er nog in dit dossier?",
      "Stel een taakplanning voor de komende twee weken voor.",
    ],
    briefing: "Dagelijkse briefing",
    briefingIntro: "AI-overzicht van wat vandaag aandacht vraagt.",
    generate: "Genereer",
    refresh: "Opnieuw",
    triage: "AI-triage",
    triageIntro: "Samenvatting, doelgroep, urgentie en volgende stap.",
    letter: "Briefhulp",
    letterIntro: "Plak de tekst van een brief of document. De AI legt uit wat er gevraagd wordt.",
    letterPlaceholder: "Plak hier de tekst van de brief…",
    explain: "Uitleggen",
    withReply: "Voorbeeldantwoord toevoegen",
    disclaimer: "AI-voorstel — controleer altijd zelf. Geen juridisch advies.",
    rate: "Te veel aanvragen. Probeer het straks opnieuw.",
    credits: "AI-credits zijn opgebruikt.",
    error: "Er ging iets mis met de AI.",
    costLabel: "kost",
    costPerRun: "per verzoek",
    costTip:
      "Schatting in Lovable-credits voor dit verzoek. Je betaalt alleen wanneer je op de knop klikt; langere tekst kost iets meer.",

  },
  fr: {
    assistant: "Assistant dossier",
    assistantIntro: "Posez une question sur ce dossier. L'IA propose, vous décidez.",
    ask: "Question sur ce dossier…",
    send: "Demander",
    thinking: "Réflexion…",
    suggestions: [
      "Quel est l'état du dossier ?",
      "Que manque-t-il encore dans ce dossier ?",
      "Proposez un planning de tâches pour les deux prochaines semaines.",
    ],
    briefing: "Briefing du jour",
    briefingIntro: "Aperçu IA de ce qui demande votre attention aujourd'hui.",
    generate: "Générer",
    refresh: "Actualiser",
    triage: "Triage IA",
    triageIntro: "Résumé, public, urgence et prochaine étape.",
    letter: "Aide au courrier",
    letterIntro: "Collez le texte d'un courrier. L'IA explique ce qui est demandé.",
    letterPlaceholder: "Collez ici le texte du courrier…",
    explain: "Expliquer",
    withReply: "Ajouter un exemple de réponse",
    disclaimer: "Proposition IA — à vérifier. Pas un conseil juridique.",
    rate: "Trop de demandes. Réessayez plus tard.",
    credits: "Les crédits IA sont épuisés.",
    error: "Une erreur est survenue avec l'IA.",
    costLabel: "coût",
    costPerRun: "par requête",
    costTip:
      "Estimation en crédits Lovable pour cette requête. Facturé uniquement quand vous cliquez ; un texte plus long coûte un peu plus.",

  },
  en: {
    assistant: "Case assistant",
    assistantIntro: "Ask anything about this case. The AI suggests, you decide.",
    ask: "Ask about this case…",
    send: "Ask",
    thinking: "Thinking…",
    suggestions: [
      "What is the current status?",
      "What is still missing in this case?",
      "Suggest a task plan for the next two weeks.",
    ],
    briefing: "Daily briefing",
    briefingIntro: "AI overview of what needs attention today.",
    generate: "Generate",
    refresh: "Refresh",
    triage: "AI triage",
    triageIntro: "Summary, audience, urgency and next step.",
    letter: "Letter helper",
    letterIntro: "Paste the text of a letter. The AI explains what is being asked.",
    letterPlaceholder: "Paste the letter text here…",
    explain: "Explain",
    withReply: "Add a sample reply",
    disclaimer: "AI suggestion — always verify. Not legal advice.",
    rate: "Too many requests. Try again later.",
    credits: "AI credits are exhausted.",
    error: "Something went wrong with the AI.",
    costLabel: "cost",
    costPerRun: "per run",
    costTip:
      "Estimate in Lovable credits for this request. Only charged when you press the button; longer text costs slightly more.",

  },
} satisfies Record<Locale, Record<string, unknown>>;

function useAiCopy() {
  const { locale } = useLanguage();
  return { t: COPY[locale], locale };
}

function messageFor(error: unknown, t: (typeof COPY)["nl"]) {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes("RATE_LIMIT")) return t.rate;
  if (raw.includes("NO_CREDITS")) return t.credits;
  return t.error;
}

/* ------------------------------- text render ------------------------------- */

/** Minimal markdown rendering: **bold**, bullets and paragraphs. */
export function AiText({ text, className }: { text: string; className?: string }) {
  const blocks = useMemo(() => text.split("\n").filter((l) => l.trim().length > 0), [text]);
  return (
    <div className={cn("space-y-1.5 text-sm leading-relaxed text-foreground", className)}>
      {blocks.map((line, i) => {
        const bullet = /^\s*[-*•]\s+/.test(line);
        const content = line.replace(/^\s*[-*•]\s+/, "");
        const parts = content.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
        return (
          <p key={i} className={cn(bullet && "flex gap-2 pl-1")}>
            {bullet && <span className="text-accent">•</span>}
            <span>
              {parts.map((part, j) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={j} className="font-semibold text-foreground">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  <span key={j}>{part}</span>
                ),
              )}
            </span>
          </p>
        );
      })}
    </div>
  );
}

function Disclaimer({ text }: { text: string }) {
  return <p className="mt-3 text-[11px] font-medium text-muted-foreground">{text}</p>;
}

/**
 * Rough credit estimate for one AI call: a small base cost plus a share
 * that grows with the amount of text sent along (chars ≈ tokens / 4).
 */
export function estimateCredits(inputChars = 0) {
  const credits = 0.012 + (inputChars / 4) * 0.0000012 + 0.0035;
  return Math.max(0.01, Math.round(credits * 100) / 100);
}

function formatCredits(value: number, locale: Locale) {
  return value.toLocaleString(locale === "en" ? "en-US" : locale === "fr" ? "fr-BE" : "nl-BE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CostBadge({ inputChars = 0 }: { inputChars?: number }) {
  const { t, locale } = useAiCopy();
  const credits = estimateCredits(inputChars);
  return (
    <span
      title={t.costTip}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
    >
      <Coins className="h-3.5 w-3.5 text-accent" />
      {t.costLabel} ≈ {formatCredits(credits, locale)} credits
      <span className="hidden font-medium opacity-70 sm:inline">/ {t.costPerRun}</span>
    </span>
  );
}

function AiButton({
  onClick,
  loading,
  children,
  disabled,
  inputChars,
}: {
  onClick: () => void;
  loading?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  inputChars?: number;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <CostBadge inputChars={inputChars ?? 0} />
      <button
        type="button"
        onClick={onClick}
        disabled={loading || disabled}
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-foreground shadow-soft transition hover:brightness-105 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {children}
      </button>
    </span>
  );
}


/* ----------------------------- case assistant ----------------------------- */

type Turn = { role: "user" | "assistant"; content: string };

export function CaseAssistant({ caseId }: { caseId: string }) {
  const { t, locale } = useAiCopy();
  const ask = useServerFn(caseAssistant);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");

  const mutation = useMutation({
    mutationFn: (question: string) =>
      ask({ data: { caseId, question, language: locale, history: turns.slice(-8) } }),
    onSuccess: (res, question) =>
      setTurns((prev) => [
        ...prev,
        { role: "user", content: question },
        { role: "assistant", content: res.answer },
      ]),
  });

  const submit = (question: string) => {
    const q = question.trim();
    if (!q || mutation.isPending) return;
    setInput("");
    mutation.mutate(q);
  };

  return (
    <Panel title={t.assistant}>
      <p className="text-sm text-muted-foreground">{t.assistantIntro}</p>

      {turns.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {t.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-accent/50 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {turns.map((turn, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl px-4 py-3",
              turn.role === "user"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background",
            )}
          >
            {turn.role === "user" ? (
              <p className="text-sm">{turn.content}</p>
            ) : (
              <AiText text={turn.content} />
            )}
          </div>
        ))}
        {mutation.isPending && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t.thinking}
          </p>
        )}
        {mutation.isError && (
          <p className="text-sm font-medium text-destructive">{messageFor(mutation.error, t)}</p>
        )}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.ask}
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={mutation.isPending || !input.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-foreground disabled:opacity-60"
        >
          <Send className="h-4 w-4" /> <span className="hidden sm:inline">{t.send}</span>
        </button>
      </form>
      <div className="mt-2">
        <CostBadge inputChars={input.trim().length + turns.reduce((n, x) => n + x.content.length, 0)} />
      </div>
      <Disclaimer text={t.disclaimer} />
    </Panel>
  );
}

/* ------------------------------ inbox triage ------------------------------ */

export function InboxTriage({ submissionId }: { submissionId: string }) {
  const { t, locale } = useAiCopy();
  const run = useServerFn(triageSubmission);
  const mutation = useMutation({
    mutationFn: () => run({ data: { id: submissionId, language: locale } }),
  });

  return (
    <div className="rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">{t.triage}</p>
          <p className="text-xs text-muted-foreground">{t.triageIntro}</p>
        </div>
        <AiButton onClick={() => mutation.mutate()} loading={mutation.isPending}>
          {mutation.data ? t.refresh : t.generate}
        </AiButton>
      </div>
      {mutation.isError && (
        <p className="mt-3 text-sm font-medium text-destructive">{messageFor(mutation.error, t)}</p>
      )}
      {mutation.data && (
        <>
          <AiText className="mt-3" text={mutation.data.triage} />
          <Disclaimer text={t.disclaimer} />
        </>
      )}
    </div>
  );
}

/* ----------------------------- daily briefing ----------------------------- */

export function DailyBriefing() {
  const { t, locale } = useAiCopy();
  const run = useServerFn(dailyBriefing);
  const mutation = useMutation({ mutationFn: () => run({ data: { language: locale } }) });

  return (
    <Panel
      title={t.briefing}
      action={
        <AiButton onClick={() => mutation.mutate()} loading={mutation.isPending}>
          {mutation.data ? t.refresh : t.generate}
        </AiButton>
      }
    >
      <p className="text-sm text-muted-foreground">{t.briefingIntro}</p>
      {mutation.isError && (
        <p className="mt-3 text-sm font-medium text-destructive">{messageFor(mutation.error, t)}</p>
      )}
      {mutation.data && (
        <>
          <AiText className="mt-3" text={mutation.data.briefing} />
          <Disclaimer text={t.disclaimer} />
        </>
      )}
    </Panel>
  );
}

/* ------------------------------ letter helper ----------------------------- */

export function LetterHelper() {
  const { t, locale } = useAiCopy();
  const run = useServerFn(explainDocument);
  const [text, setText] = useState("");
  const [withReply, setWithReply] = useState(true);
  const mutation = useMutation({
    mutationFn: () => run({ data: { text, language: locale, withReply } }),
  });

  return (
    <Panel title={t.letter}>
      <p className="text-sm text-muted-foreground">{t.letterIntro}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder={t.letterPlaceholder}
        className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={withReply}
            onChange={(e) => setWithReply(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          {t.withReply}
        </label>
        <AiButton
          onClick={() => mutation.mutate()}
          loading={mutation.isPending}
          disabled={text.trim().length < 20}
          inputChars={text.trim().length}
        >
          {t.explain}
        </AiButton>
      </div>
      {mutation.isError && (
        <p className="mt-3 text-sm font-medium text-destructive">{messageFor(mutation.error, t)}</p>
      )}
      {mutation.data && (
        <>
          <AiText className="mt-4" text={mutation.data.explanation} />
          <Disclaimer text={t.disclaimer} />
        </>
      )}
    </Panel>
  );
}
