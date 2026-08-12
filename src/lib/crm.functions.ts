import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  caseFilterSchema,
  caseSchema,
  clientSchema,
  documentSchema,
  noteSchema,
  taskSchema,
  taskViewSchema,
} from "./crm.schemas";

/** Workspace bootstrap: membership, organization, team, case types and statuses. */
export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: member } = await context.supabase
      .from("org_members")
      .select("organization_id, role, full_name, email, branch_id, ui_language")
      .eq("user_id", context.userId)
      .eq("active", true)
      .limit(1)
      .maybeSingle();
    if (!member) return { member: null } as const;

    const [org, team, types, statuses] = await Promise.all([
      context.supabase
        .from("organizations")
        .select("id, name, slug, email, phone, default_language, case_number_prefix")
        .eq("id", member.organization_id)
        .maybeSingle(),
      context.supabase
        .from("org_members")
        .select("user_id, full_name, email, role, active")
        .eq("organization_id", member.organization_id)
        .eq("active", true)
        .order("full_name"),
      context.supabase
        .from("case_types")
        .select("id, key, name_nl, name_fr, name_en, workflow_stages, required_documents, default_tasks")
        .eq("organization_id", member.organization_id)
        .eq("active", true)
        .order("sort_order"),
      context.supabase
        .from("case_statuses")
        .select("key, label_nl, label_fr, label_en, tone, is_open, sort_order")
        .eq("organization_id", member.organization_id)
        .order("sort_order"),
    ]);

    return {
      member: { ...member, userId: context.userId },
      organization: org.data,
      team: team.data ?? [],
      caseTypes: types.data ?? [],
      caseStatuses: statuses.data ?? [],
    } as const;
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff, CASE_COLUMNS } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const org = member.organization_id;
    const today = new Date().toISOString().slice(0, 10);
    const inWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const [openStatuses, cases, tasks, activities, docs] = await Promise.all([
      context.supabase
        .from("case_statuses")
        .select("key")
        .eq("organization_id", org)
        .eq("is_open", true),
      context.supabase
        .from("cases")
        .select(`${CASE_COLUMNS}, clients ( first_name, last_name, company_name )`)
        .eq("organization_id", org)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(300),
      context.supabase
        .from("tasks")
        .select("id, title, status, priority, due_date, assigned_to, case_id")
        .eq("organization_id", org)
        .is("deleted_at", null)
        .not("status", "in", "(completed,cancelled)")
        .limit(400),
      context.supabase
        .from("case_activities")
        .select("id, kind, summary, actor_label, created_at, case_id")
        .eq("organization_id", org)
        .order("created_at", { ascending: false })
        .limit(12),
      context.supabase
        .from("case_documents")
        .select("id, name, status, case_id, client_id")
        .eq("organization_id", org)
        .is("deleted_at", null)
        .in("status", ["requested", "rejected", "expired"])
        .limit(50),
    ]);

    const openKeys = new Set((openStatuses.data ?? []).map((s) => s.key));
    const allCases = cases.data ?? [];
    const openCases = allCases.filter((c) => openKeys.has(c.status_key));
    const allTasks = tasks.data ?? [];

    return {
      role: member.role,
      kpis: {
        activeCases: openCases.length,
        newRequests: allCases.filter((c) => c.status_key === "new").length,
        dueToday: allTasks.filter((t) => t.due_date === today).length,
        overdue: allTasks.filter((t) => t.due_date && t.due_date < today).length,
        deadlinesThisWeek: openCases.filter(
          (c) => c.deadline && c.deadline >= today && c.deadline <= inWeek,
        ).length,
      },
      attention: openCases
        .filter(
          (c) =>
            c.priority === "urgent" ||
            c.priority === "high" ||
            (c.deadline && c.deadline <= inWeek) ||
            c.status_key === "documents_required",
        )
        .slice(0, 8),
      myTasks: allTasks
        .filter((t) => t.assigned_to === context.userId)
        .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"))
        .slice(0, 8),
      activities: activities.data ?? [],
      missingDocuments: docs.data ?? [],
    };
  });

export const listClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ search: z.string().trim().max(120).default("") }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff, CLIENT_COLUMNS } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    let query = context.supabase
      .from("clients")
      .select(CLIENT_COLUMNS)
      .eq("organization_id", member.organization_id)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(200);
    if (data.search) {
      const s = `%${data.search}%`;
      query = query.or(
        `first_name.ilike.${s},last_name.ilike.${s},company_name.ilike.${s},email.ilike.${s},phone.ilike.${s}`,
      );
    }
    const { data: items, error } = await query;
    if (error) throw new Error(error.message);
    return { items: items ?? [] };
  });

