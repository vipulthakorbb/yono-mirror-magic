import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, LegalPage } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — RoyalYono" },
      { name: "robots", content: "noindex, follow" },
      {
        name: "description",
        content:
          "About RoyalYono — your trusted guide to Yono Rummy, Yono apps, Jili games, Teen Patti bonuses and honest casino game reviews.",
      },
      { property: "og:title", content: "About Us — RoyalYono" },
      {
        property: "og:description",
        content:
          "Learn what RoyalYono is and why thousands trust us for the latest Yono, rummy and casino app reviews.",
      },
      { property: "og:url", content: "https://www.royalyono.com/about" },
    ],
    links: [],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <LegalPage title="About RoyalYono">
        <p>
          <strong>RoyalYono</strong> is an independent review and discovery
          platform for <em>Yono rummy</em>, <em>Yono casino apps</em>,
          <em> Jili games</em>, <em>Teen Patti bonus apps</em> and other online
          earning games popular across India.
        </p>
        <p>
          Our team plays, tests and verifies every app before listing it here so
          users can quickly find genuine signup bonuses, official download links
          and an honest opinion on whether an app is safe, real or fake.
        </p>
        <h2>What we cover</h2>
        <ul>
          <li>All Yono Rummy &amp; Yono Game apk apps</li>
          <li>Jili slot games and Teen Patti 51 bonus apps</li>
          <li>Online earning &amp; cash withdrawal app reviews</li>
          <li>Promo codes, signup bonuses and event guides</li>
        </ul>
        <p>
          RoyalYono is for users aged 18+. Please play responsibly — read our
          Responsible Gaming page for help and guidance.
        </p>
      </LegalPage>
    </SiteLayout>
  );
}
