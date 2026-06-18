import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CustomPageForm } from "@/components/CustomPageForm";
import { adminGetPage, adminUpdatePage } from "@/lib/pages.functions";

export const Route = createFileRoute("/admin/pages/$id")({
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const get = useServerFn(adminGetPage);
  const update = useServerFn(adminUpdatePage);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "custom-page", id],
    queryFn: () => get({ data: { id } }),
  });

  return (
    <div>
      <Link to="/admin/pages" className="mb-4 inline-block text-sm text-gray-600 hover:underline">
        ← Back to pages
      </Link>
      <h1 className="mb-4 text-2xl font-bold">Edit custom page</h1>
      {isLoading || !data ? (
        <p>Loading…</p>
      ) : (
        <CustomPageForm
          submitLabel="Save changes"
          initial={{
            slug: data.slug,
            title: data.title,
            head_html: data.head_html,
            body_html: data.body_html,
          }}
          onSubmit={async (v) => {
            await update({ data: { id, ...v } });
            await qc.invalidateQueries({ queryKey: ["admin", "custom-pages"] });
            await qc.invalidateQueries({ queryKey: ["admin", "custom-page", id] });
            navigate({ to: "/admin/pages" });
          }}
        />
      )}
    </div>
  );
}