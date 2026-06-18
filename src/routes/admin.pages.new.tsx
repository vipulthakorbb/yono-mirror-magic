import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { CustomPageForm } from "@/components/CustomPageForm";
import { adminCreatePage } from "@/lib/pages.functions";

export const Route = createFileRoute("/admin/pages/new")({
  component: NewPage,
});

function NewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(adminCreatePage);

  return (
    <div>
      <Link to="/admin/pages" className="mb-4 inline-block text-sm text-gray-600 hover:underline">
        ← Back to pages
      </Link>
      <h1 className="mb-4 text-2xl font-bold">New custom page</h1>
      <CustomPageForm
        submitLabel="Create page"
        onSubmit={async (v) => {
          await create({ data: v });
          await qc.invalidateQueries({ queryKey: ["admin", "custom-pages"] });
          navigate({ to: "/admin/pages" });
        }}
      />
    </div>
  );
}