export const getClient = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, CLIENT_COLUMNS, CASE_COLUMNS, TASK_COLUMNS, DOCUMENT_COLUMNS } =
      await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const org = member.organization_id;
    const [client, cases, tasks, documents, activities] = await Promise.all([
      context.supabase
        .from("clients")
        .select(CLIENT_COLUMNS)
        .eq("organization_id", org)
        .eq("id", data.id)
        .maybeSingle(),
      context.supabase
        .from("cases")
        .select(CASE_COLUMNS)
        .eq("client_id", data.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("tasks")
        .select(TASK_COLUMNS)
        .eq("client_id", data.id)
        .is("deleted_at", null)
        .order("due_date"),
      context.supabase
        .from("case_documents")
        .select(DOCUMENT_COLUMNS)
        .eq("client_id", data.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("case_activities")
        .select("id, kind, summary, actor_label, created_at, case_id")
        .eq("client_id", data.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    if (!client.data) throw new Error("NOT_FOUND");
    return {
      client: client.data,
      cases: cases.data ?? [],
      tasks: tasks.data ?? [],
      documents: documents.data ?? [],
      activities: activities.data ?? [],
    };
  });

export const saveClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => clientSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, logActivity, clientLabel } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const { id, ...values } = data;
    const payload = { ...values, organization_id: member.organization_id };
    if (id) {
      const { error } = await context.supabase
        .from("clients")
        .update(payload)
        .eq("id", id)
        .eq("organization_id", member.organization_id);
      if (error) throw new Error(error.message);
      await logActivity(context.supabase, member, context.userId, {
        client_id: id,
        kind: "client_updated",
        summary: `Klantgegevens bijgewerkt: ${clientLabel(values)}`,
      });
      return { id };
    }
    const { data: created, error } = await context.supabase
      .from("clients")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, member, context.userId, {
      client_id: created.id,
      kind: "client_created",
      summary: `Klant aangemaakt: ${clientLabel(values)}`,
    });
    return { id: created.id };
  });

export const listCases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => caseFilterSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { requireStaff, CASE_COLUMNS } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    let query = context.supabase
      .from("cases")
      .select(`${CASE_COLUMNS}, clients ( id, first_name, last_name, company_name )`)
      .eq("organization_id", member.organization_id)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(300);
    if (data.status_key) query = query.eq("status_key", data.status_key);
    if (data.priority) query = query.eq("priority", data.priority);
    if (data.assigned_to) query = query.eq("assigned_to", data.assigned_to);
    if (data.case_type_id) query = query.eq("case_type_id", data.case_type_id);
    if (data.search) query = query.ilike("title", `%${data.search}%`);
    const { data: items, error } = await query;
    if (error) throw new Error(error.message);
    return { items: items ?? [] };
  });

export const getCase = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, CASE_COLUMNS, TASK_COLUMNS, DOCUMENT_COLUMNS, CLIENT_COLUMNS } =
      await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const org = member.organization_id;
    const { data: row, error } = await context.supabase
      .from("cases")
      .select(`${CASE_COLUMNS}, clients ( ${CLIENT_COLUMNS} )`)
      .eq("organization_id", org)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("NOT_FOUND");

    const [tasks, documents, notes, activities] = await Promise.all([
      context.supabase
        .from("tasks")
        .select(TASK_COLUMNS)
        .eq("case_id", data.id)
        .is("deleted_at", null)
        .order("due_date", { nullsFirst: false }),
      context.supabase
        .from("case_documents")
        .select(DOCUMENT_COLUMNS)
        .eq("case_id", data.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("case_notes")
        .select("id, body, is_internal, author_id, created_at")
        .eq("case_id", data.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("case_activities")
        .select("id, kind, summary, actor_label, is_internal, created_at")
        .eq("case_id", data.id)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    return {
      case: row,
      tasks: tasks.data ?? [],
      documents: documents.data ?? [],
      notes: notes.data ?? [],
      activities: activities.data ?? [],
    };
  });

export const saveCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => caseSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, logActivity } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const { id, ...values } = data;
    if (id) {
      const { data: before } = await context.supabase
        .from("cases")
        .select("status_key")
        .eq("id", id)
        .eq("organization_id", member.organization_id)
        .maybeSingle();
      const { error } = await context.supabase
        .from("cases")
        .update(values)
        .eq("id", id)
        .eq("organization_id", member.organization_id);
      if (error) throw new Error(error.message);
      await logActivity(context.supabase, member, context.userId, {
        case_id: id,
        client_id: values.client_id,
        kind: before?.status_key !== values.status_key ? "case_status_changed" : "case_updated",
        summary:
          before?.status_key !== values.status_key
            ? `Status gewijzigd naar "${values.status_key}"`
            : "Dossier bijgewerkt",
        is_internal: before?.status_key === values.status_key,
      });
      return { id };
    }
    const { data: created, error } = await context.supabase
      .from("cases")
      .insert({
        ...values,
        organization_id: member.organization_id,
        branch_id: member.branch_id,
        created_by: context.userId,
      })
      .select("id, case_number")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, member, context.userId, {
      case_id: created.id,
      client_id: values.client_id,
      kind: "case_created",
      summary: `Dossier #${created.case_number} aangemaakt: ${values.title}`,
      is_internal: false,
    });
    return { id: created.id };
  });

