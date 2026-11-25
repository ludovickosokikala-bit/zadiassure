import { z } from "zod";

export const REQUEST_TTL_DAYS = 14;
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const UPLOAD_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/heif"] as const;
export const UPLOAD_EXT = ["pdf", "jpg", "jpeg", "png", "heic", "heif"] as const;
/** Max uploads per request in a rolling 10 minutes, and in total. */
export const UPLOAD_RATE = { windowMinutes: 10, perWindow: 15, total: 60 } as const;

export type RequestItem = { id: string; label: string; imm_document_id: string | null; received: boolean };
export type RequestStatus = "sent" | "partial" | "complete" | "expired";

export function requestStatus(r: { items: RequestItem[]; expires_at: string }, now: Date): RequestStatus {
  const got = r.items.filter((i) => i.received).length;
  if (got > 0 && got === r.items.length) return "complete";
  if (Date.parse(r.expires_at) < now.getTime()) return "expired";
  return got > 0 ? "partial" : "sent";
}
export function storedStatus(items: RequestItem[]): "sent" | "partial" | "complete" {
  const got = items.filter((i) => i.received).length;
  return got === 0 ? "sent" : got === items.length ? "complete" : "partial";
}

export function isAllowedUpload(name: string, type: string, size: number) {
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  if (size <= 0 || size > MAX_UPLOAD_BYTES) return false;
  return (UPLOAD_EXT as readonly string[]).includes(ext) && (type === "" || (UPLOAD_TYPES as readonly string[]).includes(type));
}

const dayMs = 86400000;
/** Open request (not complete/expired), sent at least 5 days ago, never reminded. */
export function docReminderDue(r: { items: RequestItem[]; expires_at: string; created_at: string; reminder_sent_at: string | null }, now: Date) {
  const s = requestStatus(r, now);
  if (s === "complete" || s === "expired" || r.reminder_sent_at) return false;
  return now.getTime() - Date.parse(r.created_at) >= 5 * dayMs;
}
/** Unpaid instalment due in exactly 0–3 days, not yet reminded. */
export function instalmentReminderDue(i: { due_date: string; paid_at: string | null; reminder_sent_at: string | null }, today: string) {
  if (i.paid_at || i.reminder_sent_at) return false;
  const d = Math.round((Date.parse(`${i.due_date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / dayMs);
  return d >= 0 && d <= 3;
}

export function toCsv(rows: (string | number)[][]) {
  return rows.map((r) => r.map((v) => { const s = String(v ?? ""); return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(";")).join("\n");
}
export function avgDurationDays(dossiers: { start_date: string; status: string; updated_at: string }[]) {
  const closed = dossiers.filter((d) => d.status === "completed" || d.status === "archived");
  if (!closed.length) return null;
  const total = closed.reduce((s, d) => s + Math.max(0, (Date.parse(d.updated_at) - Date.parse(`${d.start_date}T00:00:00Z`)) / dayMs), 0);
  return Math.round(total / closed.length);
}

export const letterAnalysisSchema = z.object({
  sender: z.string(),
  sender_reference: z.string(),
  letter_language: z.string(),
  deadline: z.string().nullable(),
  amounts: z.array(z.object({ amount: z.string(), description: z.string() })),
  summaries: z.array(z.object({ language: z.string(), about: z.string(), asked: z.string() })),
});
export type LetterAnalysis = z.infer<typeof letterAnalysisSchema>;
