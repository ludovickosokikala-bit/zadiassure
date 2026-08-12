import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Db = SupabaseClient<Database>;

export interface Membership {
  organization_id: string;
  role: Database["public"]["Enums"]["crm_role"];
  full_name: string;
  email: string;
  branch_id: string | null;
}

const STAFF_ROLES = [
  "super_admin",
  "owner",
  "admin",
  "manager",
  "case_manager",
  "employee",
] as const;

/** Resolves the signed-in user's staff membership; throws when they have none. */
export async function requireStaff(supabase: Db, userId: string): Promise<Membership> {
  const { data, error } = await supabase
    .from("org_members")
    .select("organization_id, role, full_name, email, branch_id")
    .eq("user_id", userId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("NO_MEMBERSHIP");
  if (!STAFF_ROLES.includes(data.role as (typeof STAFF_ROLES)[number])) {
    throw new Error("NOT_STAFF");
  }
  return data as Membership;
}

export function isManager(role: Membership["role"]) {
  return ["super_admin", "owner", "admin", "manager"].includes(role);
}

export async function logActivity(
  supabase: Db,
  member: Membership,
  actorId: string,
  entry: {
    case_id?: string | null;
    client_id?: string | null;
    kind: string;
    summary: string;
    detail?: Record<string, unknown>;
    is_internal?: boolean;
  },
) {
  await supabase.from("case_activities").insert({
    organization_id: member.organization_id,
    case_id: entry.case_id ?? null,
    client_id: entry.client_id ?? null,
    kind: entry.kind,
    summary: entry.summary,
    detail: (entry.detail ?? {}) as never,
    is_internal: entry.is_internal ?? true,
    actor_id: actorId,
    actor_label: member.full_name || member.email,
  });
}

export function clientLabel(row: { first_name?: string | null; last_name?: string | null; company_name?: string | null }) {
  const person = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();
  return person || (row.company_name ?? "") || "—";
}

export const CLIENT_COLUMNS =
  "id, client_type, first_name, last_name, company_name, date_of_birth, email, phone, address, city, postal_code, country, preferred_language, contact_preference, status, notes, assigned_to, created_at, updated_at";

export const CASE_COLUMNS =
  "id, case_number, title, description, status_key, stage, priority, progress, assigned_to, client_id, case_type_id, start_date, target_date, deadline, tags, created_at, updated_at";

export const TASK_COLUMNS =
  "id, title, description, status, priority, due_date, assigned_to, case_id, client_id, completed_at, created_at";

export const DOCUMENT_COLUMNS =
  "id, name, document_type, status, case_id, client_id, requested_from_client, notes, expires_on, uploaded_at, created_at";
