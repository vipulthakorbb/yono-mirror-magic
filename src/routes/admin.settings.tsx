import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminGetSiteSettings, adminUpdateSiteSettings } from "@/lib/admin.functions";
import {
  DEFAULT_HOME_SECTION_TITLE,
  DEFAULT_HOME_SECTION_CONTENT,
} from "@/lib/home-defaults";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const get = useServerFn(adminGetSiteSettings);
  const update = useServerFn(adminUpdateSiteSettings);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "site-settings"],
    queryFn: () => get(),
  });

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionContent, setSectionContent] = useState("");
  const [sectionImage, setSectionImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [insertingImg, setInsertingImg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!data) return;
    setMetaTitle(data.meta_title ?? "");
    setMetaDescription(data.meta_description ?? "");
    setMetaKeywords(data.meta_keywords ?? "");
    setSectionTitle(data.section_title ?? DEFAULT_HOME_SECTION_TITLE);
    setSectionContent(
      data.section_content && data.section_content.trim()
        ? data.section_content
        : DEFAULT_HOME_SECTION_CONTENT,
    );
    setSectionImage(data.section_image ?? "");
  }, [data]);

  const uploadImage = useCallback(async (file: File, target: "hero" | "inline") => {
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    setErr("");
    if (target === "hero") setUploading(true);
    else setInsertingImg(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `home/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("game-icons")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("game-icons").getPublicUrl(path);
      if (target === "hero") {
        setSectionImage(pub.publicUrl);
      } else {
        const html = `<img src="${pub.publicUrl}" alt="" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;" />`;
        const ta = contentRef.current;
        if (ta) {
          const start = ta.selectionStart ?? sectionContent.length;
          const end = ta.selectionEnd ?? sectionContent.length;
          const next = sectionContent.slice(0, start) + html + sectionContent.slice(end);
          setSectionContent(next);
          setTimeout(() => {
            ta.focus();
            ta.selectionStart = ta.selectionEnd = start + html.length;
          }, 0);
        } else {
          setSectionContent((c) => c + html);
        }
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploading(false);
      setInsertingImg(false);
    }
  }, [sectionContent]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setOkMsg("");
    setSaving(true);
    try {
      await update({
        data: {
          meta_title: metaTitle.trim(),
          meta_description: metaDescription.trim(),
          meta_keywords: metaKeywords.trim(),
          section_title: sectionTitle.trim(),
          section_content: sectionContent,
          section_image: sectionImage.trim(),
        },
      });
      await qc.invalidateQueries({ queryKey: ["site-settings"] });
      await qc.invalidateQueries({ queryKey: ["admin", "site-settings"] });
      setOkMsg("Saved! Changes appear on the home page within seconds.");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link to="/admin" className="mb-4 inline-block text-sm text-gray-600 hover:underline">
        ← Back
      </Link>
      <h1 className="mb-1 text-2xl font-bold">Home page settings</h1>
      <p className="mb-4 text-sm text-gray-600">
        Edit the home page &lt;head&gt; meta and the custom content section shown below the games grid.
      </p>
      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <form onSubmit={submit} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
          <fieldset className="rounded-lg border border-gray-200 p-4">
            <legend className="px-2 text-sm font-semibold text-gray-700">SEO / &lt;head&gt; meta</legend>
            <div>
              <label className="mb-1 block text-sm font-semibold">Meta title</label>
              <input
                maxLength={300}
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Yono Rummy APK & Yono Games Download — RoyalYono"
              />
              <p className="mt-1 text-xs text-gray-500">≤60 chars recommended. Leave blank for default.</p>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-sm font-semibold">Meta description</label>
              <textarea
                maxLength={500}
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Short summary shown in search results (≤160 chars)."
              />
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-sm font-semibold">Meta keywords</label>
              <textarea
                maxLength={1000}
                rows={2}
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="yono rummy, yono games, yono apk, royal yono, ..."
              />
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-gray-200 p-4">
            <legend className="px-2 text-sm font-semibold text-gray-700">Custom home section</legend>
            <div>
              <label className="mb-1 block text-sm font-semibold">Section heading</label>
              <input
                maxLength={300}
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Why play with RoyalYono?"
              />
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-sm font-semibold">Section image</label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {sectionImage ? (
                  <img
                    src={sectionImage}
                    alt="preview"
                    className="h-24 w-24 rounded-lg border object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed text-xs text-gray-400">
                    Preview
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    {uploading ? "Uploading…" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadImage(f, "hero");
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="or paste image URL"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={sectionImage}
                    onChange={(e) => setSectionImage(e.target.value)}
                  />
                  {sectionImage && (
                    <button
                      type="button"
                      className="text-left text-xs text-red-600 hover:underline"
                      onClick={() => setSectionImage("")}
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-sm font-semibold">Section content (HTML allowed)</label>
              <div className="mb-2">
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-blue-600 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                  {insertingImg ? "Uploading…" : "🖼  Insert image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(f, "inline");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <textarea
                ref={contentRef}
                rows={14}
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={sectionContent}
                onChange={(e) => setSectionContent(e.target.value)}
                placeholder="<p>Welcome to RoyalYono...</p>"
              />
              <p className="mt-1 text-xs text-gray-500">
                Supports HTML. Use the Insert image button to upload and embed images.
              </p>
            </div>
          </fieldset>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {okMsg && <p className="text-sm text-green-700">{okMsg}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-md bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="text-sm text-gray-600 hover:underline"
            >
              View home page →
            </button>
          </div>
        </form>
      )}
    </div>
  );
}