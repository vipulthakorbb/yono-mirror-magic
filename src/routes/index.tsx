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
      { title: "Yono Rummy, Yono Games & Teen Patti Bonus Apps — RoyalYono" },
      {
        name: "description",
        content:
          "Download Yono Rummy APK, all Yono Games, Teen Patti Gold, Teen Patti Master, Rummy Noble, Jili games & real cash earning apps with signup bonus — honest reviews on RoyalYono.",
      },
      {
        name: "keywords",
        content:
          "yono rummy, yono games, yono games download, yono rummy apk, yono rummy download, yono all game, yono arcade, teen patti, teen patti master, teen patti gold, teen patti star, 3 patti, rummy noble, rummy wealth, rummy nabob, rummy mars, holy rummy, all rummy apps, rummy app, jili games, 777 games, jalwa game, spin 101, bingo 101, dd1 game, real cash games, money games online, online earning apps, teen patti bonus",
      },
      { property: "og:title", content: "Yono Rummy, Yono Games & Teen Patti Bonus Apps — RoyalYono" },
      {
        property: "og:description",
        content:
          "Yono Rummy APK, all Yono Games, Teen Patti Master/Gold, Rummy Noble, Jili games & real cash earning apps with signup bonus.",
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
          <h1>Yono Rummy, Yono Games, Teen Patti &amp; Rummy Apps with Signup Bonus ({GAMES.length}+ Apps)</h1>
          <p>
            Welcome to <strong>RoyalYono</strong> — the trusted hub for{" "}
            <strong>Yono Rummy APK</strong>, <strong>Yono Games download</strong>,{" "}
            <strong>Teen Patti Master</strong>, <strong>Teen Patti Gold</strong>,{" "}
            <strong>Rummy Noble</strong>, <strong>Rummy Wealth</strong>,{" "}
            <strong>Jili games</strong>, <strong>777 games</strong> and other{" "}
            <strong>real cash earning apps</strong> with signup bonus. Claim your{" "}
            <strong>51 Bonus Teen Patti</strong> rewards, read honest reviews and download
            the official APKs from the listings above.
          </p>
        </section>
      </main>
    </SiteLayout>
  );
}
