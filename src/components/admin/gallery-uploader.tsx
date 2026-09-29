"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerFiles } from "@/app/admin/_actions/galleries";
import { pool, resizeImage, safeName } from "@/lib/image-client";
import { createClient } from "@/lib/supabase/client";

type Status = { name: string; state: "wachten" | "bezig" | "klaar" | "fout"; error?: string };

export function GalleryUploader({ galleryId }: { galleryId: string }) {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function handle(files: File[]) {
    if (!files.length) return;
    setBusy(true);
    setStatuses(files.map((f) => ({ name: f.name, state: "wachten" })));
    const supabase = createClient();
    const done: Parameters<typeof registerFiles>[1] = [];
    const set = (i: number, s: Partial<Status>) => setStatuses((prev) => prev.map((p, n) => (n === i ? { ...p, ...s } : p)));

    await pool(files, 3, async (file, i) => {
      set(i, { state: "bezig" });
      try {
        const id = crypto.randomUUID();
        const originalPath = `${galleryId}/${id}-${safeName(file.name)}`;
        let previewPath: string | null = null;
        let width = 0;
        let height = 0;

        if (file.type.startsWith("image/")) {
          const preview = await resizeImage(file, 2000, 0.8);
          width = preview.originalWidth;
          height = preview.originalHeight;
          previewPath = `${galleryId}/${id}.jpg`;
          const { error } = await supabase.storage.from("previews").upload(previewPath, preview.blob, { contentType: "image/jpeg", cacheControl: "31536000" });
          if (error) throw error;
        }
        const { error } = await supabase.storage.from("originals").upload(originalPath, file, { contentType: file.type || "application/octet-stream" });
        if (error) throw error;

        done.push({ original_path: originalPath, preview_path: previewPath, file_name: file.name, mime_type: file.type, width, height, size_bytes: file.size });
        set(i, { state: "klaar" });
      } catch (err) {
        set(i, { state: "fout", error: err instanceof Error ? err.message : "Upload mislukt" });
      }
    });

    if (done.length) {
      done.sort((a, b) => a.file_name.localeCompare(b.file_name, "nl", { numeric: true }));
      await registerFiles(galleryId, done);
    }
    setBusy(false);
    router.refresh();
  }

  const finished = statuses.filter((s) => s.state === "klaar").length;

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (!busy) handle([...e.dataTransfer.files]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors ${drag ? "border-ember bg-ember/5" : "border-ink-600 hover:border-ink-500"}`}
      >
        <input type="file" multiple accept="image/*,video/*" className="sr-only" disabled={busy} onChange={(e) => handle([...(e.target.files ?? [])])} />
        <p className="font-display text-2xl text-bone">{busy ? `Uploaden… ${finished}/${statuses.length}` : "Sleep foto's hierheen"}</p>
        <p className="mt-1 text-sm text-mist">of klik om te kiezen. Originelen blijven op volle resolutie, klanten zien eerst een webversie.</p>
      </label>
      {statuses.some((s) => s.state === "fout") && (
        <ul className="mt-3 space-y-1 text-xs text-rose">
          {statuses
            .filter((s) => s.state === "fout")
            .map((s) => (
              <li key={s.name}>
                {s.name}: {s.error}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
