import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SignaturePad } from "@/components/site/SignaturePad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { submitMandate } from "@/lib/mandates.functions";
import { MANDATE_SCOPES, mandateDictionaries, type MandateScope } from "@/i18n/mandate";
import { useLanguage } from "@/i18n";
import heroImage from "@/assets/page-contact.jpg";

const meta = mandateDictionaries.nl.page;

export const Route = createFileRoute("/volmacht")({
  head: () => ({
    meta: [
      { title: "Volmacht geven aan ZADIASSURE — online ondertekenen" },
      {
        name: "description",
        content:
          "Geef ZADIASSURE volmacht om je administratie op te volgen: kies de bevoegdheden, de periode en onderteken digitaal.",
      },
      { property: "og:title", content: "Volmacht geven aan ZADIASSURE" },
      {
        property: "og:description",
        content:
          "Kies zelf welke bevoegdheden je toevertrouwt en onderteken je volmacht digitaal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/volmacht" }],
  }),
  component: MandatePage,
});

function MandatePage() {
  const { locale } = useLanguage();
  const t = mandateDictionaries[locale];
  const send = useServerFn(submitMandate);

  const [scopes, setScopes] = useState<MandateScope[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error" | "invalid">("idle");

  function toggle(scope: MandateScope) {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    if (!signature || !consent || scopes.length === 0 || !value("signed_full_name")) {
      setState("invalid");
      return;
    }
    setState("sending");
    try {
      const res = await send({
        data: {
          applicant_name: value("applicant_name"),
          applicant_email: value("applicant_email"),
          applicant_phone: value("applicant_phone"),
          applicant_address: value("applicant_address"),
          applicant_birth_date: value("applicant_birth_date") || null,
          scope: scopes,
          purpose: value("purpose"),
          starts_on: value("starts_on") || null,
          ends_on: value("ends_on") || null,
          signed_full_name: value("signed_full_name"),
          signature_image: signature,
          consent: true,
          language: locale,
        },
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <PageHero
        eyebrow={t.page.eyebrow}
        title={t.page.title}
        text={t.page.text}
        image={heroImage}
        imageAlt={t.page.eyebrow}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="space-y-5">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <ShieldCheck className="h-7 w-7 text-accent" />
              <h2 className="mt-3 font-heading text-lg font-bold text-foreground">{t.page.who}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t.page.whoText}</p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{t.page.legal}</p>
          </aside>

          {state === "done" ? (
            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
              <CheckCircle2 className="h-9 w-9 text-accent" />
              <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
                {t.page.success}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{t.page.successText}</p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
            >
              <h2 className="font-heading text-xl font-bold text-foreground">{t.page.formTitle}</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={t.page.fullName} name="applicant_name" required />
                <FormField label={t.page.email} name="applicant_email" type="email" required />
                <FormField label={t.page.phone} name="applicant_phone" />
                <FormField label={t.page.birthDate} name="applicant_birth_date" type="date" />
                <FormField label={t.page.address} name="applicant_address" className="sm:col-span-2" />
              </div>

              <fieldset className="space-y-3">
                <legend className="font-heading text-base font-semibold text-foreground">
                  {t.page.scopeTitle}
                </legend>
                <p className="text-xs text-muted-foreground">{t.page.scopeHint}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {MANDATE_SCOPES.map((scope) => (
                    <label
                      key={scope}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 text-sm text-foreground"
                    >
                      <Checkbox
                        checked={scopes.includes(scope)}
                        onCheckedChange={() => toggle(scope)}
                      />
                      <span>{t.scopes[scope]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-1.5">
                <Label htmlFor="purpose">{t.page.purpose}</Label>
                <Textarea id="purpose" name="purpose" rows={3} />
              </div>

              <fieldset className="grid gap-4 sm:grid-cols-2">
                <legend className="mb-2 font-heading text-base font-semibold text-foreground">
                  {t.page.period}
                </legend>
                <FormField label={t.page.startsOn} name="starts_on" type="date" />
                <FormField label={t.page.endsOn} name="ends_on" type="date" />
              </fieldset>

              <div className="space-y-3">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  {t.page.signatureTitle}
                </h3>
                <FormField label={t.page.signedName} name="signed_full_name" required />
                <SignaturePad
                  onChange={setSignature}
                  clearLabel={t.page.clear}
                  hint={t.page.signatureHint}
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
                <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} />
                <span>{t.page.consent}</span>
              </label>

              {state === "invalid" && <p className="text-sm text-destructive">{t.page.required}</p>}
              {state === "error" && <p className="text-sm text-destructive">{t.page.error}</p>}

              <Button type="submit" size="lg" disabled={state === "sending"} className="w-full">
                {state === "sending" ? t.page.sending : t.page.submit}
              </Button>
            </form>
          )}
        </div>
      </Section>
    </>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-accent"> *</span>}
      </Label>
      <Input id={name} name={name} type={type} required={required} />
    </div>
  );
}

export { meta as mandatePageMeta };
