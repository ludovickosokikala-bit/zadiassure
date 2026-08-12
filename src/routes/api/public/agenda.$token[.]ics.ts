import { createFileRoute } from "@tanstack/react-router";

function esc(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function stamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function dateOnly(day: string) {
  return day.replace(/-/g, "");
}

function fold(line: string) {
  if (line.length <= 73) return line;
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    parts.push(rest.slice(0, 73));
    rest = rest.slice(73);
  }
  parts.push(rest);
  return parts.join("\r\n ");
}

export const Route = createFileRoute("/api/public/agenda/$token.ics")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = String((params as { token?: string }).token ?? "");
        if (token.length < 32) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: feed } = await supabaseAdmin
          .from("calendar_feeds")
          .select("user_id, organization_id")
          .eq("token", token)
          .maybeSingle();
        if (!feed) return new Response("Not found", { status: 404 });

        const from = new Date(Date.now() - 60 * 86400000).toISOString();
        const fromDay = from.slice(0, 10);

        const [appointments, tasks] = await Promise.all([
          supabaseAdmin
            .from("appointments")
            .select("id, title, description, location, starts_at, ends_at, all_day, status, updated_at")
            .eq("organization_id", feed.organization_id)
            .eq("assigned_to", feed.user_id)
            .is("deleted_at", null)
            .gte("starts_at", from)
            .limit(1000),
          supabaseAdmin
            .from("tasks")
            .select("id, title, description, due_date, status, updated_at")
            .eq("organization_id", feed.organization_id)
            .eq("assigned_to", feed.user_id)
            .is("deleted_at", null)
            .not("due_date", "is", null)
            .gte("due_date", fromDay)
            .limit(1000),
        ]);

        const now = stamp(new Date().toISOString());
        const lines = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//ZADIASSURE//CRM Agenda//NL",
          "CALSCALE:GREGORIAN",
          "METHOD:PUBLISH",
          "X-WR-CALNAME:ZADIASSURE",
          "X-WR-TIMEZONE:Europe/Brussels",
        ];

        for (const a of appointments.data ?? []) {
          lines.push("BEGIN:VEVENT");
          lines.push(`UID:appointment-${a.id}@zadiassure`);
          lines.push(`DTSTAMP:${now}`);
          lines.push(`LAST-MODIFIED:${stamp(a.updated_at ?? new Date().toISOString())}`);
          if (a.all_day) {
            lines.push(`DTSTART;VALUE=DATE:${dateOnly(a.starts_at.slice(0, 10))}`);
            const end = new Date(new Date(a.ends_at).getTime() + 86400000).toISOString().slice(0, 10);
            lines.push(`DTEND;VALUE=DATE:${dateOnly(end)}`);
          } else {
            lines.push(`DTSTART:${stamp(a.starts_at)}`);
            lines.push(`DTEND:${stamp(a.ends_at)}`);
          }
          lines.push(fold(`SUMMARY:${esc(a.title)}`));
          if (a.location) lines.push(fold(`LOCATION:${esc(a.location)}`));
          if (a.description) lines.push(fold(`DESCRIPTION:${esc(a.description)}`));
          lines.push(`STATUS:${a.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`);
          lines.push("END:VEVENT");
        }

        for (const t of tasks.data ?? []) {
          if (!t.due_date) continue;
          const end = new Date(new Date(`${t.due_date}T00:00:00Z`).getTime() + 86400000)
            .toISOString()
            .slice(0, 10);
          lines.push("BEGIN:VEVENT");
          lines.push(`UID:task-${t.id}@zadiassure`);
          lines.push(`DTSTAMP:${now}`);
          lines.push(`DTSTART;VALUE=DATE:${dateOnly(t.due_date)}`);
          lines.push(`DTEND;VALUE=DATE:${dateOnly(end)}`);
          lines.push(fold(`SUMMARY:${esc(`[Taak] ${t.title}`)}`));
          if (t.description) lines.push(fold(`DESCRIPTION:${esc(t.description)}`));
          lines.push("END:VEVENT");
        }

        lines.push("END:VCALENDAR");

        return new Response(lines.join("\r\n"), {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
