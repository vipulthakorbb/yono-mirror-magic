import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type GameRow = {
  id: string;
  slug: string;
  title: string;
  img: string;
  content: string;
  position: number;
  source_url?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
};

export type SiteSettings = {
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  section_title: string | null;
  section_content: string | null;
  section_image: string | null;
};

// Aggressive edge caching: serve from Cloudflare's cache so the DB is barely
// touched even at millions of req/day. Admin mutations bump the cache key
// via `cacheBust` so changes show up within seconds.
//
// - s-maxage: how long the edge keeps the response fresh
// - stale-while-revalidate: how long the edge keeps serving stale while it
//   refreshes in the background — virtually zero origin load during a spike
function setEdgeCache(seconds = 1800, swr = 604800) {
  try {
    setResponseHeaders(
      new Headers({
        "Cache-Control": `public, max-age=60, s-maxage=${seconds}, stale-while-revalidate=${swr}`,
        "CDN-Cache-Control": `public, s-maxage=${seconds}, stale-while-revalidate=${swr}`,
      }),
    );
  } catch {
    // setResponseHeaders throws when called outside a server request (e.g.
    // during a client-side React Query refetch). Safe to ignore there.
  }
}

export const listGames = createServerFn({ method: "GET" }).handler(async () => {
  setEdgeCache(1800, 604800);
  const { data, error } = await supabaseAdmin
    .from("games")
    .select("id, slug, title, img, content, position, source_url, meta_title, meta_description")
    .order("position", { ascending: true })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as GameRow[];
});

export const getGameBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(300) }).parse(d),
  )
  .handler(async ({ data }) => {
    setEdgeCache(1800, 604800);
    const { data: game, error } = await supabaseAdmin
      .from("games")
      .select("id, slug, title, img, content, position, source_url, meta_title, meta_description")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!game) return null;

    const { data: relatedRaw } = await supabaseAdmin
      .from("games")
      .select("id, slug, title, img, position")
      .neq("slug", data.slug)
      .order("position", { ascending: true })
      .limit(500);
    const all = (relatedRaw ?? []) as Array<Pick<GameRow, "id" | "slug" | "title" | "img" | "position">>;
    const idx = all.findIndex((g) => g.position >= (game.position ?? 0));
    const start = Math.max(0, idx - 3);
    const related = all.slice(start, start + 6);

    return { game: game as GameRow, related };
  });

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  setEdgeCache(1800, 604800);
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("meta_title, meta_description, meta_keywords, section_title, section_content, section_image")
    .eq("id", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? {
    meta_title: null,
    meta_description: null,
    meta_keywords: null,
    section_title: null,
    section_content: null,
    section_image: null,
  }) as SiteSettings;
});