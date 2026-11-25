import { createHash, randomBytes } from "node:crypto";
import { PUBLIC_ORIGIN, hostKind } from "./host-routing";
import { docReminderDue, instalmentReminderDue, type RequestItem, requestStatus } from "./phase5Core";
import { formatEUR } from "./debtCore";

type Admin = (typeof import("@/integrations/supabase/client.server"))["supabaseAdmin"];

export function newToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}
export const hashToken = (t: string) => createHash("sha256").update(t, "utf8").digest("hex");
export function publicOrigin(requestOrigin?: string | null) {
  if (!requestOrigin) return PUBLIC_ORIGIN;
  try {
    const u = new URL(requestOrigin);
    return hostKind(u.host) === "other" ? u.origin : PUBLIC_ORIGIN;
  } catch {
    return PUBLIC_ORIGIN;
  }
}
export const clientLang = (l: string) => (l === "fr" ? "fr" : "nl");
export function clientFirstName(c: { type: string; first_name: string; company_name: string; household_name: string }) {
  return c.type === "company" ? c.company_name : c.type === "household" ? c.household_name : c.first_name;
}
const dateText = (iso: string, lang: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString(lang === "fr" ? "fr-BE" : "nl-BE", { day: "numeric", month: "long", year: "numeric" });

export async function sendRequestEmail(
  admin: Admin,
  req: { id: string; organization_id: string; client_id: string; dossier_id: string | null; items: RequestItem[]; expires_at: string; language: string },
  client: { email: string; type: string; first_name: string; company_name: string; household_name: string },
  token: string,
  origin: string,
  reminder: boolean,
) {
  const { sendTemplateEmail } = await import("./email-templates/send-email");
  const lang = req.language;
  const res = await sendTemplateEmail("document-request", client.email, {
    templateData: {
      lang,
      name: clientFirstName(client),
      items: req.items.filter((i) => !i.received).map((i) => i.label),
      link: `${origin}/documenten/${token}`,
      expires: dateText(req.expires_at, lang),
      reminder,
    },
    idempotencyKey: `docreq-${req.id}-${reminder ? "r" : "s"}-${token.slice(0, 8)}`,
  });
  await admin.from("crm_timeline").insert({
    organization_id: req.organization_id,
    client_id: req.client_id,
    dossier_id: req.dossier_id,
    kind: reminder ? "reminder_sent" : "doc_request_sent",
    detail: { type: "documents", count: req.items.length, sent: res.sent },
  });
  return res.sent;
}

/** Sends due reminders. With clientId: manual send for that client (ignores the 5-day wait and the opt-in). */
export async function runReminders(admin: Admin, opts: { clientId?: string; organizationId?: string; origin?: string | null } = {}) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const origin = publicOrigin(opts.origin);
  let docs = 0;
  let instalments = 0;
  let clientsQ = admin.from("crm_clients").select("id,organization_id,email,type,first_name,company_name,household_name,preferred_language,email_reminders").neq("email", "").limit(2000);
  if (opts.clientId) clientsQ = clientsQ.eq("id", opts.clientId).eq("organization_id", opts.organizationId!);
  else clientsQ = clientsQ.eq("email_reminders", true);
  const { data: clients, error } = await clientsQ;
  if (error) throw new Error("LOAD_FAILED");
  if (!clients.length) return { docs, instalments };
  const byId = new Map(clients.map((c) => [c.id, c]));
  const ids = [...byId.keys()];

  const { data: reqs } = await admin.from("crm_doc_requests").select("*").in("client_id", ids).neq("status", "complete").gt("expires_at", now.toISOString()).limit(200);
  for (const r of reqs ?? []) {
    const items = (r.items as RequestItem[]) ?? [];
    const due = opts.clientId ? requestStatus({ items, expires_at: r.expires_at }, now) !== "complete" : docReminderDue({ ...r, items }, now);
    if (!due) continue;
    const { token, hash } = newToken();
    // Claim first so a parallel run cannot send twice; rotating the token invalidates the old link.
    let claim = admin.from("crm_doc_requests").update({ reminder_sent_at: now.toISOString(), token_hash: hash }).eq("id", r.id);
    if (!opts.clientId) claim = claim.is("reminder_sent_at", null);
    const { data: claimed } = await claim.select("id");
    if (!claimed?.length) continue;
    try {
      if (await sendRequestEmail(admin, { ...r, items }, byId.get(r.client_id)!, token, origin, true)) docs++;
    } catch (e) {
      console.error("[reminders] document reminder failed", e);
    }
  }

  const { data: debts } = await admin.from("crm_debts").select("id,client_id,dossier_id,organization_id,creditor,status").in("client_id", ids).not("status", "in", "(paid_off,referred,refused)").limit(2000);
  if (debts?.length) {
    const debtById = new Map(debts.map((d) => [d.id, d]));
    const end = new Date(now.getTime() + (opts.clientId ? 7 : 3) * 86400000).toISOString().slice(0, 10);
    const { data: inst } = await admin.from("crm_instalments").select("*").in("debt_id", [...debtById.keys()]).is("paid_at", null).gte("due_date", today).lte("due_date", end).limit(200);
    for (const i of inst ?? []) {
      if (!opts.clientId && !instalmentReminderDue(i, today)) continue;
      let claim = admin.from("crm_instalments").update({ reminder_sent_at: now.toISOString() }).eq("id", i.id);
      if (!opts.clientId) claim = claim.is("reminder_sent_at", null);
      const { data: claimed } = await claim.select("id");
      if (!claimed?.length) continue;
      const d = debtById.get(i.debt_id)!;
      const c = byId.get(d.client_id)!;
      const lang = clientLang(c.preferred_language);
      try {
        const { sendTemplateEmail } = await import("./email-templates/send-email");
        const res = await sendTemplateEmail("instalment-reminder", c.email, {
          templateData: { lang, name: clientFirstName(c), creditor: d.creditor, amount: formatEUR(i.amount), due: dateText(i.due_date, lang) },
          idempotencyKey: `inst-${i.id}-${now.toISOString().slice(0, 13)}`,
        });
        await admin.from("crm_timeline").insert({ organization_id: d.organization_id, client_id: d.client_id, dossier_id: d.dossier_id, kind: "reminder_sent", detail: { type: "instalment", creditor: d.creditor, amount: i.amount, due_date: i.due_date, sent: res.sent } });
        if (res.sent) instalments++;
      } catch (e) {
        console.error("[reminders] instalment reminder failed", e);
      }
    }
  }
  return { docs, instalments };
}
