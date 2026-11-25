import type { Db } from "./crm.server";
export async function foundationMember(db: Db, userId: string) {
  const { data, error } = await db
    .from("org_members")
    .select("id,user_id,organization_id,full_name,email,foundation_role,active")
    .eq("user_id", userId)
    .eq("active", true)
    .not("foundation_role", "is", null)
    .limit(1)
    .maybeSingle();
  if (error || !data) throw new Error("NO_MEMBERSHIP");
  return data;
}
// Page through all authorized records so global search never silently misses older clients.
async function allRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
) {
  const rows: T[] = [];
  for (let from = 0; ; from += 500) {
    const result = await fetchPage(from, from + 499);
    if (result.error) throw new Error("LOAD_FAILED");
    rows.push(...(result.data ?? []));
    if ((result.data?.length ?? 0) < 500) break;
  }
  return rows;
}
export async function loadFoundation(db: Db, userId: string) {
  const lookup = await db
    .from("org_members")
    .select("id,user_id,organization_id,full_name,email,foundation_role,active")
    .eq("user_id", userId)
    .eq("active", true)
    .not("foundation_role", "is", null)
    .limit(1)
    .maybeSingle();
  if (lookup.error) throw new Error("LOAD_FAILED");
  const member = lookup.data;
  const org = member?.organization_id ?? "00000000-0000-0000-0000-000000000000";
  const [clients, dossiers, links, timeline, team, prefs] = await Promise.all([
    allRows((from, to) =>
      db
        .from("crm_clients")
        .select("*")
        .eq("organization_id", org)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
    allRows((from, to) =>
      db
        .from("crm_dossiers")
        .select("*")
        .eq("organization_id", org)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
    allRows((from, to) =>
      db
        .from("crm_client_links")
        .select("*")
        .eq("organization_id", org)
        .order("id")
        .range(from, to),
    ),
    allRows((from, to) =>
      db
        .from("crm_timeline")
        .select("*")
        .eq("organization_id", org)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
    db
      .from("org_members")
      .select("id,user_id,full_name,email,foundation_role,active")
      .eq("organization_id", org)
      .eq("active", true)
      .not("foundation_role", "is", null)
      .order("full_name"),
    db.from("crm_preferences").select("language,theme").eq("user_id", userId).maybeSingle(),
  ]);
  if (team.error || prefs.error) throw new Error("LOAD_FAILED");
  return {
    member,
    clients,
    dossiers,
    links,
    timeline,
    team: team.data ?? [],
    preferences: prefs.data ?? { language: "nl", theme: "system" },
  };
}
