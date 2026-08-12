import { streamText } from "ai";
import { CRM_AI_MODEL, createLovableAiGatewayProvider, requireLovableApiKey } from "./ai-gateway.server";
import type { Db } from "./crm.server";

export const LANGUAGE_LABEL = { nl: "het Nederlands", fr: "het Frans", en: "het Engels" } as const;

type Msg = { role: "user" | "assistant"; content: string };

/** One gateway call, streamed server-side and returned as text. */
export async function runCrmAi({ system, messages }: { system: string; messages: Msg[] }) {
  const gateway = createLovableAiGatewayProvider(requireLovableApiKey());
  try {
    const result = streamText({
      model: gateway(CRM_AI_MODEL),
      system,
      messages,
    });
    const text = await result.text;
    return text.trim() || "Geen antwoord ontvangen. Probeer het opnieuw.";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("429")) throw new Error("RATE_LIMIT");
    if (message.includes("402")) throw new Error("NO_CREDITS");
    throw new Error(message);
  }
}

/** Compact, read-only snapshot of one case for the assistant prompt. */
export async function buildCaseContext(supabase: Db, organizationId: string, caseId: string) {
  const { data: row } = await supabase
    .from("cases")
    .select(
      "id, case_number, title, description, status_key, priority, opened_at, deadline_at, updated_at, clients ( first_name, last_name, company_name, client_type, language, city )",
    )
    .eq("organization_id", organizationId)
    .eq("id", caseId)
    .maybeSingle();
  if (!row) throw new Error("NOT_FOUND");

  const [tasks, documents, notes] = await Promise.all([
    supabase
      .from("tasks")
      .select("title, status, priority, due_date")
      .eq("case_id", caseId)
      .is("deleted_at", null)
      .order("due_date", { nullsFirst: false })
      .limit(40),
    supabase
      .from("case_documents")
      .select("title, status, due_date")
      .eq("case_id", caseId)
      .is("deleted_at", null)
      .limit(40),
    supabase
      .from("case_notes")
      .select("body, created_at")
      .eq("case_id", caseId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  return JSON.stringify(
    {
      case: row,
      tasks: tasks.data ?? [],
      documents: documents.data ?? [],
      notes: (notes.data ?? []).map((n) => ({
        created_at: n.created_at,
        body: (n.body ?? "").slice(0, 800),
      })),
    },
    null,
    2,
  );
}

/** Aggregated workload snapshot used for the daily briefing. */
export async function buildBriefingContext(supabase: Db, organizationId: string, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const stale = new Date(Date.now() - 14 * 86400000).toISOString();

  const [myTasks, deadlines, staleCases, inbox] = await Promise.all([
    supabase
      .from("tasks")
      .select("title, due_date, status, priority")
      .eq("organization_id", organizationId)
      .eq("assigned_to", userId)
      .neq("status", "done")
      .is("deleted_at", null)
      .lte("due_date", weekAhead)
      .order("due_date")
      .limit(30),
    supabase
      .from("cases")
      .select("case_number, title, deadline_at, status_key")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .not("deadline_at", "is", null)
      .lte("deadline_at", weekAhead)
      .order("deadline_at")
      .limit(30),
    supabase
      .from("cases")
      .select("case_number, title, status_key, updated_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .lt("updated_at", stale)
      .order("updated_at")
      .limit(15),
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status_key", "new")
      .is("deleted_at", null),
  ]);

  return {
    today,
    myTasks: myTasks.data ?? [],
    upcomingDeadlines: deadlines.data ?? [],
    staleCases: staleCases.data ?? [],
    newCases: inbox.count ?? 0,
  };
}
