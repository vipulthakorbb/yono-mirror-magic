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
      { title: "Yono Rummy APK & Yono Games Download — Free Signup Bonus | RoyalYono" },
      {
        name: "description",
        content:
          "Download Yono Rummy APK, all Yono Games, Yono Arcade, Teen Patti Master & Rummy Noble with free signup bonus. Honest reviews & official links.",
      },
      {
        name: "keywords",
        content:
          "yono rummy, yono rummy apk, yono rummy download, yono games, yono games download, yono game, yono all game, yono app, yono apk, yono arcade, yono 777, yono slots, yono vip, royal yono, royalyono, teen patti master, teen patti gold, rummy noble, rummy wealth, rummy nabob, rummy mars, 777 games, jalwa game, spin 101, jili games",
      },
      { property: "og:title", content: "Yono Rummy APK & Yono Games Download — RoyalYono" },
      {
        property: "og:description",
        content:
          "Download Yono Rummy APK, all Yono Games & Teen Patti bonus apps. Free signup bonus, honest reviews, official APK links.",
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
        fetchPriority="high"
      />
      <main className="ry-container">
        <header className="ry-content-area">
          <h1>Yono Rummy APK, Yono Games Download &amp; Teen Patti Bonus Apps ({GAMES.length}+ Apps)</h1>
        </header>
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
              <div className="ry-stars" aria-label="Rating 5 out of 5">★★★★★</div>
              <Link to="/games/$slug" params={{ slug: g.slug }} className="ry-dl-btn">
                DOWNLOAD
              </Link>
            </article>
          ))}
        </div>
        {visible < GAMES.length && (
          <div className="ry-loader">Loading more games…</div>
        )}

        <section className="ry-content-area">
          <h2>About RoyalYono</h2>
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
