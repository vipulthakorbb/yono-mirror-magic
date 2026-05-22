import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GameForm } from "@/components/GameForm";
import { adminGetGame, adminUpdateGame } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/$id")({
  component: EditGame,
});

function EditGame() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const get = useServerFn(adminGetGame);
  const update = useServerFn(adminUpdateGame);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "game", id],
    queryFn: () => get({ data: { id } }),
  });

  return (
    <div>
      <Link to="/admin" className="mb-4 inline-block text-sm text-gray-600 hover:underline">
        ← Back
      </Link>
      <h1 className="mb-4 text-2xl font-bold">Edit game</h1>
      {isLoading || !data ? (
        <p>Loading…</p>
      ) : (
        <GameForm
          submitLabel="Save changes"
          initial={{
            title: data.title,
            slug: data.slug,
            img: data.img,
            source_url: (data as { source_url?: string | null }).source_url ?? "",
          }}
          onSubmit={async (v) => {
            await update({ data: { id, ...v } });
            await qc.invalidateQueries({ queryKey: ["games"] });
            await qc.invalidateQueries({ queryKey: ["game"] });
            navigate({ to: "/admin" });
          }}
        />
      )}
    </div>
  );
}