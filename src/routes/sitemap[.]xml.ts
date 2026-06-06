import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { INDEXABLE_GAME_SLUGS } from "@/lib/indexable";

const BASE_URL = "https://royalyono.com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { data: games } = await supabaseAdmin
          .from("games")
          .select("slug, updated_at")
          .order("position", { ascending: true });

        const entries: Array<{ path: string; lastmod?: string; changefreq?: string; priority?: string }> = [
          { path: "/", changefreq: "daily", priority: "1.0" },
        ];

        for (const g of games ?? []) {
          if (!INDEXABLE_GAME_SLUGS.has(g.slug)) continue;
          entries.push({
            path: `/games/${g.slug}`,
            lastmod: g.updated_at ? new Date(g.updated_at).toISOString() : undefined,
            changefreq: "weekly",
            priority: "0.8",
          });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
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
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});