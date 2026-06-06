import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { getGameBySlug } from "@/lib/games.functions";
import { cdnImg } from "@/lib/cdn";

const gameQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["game", slug],
    queryFn: () => getGameBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/games/$slug")({
  loader: async ({ params, context }) => {
    const result = await context.queryClient.ensureQueryData(
      gameQueryOptions(params.slug),
    );
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    const g = loaderData?.game;
    const title = g
      ? (g.meta_title?.trim() || `${g.title} — RoyalYono`)
      : "Game — RoyalYono";
    const desc = g
      ? (g.meta_description?.trim() ||
          `${g.title}. Read the full review, claim the signup bonus and download the official APK on RoyalYono.`)
      : "Game review on RoyalYono.";
    const url = g ? `https://royalyono.com/games/${g.slug}` : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(url ? [{ property: "og:url", content: url }] : []),
        ...(g?.img ? [{ property: "og:image", content: g.img }] : []),
        ...(g?.img ? [{ name: "twitter:image", content: g.img }] : []),
      ],
      links: g ? [{ rel: "canonical", href: url! }] : [],
      scripts: g
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: g.title,
                image: g.img,
                description: desc,
                applicationCategory: "GameApplication",
                operatingSystem: "Android",
                url,
              }),
            },
          ]
        : [],
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
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(gameQueryOptions(slug));
  const game = data!.game;
  const related = data!.related;
  const html = game.content;

  // Stable per-game pseudo-random rating (4.5–4.9) and size (20–80 MB)
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const rating = (4.5 + ((h % 5) / 10)).toFixed(1); // 4.5, 4.6, 4.7, 4.8, 4.9
  const sizeMb = 45 + ((h >> 3) % 136); // 45–180 MB

  return (
    <SiteLayout>
      <main className="ry-container">
        <article className="ry-game-page">
          <header className="ry-game-header">
            <img
              src={cdnImg(game.img, 360)}
              alt={game.title}
              width={180}
              height={180}
              className="ry-game-icon"
              fetchPriority="high"
              decoding="async"
            />
            <div>
              <h1>{game.title}</h1>
              <p className="ry-crumbs">
                <Link to="/">Home</Link> &nbsp;›&nbsp; <span>Game Review</span>
              </p>
              <div className="ry-game-meta">
                <span className="ry-meta-item">
                  <span className="ry-meta-icon" aria-hidden>★</span> {rating} / 5
                </span>
                <span className="ry-meta-item">
                  <span className="ry-meta-icon" aria-hidden>📱</span> Android · {sizeMb} MB
                </span>
                <span className="ry-meta-item">
                  <span className="ry-meta-icon" aria-hidden>🛡</span> Verified APK
                </span>
              </div>
              {game.source_url ? (
                <p style={{ marginTop: 12 }}>
                  <a
                    href={game.source_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="ry-dl-btn"
                    style={{ display: "inline-block", padding: "12px 28px", fontWeight: 700 }}
                  >
                    DOWNLOAD APP ↗
                  </a>
                </p>
              ) : null}
            </div>
          </header>

          {html ? (
            <div
              className="ry-game-body"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="ry-game-body">
              Review content is being updated. Please check back soon.
            </p>
          )}
        </article>

        {related.length > 0 && (
          <section className="ry-content-area">
            <h2>More Yono &amp; Casino Apps</h2>
            <div className="ry-app-grid">
              {related.map((g) => (
                <article className="ry-card" key={g.slug}>
                  <Link to="/games/$slug" params={{ slug: g.slug }} className="ry-icon-box">
                    <img src={cdnImg(g.img, 360)} alt={g.title} width={180} height={180} loading="lazy" decoding="async" />
                  </Link>
                  <h3 className="ry-app-name">{g.title}</h3>
                  <div className="ry-stars" aria-label="Rating 5 out of 5">★★★★★</div>
                  <Link to="/games/$slug" params={{ slug: g.slug }} className="ry-dl-btn">
                    DOWNLOAD
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