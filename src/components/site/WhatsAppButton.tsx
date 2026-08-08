import { MessageCircle } from "lucide-react";
import { site } from "@/config/site";
import { useLanguage } from "@/i18n";

const copy = {
  nl: {
    label: "Chat via WhatsApp",
    bubble: "Vraag? Chat met ons via WhatsApp.",
    prefill: "Hallo ZADIASSURE, ik heb een vraag over administratieve begeleiding.",
  },
  fr: {
    label: "Discuter sur WhatsApp",
    bubble: "Une question ? Écrivez-nous sur WhatsApp.",
    prefill: "Bonjour ZADIASSURE, j'ai une question sur l'accompagnement administratif.",
  },
  en: {
    label: "Chat on WhatsApp",
    bubble: "A question? Chat with us on WhatsApp.",
    prefill: "Hello ZADIASSURE, I have a question about administrative support.",
  },
} as const;

export function WhatsAppButton() {
  const { locale } = useLanguage();
  const t = copy[locale] ?? copy.nl;
  const href = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t.prefill)}`;

  return (
    <div className="fixed bottom-5 right-4 z-50 flex items-center gap-3 sm:bottom-6 sm:right-6">
      <span className="hidden max-w-[15rem] rounded-2xl border border-border bg-background/95 px-4 py-2.5 text-sm font-medium text-foreground shadow-lg backdrop-blur lg:block">
        {t.bubble}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.label}
        className="inline-flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-xl transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <MessageCircle className="size-7" />
      </a>
    </div>
  );
}
