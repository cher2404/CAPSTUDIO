import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { withPreviewUrls } from "@/lib/galleries";
import { getMyProjects } from "@/lib/portal";
import type { Gallery, GalleryFile } from "@/lib/types";

export const metadata = { title: "Mijn foto's" };

export default async function GalerijenPage() {
  const { supabase, projects } = await getMyProjects();
  const { data } = await supabase.from("galleries").select("*").order("published_at", { ascending: false });
  const galleries = (data ?? []) as Gallery[];

  const covers = await Promise.all(
    galleries.map(async (g) => {
      const { data: f } = await supabase.from("files").select("*").eq("gallery_id", g.id).order("sort").limit(1);
      const [withUrl] = await withPreviewUrls((f ?? []) as GalleryFile[]);
      const { count } = await supabase.from("files").select("id", { count: "exact", head: true }).eq("gallery_id", g.id);
      return { id: g.id, url: withUrl?.url ?? null, count: count ?? 0 };
    }),
  );

  return (
    <>
      <PageHeader eyebrow="Mijn foto's" title="Je galerijen">
        Bekijk je beelden, kies je favorieten en download ze in hoge resolutie zodra ze zijn vrijgegeven.
      </PageHeader>
      {galleries.length === 0 ? (
        <EmptyState title="Nog even geduld">Na de shoot ga ik aan de slag met bewerken. Je krijgt een mail zodra je galerij klaarstaat.</EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {galleries.map((g) => {
            const cover = covers.find((c) => c.id === g.id);
            return (
              <Link key={g.id} href={`/portal/galerijen/${g.id}`} className="group overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900/60">
                <div className="relative aspect-[16/10] overflow-hidden bg-ink-850">
                  {cover?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-1000 group-hover:scale-[1.03]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <p className="font-display text-3xl text-bone">{g.title}</p>
                    <p className="text-xs text-bone-dim">
                      {cover?.count ?? 0} beelden · {projects.find((p) => p.id === g.project_id)?.title}
                      {g.shoot_date && <> · {formatDate(g.shoot_date)}</>}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
