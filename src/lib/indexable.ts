// Allowlist of pages that should be indexable by search engines.
// Everything else gets `noindex, follow` and is excluded from sitemap.xml.
// Total: 10 pages (home + 9 cornerstone game reviews).

export const INDEXABLE_GAME_SLUGS: ReadonlySet<string> = new Set([
  "yonorummy-yono-apk-download-get-42-signup-bonus-free-best-of-all-yono-games",
  "yonoarcade-yono-apk-download-get-42-signup-bonus-free-best-of-all-yono-games",
  "yono777-yono-apk-download-get-42-signup-bonus-free-best-of-all-yono-games",
  "yonovip-yono-apk-download-get-42-signup-bonus-free-best-of-all-yono-games",
  "yonogames-yono-apk-download-get-42-signup-bonus-free-best-of-all-yono-games",
  "spin101-yono-apk-download-get-42-signup-bonus-free-best-of-all-yono-games",
  "teenpattilive-apk-download-get-42-signup-bonus-free-best-of-all-yono-games",
  "teenpattimaster-yono-apk-download-get-42-signup-bonus-free-best-of-all-yono-games",
  "slotswinner-yono-apk-download-get-42-signup-bonus-free-best-of-all-yono-games",
]);

export function isGameSlugIndexable(slug: string): boolean {
  return INDEXABLE_GAME_SLUGS.has(slug);
}