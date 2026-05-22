import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { GameForm } from "@/components/GameForm";
import { adminCreateGame } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/new")({
  component: NewGame,
});

function NewGame() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(adminCreateGame);

  return (
    <div>
      <Link to="/admin" className="mb-4 inline-block text-sm text-gray-600 hover:underline">
        ← Back
      </Link>
      <h1 className="mb-1 text-2xl font-bold">Add new game</h1>
      <p className="mb-4 text-sm text-gray-600">
        Enter a title, pick an image, and paste the game's source link. We'll fetch the
        page content for you on save.
      </p>
      <GameForm
        submitLabel="Create game"
        onSubmit={async (v) => {
          await create({ data: v });
          await qc.invalidateQueries({ queryKey: ["games"] });
          navigate({ to: "/admin" });
        }}
      />
    </div>
  );
}