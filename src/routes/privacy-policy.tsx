import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, LegalPage } from "@/components/SiteLayout";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — RoyalYono" },
      { name: "robots", content: "noindex, follow" },
      {
        name: "description",
        content:
          "How RoyalYono collects, uses and protects your information when you visit our site.",
      },
      { property: "og:title", content: "Privacy Policy — RoyalYono" },
      {
        property: "og:description",
        content:
          "RoyalYono privacy policy: cookies, analytics, ads and your rights.",
      },
      { property: "og:url", content: "https://www.royalyono.com/privacy-policy" },
    ],
    links: [],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <SiteLayout>
      <LegalPage title="Privacy Policy">
        <p>
          Your privacy matters to us. This policy explains what information
          RoyalYono collects when you visit the site and how we use it.
        </p>
        <h2>Information we collect</h2>
        <ul>
          <li>Basic analytics (pages viewed, device, country)</li>
          <li>Cookies used by our advertising and analytics partners</li>
          <li>Optional info you submit via the contact form</li>
        </ul>
        <h2>How we use it</h2>
        <p>
          To improve content, measure performance, serve relevant ads and
          respond to your messages. We never sell personal data.
        </p>
        <h2>Third-party services</h2>
        <p>
          We use Google Analytics and Google AdSense, which set their own
          cookies governed by their respective privacy policies.
        </p>
        <h2>Your rights</h2>
        <p>
          You can request deletion of any information you submitted to us by
          contacting{" "}
          <a href="mailto:support@royalyono.com">support@royalyono.com</a>.
        </p>
      </LegalPage>
    </SiteLayout>
  );
}
