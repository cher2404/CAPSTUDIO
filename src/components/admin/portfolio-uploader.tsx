"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addPortfolioItems } from "@/app/admin/_actions/content";
import { pool, resizeImage, safeName } from "@/lib/image-client";
import { createClient } from "@/lib/supabase/client";
import { portfolioCategories } from "@/lib/categories";
import type { PortfolioCategory } from "@/lib/types";

export function PortfolioUploader() {
  const router = useRouter();
  const [category, setCategory] = useState<PortfolioCategory>("sport");
  const [progress, setProgress] = useState<string>("");

  async function handle(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    const supabase = createClient();
    const items: Parameters<typeof addPortfolioItems>[0] = [];
    let n = 0;
    setProgress(`0/${images.length}`);
    await pool(images, 3, async (file) => {
      // Webversie van max. 2400px: next/image maakt daar de juiste formaten van.
      const { blob, width, height } = await resizeImage(file, 2400, 0.86);
      const path = `${crypto.randomUUID()}-${safeName(file.name).replace(/\.\w+$/, "")}.jpg`;
      const { error } = await supabase.storage.from("portfolio").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (!error) {
        const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
        items.push({ image_url: data.publicUrl, storage_path: path, width, height, category, alt: "" });
      }
      setProgress(`${++n}/${images.length}`);
    });
    if (items.length) await addPortfolioItems(items);
    setProgress("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <select value={category} onChange={(e) => setCategory(e.target.value as PortfolioCategory)} className="field md:w-44">
        {portfolioCategories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <label className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed border-ink-600 px-4 py-4 text-sm text-bone-dim hover:border-ink-500">
        <input type="file" multiple accept="image/*" className="sr-only" disabled={!!progress} onChange={(e) => handle([...(e.target.files ?? [])])} />
        {progress ? `Uploaden… ${progress}` : "Kies foto's om toe te voegen"}
      </label>
    </div>
  );
}
