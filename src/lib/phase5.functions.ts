import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { REQUEST_TTL_DAYS, letterAnalysisSchema, type RequestItem } from "./phase5Core";

type Ctx = { supabase: import("./crm.server").Db; userId: string };
async function member(ctx: Ctx) {
  const { foundationMember } = await import("./foundation.server");
  return foundationMember(ctx.supabase, ctx.userId);
}
const uuid = z.string().uuid();
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();
const ok = (r: { error: unknown }) => {
  if (r.error) throw new Error("SAVE_FAILED");
};

export const getPhase5Data = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const m = await member(context);
    const org = m.organization_id;
    const db = context.supabase;
    const [letters, tasks, requests, documents, inbox, mandates] = await Promise.all([
      db.from("crm_letters").select("*").eq("organization_id", org).order("created_at", { ascending: false }).limit(5000),
      db.from("crm_tasks").select("*").eq("organization_id", org).order("due_date", { ascending: true, nullsFirst: false }).limit(10000),
      db.from("crm_doc_requests").select("id,client_id,dossier_id,items,status,language,expires_at,reminder_sent_at,created_at").eq("organization_id", org).order("created_at", { ascending: false }).limit(5000),
      db.from("crm_documents").select("*").eq("organization_id", org).order("created_at", { ascending: false }).limit(10000),
      db.from("form_submissions").select("id,template_slug,full_name,email,phone,language,audience,message,answers,status,created_at,crm_client_id").order("created_at", { ascending: false }).limit(1000),
      db.from("mandates").select("id,applicant_email,applicant_name,holder_name,status,signed_at,starts_on,ends_on,created_at").is("deleted_at", null).limit(2000),
    ]);
    if (letters.error || tasks.error || requests.error || documents.error) throw new Error("LOAD_FAILED");
    return {
      organizationId: org,
      isAdmin: m.foundation_role === "admin",
      letters: letters.data,
      tasks: tasks.data,
      requests: requests.data.map((r) => ({ ...r, items: (r.items as RequestItem[]) ?? [] })),
      documents: documents.data,
      inbox: inbox.data ?? [],
      mandates: mandates.data ?? [],
    };
  });

/* ---------- Letters ---------- */
async function downloadFiles(db: Ctx["supabase"], paths: string[], mimes: string[]) {
  return Promise.all(
    paths.map(async (p, i) => {
      const { data, error } = await db.storage.from("crm-documents").download(p);
      if (error || !data) throw new Error("LOAD_FAILED");
      return { name: p.split("/").pop() ?? "file", mime: mimes[i] || data.type, base64: Buffer.from(await data.arrayBuffer()).toString("base64") };
    }),
  );
}

export const addLetter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ client_id: uuid, dossier_id: uuid.nullable(), title: z.string().trim().max(200), paths: z.array(z.string().max(300)).min(1).max(10), mimes: z.array(z.string().max(100)).max(10) }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const org = m.organization_id;
    if (data.paths.some((p) => !p.startsWith(`${org}/${data.client_id}/`))) throw new Error("FORBIDDEN");
    const ins = await context.supabase.from("crm_letters").insert({ organization_id: org, client_id: data.client_id, dossier_id: data.dossier_id, title: data.title, file_paths: data.paths, mime_types: data.mimes, created_by: context.userId }).select("id").single();
    ok(ins);
    await context.supabase.from("crm_timeline").insert({ organization_id: org, client_id: data.client_id, dossier_id: data.dossier_id, kind: "letter_added", detail: { title: data.title, pages: data.paths.length } });
    return { id: ins.data!.id };
  });

