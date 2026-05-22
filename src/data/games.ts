// AUTO-GENERATED. Game catalog with internal pages scraped from multycash.com.
export type Game = { title: string; href: string; img: string; slug: string; html: string };

export const GAMES: Game[] = [];

export const GAMES_BY_SLUG: Record<string, Game> = Object.fromEntries(GAMES.map(g => [g.slug, g]));
