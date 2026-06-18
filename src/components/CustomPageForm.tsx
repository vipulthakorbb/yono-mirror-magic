import { useState } from "react";

export type PageFormValues = {
  slug: string;
  title: string;
  head_html: string;
  body_html: string;
};

export function CustomPageForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<PageFormValues>;
  submitLabel: string;
  onSubmit: (v: PageFormValues) => Promise<void>;
}) {
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [headHtml, setHeadHtml] = useState(initial?.head_html ?? "");
  const [bodyHtml, setBodyHtml] = useState(initial?.body_html ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!/^[a-z0-9-]+$/.test(slug.trim())) {
      setErr("Slug must be lowercase letters, numbers, and hyphens only.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        slug: slug.trim(),
        title: title.trim(),
        head_html: headHtml,
        body_html: bodyHtml,
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="My landing page"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">
          Slug <span className="text-xs font-normal text-gray-500">(URL will be /p/&lt;slug&gt;)</span>
        </label>
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-md border px-3 py-2 font-mono text-sm"
          placeholder="my-page"
          pattern="[a-z0-9-]+"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">
          Head HTML
          <span className="ml-1 text-xs font-normal text-gray-500">
            (inserted inside &lt;head&gt; — meta, link, scripts, etc.)
          </span>
        </label>
        <textarea
          value={headHtml}
          onChange={(e) => setHeadHtml(e.target.value)}
          rows={10}
          className="w-full rounded-md border px-3 py-2 font-mono text-xs"
          placeholder={`<meta name="description" content="..." />\n<link rel="canonical" href="https://royalyono.com/p/my-page" />\n<script>/* analytics */</script>`}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">
          Body HTML
          <span className="ml-1 text-xs font-normal text-gray-500">(the page content)</span>
        </label>
        <textarea
          value={bodyHtml}
          onChange={(e) => setBodyHtml(e.target.value)}
          rows={20}
          className="w-full rounded-md border px-3 py-2 font-mono text-xs"
          placeholder="<h1>Hello</h1>\n<p>Page content goes here.</p>"
        />
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}