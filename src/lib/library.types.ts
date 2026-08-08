/** Shapes returned by the public library server functions. */
export interface LegislationRow {
  id: string;
  slug: string;
  theme: string;
  audiences: string[];
  effective_date: string | null;
  published_at: string | null;
  source_url: string | null;
  source_label: string | null;
  [key: string]: unknown;
}

export interface FormRow {
  id: string;
  slug: string;
  theme: string;
  authority: string;
  audiences: string[];
  sort_order: number;
  official_url: string | null;
  official_label: string | null;
  checklist: Record<string, string[]>;
  [key: string]: unknown;
}
