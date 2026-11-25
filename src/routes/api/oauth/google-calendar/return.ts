import { createFileRoute } from "@tanstack/react-router";

// Plain HTML landing page for the Google Calendar consent popup: it only relays the
// one-time code to the CRM window that opened it, which exchanges it server-side.
export const Route = createFileRoute("/api/oauth/google-calendar/return")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code") ?? "";
        const success = url.searchParams.get("success") === "true";
        const offline = url.searchParams.get("offline_access_allowed") === "false";
        const result =
          success && (code || offline)
            ? { ok: true, code: code || null }
            : { ok: false, code: null, error: url.searchParams.get("error") ?? "OAuth failed" };
        const esc = (s: string) =>
          s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        const json = JSON.stringify(result).replace(/</g, "\\u003c");
        const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Google Agenda</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:grid;place-items:center;min-height:90vh;color:#1d1d1f">
<p>${result.ok ? "Koppeling afgerond / Connexion terminée…" : "Mislukt / Échec: " + esc(result.error ?? "")}</p>
<script>
const r = ${json};
if (window.opener && window.opener !== window) {
  window.opener.postMessage({ type: r.ok ? "appUserConnectorOAuthComplete" : "appUserConnectorOAuthFailed", connectorId: "google_calendar", code: r.code }, window.location.origin);
}
window.close();
</script></body></html>`;
        return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
      },
    },
  },
});
