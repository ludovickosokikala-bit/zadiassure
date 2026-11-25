import { queryOptions } from "@tanstack/react-query";
import { getFoundation } from "@/lib/foundation.functions";
export const foundationQuery = () =>
  queryOptions({ queryKey: ["crm-foundation"], queryFn: () => getFoundation(), staleTime: 0 });
export type Foundation = Awaited<ReturnType<typeof getFoundation>>;
export type Client = Foundation["clients"][number];
export type Dossier = Foundation["dossiers"][number];
export type TimelineEntry = Foundation["timeline"][number];
export function crmHead(title: string) {
  return {
    meta: [
      { title: `${title} — ZADIASSURE CRM` },
      { name: "description", content: `${title} in het beveiligde ZADIASSURE CRM.` },
      { property: "og:title", content: `${title} — ZADIASSURE CRM` },
      { property: "og:description", content: `${title} in het beveiligde ZADIASSURE CRM.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  };
}
