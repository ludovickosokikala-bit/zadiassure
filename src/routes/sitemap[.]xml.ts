import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { dictionaries } from "@/i18n";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/voor-wie", changefreq: "monthly", priority: "0.9" },
          { path: "/aanpak/complexiteit", changefreq: "monthly", priority: "0.7" },
          { path: "/aanpak/oplossing", changefreq: "monthly", priority: "0.7" },
          { path: "/aanpak/autonomie", changefreq: "monthly", priority: "0.7" },
          { path: "/begeleiding", changefreq: "monthly", priority: "0.9" },
          ...dictionaries.nl.servicesSection.items.map((s) => ({
            path: `/begeleiding/${s.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          { path: "/accompagnement-budgetaire-suivi-dettes", changefreq: "monthly", priority: "0.9" },
          { path: "/over-zadiassure", changefreq: "monthly", priority: "0.7" },
          { path: "/partners", changefreq: "monthly", priority: "0.7" },
          { path: "/kenniscentrum", changefreq: "weekly", priority: "0.8" },
          ...dictionaries.nl.insightsSection.articles.map((a) => ({
            path: `/kenniscentrum/${a.slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
          })),
          { path: "/wetgeving", changefreq: "weekly", priority: "0.8" },
          { path: "/documenten", changefreq: "weekly", priority: "0.8" },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.9" },
          { path: "/privacybeleid", changefreq: "yearly", priority: "0.3" },
          { path: "/algemene-voorwaarden", changefreq: "yearly", priority: "0.3" },
          { path: "/cookiebeleid", changefreq: "yearly", priority: "0.3" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
