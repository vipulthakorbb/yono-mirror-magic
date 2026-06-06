import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, LegalPage } from "@/components/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — RoyalYono" },
      { name: "robots", content: "noindex, follow" },
      {
        name: "description",
        content:
          "Get in touch with the RoyalYono team for app review requests, partnership enquiries, copyright issues or general feedback.",
      },
      { property: "og:title", content: "Contact Us — RoyalYono" },
      {
        property: "og:description",
        content: "Reach out to RoyalYono — we usually reply within 24 hours.",
      },
      { property: "og:url", content: "https://royalyono.com/contact" },
    ],
    links: [],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <LegalPage title="Contact Us">
        <p>
          Have a question, copyright concern or want your app reviewed on
          RoyalYono? Send us a message and our team will get back to you
          within 24 hours.
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:jaymatajijaymataji486@gmail.com">jaymatajijaymataji486@gmail.com</a>
        </p>
        <form
          className="ry-form"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thanks! We will reply shortly.");
          }}
        >
          <label>
            Your name
            <input type="text" name="name" required />
          </label>
          <label>
            Email
            <input type="email" name="email" required />
          </label>
          <label>
            Message
            <textarea name="message" rows={5} required />
          </label>
          <button type="submit" className="ry-dl-btn ry-submit">
            Send Message
          </button>
        </form>
      </LegalPage>
    </SiteLayout>
  );
}