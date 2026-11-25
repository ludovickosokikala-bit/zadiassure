import { z } from "zod";

export const PROCEDURE_TYPES = ["residence", "renewal", "family", "nationality", "single_permit", "professional_card", "integration", "other"] as const;
export type ProcedureType = (typeof PROCEDURE_TYPES)[number];
export const STEP_STATUSES = ["todo", "doing", "done"] as const;
export const DOC_STATUSES = ["missing", "requested", "received", "checked", "na"] as const;
export const DECISIONS = ["", "positive", "negative", "incomplete"] as const;

type Pair = [nl: string, fr: string];
const STEPS: Pair[] = [
  ["Intake", "Intake"],
  ["Documenten verzamelen", "Collecte des documents"],
  ["Dossier controleren", "Contrôle du dossier"],
  ["Indiening", "Introduction de la demande"],
  ["Wachten op beslissing", "Attente de la décision"],
  ["Beslissing ontvangen", "Décision reçue"],
  ["Afgerond", "Clôturé"],
];
const D = {
  id: ["Identiteitsdocument / paspoort", "Document d'identité / passeport"],
  photo: ["Pasfoto", "Photo d'identité"],
  home: ["Bewijs van woonst", "Preuve de résidence"],
  health: ["Ziekteverzekering", "Assurance maladie"],
  birth: ["Geboorteakte", "Acte de naissance"],
  income: ["Bewijs van inkomsten", "Preuve de revenus"],
  lease: ["Huurcontract", "Contrat de bail"],
  record: ["Uittreksel strafregister", "Extrait de casier judiciaire"],
  transl: ["Vertaling / legalisatie", "Traduction / légalisation"],
  card: ["Huidige verblijfskaart", "Carte de séjour actuelle"],
  marriage: ["Huwelijksakte / bewijs van samenwoning", "Acte de mariage / preuve de cohabitation"],
  integ: ["Inburgeringsattest / taalbewijs", "Attestation d'intégration / preuve de langue"],
  work: ["Arbeidsovereenkomst", "Contrat de travail"],
  diploma: ["Diploma's", "Diplômes"],
  medical: ["Medisch attest", "Certificat médical"],
  plan: ["Ondernemingsplan", "Plan d'entreprise"],
} satisfies Record<string, Pair>;
const BASE = [D.id, D.photo, D.home, D.health];
const DOCS: Record<ProcedureType, Pair[]> = {
  residence: [...BASE, D.birth, D.income, D.lease, D.record, D.transl],
  renewal: [D.card, ...BASE, D.income, D.lease],
  family: [...BASE, D.birth, D.marriage, D.income, D.lease, D.record, D.transl],
  nationality: [...BASE, D.birth, D.income, D.integ, D.record, D.transl],
  single_permit: [...BASE, D.work, D.diploma, D.record, D.medical],
  professional_card: [...BASE, D.plan, D.diploma, D.record],
  integration: [D.id, D.card, D.home],
  other: BASE,
};

/** Generic starting point per procedure; must be checked per case. */
export function defaultTemplate(type: ProcedureType, lang: "nl" | "fr") {
  const i = lang === "fr" ? 1 : 0;
  return { steps: STEPS.map((p) => p[i]), documents: DOCS[type].map((p) => p[i]) };
}

export function checklistProgress(docs: { status: string }[]) {
  const relevant = docs.filter((d) => d.status !== "na");
  return { done: relevant.filter((d) => d.status === "received" || d.status === "checked").length, total: relevant.length };
}

const dayMs = 86400000;
export function daysUntil(date: string, today: string) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / dayMs);
}
/** Residence card/document: warn at 90, 60 and 30 days, and once expired. */
export function expiryLevel(date: string | null, today: string): 90 | 60 | 30 | "expired" | null {
  if (!date) return null;
  const d = daysUntil(date, today);
  if (d < 0) return "expired";
  if (d <= 30) return 30;
  if (d <= 60) return 60;
  if (d <= 90) return 90;
  return null;
}
/** Appeal date ("beroepstermijn tot"), entered manually: warn at 14 and 7 days, until the date has passed. */
export function appealLevel(date: string | null, today: string): 14 | 7 | null {
  if (!date) return null;
  const d = daysUntil(date, today);
  if (d < 0) return null;
  if (d <= 7) return 7;
  if (d <= 14) return 14;
  return null;
}

export type ImmAlert = { kind: "expiry" | "appeal"; dossierId: string; personId?: string; label: string; date: string; days: number; level: 90 | 60 | 30 | 14 | 7 | "expired" };
export function immAlerts(
  procedures: { dossier_id: string; appeal_until: string | null }[],
  persons: { dossier_id: string; person_id: string; document_label: string; expires_on: string | null }[],
  openDossiers: Set<string>,
  today: string,
): ImmAlert[] {
  const out: ImmAlert[] = [];
  for (const p of persons) {
    if (!openDossiers.has(p.dossier_id)) continue;
    const level = expiryLevel(p.expires_on, today);
    if (level) out.push({ kind: "expiry", dossierId: p.dossier_id, personId: p.person_id, label: p.document_label, date: p.expires_on!, days: daysUntil(p.expires_on!, today), level });
  }
  for (const p of procedures) {
    if (!openDossiers.has(p.dossier_id)) continue;
    const level = appealLevel(p.appeal_until, today);
    if (level) out.push({ kind: "appeal", dossierId: p.dossier_id, label: "", date: p.appeal_until!, days: daysUntil(p.appeal_until!, today), level });
  }
  return out.sort((a, b) => a.days - b.days);
}

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();
const id = z.string().uuid();
export const procedureSchema = z.object({
  dossier_id: id,
  procedure_type: z.enum(["", ...PROCEDURE_TYPES]),
  submitted_on: day,
  decision_on: day,
  decision: z.enum(DECISIONS),
  appeal_until: day,
  seed: z.object({ steps: z.array(z.string().trim().min(1).max(200)).max(40), documents: z.array(z.string().trim().min(1).max(200)).max(60) }).optional(),
});
export const stepSchema = z.object({ id: id.optional(), dossier_id: id, label: z.string().trim().min(1).max(200), status: z.enum(STEP_STATUSES), step_date: day, sort_order: z.number().int().min(0).max(1000) });
export const documentSchema = z.object({
  id: id.optional(), dossier_id: id, label: z.string().trim().min(1).max(200), status: z.enum(DOC_STATUSES),
  notes: z.string().max(2000), needs_translation: z.boolean(), file_path: z.string().max(500).nullable(), sort_order: z.number().int().min(0).max(1000),
});
export const personSchema = z.object({ id: id.optional(), dossier_id: id, person_id: id, document_label: z.string().trim().max(200), expires_on: day });
export const templateSchema = z.object({ procedure_type: z.enum(PROCEDURE_TYPES), steps: z.array(z.string().trim().min(1).max(200)).max(40), documents: z.array(z.string().trim().min(1).max(200)).max(60) });
