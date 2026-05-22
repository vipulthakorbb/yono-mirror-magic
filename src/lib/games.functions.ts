import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type GameRow = {
  id: string;
  slug: string;
  title: string;
  img: string;
  content: string;
  position: number;
};

export const listGames = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("games")
    .select("id, slug, title, img, content, position")
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
    const { data: game, error } = await supabaseAdmin
      .from("games")
      .select("id, slug, title, img, content, position")
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