import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type GameFormValues = {
  title: string;
  slug?: string;
  img: string;
  content: string;
};

type Props = {
  initial?: Partial<GameFormValues>;
  submitLabel: string;
  onSubmit: (v: GameFormValues) => Promise<void>;
};

export function GameForm({ initial, submitLabel, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [img, setImg] = useState(initial?.img ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    setErr("");
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("game-icons")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("game-icons").getPublicUrl(path);
      setImg(data.publicUrl);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!img) {
      setErr("Please upload or paste an image URL.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        slug: slug.trim() || undefined,
        img,
        content,
      });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-semibold">Title</label>
        <input
          required
          maxLength={300}
          className="w-full rounded-md border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">
          Slug <span className="font-normal text-gray-500">(leave blank to auto-generate)</span>
        </label>
        <input
          maxLength={200}
          pattern="[a-z0-9-]+"
          className="w-full rounded-md border px-3 py-2 font-mono text-sm"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="my-game-slug"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Image</label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          {img ? (
            <img
              src={img}
              alt="preview"
              className="h-32 w-32 rounded-full border-4 border-white object-cover shadow"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed border-gray-300 text-xs text-gray-400">
              Preview
            </div>
          )}
          <p className="text-sm text-gray-600">
            Drag &amp; drop an image here, or
          </p>
          <label className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            {uploading ? "Uploading…" : "Choose file"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
              }}
            />
          </label>
          <input
            type="url"
            placeholder="or paste image URL"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={img}
            onChange={(e) => setImg(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">
          Content (HTML)
        </label>
        <textarea
          rows={10}
          className="w-full rounded-md border px-3 py-2 font-mono text-xs"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="<p>Full review HTML…</p>"
        />
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={saving || uploading}
        className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}