import { Mail, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCrmDict } from "./useCrm";

/** Normalises a Belgian-style phone number to E.164 digits for wa.me / tel: links. */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  if (!digits) return "";
  if (digits.startsWith("+")) return digits.slice(1);
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `32${digits.slice(1)}`;
  return digits;
}

const btn =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary";

/** Direct call / WhatsApp / e-mail actions for a client's contact details. */
export function ContactActions({
  phone,
  email,
  className,
}: {
  phone?: string | null;
  email?: string | null;
  className?: string;
}) {
  const c = useCrmDict();
  const intl = phone ? normalizePhone(phone) : "";
  if (!intl && !email) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {intl && (
        <>
          <a href={`tel:+${intl}`} className={btn}>
            <Phone className="h-3.5 w-3.5" /> {c.clients.call}
          </a>
          <a
            href={`https://wa.me/${intl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={btn}
          >
            <MessageCircle className="h-3.5 w-3.5" /> {c.clients.whatsapp}
          </a>
        </>
      )}
      {email && (
        <a href={`mailto:${email}`} className={btn}>
          <Mail className="h-3.5 w-3.5" /> {c.clients.sendEmail}
        </a>
      )}
    </div>
  );
}
