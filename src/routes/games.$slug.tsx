import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { GAMES_BY_SLUG, GAMES } from "@/data/games";

export const Route = createFileRoute("/games/$slug")({
  loader: ({ params }) => {
    const game = GAMES_BY_SLUG[params.slug];
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => {
    const g = loaderData?.game;
    const title = g ? `${g.title} — RoyalYono` : "Game — RoyalYono";
    const desc = g
      ? `${g.title}. Read the full review, claim the signup bonus and download the official APK on RoyalYono.`
      : "Game review on RoyalYono.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(g?.img ? [{ property: "og:image", content: g.img }] : []),
      ],
      links: g ? [{ rel: "canonical", href: `/games/${g.slug}` }] : [],
    };
  },
  component: GamePage,
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <main className="ry-container">
        <section className="ry-content-area">
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
          <p><Link to="/">← Back to home</Link></p>
        </section>
      </main>
    </SiteLayout>
  ),
});

function NotFound() {
  return (
    <SiteLayout>
      <main className="ry-container">
        <section className="ry-content-area">
          <h1>Game not found</h1>
          <p>The game you are looking for does not exist on RoyalYono.</p>
          <p><Link to="/">← Browse all games</Link></p>
        </section>
      </main>
    </SiteLayout>
  );
}

function GamePage() {
  const { game } = Route.useLoaderData();
  const idx = GAMES.findIndex((g) => g.slug === game.slug);
  const related = [
    ...GAMES.slice(Math.max(0, idx - 3), idx),
    ...GAMES.slice(idx + 1, idx + 4),
  ].slice(0, 6);

  return (
    <SiteLayout>
      <main className="ry-container">
        <article className="ry-game-page">
          <header className="ry-game-header">
            <img
              src={game.img}
              alt={game.title}
              width={180}
              height={180}
              className="ry-game-icon"
              decoding="async"
            />
            <div>
              <h1>{game.title}</h1>
              <p className="ry-crumbs">
                <Link to="/">Home</Link> &nbsp;›&nbsp; <span>Game Review</span>
              </p>
            </div>
          </header>

          <div
            className="ry-game-body"
            dangerouslySetInnerHTML={{ __html: game.html }}
          />
        </article>

        {related.length > 0 && (
          <section className="ry-content-area">
            <h2>More Yono &amp; Casino Apps</h2>
            <div className="ry-app-grid">
              {related.map((g) => (
                <article className="ry-card" key={g.slug}>
                  <Link to="/games/$slug" params={{ slug: g.slug }} className="ry-icon-box">
                    <img src={g.img} alt={g.title} width={180} height={180} loading="lazy" decoding="async" />
                  </Link>
                  <h3 className="ry-app-name">{g.title}</h3>
                  <Link to="/games/$slug" params={{ slug: g.slug }} className="ry-dl-btn">
                    VIEW DETAILS
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </SiteLayout>
  );
}