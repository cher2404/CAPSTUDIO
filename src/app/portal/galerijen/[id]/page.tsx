import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientGallery } from "@/components/portal/client-gallery";
import { Badge } from "@/components/ui/card";
import { requireClient } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { withPreviewUrls } from "@/lib/galleries";
import type { Gallery, GalleryFile, Project } from "@/lib/types";

export const metadata = { title: "Galerij" };

export default async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireClient();
  const { data } = await supabase.from("galleries").select("*, projects(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const gallery = data as Gallery & { projects: Project };

  const [{ data: files }, { data: canDownload }] = await Promise.all([
    supabase.from("files").select("*").eq("gallery_id", id).order("sort").order("created_at"),
    supabase.rpc("can_download_gallery", { p_gallery_id: id }),
  ]);
  const items = await withPreviewUrls((files ?? []) as GalleryFile[]);

  return (
    <>
      <Link href="/portal/galerijen" className="mb-6 inline-block text-sm text-mist hover:text-bone">
        ← Alle galerijen
      </Link>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{gallery.projects.title}</p>
          <h1 className="mt-3 text-4xl md:text-5xl">{gallery.title}</h1>
          {gallery.shoot_date && <p className="mt-2 text-sm text-mist">Geschoten op {formatDate(gallery.shoot_date)}</p>}
          {gallery.description && <p className="mt-3 max-w-2xl text-mist">{gallery.description}</p>}
        </div>
        {canDownload ? (
          <Badge tone="good">Downloads beschikbaar</Badge>
        ) : (
          <div className="max-w-xs rounded-xl border border-ink-700 p-3 text-xs text-mist">
            Downloads in hoge resolutie komen beschikbaar zodra de betaling binnen is. Favorieten kiezen kan al wel.
          </div>
        )}
      </div>
      <ClientGallery items={items.map(({ id, url, file_name, width, height, is_favorite }) => ({ id, url, file_name, width, height, is_favorite }))} canDownload={Boolean(canDownload)} />
    </>
  );
}