export const analyzeLetterFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: uuid, uiLanguage: z.enum(["nl", "fr"]) }).parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const db = context.supabase;
    const { data: letter } = await db.from("crm_letters").select("*").eq("id", data.id).eq("organization_id", m.organization_id).single();
    if (!letter) throw new Error("NOT_FOUND");
    const { data: client } = await db.from("crm_clients").select("preferred_language").eq("id", letter.client_id).single();
    const { analyzeLetter, aiErrorCode } = await import("./letters.server");
    try {
      const files = await downloadFiles(db, letter.file_paths, letter.mime_types);
      const clientLang = client?.preferred_language === "fr" ? "fr" : client?.preferred_language === "en" ? "en" : "nl";
      const analysis = await analyzeLetter(files, [clientLang, data.uiLanguage]);
      ok(await db.from("crm_letters").update({ analysis, deadline: analysis.deadline, analysis_error: "", title: letter.title || analysis.sender, updated_at: new Date().toISOString() }).eq("id", letter.id));
      return { ok: true as const };
    } catch (e) {
      const code = aiErrorCode(e);
      await db.from("crm_letters").update({ analysis_error: code }).eq("id", letter.id);
      return { ok: false as const, error: code };
    }
  });

export const draftLetterReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: uuid, instructions: z.string().trim().max(1000) }).parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const db = context.supabase;
    const { data: letter } = await db.from("crm_letters").select("*").eq("id", data.id).eq("organization_id", m.organization_id).single();
    if (!letter?.analysis) throw new Error("NOT_FOUND");
    const { data: c } = await db.from("crm_clients").select("*").eq("id", letter.client_id).single();
    const { displayClient } = await import("./foundation.schemas");
    const { draftReply, aiErrorCode } = await import("./letters.server");
    try {
      const reply = await draftReply(letterAnalysisSchema.parse(letter.analysis), { name: c ? displayClient(c) : "", address: c?.address ?? "" }, data.instructions);
      ok(await db.from("crm_letters").update({ reply_draft: reply, updated_at: new Date().toISOString() }).eq("id", letter.id));
      await db.from("crm_timeline").insert({ organization_id: m.organization_id, client_id: letter.client_id, dossier_id: letter.dossier_id, kind: "letter_reply", detail: { title: letter.title } });
      return { ok: true as const, reply };
    } catch (e) {
      return { ok: false as const, error: aiErrorCode(e) };
    }
  });

export const saveLetterReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: uuid, reply: z.string().max(20000) }).parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    ok(await context.supabase.from("crm_letters").update({ reply_draft: data.reply }).eq("id", data.id).eq("organization_id", m.organization_id));
    return { ok: true };
  });

/* ---------- Documents ---------- */
export const addDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ client_id: uuid, dossier_id: uuid.nullable(), name: z.string().trim().min(1).max(250), path: z.string().max(300), mime: z.string().max(100), size: z.number().int().min(0) }).parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    if (!data.path.startsWith(`${m.organization_id}/${data.client_id}/`)) throw new Error("FORBIDDEN");
    ok(await context.supabase.from("crm_documents").insert({ organization_id: m.organization_id, client_id: data.client_id, dossier_id: data.dossier_id, name: data.name, storage_path: data.path, mime_type: data.mime, size_bytes: data.size, category: "other", uploaded_by: context.userId, uploaded_by_label: m.full_name || m.email }));
    return { ok: true };
  });

export const createDocRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ client_id: uuid, dossier_id: uuid.nullable(), items: z.array(z.object({ label: z.string().trim().min(1).max(200), imm_document_id: uuid.nullable() })).min(1).max(30) }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const db = context.supabase;
    const { data: client } = await db.from("crm_clients").select("*").eq("id", data.client_id).eq("organization_id", m.organization_id).single();
    if (!client) throw new Error("NOT_FOUND");
    if (!client.email) return { ok: false as const, error: "NO_EMAIL" };
    const { newToken, sendRequestEmail, clientLang } = await import("./reminders.server");
    const { getRequest } = await import("@tanstack/react-start/server");
    const { token, hash } = newToken();
    const items: RequestItem[] = data.items.map((i) => ({ id: crypto.randomUUID(), label: i.label, imm_document_id: i.imm_document_id, received: false }));
    const expires_at = new Date(Date.now() + REQUEST_TTL_DAYS * 86400000).toISOString();
    const ins = await db.from("crm_doc_requests").insert({ organization_id: m.organization_id, client_id: data.client_id, dossier_id: data.dossier_id, token_hash: hash, items, language: clientLang(client.preferred_language), expires_at, created_by: context.userId }).select("*").single();
    ok(ins);
    const immIds = items.map((i) => i.imm_document_id).filter((x): x is string => !!x);
    if (immIds.length) await db.from("crm_imm_documents").update({ status: "requested" }).in("id", immIds).eq("status", "missing");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    try {
      const origin = new URL(getRequest().url).origin;
      const sent = await sendRequestEmail(supabaseAdmin, { ...ins.data!, items }, client, token, (await import("./reminders.server")).publicOrigin(origin), false);
      return { ok: true as const, sent };
    } catch (e) {
      console.error("[docrequest] email failed", e);
      return { ok: false as const, error: "EMAIL_FAILED" };
    }
  });

