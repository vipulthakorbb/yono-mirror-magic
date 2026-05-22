import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);

const GameInput = z.object({
  title: z.string().trim().min(1).max(300),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  img: z.string().trim().url().max(2000).optional().or(z.literal("")),
  content: z.string().max(500000).default(""),
  position: z.number().int().min(0).max(100000).optional(),
  source_url: z.string().trim().url().max(2000).optional().or(z.literal("")),
});

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { count: adminCount } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    const { data: mine } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    return {
      userId,
      isAdmin: !!mine,
      anyAdminExists: (adminCount ?? 0) > 0,
    };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("An admin already exists.");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminCreateGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => GameInput.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertAdmin(userId);
    const slug = data.slug || slugify(data.title);
    if (!slug) throw new Error("Could not derive slug from title");

    // Auto-scrape content / image from source_url when provided.
    let img = data.img || "";
    let content = data.content ?? "";
    if (data.source_url) {
      const scraped = await scrapeUrl(data.source_url);
      content = scraped.content || content;
      if (!img) img = scraped.img;
    }
    if (!img) throw new Error("Please upload an image or provide a source link with an og:image.");

    const { count } = await supabaseAdmin
      .from("games")
      .select("id", { count: "exact", head: true });
    const position = data.position ?? count ?? 0;
    const { data: row, error } = await supabaseAdmin
      .from("games")
      .insert({
        title: data.title,
        slug,
        img,
        content,
        source_url: data.source_url || null,
        position,
      })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({ id: z.string().uuid() })
      .merge(GameInput.partial())
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertAdmin(userId);
    const { id, ...rest } = data;
    const patch: {
      title?: string;
      slug?: string;
      img?: string;
      content?: string;
      position?: number;
      source_url?: string | null;
    } = {};
    if (rest.title !== undefined) patch.title = rest.title;
    if (rest.slug !== undefined) patch.slug = rest.slug;
    if (rest.position !== undefined) patch.position = rest.position;

    // If a source_url is provided on save, always re-scrape and refresh content
    // (and image if no manual image override is being saved).
    if (rest.source_url !== undefined) {
      const url = rest.source_url || "";
      patch.source_url = url || null;
      if (url) {
        const scraped = await scrapeUrl(url);
        patch.content = scraped.content;
        if (!rest.img) patch.img = scraped.img;
      }
    }
    if (rest.img) patch.img = rest.img;
    // Only allow manual content override when explicitly passed AND no source_url
    // refresh happened in this save.
    if (rest.content !== undefined && patch.content === undefined) {
      patch.content = rest.content;
    }

    const { error } = await supabaseAdmin
      .from("games")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertAdmin(userId);
    const { error } = await supabaseAdmin.from("games").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetGame = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertAdmin(userId);
    const { data: row, error } = await supabaseAdmin
      .from("games")
      .select("id, slug, title, img, content, position, source_url")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminReorderGames = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        order: z
          .array(z.object({ id: z.string().uuid(), position: z.number().int().min(0).max(100000) }))
          .min(1)
          .max(1000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertAdmin(userId);
    // Update each row's position. Small batches keep it simple and reliable.
    for (const { id, position } of data.order) {
      const { error } = await supabaseAdmin
        .from("games")
        .update({ position })
        .eq("id", id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const adminUpdateSlug = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        slug: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertAdmin(userId);
    const { error } = await supabaseAdmin
      .from("games")
      .update({ slug: data.slug })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, slug: data.slug };
  });

// ---------- Auto-scrape a source URL to pre-fill a new game ----------

function pick(re: RegExp, html: string): string | undefined {
  const m = html.match(re);
  return m?.[1]?.trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function absolutize(url: string, base: string): string {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

function extractMain(html: string): string {
  // Strip <script>, <style>, <noscript>
  let h = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Try <article>, then <main>, then a content-ish div, else body
  const article = h.match(/<article[\s\S]*?<\/article>/i)?.[0];
  if (article) return article;
  const main = h.match(/<main[\s\S]*?<\/main>/i)?.[0];
  if (main) return main;
  const body = h.match(/<body[\s\S]*?<\/body>/i)?.[0];
  return body ?? h;
}

async function scrapeUrl(url: string): Promise<{ title: string; img: string; content: string }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; YonoBot/1.0; +https://yono-mirror-magic.lovable.app)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch URL (${res.status} ${res.statusText})`);
  }
  const html = await res.text();
  const ogTitle =
    pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i, html) ||
    pick(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i, html);
  const titleTag = pick(/<title[^>]*>([^<]+)<\/title>/i, html);
  const title = decodeEntities(ogTitle || titleTag || "").slice(0, 300);
  const ogImg =
    pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i, html) ||
    pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i, html);
  let img = ogImg || pick(/<img[^>]+src=["']([^"']+)["']/i, html) || "";
  if (img) img = absolutize(img, url);
  const content = extractMain(html);
  return { title, img, content };
}

export const adminScrapeGameUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ url: z.string().trim().url().max(2000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertAdmin(userId);

    const res = await fetch(data.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; YonoBot/1.0; +https://yono-mirror-magic.lovable.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch URL (${res.status} ${res.statusText})`);
    }
    const html = await res.text();

    const ogTitle =
      pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i, html) ||
      pick(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i, html);
    const titleTag = pick(/<title[^>]*>([^<]+)<\/title>/i, html);
    const title = decodeEntities(ogTitle || titleTag || "").slice(0, 300);

    const ogImg =
      pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i, html) ||
      pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i, html);
    let img = ogImg || "";
    if (!img) {
      // First substantial <img>
      const firstImg = pick(/<img[^>]+src=["']([^"']+)["']/i, html);
      if (firstImg) img = firstImg;
    }
    if (img) img = absolutize(img, data.url);

    const content = extractMain(html);

    if (!title) throw new Error("Could not detect a page title");
    return { title, img, content };
  });

export const adminCreateGameFromUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ url: z.string().trim().url().max(2000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertAdmin(userId);

    // Reuse the scrape logic by calling the underlying fetch inline
    const res = await fetch(data.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; YonoBot/1.0; +https://yono-mirror-magic.lovable.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch URL (${res.status} ${res.statusText})`);
    }
    const html = await res.text();
    const ogTitle =
      pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i, html) ||
      pick(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i, html);
    const titleTag = pick(/<title[^>]*>([^<]+)<\/title>/i, html);
    const title = decodeEntities(ogTitle || titleTag || "").slice(0, 300);
    if (!title) throw new Error("Could not detect a page title");
    const ogImg =
      pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i, html) ||
      pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i, html);
    let img = ogImg || pick(/<img[^>]+src=["']([^"']+)["']/i, html) || "";
    if (img) img = absolutize(img, data.url);
    if (!img) throw new Error("Could not detect a page image (og:image)");
    const content = extractMain(html);

    const slug = slugify(title);
    if (!slug) throw new Error("Could not derive slug from title");

    const { count } = await supabaseAdmin
      .from("games")
      .select("id", { count: "exact", head: true });

    const { data: row, error } = await supabaseAdmin
      .from("games")
      .insert({
        title,
        slug,
        img,
        content,
        position: count ?? 0,
      })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });