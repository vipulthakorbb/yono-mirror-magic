import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { listGames, type GameRow } from "@/lib/games.functions";
import { cdnImg } from "@/lib/cdn";
import {
  adminDeleteGame,
  adminReorderGames,
  adminUpdateSlug,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminGamesList,
});

function AdminGamesList() {
  const qc = useQueryClient();
  const fetchGames = useServerFn(listGames);
  const del = useServerFn(adminDeleteGame);
  const reorder = useServerFn(adminReorderGames);
  const updateSlug = useServerFn(adminUpdateSlug);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "games"],
    queryFn: () => fetchGames(),
  });

  const [items, setItems] = useState<GameRow[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    setSavingOrder(true);
    try {
      await reorder({
        data: { order: next.map((g, idx) => ({ id: g.id, position: idx })) },
      });
      await qc.invalidateQueries({ queryKey: ["games"] });
      await qc.invalidateQueries({ queryKey: ["admin", "games"] });
    } catch (err) {
      alert("Reorder failed: " + (err as Error).message);
      setItems(items);
    } finally {
      setSavingOrder(false);
    }
  };

  const onDelete = async (g: GameRow) => {
    if (!confirm(`Delete "${g.title}"?`)) return;
    try {
      await del({ data: { id: g.id } });
      setItems((cur) => cur.filter((x) => x.id !== g.id));
      await qc.invalidateQueries({ queryKey: ["games"] });
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const onSlugSave = async (id: string, slug: string) => {
    try {
      await updateSlug({ data: { id, slug } });
      setItems((cur) => cur.map((x) => (x.id === id ? { ...x, slug } : x)));
      await qc.invalidateQueries({ queryKey: ["games"] });
      return true;
    } catch (e) {
      alert((e as Error).message);
      return false;
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Games ({items.length})</h1>
        <div className="flex items-center gap-3">
          {savingOrder && <span className="text-xs text-gray-500">Saving order…</span>}
          <Link
            to="/admin/settings"
            className="rounded-md border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Home page settings
          </Link>
          <Link
            to="/admin/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add game
          </Link>
        </div>
      </div>
      <p className="mb-3 text-xs text-gray-500">
        Drag the <span className="font-semibold">⋮⋮</span> handle to reorder. Click the link to edit it.
      </p>
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((g) => (
                <SortableCard
                  key={g.id}
                  game={g}
                  onDelete={() => onDelete(g)}
                  onSlugSave={(slug) => onSlugSave(g.id, slug)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableCard({
  game,
  onDelete,
  onSlugSave,
}: {
  game: GameRow;
  onDelete: () => void;
  onSlugSave: (slug: string) => Promise<boolean>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: game.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [editing, setEditing] = useState(false);
  const [slug, setSlug] = useState(game.slug);
  const [saving, setSaving] = useState(false);

  useEffect(() => setSlug(game.slug), [game.slug]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 rounded-lg border bg-white p-3 shadow-sm"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        className="mt-1 cursor-grab touch-none rounded px-1 text-gray-400 hover:bg-gray-100 active:cursor-grabbing"
      >
        ⋮⋮
      </button>
      <img
        src={cdnImg(game.img)}
        alt={game.title}
        className="h-16 w-16 flex-shrink-0 rounded-full border object-cover"
        loading="lazy"
        decoding="async"
      />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold">{game.title}</p>
        {editing ? (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-xs text-gray-400">/games/</span>
            <input
              autoFocus
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="min-w-0 flex-1 rounded border px-2 py-1 font-mono text-xs"
              pattern="[a-z0-9-]+"
            />
            <button
              disabled={saving}
              className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
              onClick={async () => {
                setSaving(true);
                const ok = await onSlugSave(slug.trim());
                setSaving(false);
                if (ok) setEditing(false);
              }}
            >
              Save
            </button>
            <button
              className="rounded border px-2 py-1 text-xs"
              onClick={() => {
                setSlug(game.slug);
                setEditing(false);
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            title="Click to edit link"
            className="block max-w-full truncate text-left text-xs text-blue-600 hover:underline"
          >
            /games/{game.slug}
          </button>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            to="/admin/$id"
            params={{ id: game.id }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Edit
          </Link>
          <a
            href={`/games/${game.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-gray-600 hover:underline"
          >
            View ↗
          </a>
          <button
            className="text-xs font-semibold text-red-600 hover:underline"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}