export const sendClientReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ client_id: uuid }).parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const { getRequest } = await import("@tanstack/react-start/server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { runReminders } = await import("./reminders.server");
    return runReminders(supabaseAdmin, { clientId: data.client_id, organizationId: m.organization_id, origin: new URL(getRequest().url).origin });
  });

export const setClientReminders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ client_id: uuid, on: z.boolean() }).parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    ok(await context.supabase.from("crm_clients").update({ email_reminders: data.on }).eq("id", data.client_id).eq("organization_id", m.organization_id));
    return { ok: true };
  });

/* ---------- Tasks ---------- */
export const saveTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ id: uuid.optional(), title: z.string().trim().min(1).max(300), due_date: day, assignee_id: uuid.nullable(), client_id: uuid.nullable(), dossier_id: uuid.nullable(), letter_id: uuid.nullable().default(null) }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const m = await member(context);
    const { id, ...f } = data;
    ok(id
      ? await context.supabase.from("crm_tasks").update(f).eq("id", id).eq("organization_id", m.organization_id)
      : await context.supabase.from("crm_tasks").insert({ ...f, organization_id: m.organization_id, created_by: context.userId }));
    return { ok: true };
  });
export const setTaskStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: uuid, status: z.enum(["open", "done"]) }).parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    ok(await context.supabase.from("crm_tasks").update({ status: data.status }).eq("id", data.id).eq("organization_id", m.organization_id));
    return { ok: true };
  });
export const deleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: uuid }).parse(v))
  .handler(async ({ data, context }) => {
    const m = await member(context);
    ok(await context.supabase.from("crm_tasks").delete().eq("id", data.id).eq("organization_id", m.organization_id));
    return { ok: true };
  });

/* ---------- Inbox ---------- */
export const setInboxStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: uuid, status: z.enum(["new", "in_progress", "handled", "archived"]), crm_client_id: uuid.nullable().optional() }).parse(v))
  .handler(async ({ data, context }) => {
    await member(context);
    const patch: { status: string; crm_client_id?: string | null } = { status: data.status };
    if (data.crm_client_id !== undefined) patch.crm_client_id = data.crm_client_id;
    ok(await context.supabase.from("form_submissions").update(patch).eq("id", data.id));
    return { ok: true };
  });

/* ---------- Reports (admin) ---------- */
export const getReportData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const m = await member(context);
    if (m.foundation_role !== "admin") throw new Error("FORBIDDEN");
    const org = m.organization_id;
    const db = context.supabase;
    const [dossiers, clients, debts] = await Promise.all([
      db.from("crm_dossiers").select("id,service,status,start_date,updated_at").eq("organization_id", org).limit(20000),
      db.from("crm_clients").select("id,created_at").eq("organization_id", org).limit(20000),
      db.from("crm_debts").select("original_amount,outstanding_amount").eq("organization_id", org).limit(20000),
    ]);
    if (dossiers.error || clients.error || debts.error) throw new Error("LOAD_FAILED");
    return { dossiers: dossiers.data, clients: clients.data, debts: debts.data };
  });
