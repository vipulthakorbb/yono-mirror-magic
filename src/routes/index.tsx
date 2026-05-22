import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { GAMES } from "@/data/games";

export const Route = createFileRoute("/")({
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
    ],
  }),
});

function Index() {
  return (
    <SiteLayout>
      <img src="/images/145203.webp" alt="Promo banner" className="ry-promo-banner" />
      <main className="ry-container">
        <div className="ry-app-grid">
          {GAMES.map((g) => (
            <article className="ry-card" key={g.href}>
              <a href={g.href} target="_blank" rel="noopener noreferrer" className="ry-icon-box">
                <img src={g.img} alt={g.title} loading="lazy" />
              </a>
              <h2 className="ry-app-name">{g.title}</h2>
              <a href={g.href} target="_blank" rel="noopener noreferrer" className="ry-dl-btn">
                OFFICIAL WEB
              </a>
            </article>
          ))}
        </div>

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
