import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, LegalPage } from "@/components/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — RoyalYono" },
      { name: "robots", content: "noindex, follow" },
      {
        name: "description",
        content:
          "The terms and conditions that govern your use of the RoyalYono website.",
      },
      { property: "og:title", content: "Terms and Conditions — RoyalYono" },
      {
        property: "og:description",
        content: "Please read these terms carefully before using RoyalYono.",
      },
      { property: "og:url", content: "https://royalyono.com/terms" },
    ],
    links: [],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <SiteLayout>
      <LegalPage title="Terms and Conditions">
        <p>
          By accessing <strong>RoyalYono</strong> you agree to these terms.
          If you do not agree, please discontinue use of the site.
        </p>
        <h2>Use of content</h2>
        <p>
          All reviews, screenshots and articles on RoyalYono are owned by us
          or used with permission. You may share short excerpts with a link
          back, but full reproduction is not allowed.
        </p>
        <h2>Third-party apps</h2>
        <p>
          We are not responsible for the behaviour, payouts or downtime of
          third-party apps reviewed here. Any transaction is strictly
          between you and the app provider.
        </p>
        <h2>Changes</h2>
        <p>
          We may update these terms at any time. Continued use of the site
          after changes means you accept the updated terms.
        </p>
      </LegalPage>
    </SiteLayout>
  );
}