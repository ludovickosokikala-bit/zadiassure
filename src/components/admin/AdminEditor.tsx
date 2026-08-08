import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ctaVariants } from "@/components/ui/cta";
import { cn } from "@/lib/utils";
import { THEME_KEYS, type LibraryDict } from "@/i18n/library";

export type Row = Record<string, unknown>;

const LOCALES = ["nl", "fr", "en"] as const;

function str(row: Row, key: string): string {
  const v = row[key];
  return typeof v === "string" ? v : "";
}

export interface EditorProps {
  kind: "legislation" | "form";
  row: Row;
  dict: LibraryDict;
  onCancel: () => void;
  onSave: (values: Row) => Promise<void>;
}

/** Multilingual editor for a legislation update or a form template. */
export function AdminEditor({ kind, row, dict, onCancel, onSave }: EditorProps) {
  const a = dict.admin;
  const [values, setValues] = useState<Row>(() => ({ ...row }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, value: unknown) => setValues((v) => ({ ...v, [key]: value }));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSave(values);
    } catch {
      setError(a.saveFailed);
    } finally {
      setBusy(false);
    }
  };

  const textFields =
    kind === "legislation"
      ? ([
          ["title", a.labelTitle, false],
          ["summary", a.labelSummary, true],
          ["changes", a.labelChanges, true],
          ["action", a.labelAction, true],
        ] as const)
      : ([
          ["title", a.labelTitle, false],
          ["description", a.labelDescription, true],
          ["who", a.labelWho, true],
        ] as const);

  return (
    <form
      onSubmit={submit}
      className="mt-6 grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrap label={a.fieldSlug}>
          <Input value={str(values, "slug")} onChange={(e) => set("slug", e.target.value)} required />
        </FieldWrap>
        <FieldWrap label={a.fieldTheme}>
          <select
            value={str(values, "theme") || "immigration"}
            onChange={(e) => set("theme", e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {THEME_KEYS.map((key) => (
              <option key={key} value={key}>
                {dict.themes[key]}
              </option>
            ))}
          </select>
        </FieldWrap>

        {kind === "legislation" ? (
          <>
            <FieldWrap label={a.fieldEffective}>
              <Input
                type="date"
                value={str(values, "effective_date")}
                onChange={(e) => set("effective_date", e.target.value)}
              />
            </FieldWrap>
            <FieldWrap label={a.fieldSource}>
              <Input
                value={str(values, "source_url")}
                onChange={(e) => set("source_url", e.target.value)}
                placeholder="https://"
              />
            </FieldWrap>
            <FieldWrap label={a.fieldSourceLabel}>
              <Input
                value={str(values, "source_label")}
                onChange={(e) => set("source_label", e.target.value)}
              />
            </FieldWrap>
          </>
        ) : (
          <>
            <FieldWrap label={a.fieldAuthority}>
              <Input
                value={str(values, "authority")}
                onChange={(e) => set("authority", e.target.value)}
              />
            </FieldWrap>
            <FieldWrap label={a.fieldOfficialUrl}>
              <Input
                value={str(values, "official_url")}
                onChange={(e) => set("official_url", e.target.value)}
                placeholder="https://"
              />
            </FieldWrap>
            <FieldWrap label={a.fieldOfficialLabel}>
              <Input
                value={str(values, "official_label")}
                onChange={(e) => set("official_label", e.target.value)}
              />
            </FieldWrap>
            <FieldWrap label={a.fieldOrder}>
              <Input
                type="number"
                value={String(values["sort_order"] ?? 0)}
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </FieldWrap>
          </>
        )}

        <FieldWrap label={a.audiencesHint}>
          <Input
            value={Array.isArray(values["audiences"]) ? (values["audiences"] as string[]).join(", ") : ""}
            onChange={(e) =>
              set(
                "audiences",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </FieldWrap>
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold text-primary">
        <input
          type="checkbox"
          checked={values["published"] === true}
          onChange={(e) => set("published", e.target.checked)}
          className="size-4 rounded border-input"
        />
        {a.published}
      </label>

      {textFields.map(([field, label, multiline]) => (
        <div key={field} className="grid gap-3 lg:grid-cols-3">
          {LOCALES.map((loc) => (
            <FieldWrap key={loc} label={`${label} (${loc.toUpperCase()})`}>
              {multiline ? (
                <Textarea
                  rows={4}
                  value={str(values, `${field}_${loc}`)}
                  onChange={(e) => set(`${field}_${loc}`, e.target.value)}
                />
              ) : (
                <Input
                  value={str(values, `${field}_${loc}`)}
                  onChange={(e) => set(`${field}_${loc}`, e.target.value)}
                />
              )}
            </FieldWrap>
          ))}
        </div>
      ))}

      {kind === "form" && (
        <div className="grid gap-3 lg:grid-cols-3">
          {LOCALES.map((loc) => {
            const checklist = (values["checklist"] ?? {}) as Record<string, string[]>;
            return (
              <FieldWrap key={loc} label={`${a.labelChecklist} (${loc.toUpperCase()}) — ${a.checklistHint}`}>
                <Textarea
                  rows={6}
                  value={(checklist[loc] ?? []).join("\n")}
                  onChange={(e) =>
                    set("checklist", {
                      ...checklist,
                      [loc]: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </FieldWrap>
            );
          })}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className={cn(ctaVariants({ size: "lg" }))}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {busy ? a.saving : a.save}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={cn(ctaVariants({ variant: "outline", size: "lg" }))}
        >
          {a.cancel}
        </button>
      </div>
    </form>
  );
}

function FieldWrap({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

export const emptyLegislation: Row = {
  slug: "",
  theme: "immigration",
  audiences: [],
  effective_date: "",
  published: false,
  source_url: "",
  source_label: "",
};

export const emptyForm: Row = {
  slug: "",
  theme: "immigration",
  authority: "",
  audiences: [],
  published: false,
  sort_order: 0,
  official_url: "",
  official_label: "",
  checklist: { nl: [], fr: [], en: [] },
};
