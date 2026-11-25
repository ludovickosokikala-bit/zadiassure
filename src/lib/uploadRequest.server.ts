import { hashToken } from "./reminders.server";
import { requestStatus, type RequestItem } from "./phase5Core";

export async function findRequest(token: string) {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("crm_doc_requests").select("*").eq("token_hash", hashToken(token)).maybeSingle();
  return data ? { admin: supabaseAdmin, req: { ...data, items: (data.items as RequestItem[]) ?? [] } } : null;
}
export function publicView(req: { items: RequestItem[]; expires_at: string; language: string }) {
  return {
    status: requestStatus(req, new Date()),
    language: req.language === "fr" ? "fr" : "nl",
    expires_at: req.expires_at,
    items: req.items.map((i) => ({ id: i.id, label: i.label, received: i.received })),
  };
}
