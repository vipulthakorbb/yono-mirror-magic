import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, LegalPage } from "@/components/SiteLayout";

export const Route = createFileRoute("/responsible-gaming")({
  head: () => ({
    meta: [
      { title: "Responsible Gaming — RoyalYono" },
      { name: "robots", content: "noindex, follow" },
      {
        name: "description",
        content:
          "Tips and helplines for safe, responsible play. Set limits, recognise warning signs and find help.",
      },
      { property: "og:title", content: "Responsible Gaming — RoyalYono" },
      {
        property: "og:description",
        content:
          "RoyalYono promotes safe play. Learn about responsible gaming tips and support resources.",
      },
      { property: "og:url", content: "https://royalyono.com/responsible-gaming" },
    ],
    links: [],
  }),
  component: ResponsiblePage,
});

function ResponsiblePage() {
  return (
    <SiteLayout>
      <LegalPage title="Responsible Gaming">
        <p>
          Real-money games should be played for fun, not as a way to make
          money. RoyalYono encourages every user to play responsibly.
        </p>
        <h2>Stay in control</h2>
        <ul>
          <li>Set a daily and monthly deposit limit — and stick to it.</li>
          <li>Never chase losses or borrow money to play.</li>
          <li>Take regular breaks. Don't play when stressed or tired.</li>
          <li>Only players 18+ may use the apps listed on this site.</li>
        </ul>
        <h2>Need help?</h2>
        <p>
          If gaming is affecting your life, finances or relationships,
          contact a free helpline in your area. In India you can call{" "}
          <strong>iCALL (9152987821)</strong> for confidential
          mental-health support.
        </p>
      </LegalPage>
    </SiteLayout>
  );
}