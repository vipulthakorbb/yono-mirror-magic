import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/SiteLayout";
import { listGames, getSiteSettings } from "@/lib/games.functions";
import { cdnImg } from "@/lib/cdn";
import { useEffect, useState } from "react";
import bannerWave from "@/assets/banner-wave.webp.asset.json";

const gamesQueryOptions = queryOptions({
  queryKey: ["games", "all"],
  queryFn: () => listGames(),
});

const siteSettingsQueryOptions = queryOptions({
  queryKey: ["site-settings"],
  queryFn: () => getSiteSettings(),
});

const DEFAULT_META = {
  title: "Yono Rummy APK & Yono Games Download — Free Signup Bonus | RoyalYono",
  description:
    "Download Yono Rummy APK, all Yono Games, Yono Arcade, Teen Patti Master & Rummy Noble with free signup bonus. Honest reviews & official links.",
  keywords:
    "yono rummy, yono rummy apk, yono rummy download, yono games, yono games download, yono game, yono all game, yono app, yono apk, yono arcade, yono 777, yono slots, yono vip, royal yono, royalyono, teen patti master, teen patti gold, rummy noble, rummy wealth, rummy nabob, rummy mars, 777 games, jalwa game, spin 101, jili games",
};

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [, settings] = await Promise.all([
      context.queryClient.ensureQueryData(gamesQueryOptions),
      context.queryClient.ensureQueryData(siteSettingsQueryOptions),
    ]);
    return { settings };
  },
  component: Index,
  head: ({ loaderData }) => {
    const s = loaderData?.settings;
    const title = (s?.meta_title?.trim() || DEFAULT_META.title);
    const description = (s?.meta_description?.trim() || DEFAULT_META.description);
    const keywords = (s?.meta_keywords?.trim() || DEFAULT_META.keywords);
    return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "keywords", content: keywords },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://royalyono.com/" },
    ],
    links: [
      { rel: "canonical", href: "https://royalyono.com/" },
      { rel: "preload", as: "image", href: "/images/145177.webp", fetchpriority: "high" },
      { rel: "preload", as: "image", href: bannerWave.url, fetchpriority: "high" },
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
    };
  },
});

function Index() {
  const { data: GAMES } = useSuspenseQuery(gamesQueryOptions);
  const { data: settings } = useSuspenseQuery(siteSettingsQueryOptions);
  const INITIAL = 20;
  const [visible, setVisible] = useState(INITIAL);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);
  }, []);

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

  const q = query.trim().toLowerCase();
  const filtered = q
    ? GAMES.filter((g) => g.title.toLowerCase().includes(q))
    : GAMES;
  const games = q ? filtered : filtered.slice(0, visible);

  return (
    <SiteLayout>
      <section className="ry-hero">
        <img
          src={bannerWave.url}
          alt="RoyalYono — Yono Games & Rummy APK hub"
          className="ry-hero-bg"
          decoding="async"
          fetchPriority="high"
        />
        <div className="ry-hero-overlay" />
        <div className="ry-hero-content">
          <h1 className="ry-hero-title">
            Yono Games 2026 — Yono Rummy APK Download &amp; ₹500 Bonus
          </h1>
          <p className="ry-hero-sub">
            All Yono Rummy, Yono Slots &amp; Teen Patti APK List
          </p>
          <p className="ry-hero-meta">
            {GAMES.length}+ verified Yono game APKs · Real signup bonus ₹50–₹500 · Updated daily
          </p>
          <p className="ry-hero-desc">
            <strong>RoyalYono</strong> is India's most updated hub for{" "}
            <strong>Yono Rummy APK</strong>, <strong>Yono Slots</strong>,{" "}
            <strong>Teen Patti</strong> and the full <strong>Yono games list 2026</strong>.
            Every Yono APK on this page is scanned, tested, and updated weekly so you always
            download the latest working version — no Play Store needed.
          </p>
          <form
            className="ry-hero-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const el = document.querySelector(".ry-app-grid");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <input
              type="text"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search Yono games"
              placeholder="Yono Games App search"
            />
            <button type="submit" aria-label="Search">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>
        </div>
      </section>
      <main className="ry-container">
        <header className="ry-content-area">
          <h2>
            {q
              ? `Search results for "${query}" (${filtered.length})`
              : `Yono Rummy APK, Yono Games Download & Teen Patti Bonus Apps (${GAMES.length}+ Apps)`}
          </h2>
        </header>
        {q && filtered.length === 0 && (
          <p style={{ textAlign: "center", padding: "24px 0" }}>
            No games found. Try a different search.
          </p>
        )}
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
        {!q && visible < GAMES.length && (
          <div className="ry-loader">Loading more games…</div>
        )}

        {(settings?.section_title || settings?.section_content || settings?.section_image) && (
          <section className="ry-content-area">
            {settings.section_title && <h2>{settings.section_title}</h2>}
            {settings.section_image && (
              <img
                src={settings.section_image}
                alt={settings.section_title || "Section image"}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 12,
                  margin: "12px 0",
                }}
                loading="lazy"
                decoding="async"
              />
            )}
            {settings.section_content && (
              <div dangerouslySetInnerHTML={{ __html: settings.section_content }} />
            )}
          </section>
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
