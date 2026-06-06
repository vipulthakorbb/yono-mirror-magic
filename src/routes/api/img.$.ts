import { createFileRoute } from "@tanstack/react-router";

// Edge-cached image proxy. Game icons live in Supabase Storage; routing them
// through this Worker lets Cloudflare cache the bytes for a full year
// (immutable) so billions of repeat views never touch Supabase egress.
//
// Usage on the client: <img src="/img/game-icons/abc.png" />
// We only allow proxying from this project's Supabase storage host — never
// arbitrary URLs (SSRF protection).

export const Route = createFileRoute("/api/img/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = params._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Bad path", { status: 400 });
        }

        const base =
          process.env.SUPABASE_URL ||
          (process.env.VITE_SUPABASE_URL as string | undefined);
        if (!base) return new Response("Misconfigured", { status: 500 });

        const upstream = `${base.replace(/\/$/, "")}/storage/v1/object/public/${path}`;
        // Optional on-the-fly resize via Cloudflare Image Resizing.
        // ?w=360&q=80 → cf.image { width: 360, quality: 80, format: "auto" }
        // If Image Resizing isn't enabled on the zone, Cloudflare just
        // serves the original bytes — same behaviour as before.
        const u = new URL(request.url);
        const w = Number(u.searchParams.get("w")) || 0;
        const q = Number(u.searchParams.get("q")) || 80;
        const cf: Record<string, unknown> = {
          cacheTtl: 31536000,
          cacheEverything: true,
        };
        if (w > 0 && w <= 2000) {
          cf.image = {
            width: w,
            quality: q,
            format: "auto",
            fit: "cover",
          };
        }
        const res = await fetch(upstream, { cf } as unknown as RequestInit);
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