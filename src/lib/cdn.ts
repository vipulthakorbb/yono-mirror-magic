// Rewrite Supabase Storage URLs to go through our edge-cached image proxy
// (/api/img/...). Cloudflare caches those for a year, so repeat views of
// game icons never hit Supabase bandwidth limits.
//
// Any non-Supabase URL (e.g. external image pasted by admin) is returned
// unchanged so we don't accidentally proxy random hosts.

const SUPA = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(
  /\/$/,
  "",
);

export function cdnImg(
  url: string | null | undefined,
  width?: number,
): string {
  if (!url) return "";
  if (!SUPA) return url;
  const prefix = `${SUPA}/storage/v1/object/public/`;
  if (url.startsWith(prefix)) {
    const path = url.slice(prefix.length);
    return width ? `/api/img/${path}?w=${width}&q=78` : `/api/img/${path}`;
  }
  return url;
}