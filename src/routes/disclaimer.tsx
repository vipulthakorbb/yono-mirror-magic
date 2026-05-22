import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, LegalPage } from "@/components/SiteLayout";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — RoyalYono" },
      {
        name: "description",
        content:
          "RoyalYono disclaimer: information on third-party apps, financial risk, age restrictions and editorial independence.",
      },
      { property: "og:title", content: "Disclaimer — RoyalYono" },
      {
        property: "og:description",
        content:
          "Important disclaimer about real-money games, third-party apps and editorial reviews on RoyalYono.",
      },
      { property: "og:url", content: "https://royalyono.com/disclaimer" },
    ],
    links: [{ rel: "canonical", href: "https://royalyono.com/disclaimer" }],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <SiteLayout>
      <LegalPage title="Disclaimer">
        <p>
          The content on <strong>RoyalYono</strong> is provided for
          informational and entertainment purposes only. We do not own,
          operate or control any of the third-party apps reviewed on this
          site.
        </p>
        <h2>Real-money risk</h2>
        <p>
          Real-money rummy, fantasy and casino apps involve financial risk
          and may not be legal in every Indian state. You are responsible
          for checking your local laws before playing or depositing money.
        </p>
        <h2>Age restriction</h2>
        <p>
          All listed apps are intended for users aged{" "}
          <strong>18 years and above</strong>. RoyalYono does not promote
          gambling to minors.
        </p>
        <h2>Affiliate notice</h2>
        <p>
          Some download links on this site may be affiliate or referral
          links. We may earn a small commission at no extra cost to you.
          This does not influence our review opinion.
        </p>
      </LegalPage>
    </SiteLayout>
  );
}