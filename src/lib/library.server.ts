import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Server-only publishable client for public reads of the knowledge library
 * (legislation updates and downloadable/fillable request forms).
 * RLS applies as `anon`, so only published rows are returned.
 */
export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const LEGISLATION_COLUMNS =
  "id, slug, theme, audiences, effective_date, published_at, source_url, source_label, title_nl, title_fr, title_en, summary_nl, summary_fr, summary_en, changes_nl, changes_fr, changes_en, action_nl, action_fr, action_en";

export const FORM_COLUMNS =
  "id, slug, theme, authority, audiences, sort_order, official_url, official_label, title_nl, title_fr, title_en, description_nl, description_fr, description_en, who_nl, who_fr, who_en, checklist";
