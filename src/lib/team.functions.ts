import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { CRM_ROLE_KEYS, inviteSchema } from "./crm.schemas";

/** Team members plus pending invitations. Admin-only. */
export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff, isAdminRole } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    if (!isAdminRole(member.role)) return { isAdmin: false as const, members: [], invites: [] };

    const [members, invites] = await Promise.all([
      context.supabase
        .from("org_members")
        .select("id, user_id, full_name, email, role, active, created_at")
        .eq("organization_id", member.organization_id)
        .order("full_name"),
      context.supabase
        .from("org_invites")
        .select("id, email, full_name, role, token, status, expires_at, created_at")
        .eq("organization_id", member.organization_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);
    return {
      isAdmin: true as const,
      me: context.userId,
      members: members.data ?? [],
      invites: invites.data ?? [],
    };
  });

export const inviteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inviteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, isAdminRole } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    if (!isAdminRole(member.role)) throw new Error("FORBIDDEN");

    const { data: created, error } = await context.supabase
      .from("org_invites")
      .insert({
        organization_id: member.organization_id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        invited_by: context.userId,
      })
      .select("id, token")
      .single();
    if (error) throw new Error(error.message);
    return { id: created.id, token: created.token };
  });

export const revokeInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, isAdminRole } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    if (!isAdminRole(member.role)) throw new Error("FORBIDDEN");
    const { error } = await context.supabase
      .from("org_invites")
      .update({ status: "revoked" })
      .eq("id", data.id)
      .eq("organization_id", member.organization_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updateMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        role: z.enum(CRM_ROLE_KEYS).optional(),
        active: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff, isAdminRole } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    if (!isAdminRole(member.role)) throw new Error("FORBIDDEN");

    const patch: { role?: (typeof CRM_ROLE_KEYS)[number]; active?: boolean } = {};
    if (data.role) patch.role = data.role;
    if (typeof data.active === "boolean") patch.active = data.active;
    if (Object.keys(patch).length === 0) return { ok: true as const };

    const { data: target } = await context.supabase
      .from("org_members")
      .select("user_id")
      .eq("id", data.id)
      .eq("organization_id", member.organization_id)
      .maybeSingle();
    // Never let an admin lock themselves out of the workspace.
    if (target?.user_id === context.userId) throw new Error("SELF_UPDATE");

    const { error } = await context.supabase
      .from("org_members")
      .update(patch)
      .eq("id", data.id)
      .eq("organization_id", member.organization_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Reads a pending invitation for the signed-in user (matched on email). */
export const getInvite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().trim().min(8).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invite } = await supabaseAdmin
      .from("org_invites")
      .select("id, email, full_name, role, status, expires_at, organization_id")
      .eq("token", data.token)
      .maybeSingle();
    if (!invite || invite.status !== "pending" || new Date(invite.expires_at) < new Date()) {
      return { state: "invalid" as const };
    }
    const email = String((context.claims as { email?: string } | null)?.email ?? "").toLowerCase();
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("name")
      .eq("id", invite.organization_id)
      .maybeSingle();
    return {
      state: email === invite.email.toLowerCase() ? ("ready" as const) : ("wrong_email" as const),
      invite: { email: invite.email, full_name: invite.full_name, role: invite.role },
      organization: org?.name ?? "",
    };
  });

/** Creates the membership for the signed-in user based on the invitation. */
export const acceptInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().trim().min(8).max(120) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invite } = await supabaseAdmin
      .from("org_invites")
      .select("id, email, full_name, role, status, expires_at, organization_id, branch_id")
      .eq("token", data.token)
      .maybeSingle();
    if (!invite || invite.status !== "pending" || new Date(invite.expires_at) < new Date()) {
      return { ok: false as const, reason: "invalid" as const };
    }
    const email = String((context.claims as { email?: string } | null)?.email ?? "").toLowerCase();
    if (!email || email !== invite.email.toLowerCase()) {
      return { ok: false as const, reason: "wrong_email" as const };
    }

    const { data: existing } = await supabaseAdmin
      .from("org_members")
      .select("id")
      .eq("organization_id", invite.organization_id)
      .eq("user_id", context.userId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("org_members")
        .update({ role: invite.role, active: true })
        .eq("id", existing.id);
    } else {
      const { error } = await supabaseAdmin.from("org_members").insert({
        organization_id: invite.organization_id,
        user_id: context.userId,
        branch_id: invite.branch_id,
        role: invite.role,
        full_name: invite.full_name || email,
        email,
        active: true,
      });
      if (error) return { ok: false as const, reason: "invalid" as const };
    }

    await supabaseAdmin
      .from("org_invites")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", invite.id);
    return { ok: true as const };
  });

/** Default password for freshly created staff accounts. */
export const DEFAULT_STAFF_PASSWORD = "Zadiassure123";

/**
 * Creates a ready-to-use CRM account with the default password and an active
 * membership, so the member can sign in immediately and change the password
 * afterwards under Instellingen.
 */
export const createMemberAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inviteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, isAdminRole } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);
    if (!isAdminRole(member.role)) throw new Error("FORBIDDEN");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const created = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: DEFAULT_STAFF_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });

    let userId = created.data.user?.id ?? null;
    let existed = false;
    if (!userId) {
      const message = created.error?.message ?? "";
      if (!/already/i.test(message)) throw new Error(message || "CREATE_FAILED");
      existed = true;
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      userId =
        list?.users.find((u) => (u.email ?? "").toLowerCase() === data.email)?.id ?? null;
      if (!userId) throw new Error("USER_LOOKUP_FAILED");
    }

    const { data: existing } = await supabaseAdmin
      .from("org_members")
      .select("id")
      .eq("organization_id", member.organization_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("org_members")
        .update({ role: data.role, active: true, full_name: data.full_name || data.email })
        .eq("id", existing.id);
    } else {
      const { error } = await supabaseAdmin.from("org_members").insert({
        organization_id: member.organization_id,
        user_id: userId,
        role: data.role,
        full_name: data.full_name || data.email,
        email: data.email,
        active: true,
      });
      if (error) throw new Error(error.message);
    }

    return {
      ok: true as const,
      email: data.email,
      password: existed ? null : DEFAULT_STAFF_PASSWORD,
      existed,
    };
  });
