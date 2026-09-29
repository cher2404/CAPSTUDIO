import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GalleryFile } from "@/lib/types";

export type FileWithUrl = GalleryFile & { url: string | null };

/**
 * Tijdelijke URL's (1 uur) voor webversies. Roep dit alleen aan met bestanden
 * die je eerst via de RLS-client hebt opgehaald.
 */
export async function withPreviewUrls(files: GalleryFile[]): Promise<FileWithUrl[]> {
  const paths = files.map((f) => f.preview_path ?? f.original_path);
  if (!paths.length) return [];
  const db = createAdminClient();
  const previews = files.filter((f) => f.preview_path);
  const originals = files.filter((f) => !f.preview_path);

  const [a, b] = await Promise.all([
    previews.length ? db.storage.from("previews").createSignedUrls(previews.map((f) => f.preview_path!), 3600) : { data: [] },
    originals.length ? db.storage.from("originals").createSignedUrls(originals.map((f) => f.original_path), 3600) : { data: [] },
  ]);
  const map = new Map<string, string>();
  for (const r of [...(a.data ?? []), ...(b.data ?? [])]) if (r.path && r.signedUrl) map.set(r.path, r.signedUrl);
  return files.map((f) => ({ ...f, url: map.get(f.preview_path ?? f.original_path) ?? null }));
}
