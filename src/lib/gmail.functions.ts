import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const emailQuerySchema = z.object({
  email: z.string().trim().email().max(255),
  max: z.number().int().min(1).max(30).default(12),
});

const sendSchema = z.object({
  to: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20000),
  in_reply_to: z.string().trim().max(300).default(""),
  client_id: z.string().uuid().nullable().default(null),
  case_id: z.string().uuid().nullable().default(null),
});

/** Whether the signed-in staff member has linked their work Gmail. */
export const gmailStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getConnection } = await import("./appUserConnections.server");
    const { GMAIL_CONNECTOR_ID } = await import("./gmail.server");
    const conn = await getConnection(context.userId, GMAIL_CONNECTOR_ID);
    return { connected: Boolean(conn), email: conn?.accountEmail ?? "" };
  });

/** Starts the per-user Google consent flow and returns the popup URL. */
export const startGmailConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientApiKey = process.env["GOOGLE_MAIL_APP_USER_CONNECTOR_CLIENT_API_KEY"];
    if (!clientApiKey) throw new Error("GMAIL_CLIENT_NOT_CONFIGURED");
    const request = getRequest();
    if (!request) throw new Error("OAuth must start from an app request.");

    const { authorizeAppUserOAuth } = await import("@/integrations/lovable/appUserConnector");
    const { getConnectionKeyForUser } = await import("./appUserConnections.server");
    const { GATEWAY_BASE_URL, GMAIL_CONNECTOR_ID, GMAIL_SCOPES } = await import("./gmail.server");

    const existing = await getConnectionKeyForUser(context.userId, GMAIL_CONNECTOR_ID);
    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: GMAIL_CONNECTOR_ID,
      appUserId: context.userId,
      clientAPIKey: clientApiKey,
      returnUrl: new URL("/oauth/google/return", request.url).toString(),
      ...(existing ? { connectionAPIKey: existing } : {}),
      credentialsConfiguration: { scopes: GMAIL_SCOPES },
    });
    return { authorizationUrl };
  });

/** Exchanges the one-time OAuth code and stores the encrypted connection key. */
export const completeGmailConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ code: z.string().min(8).max(400) }).parse(input))
  .handler(async ({ data, context }) => {
    const { exchangeAppUserOAuthCode, callAsAppUser } = await import(
      "@/integrations/lovable/appUserConnector"
    );
    const { saveConnectionKeyForUser } = await import("./appUserConnections.server");
    const { GATEWAY_BASE_URL, GMAIL_CONNECTOR_ID } = await import("./gmail.server");

    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(
      GATEWAY_BASE_URL,
      data.code,
    );
    if (connectorId !== GMAIL_CONNECTOR_ID) throw new Error("WRONG_CONNECTOR");

    let email = "";
    const profile = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey,
      connectorId: GMAIL_CONNECTOR_ID,
      path: "/gmail/v1/users/me/profile",
    });
    if (profile.ok) {
      email = ((await profile.json()) as { emailAddress?: string }).emailAddress ?? "";
    }

    await saveConnectionKeyForUser(context.userId, connectorId, connectionAPIKey, email);
    return { ok: true, email };
  });

export const disconnectGmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { disconnectAppUser } = await import("@/integrations/lovable/appUserConnector");
    const { getConnectionKeyForUser, deleteConnectionForUser } = await import(
      "./appUserConnections.server"
    );
    const { GATEWAY_BASE_URL, GMAIL_CONNECTOR_ID } = await import("./gmail.server");
    const key = await getConnectionKeyForUser(context.userId, GMAIL_CONNECTOR_ID);
    if (key) {
      await disconnectAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey: key,
        connectorId: GMAIL_CONNECTOR_ID,
      });
      await deleteConnectionForUser(context.userId, GMAIL_CONNECTOR_ID);
    }
    return { ok: true };
  });

/** All correspondence with one client address — our messages and their replies. */
export const listClientMail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => emailQuerySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./crm.server");
    await requireStaff(context.supabase, context.userId);

    const { callAsAppUser } = await import("@/integrations/lovable/appUserConnector");
    const { getConnection } = await import("./appUserConnections.server");
    const { GATEWAY_BASE_URL, GMAIL_CONNECTOR_ID, toMailMessage } = await import("./gmail.server");

    const conn = await getConnection(context.userId, GMAIL_CONNECTOR_ID);
    if (!conn) return { connected: false as const, messages: [] };

    const query = encodeURIComponent(`from:${data.email} OR to:${data.email}`);
    const list = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey: conn.connectionAPIKey,
      connectorId: GMAIL_CONNECTOR_ID,
      path: `/gmail/v1/users/me/messages?maxResults=${data.max}&q=${query}`,
    });
    if (!list.ok) {
      const body = await list.text();
      throw new Error(`Gmail request failed [${list.status}]: ${body}`);
    }
    const ids = (((await list.json()) as { messages?: { id: string }[] }).messages ?? []).map(
      (m) => m.id,
    );

    const details = await Promise.all(
      ids.map(async (id) => {
        const res = await callAsAppUser({
          gatewayBaseUrl: GATEWAY_BASE_URL,
          connectionAPIKey: conn.connectionAPIKey,
          connectorId: GMAIL_CONNECTOR_ID,
          path: `/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date&metadataHeaders=Message-ID`,
        });
        if (!res.ok) return null;
        return toMailMessage(await res.json());
      }),
    );

    return {
      connected: true as const,
      mailbox: conn.accountEmail,
      messages: details.filter((m): m is NonNullable<typeof m> => Boolean(m)),
    };
  });

/** Sends a mail from the member's own work mailbox and logs it on the case/client. */
export const sendClientMail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => sendSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { requireStaff, logActivity } = await import("./crm.server");
    const member = await requireStaff(context.supabase, context.userId);

    const { callAsAppUser } = await import("@/integrations/lovable/appUserConnector");
    const { getConnection } = await import("./appUserConnections.server");
    const { GATEWAY_BASE_URL, GMAIL_CONNECTOR_ID, buildRawEmail } = await import("./gmail.server");

    const conn = await getConnection(context.userId, GMAIL_CONNECTOR_ID);
    if (!conn) throw new Error("GMAIL_NOT_CONNECTED");

    const res = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey: conn.connectionAPIKey,
      connectorId: GMAIL_CONNECTOR_ID,
      path: "/gmail/v1/users/me/messages/send",
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw: buildRawEmail({
            to: data.to,
            subject: data.subject,
            body: data.body,
            ...(data.in_reply_to ? { inReplyTo: data.in_reply_to } : {}),
          }),
        }),
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gmail send failed [${res.status}]: ${body}`);
    }

    await logActivity(context.supabase, member, context.userId, {
      case_id: data.case_id,
      client_id: data.client_id,
      kind: "email_sent",
      summary: `E-mail verzonden naar ${data.to}: ${data.subject}`,
      detail: { to: data.to, subject: data.subject },
    });
    return { ok: true };
  });
