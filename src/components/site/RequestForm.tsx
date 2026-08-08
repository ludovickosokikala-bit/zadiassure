import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ctaVariants } from "@/components/ui/cta";
import { submitRequest } from "@/lib/library.functions";
import { useLanguage } from "@/i18n";
import { useLib } from "@/i18n/useLibrary";
import { cn } from "@/lib/utils";

/**
 * Intake / preparation form for one request type.
 * It never files anything officially — it prepares the file for ZADIASSURE.
 */
export function RequestForm({ slug, checklist }: { slug: string; checklist: string[] }) {
  const { locale } = useLanguage();
  const lib = useLib();
  const f = lib.forms.fields;

  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    audience: lib.forms.audienceOptions[0]?.value ?? "particulier",
    message: "",
    consent: false,
  });
  const [have, setHave] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const schema = z.object({
    fullName: z.string().trim().min(2, f.required).max(120),
    email: z.string().trim().min(1, f.required).max(255).email(f.invalidEmail),
    phone: z.string().trim().max(40),
    audience: z.string().min(1, f.required),
    message: z.string().trim().max(3000),
    consent: z.literal(true, { message: f.required }),
  });

  const set = (key: keyof typeof values, value: string | boolean) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setState("submitting");
    try {
      const result = await submitRequest({
        data: {
          templateSlug: slug,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          language: locale,
          audience: values.audience,
          message: values.message,
          answers: Object.fromEntries(checklist.map((item) => [item, Boolean(have[item])])),
        },
      });
      setState(result.ok ? "success" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <CheckCircle2 className="size-10 text-accent" aria-hidden />
        <h3 className="mt-4 text-xl font-bold text-primary">{f.successTitle}</h3>
        <p className="mt-2 text-muted-foreground">{f.successText}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
      noValidate
    >
      <h3 className="text-xl font-bold text-primary">{lib.forms.formTitle}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{lib.forms.formIntro}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label={f.fullName} error={errors["fullName"]} required>
          <Input
            value={values.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            maxLength={120}
            autoComplete="name"
          />
        </Field>
        <Field label={f.email} error={errors["email"]} required>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            maxLength={255}
            autoComplete="email"
          />
        </Field>
        <Field label={f.phone} error={errors["phone"]}>
          <Input
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            maxLength={40}
            autoComplete="tel"
          />
        </Field>
        <Field label={f.audience} error={errors["audience"]} required>
          <select
            value={values.audience}
            onChange={(e) => set("audience", e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {lib.forms.audienceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5">
        <Field label={f.message} error={errors["message"]}>
          <Textarea
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            rows={4}
            maxLength={3000}
            placeholder={f.messagePlaceholder}
          />
        </Field>
      </div>

      {checklist.length > 0 && (
        <fieldset className="mt-6 rounded-2xl border border-border bg-secondary/50 p-5">
          <legend className="px-2 text-sm font-semibold text-primary">{f.checklistLegend}</legend>
          <ul className="grid gap-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Checkbox
                  id={`have-${item}`}
                  checked={Boolean(have[item])}
                  onCheckedChange={(v) => setHave((h) => ({ ...h, [item]: v === true }))}
                  className="mt-0.5"
                />
                <Label htmlFor={`have-${item}`} className="text-sm font-normal leading-snug">
                  {item}
                </Label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <div className="mt-6 flex items-start gap-3">
        <Checkbox
          id="request-consent"
          checked={values.consent}
          onCheckedChange={(v) => set("consent", v === true)}
          className="mt-0.5"
        />
        <Label htmlFor="request-consent" className="text-sm font-normal leading-snug">
          {f.consent}
        </Label>
      </div>
      {errors["consent"] && <p className="mt-1 text-sm text-destructive">{errors["consent"]}</p>}
      {state === "error" && <p className="mt-4 text-sm text-destructive">{f.failed}</p>}

      <button
        type="submit"
        disabled={state === "submitting"}
        className={cn(ctaVariants({ variant: "accent", size: "lg" }), "mt-7 w-full sm:w-auto")}
      >
        {state === "submitting" && <Loader2 className="size-4 animate-spin" />}
        {state === "submitting" ? f.sending : f.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string | undefined;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-semibold text-primary">
        {label}
        {required && <span className="text-accent"> *</span>}
      </Label>
      {children}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