export const listTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => taskViewSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { requireStaff, TASK_COLUMNS } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const today = new Date().toISOString().slice(0, 10);
    let query = context.supabase
      .from("tasks")
      .select(`${TASK_COLUMNS}, cases ( id, case_number, title ), clients ( first_name, last_name, company_name )`)
      .eq("organization_id", member.organization_id)
      .is("deleted_at", null)
      .order("due_date", { nullsFirst: false })
      .limit(300);
    if (data.view === "mine") query = query.eq("assigned_to", context.userId);
    if (data.view === "today") query = query.eq("due_date", today);
    if (data.view === "overdue")
      query = query.lt("due_date", today).not("status", "in", "(completed,cancelled)");
    if (data.view === "upcoming")
      query = query.gt("due_date", today).not("status", "in", "(completed,cancelled)");
    const { data: items, error } = await query;
    if (error) throw new Error(error.message);
    return { items: items ?? [] };
  });

export const saveTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => taskSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, logActivity } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const { id, ...values } = data;
    const payload = {
      ...values,
      completed_at: values.status === "completed" ? new Date().toISOString() : null,
    };
    if (id) {
      const { error } = await context.supabase
        .from("tasks")
        .update(payload)
        .eq("id", id)
        .eq("organization_id", member.organization_id);
      if (error) throw new Error(error.message);
      await logActivity(context.supabase, member, context.userId, {
        case_id: values.case_id,
        client_id: values.client_id,
        kind: values.status === "completed" ? "task_completed" : "task_updated",
        summary: `Taak ${values.status === "completed" ? "afgerond" : "bijgewerkt"}: ${values.title}`,
      });
      return { id };
    }
    const { data: created, error } = await context.supabase
      .from("tasks")
      .insert({ ...payload, organization_id: member.organization_id, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, member, context.userId, {
      case_id: values.case_id,
      client_id: values.client_id,
      kind: "task_created",
      summary: `Taak aangemaakt: ${values.title}`,
    });
    return { id: created.id };
  });

export const addNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => noteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, logActivity } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const { error } = await context.supabase.from("case_notes").insert({
      ...data,
      organization_id: member.organization_id,
      author_id: context.userId,
    });
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, member, context.userId, {
      case_id: data.case_id,
      client_id: data.client_id,
      kind: "note_added",
      summary: data.is_internal ? "Interne notitie toegevoegd" : "Notitie voor klant toegevoegd",
      is_internal: data.is_internal,
    });
    return { ok: true as const };
  });

export const saveDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => documentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, logActivity } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    const { id, ...values } = data;
    if (id) {
      const { error } = await context.supabase
        .from("case_documents")
        .update({
          ...values,
          reviewed_by: context.userId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("organization_id", member.organization_id);
      if (error) throw new Error(error.message);
      await logActivity(context.supabase, member, context.userId, {
        case_id: values.case_id,
        client_id: values.client_id,
        kind: "document_updated",
        summary: `Document "${values.name}" → ${values.status}`,
        is_internal: false,
      });
      return { id };
    }
    const { data: created, error } = await context.supabase
      .from("case_documents")
      .insert({ ...values, organization_id: member.organization_id })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(context.supabase, member, context.userId, {
      case_id: values.case_id,
      client_id: values.client_id,
      kind: values.requested_from_client ? "document_requested" : "document_added",
      summary: `Document "${values.name}" ${values.requested_from_client ? "opgevraagd bij klant" : "toegevoegd"}`,
      is_internal: false,
    });
    return { id: created.id };
  });

export const softDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        table: z.enum(["clients", "cases", "tasks", "case_documents", "case_notes"]),
        id: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff, isManager } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    if ((data.table === "clients" || data.table === "cases") && !isManager(member.role)) {
      throw new Error("FORBIDDEN");
    }
    const { error } = await context.supabase
      .from(data.table)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("organization_id", member.organization_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
