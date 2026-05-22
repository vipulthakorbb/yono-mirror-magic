import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { listGames } from "@/lib/games.functions";
import { cdnImg } from "@/lib/cdn";
import { useEffect, useState } from "react";

const gamesQueryOptions = queryOptions({
  queryKey: ["games", "all"],
  queryFn: () => listGames(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(gamesQueryOptions),
  component: Index,
  head: () => ({
    meta: [
      { title: "RoyalYono - Trending Casino Games" },
      {
        name: "description",
        content:
          "RoyalYono — All Yono Rummy, All Yono Games, All Yono Apps, All Jili Games, 51 Bonus Teen Patti, Online Earning Apps, Casino Game Reviews.",
      },
      { property: "og:title", content: "RoyalYono - Trending Casino Games" },
      {
        property: "og:description",
        content:
          "All Yono Rummy, Yono Games, Yono Apps, Jili Games, 51 Bonus Teen Patti and Casino Game Reviews.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://royalyono.com/" },
    ],
    links: [
      { rel: "canonical", href: "https://royalyono.com/" },
      { rel: "preload", as: "image", href: "/images/145177.webp", fetchpriority: "high" },
      { rel: "preload", as: "image", href: "/images/145203.webp" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "RoyalYono",
          url: "https://royalyono.com/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://royalyono.com/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
});

function Index() {
  const { data: GAMES } = useSuspenseQuery(gamesQueryOptions);
  const INITIAL = 20;
  const [visible, setVisible] = useState(INITIAL);

  useEffect(() => {
    if (visible >= GAMES.length) return;
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 800
      ) {
        setVisible((v) => Math.min(v + 20, GAMES.length));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [visible]);

  const games = GAMES.slice(0, visible);

  return (
    <SiteLayout>
      <img
        src="/images/145203.webp"
        alt="Promo banner"
        className="ry-promo-banner"
        width={1200}
        height={300}
        decoding="async"
      />
      <main className="ry-container">
        <div className="ry-app-grid">
          {games.map((g, idx) => (
            <article className="ry-card" key={g.id}>
              <Link to="/games/$slug" params={{ slug: g.slug }} className="ry-icon-box">
                <img
                  src={cdnImg(g.img)}
                  alt={g.title}
                  width={180}
                  height={180}
                  loading={idx < 10 ? "eager" : "lazy"}
                  fetchPriority={idx === 0 ? "high" : undefined}
                  decoding="async"
                />
              </Link>
              <h2 className="ry-app-name">{g.title}</h2>
              <Link to="/games/$slug" params={{ slug: g.slug }} className="ry-dl-btn">
                VIEW DETAILS
              </Link>
            </article>
          ))}
        </div>
        {visible < GAMES.length && (
          <div className="ry-loader">Loading more games…</div>
        )}

        <section className="ry-content-area">
          <h1>RoyalYono — All Yono Games, Rummy &amp; Casino Apps ({GAMES.length}+ Apps)</h1>
          <p>
            Welcome to <strong>RoyalYono</strong>, your trusted hub for the latest Yono Rummy
            apps, Jili games, Teen Patti bonus apps and casino game reviews. Claim signup
            bonuses, read honest reviews and download the official apps from the listings
            above.
          </p>
        </section>
      </main>
    </SiteLayout>
  );
}
