import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListPages, adminDeletePage } from "@/lib/pages.functions";

export const Route = createFileRoute("/admin/pages")({
  component: AdminPagesList,
});

function AdminPagesList() {
  const qc = useQueryClient();
  const list = useServerFn(adminListPages);
  const del = useServerFn(adminDeletePage);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "custom-pages"],
    queryFn: () => list(),
  });

  const onDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await del({ data: { id } });
      await qc.invalidateQueries({ queryKey: ["admin", "custom-pages"] });
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link to="/admin" className="text-sm text-gray-600 hover:underline">
            ← Back
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Custom HTML Pages</h1>
          <p className="text-sm text-gray-600">
            Pages are live at <code>/p/&lt;slug&gt;</code> with full control over the HTML head and body.
          </p>
        </div>
        <Link
          to="/admin/pages/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + New page
        </Link>
      </div>
      {isLoading ? (
        <p>Loading…</p>
      ) : !data || data.length === 0 ? (
        <p className="rounded-md border border-dashed bg-white p-6 text-center text-sm text-gray-500">
          No custom pages yet. Click "New page" to create one.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Slug</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2 font-medium">{p.title}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-600">/p/{p.slug}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to="/admin/pages/$id"
                      params={{ id: p.id }}
                      className="mr-3 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <a
                      href={`/p/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mr-3 text-xs font-semibold text-gray-600 hover:underline"
                    >
                      View ↗
                    </a>
                    <button
                      className="text-xs font-semibold text-red-600 hover:underline"
                      onClick={() => onDelete(p.id, p.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}