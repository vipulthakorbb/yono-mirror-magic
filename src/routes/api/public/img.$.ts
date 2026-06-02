import { createFileRoute } from "@tanstack/react-router";

// Edge-cached public image proxy. Game icons live in Supabase Storage; routing
// them through this Worker lets Cloudflare cache the bytes for a full year
// (immutable) so billions of repeat views never touch Supabase egress.
//
// Lives under /api/public/ so it bypasses the preview auth bridge — these
// images are public assets. We still only allow proxying from this project's
// Supabase storage host (SSRF protection).

export const Route = createFileRoute("/api/public/img/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Bad path", { status: 400 });
        }

        const base =
          process.env.SUPABASE_URL ||
          (process.env.VITE_SUPABASE_URL as string | undefined);
        if (!base) return new Response("Misconfigured", { status: 500 });

        const upstream = `${base.replace(/\/$/, "")}/storage/v1/object/public/${path}`;
        const res = await fetch(upstream, {
          cf: { cacheTtl: 31536000, cacheEverything: true },
        } as unknown as RequestInit);
        if (!res.ok) {
          return new Response("Upstream error", { status: res.status });
        }

        const headers = new Headers();
        const ct = res.headers.get("content-type");
        if (ct) headers.set("Content-Type", ct);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        headers.set("CDN-Cache-Control", "public, max-age=31536000, immutable");
        headers.set("Access-Control-Allow-Origin", "*");
        return new Response(res.body, { status: 200, headers });
      },
    },
  },
});