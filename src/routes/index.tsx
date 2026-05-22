import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

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

type AppCard = {
  title: string;
  image: string;
  href: string;
};

const APPS: AppCard[] = [
  { title: "DiwaVIP (Yono) Apk Download : Get ₹60 Bonus Free | All Yono Game User Guide", image: "/images/146367.webp", href: "#" },
  { title: "EN 365 (Yono) Apk Download : Claim ₹51 Bonus | Best of All Yono App List", image: "/images/146221.webp", href: "#" },
  { title: "Jaiho 91 (Yono) Apk Download : Get ₹42 Signup Bonus Free | Best Of All Yono Games", image: "/images/145755.webp", href: "#" },
  { title: "DiwaSlot (Yono) Apk Download: Get ₹45 Bonus | All Yono Games & Apps Collection", image: "/images/145619.webp", href: "#" },
  { title: "Rummy 365 (Yono) Apk Download : Claim ₹51 Bonus Free | Best of All Yono Apps", image: "/images/145610.webp", href: "#" },
  { title: "MKM BET (Yono) Apk Download: Get ₹42 Bonus | All Yono Rummy & Games Collection", image: "/images/145320.webp", href: "#" },
  { title: "MDM BET (Yono) Apk Download Get Bonus ₹55 | Honest Review", image: "/images/145323.webp", href: "#" },
  { title: "Love Rummy App Review 2026: Get ₹61 Signup Bonus | Real or Fake? Safe Hai Ya Nahi?", image: "/images/121945.png", href: "#" },
  { title: "789 Jackpots (Yono) Apk Download & Get ₹67 Bonus | Honest Review & Guide", image: "/images/133215.png", href: "#" },
  { title: "Good Slots App Review 2026: Get ₹82 Signup Bonus | Safe or Not? (Real Review)", image: "/images/110172.png", href: "#" },
];

function Index() {
  return (
    <SiteLayout>
      <img src="/images/145203.webp" alt="Promo banner" className="ry-promo-banner" />
      <main className="ry-container">
        <div className="ry-app-grid">
          {APPS.map((app) => (
            <article className="ry-card" key={app.title}>
              <a href={app.href} className="ry-icon-box">
                <img src={app.image} alt={app.title} />
              </a>
              <h2 className="ry-app-name">{app.title}</h2>
              <a href={app.href} className="ry-dl-btn">
                OFFICIAL WEB
              </a>
            </article>
          ))}
        </div>

        <section className="ry-content-area">
          <h1>RoyalYono — All Yono Games, Rummy &amp; Casino Apps</h1>
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
