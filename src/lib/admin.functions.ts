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

// Extract the storage path from a public game-icons URL so we can delete it.
function extractStoragePath(url: string): string | null {
  const m = url.match(/\/storage\/v1\/object\/public\/game-icons\/(.+)$/);
  if (!m) return null;
  const raw = m[1].split("?")[0];
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

// ---------- Auto-generate description from title + source link ----------

function extractBonus(title: string): string {
  // Match ₹160, Rs 160, 160 bonus, 65% etc.
  const m =
    title.match(/(?:₹|rs\.?\s*|inr\s*)\s*(\d{2,5})/i) ||
    title.match(/(\d{2,4})\s*%?\s*(?:bonus|signup|welcome)/i) ||
    title.match(/get\s*(\d{2,4})/i);
  return m?.[1] ? `₹${m[1]}` : "₹100";
}

function cleanName(title: string): string {
  // Drop everything after the first colon, pipe or dash to get a clean name.
  return title.split(/[:|\-–]/)[0].trim() || title.trim();
}

function generateDescription(title: string, sourceUrl?: string | null): string {
  const name = cleanName(title);
  const bonus = extractBonus(title);
  const safeUrl = sourceUrl && sourceUrl.trim() ? sourceUrl.trim() : "#";
  const cta = sourceUrl
    ? `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer nofollow" style="align-items:center;background:#007bff;border-radius:12px;box-shadow:rgba(0,123,255,0.3) 0 5px 15px;color:#fff;display:inline-flex;font-size:16px;font-weight:bold;justify-content:center;padding:14px 36px;text-decoration:none;margin:18px 0;">DOWNLOAD ${name.toUpperCase()}</a>`
    : "";
  return `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:850px;margin:auto;padding:20px;color:#333;line-height:1.8;">
  <div style="text-align:center;">${cta}</div>
  <h2 style="border-bottom:2px solid #007bff;color:#007bff;padding-bottom:10px;">${name} APK Review: Get ${bonus} Welcome Bonus 2026</h2>
  <p><strong>${name}</strong> is one of the most trusted gaming apps of 2026, offering a smooth and secure experience for Indian players. New users who register through the official ${name} APK link are eligible for an instant <strong>${bonus} Welcome Bonus</strong> credited directly to their account.</p>

  <h3>Why Choose ${name}?</h3>
  <ul>
    <li><strong>Instant ${bonus} signup bonus</strong> for new users.</li>
    <li>256-bit AES encryption for full account &amp; payment security.</li>
    <li>Fast UPI / IMPS withdrawals with no hidden charges.</li>
    <li>24×7 customer support available in Hindi &amp; English.</li>
    <li>Wide range of games — Rummy, Teen Patti, Slots, Andar Bahar and more.</li>
  </ul>

  <h3>${name} Bonus Details</h3>
  <table style="background:#f9f9f9;border-collapse:collapse;margin:20px 0;width:100%;">
    <tbody>
      <tr style="background:#007bff;color:#fff;"><th style="padding:12px;text-align:left;">Feature</th><th style="padding:12px;text-align:left;">Details</th></tr>
      <tr style="border:1px solid #ddd;"><td style="padding:12px;font-weight:bold;">Welcome Bonus</td><td style="padding:12px;">${bonus} Instant Credit</td></tr>
      <tr style="border:1px solid #ddd;"><td style="padding:12px;font-weight:bold;">App Name</td><td style="padding:12px;">${name}</td></tr>
      <tr style="border:1px solid #ddd;"><td style="padding:12px;font-weight:bold;">Withdrawal</td><td style="padding:12px;">UPI / Bank / IMPS</td></tr>
      <tr style="border:1px solid #ddd;"><td style="padding:12px;font-weight:bold;">Min. Withdrawal</td><td style="padding:12px;">₹100</td></tr>
      <tr style="border:1px solid #ddd;"><td style="padding:12px;font-weight:bold;">Support</td><td style="padding:12px;">24×7 Live Chat</td></tr>
    </tbody>
  </table>

  <h3>How to Claim ${bonus} Bonus</h3>
  <ol>
    <li>Click the <strong>DOWNLOAD</strong> button above to open the official ${name} page.</li>
    <li>Install the APK and register with your mobile number.</li>
    <li>Complete OTP verification — your ${bonus} bonus is credited instantly.</li>
    <li>Start playing your favourite games and withdraw winnings via UPI.</li>
  </ol>

  <div style="text-align:center;">${cta}</div>

  <div style="background:#f8d7da;border-radius:5px;color:#721c24;font-size:12px;margin-top:30px;padding:15px;text-align:center;">
    <strong>Disclaimer:</strong> This review is for informational purposes only. Skill-based gaming involves financial risk. Play responsibly. 18+ only.
  </div>
</div>`;
}

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

    // Admin-entered content wins. Source URL is only used as an image fallback.
    let img = data.img || "";
    let content = data.content ?? "";
    if (data.source_url && !img) {
      try {
        const scraped = await scrapeUrl(data.source_url);
        img = scraped.img;
      } catch {
        // ignore scrape errors; admin can paste an image instead
      }
    }
    if (!content.trim()) {
      content = generateDescription(data.title, data.source_url);
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
    if (rest.source_url !== undefined) {
      patch.source_url = rest.source_url || null;
    }
    if (rest.img) patch.img = rest.img;
    // If admin typed a description, use it. If they cleared it (empty string)
    // or didn't touch it but changed the title/link, auto-regenerate so the
    // description always matches the current game name + bonus + link.
    if (rest.content !== undefined && rest.content.trim() !== "") {
      patch.content = rest.content;
    } else if (rest.content === "" || rest.title !== undefined || rest.source_url !== undefined) {
      // Need title + source_url to regenerate; fetch existing row to fill blanks.
      const { data: existing } = await supabaseAdmin
        .from("games")
        .select("title, source_url")
        .eq("id", id)
        .maybeSingle();
      const title = rest.title ?? existing?.title ?? "";
      const src = rest.source_url !== undefined ? rest.source_url : existing?.source_url ?? "";
      if (title) patch.content = generateDescription(title, src);
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
    const { data: existing } = await supabaseAdmin
      .from("games")
      .select("img")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await supabaseAdmin.from("games").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (existing?.img) {
      const path = extractStoragePath(existing.img);
      if (path) {
        await supabaseAdmin.storage.from("game-icons").remove([path]);
      }
    }
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

export const adminUpdateSourceUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        source_url: z.string().trim().url().max(2000).or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertAdmin(userId);
    const { error } = await supabaseAdmin
      .from("games")
      .update({ source_url: data.source_url || null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, source_url: data.source_url };
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