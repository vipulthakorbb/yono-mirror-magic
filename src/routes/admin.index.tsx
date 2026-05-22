import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listGames } from "@/lib/games.functions";
import { adminDeleteGame } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminGamesList,
});

function AdminGamesList() {
  const qc = useQueryClient();
  const fetchGames = useServerFn(listGames);
  const del = useServerFn(adminDeleteGame);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "games"],
    queryFn: () => fetchGames(),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Games ({data?.length ?? 0})</h1>
        <Link
          to="/admin/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add game
        </Link>
      </div>
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-sm"
            >
              <img
                src={g.img}
                alt={g.title}
                className="h-16 w-16 flex-shrink-0 rounded-full border object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold">{g.title}</p>
                <p className="truncate text-xs text-gray-500">{g.slug}</p>
                <div className="mt-2 flex gap-2">
                  <Link
                    to="/admin/$id"
                    params={{ id: g.id }}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    className="text-xs font-semibold text-red-600 hover:underline"
                    onClick={async () => {
                      if (!confirm(`Delete "${g.title}"?`)) return;
                      try {
                        await del({ data: { id: g.id } });
                        await qc.invalidateQueries({ queryKey: ["games"] });
                        refetch();
                      } catch (e) {
                        alert((e as Error).message);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}