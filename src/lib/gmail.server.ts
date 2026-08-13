export const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";
export const GMAIL_CONNECTOR_ID = "google_mail";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

export interface MailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
  /** true when the message was sent by the connected mailbox. */
  outgoing: boolean;
}

type GmailHeader = { name?: string; value?: string };

function header(headers: GmailHeader[], name: string) {
  return headers.find((h) => (h.name ?? "").toLowerCase() === name.toLowerCase())?.value ?? "";
}

export function toMailMessage(raw: {
  id?: string;
  threadId?: string;
  snippet?: string;
  labelIds?: string[];
  payload?: { headers?: GmailHeader[] };
}): MailMessage {
  const headers = raw.payload?.headers ?? [];
  return {
    id: raw.id ?? "",
    threadId: raw.threadId ?? "",
    from: header(headers, "From"),
    to: header(headers, "To"),
    subject: header(headers, "Subject"),
    date: header(headers, "Date"),
    snippet: (raw.snippet ?? "").replace(/&#39;/g, "'").replace(/&amp;/g, "&"),
    outgoing: (raw.labelIds ?? []).includes("SENT"),
  };
}

/** Base64url-encoded RFC 2822 message for the Gmail send endpoint. */
export function buildRawEmail(input: {
  to: string;
  subject: string;
  body: string;
  inReplyTo?: string;
}) {
  const lines = [
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "MIME-Version: 1.0",
  ];
  if (input.inReplyTo) {
    lines.push(`In-Reply-To: ${input.inReplyTo}`, `References: ${input.inReplyTo}`);
  }
  lines.push("", input.body);
  return Buffer.from(lines.join("\r\n"), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
