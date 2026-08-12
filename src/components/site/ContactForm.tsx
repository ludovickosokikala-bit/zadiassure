import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ctaVariants } from "@/components/ui/cta";
import { routes } from "@/config/site";
import { submitContact } from "@/lib/library.functions";

import { useLanguage, LOCALES } from "@/i18n";
import { cn } from "@/lib/utils";

type Values = {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  city: string;
  profile: string;
  topic: string;
  message: string;
  language: string;
  consent: boolean;
};

const initial = (locale: string): Values => ({
  lastName: "",
  firstName: "",
  email: "",
  phone: "",
  city: "",
  profile: "particulier",
  topic: "",
  message: "",
  language: locale,
  consent: false,
});

export function ContactForm() {
  const { t, locale } = useLanguage();
  const f = t.contact.form;
  const [values, setValues] = useState<Values>(() => initial(locale));
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");


  const schema = z.object({
    lastName: z.string().trim().min(1, f.errorRequired).max(100),
    firstName: z.string().trim().min(1, f.errorRequired).max(100),
    email: z.string().trim().min(1, f.errorRequired).max(255).email(f.errorEmail),
    phone: z.string().trim().max(40),
    city: z.string().trim().min(1, f.errorRequired).max(100),
    profile: z.string().min(1, f.errorRequired),
    topic: z.string().max(120),
    message: z.string().trim().min(1, f.errorRequired).max(2000),
    language: z.string().min(1),
    consent: z.literal(true, { message: f.errorConsent }),
  });

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const next: Partial<Record<keyof Values, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Values;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setState("submitting");
    try {
      const res = await submitContact({
        data: {
          fullName: `${values.firstName} ${values.lastName}`.trim(),
          email: values.email,
          phone: values.phone,
          city: values.city,
          audience: values.profile,
          topic: values.topic,
          message: values.message,
          language: (values.language as "nl" | "fr" | "en") ?? "nl",
        },
      });
      setState(res.ok ? "success" : "error");
    } catch {
      setState("error");
    }
  };


  if (state === "success") {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto size-10 text-accent" />
        <h3 className="mt-4 font-display text-xl font-bold text-primary">{f.successTitle}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{f.successText}</p>
        <button
          type="button"
          onClick={() => {
            setValues(initial(locale));
            setState("idle");
          }}
          className={cn(ctaVariants({ variant: "outline", size: "md" }), "mt-6")}
        >
          {f.newRequest}
        </button>
      </div>
    );
  }

  const fieldError = (key: keyof Values) =>
    errors[key] ? (
      <p className="mt-1.5 text-xs font-medium text-destructive" role="alert">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <h3 className="font-display text-xl font-bold text-primary">{f.title}</h3>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="lastName">{f.lastName} *</Label>
          <Input id="lastName" value={values.lastName} onChange={(e) => set("lastName", e.target.value)} className="mt-1.5" />
          {fieldError("lastName")}
        </div>
        <div>
          <Label htmlFor="firstName">{f.firstName} *</Label>
          <Input id="firstName" value={values.firstName} onChange={(e) => set("firstName", e.target.value)} className="mt-1.5" />
          {fieldError("firstName")}
        </div>
        <div>
          <Label htmlFor="email">{f.email} *</Label>
          <Input id="email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} className="mt-1.5" />
          {fieldError("email")}
        </div>
        <div>
          <Label htmlFor="phone">{f.phone}</Label>
          <Input id="phone" type="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1.5" />
          {fieldError("phone")}
        </div>
        <div>
          <Label htmlFor="city">{f.city} *</Label>
          <Input id="city" value={values.city} onChange={(e) => set("city", e.target.value)} className="mt-1.5" />
          {fieldError("city")}
        </div>
        <div>
          <Label htmlFor="profile">{f.profile} *</Label>
          <select
            id="profile"
            value={values.profile}
            onChange={(e) => set("profile", e.target.value)}
            className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {f.profileOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {fieldError("profile")}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="topic">{f.topic}</Label>
          <select
            id="topic"
            value={values.topic}
            onChange={(e) => set("topic", e.target.value)}
            className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{f.topicPlaceholder}</option>
            {t.servicesSection.items.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="message">{f.message} *</Label>
          <Textarea
            id="message"
            rows={5}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder={f.messagePlaceholder}
            className="mt-1.5"
            maxLength={2000}
          />
          {fieldError("message")}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="language">{f.language}</Label>
          <select
            id="language"
            value={values.language}
            onChange={(e) => set("language", e.target.value)}
            className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {LOCALES.map((code) => (
              <option key={code} value={code}>
                {code.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3">
        <Checkbox
          id="consent"
          checked={values.consent}
          onCheckedChange={(checked) => set("consent", checked === true)}
          className="mt-0.5"
        />
        <div>
          <Label htmlFor="consent" className="text-sm font-normal leading-relaxed text-muted-foreground">
            {f.consent} *
          </Label>
          <Link to={routes.privacy} className="mt-1 block text-xs font-semibold text-primary hover:text-accent">
            {f.privacyLink}
          </Link>
          {fieldError("consent")}
        </div>
      </div>

      <button
        type="submit"
        disabled={state === "submitting"}
        className={cn(ctaVariants({ variant: "primary", size: "lg" }), "mt-7 w-full sm:w-auto")}
      >
        {state === "submitting" && <Loader2 className="size-4 animate-spin" />}
        {state === "submitting" ? f.submitting : f.submit}
      </button>

      {state === "error" && (
        <p className="mt-4 text-sm font-medium text-destructive" role="alert">
          {f.errorRequired === "" ? "" : null}
          {locale === "fr"
            ? "L'envoi a échoué. Réessayez ou contactez-nous par téléphone."
            : locale === "en"
              ? "Sending failed. Please try again or contact us by phone."
              : "Verzenden is mislukt. Probeer opnieuw of bel ons."}
        </p>
      )}

    </form>
  );
}
