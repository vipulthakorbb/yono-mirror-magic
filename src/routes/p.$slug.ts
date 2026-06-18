import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/p/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { data, error } = await supabaseAdmin
          .from("custom_pages")
          .select("title, head_html, body_html")
          .eq("slug", params.slug)
          .maybeSingle();
        if (error) {
          return new Response("Server error", { status: 500 });
        }
        if (!data) {
          return new Response("Page not found", {
            status: 404,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(data.title)}</title>
${data.head_html ?? ""}
</head>
<body>
${data.body_html ?? ""}
</body>
</html>`;
        return new Response(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}