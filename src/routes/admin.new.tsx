import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GameForm, type GameFormValues } from "@/components/GameForm";
import {
  adminCreateGame,
  adminCreateGameFromUrl,
  adminScrapeGameUrl,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/new")({
  component: NewGame,
});

function NewGame() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(adminCreateGame);
  const createFromUrl = useServerFn(adminCreateGameFromUrl);
  const scrape = useServerFn(adminScrapeGameUrl);

  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<"" | "scrape" | "instant">("");
  const [err, setErr] = useState("");
  const [prefill, setPrefill] = useState<Partial<GameFormValues> | null>(null);

  const doInstant = async () => {
    setErr("");
    setBusy("instant");
    try {
      await createFromUrl({ data: { url: url.trim() } });
      await qc.invalidateQueries({ queryKey: ["games"] });
      navigate({ to: "/admin" });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const doPreview = async () => {
    setErr("");
    setBusy("scrape");
    try {
      const res = await scrape({ data: { url: url.trim() } });
      setPrefill({ title: res.title, img: res.img, content: res.content });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <Link to="/admin" className="mb-4 inline-block text-sm text-gray-600 hover:underline">
        ← Back
      </Link>
      <h1 className="mb-4 text-2xl font-bold">Add new game</h1>

      <div className="mb-6 rounded-xl border bg-blue-50 p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-blue-700">
          Quick add — paste a URL
        </h2>
        <p className="mb-3 text-xs text-gray-600">
          We'll fetch the page and auto-fill title, image, and content. No HTML needed.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/game-page"
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={!url.trim() || busy !== ""}
            onClick={doInstant}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy === "instant" ? "Creating…" : "Auto-create"}
          </button>
          <button
            type="button"
            disabled={!url.trim() || busy !== ""}
            onClick={doPreview}
            className="rounded-md border bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {busy === "scrape" ? "Fetching…" : "Preview & edit"}
          </button>
        </div>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      </div>

      <details className="mb-3" open={!!prefill}>
        <summary className="cursor-pointer text-sm font-semibold text-gray-700">
          {prefill ? "Review & save" : "Or fill in manually"}
        </summary>
        <div className="mt-3">
          <GameForm
            key={prefill ? "prefilled" : "blank"}
            initial={prefill ?? undefined}
            submitLabel="Create game"
            onSubmit={async (v) => {
              await create({ data: v });
              await qc.invalidateQueries({ queryKey: ["games"] });
              navigate({ to: "/admin" });
            }}
          />
        </div>
      </details>
    </div>
  );
}