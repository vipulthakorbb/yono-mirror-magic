// Allowlist of pages that should be indexable by search engines.
// Everything else gets `noindex, follow` and is excluded from sitemap.xml.
// Total: 10 pages (home + 9 cornerstone game reviews).

export const INDEXABLE_GAME_SLUGS: ReadonlySet<string> = new Set([
  "yono-rummy-apk-download-get-160-bonus-official-rummy-review-2026",
  "yono-arcade-apk-download-and-get-76-bonus-free-honest-review-and-guide",
  "yono-777-apk-download-claim-78-bonus-technical-audit-2026",
  "yono-slots-apk-download-claim-94-bonus-technical-audit-2026",
  "yono-vip-apk-download-claim-91-bonus-technical-audit-2026",
  "yono-game-apk-download-claim-73-bonus-most-stable-app-review-2026",
  "teen-patti-live-tp-casino-review-2026-50-100-bonus-and-real-or-fake",
  "rummy-nabob-apk-download-get-51-signup-bonus-51-bonus-rummy-and-teen-patti-ditai",
  "spin-101-apk-download-claim-81-bonus-technical-review-2026",
]);

export function isGameSlugIndexable(slug: string): boolean {
  return INDEXABLE_GAME_SLUGS.has(slug);
}