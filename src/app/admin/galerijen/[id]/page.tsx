import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteFile, deleteGallery, updateGallery } from "../../_actions/galleries";
import { ActionForm, ConfirmButton } from "@/components/admin/forms";
import { GalleryUploader } from "@/components/admin/gallery-uploader";
import { Badge, Card } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { PaymentStatusBadge } from "@/components/ui/status";
import { requireAdmin } from "@/lib/auth";
import { withPreviewUrls } from "@/lib/galleries";
import type { Gallery, GalleryFile, PaymentStatus } from "@/lib/types";

export default async function AdminGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("galleries").select("*, projects(id, title, payment_status, clients(full_name, email))").eq("id", id).maybeSingle();
  if (!data) notFound();
  const g = data as Gallery & { projects: { id: string; title: string; payment_status: PaymentStatus; clients: { full_name: string | null; email: string } } };
  const { data: files } = await supabase.from("files").select("*").eq("gallery_id", id).order("sort").order("created_at");
  const items = await withPreviewUrls((files ?? []) as GalleryFile[]);
  const favs = items.filter((f) => f.is_favorite);

  return (
    <>
      <Link href={`/admin/projecten/${g.projects.id}`} className="mb-6 inline-block text-sm text-mist hover:text-bone">
        ← {g.projects.clients.full_name ?? g.projects.clients.email} · {g.projects.title}
      </Link>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Galerij</p>
          <h1 className="mt-3 text-4xl">{g.title}</h1>
          <p className="mt-2 text-sm text-mist">
            {items.length} bestanden · {favs.length} favorieten gekozen door de klant
          </p>
        </div>
        <div className="flex gap-2">
          <Badge tone={g.published ? "good" : "neutral"}>{g.published ? "Online" : "Concept"}</Badge>
          <PaymentStatusBadge status={g.projects.payment_status} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <GalleryUploader galleryId={id} />
          {favs.length > 0 && (
            <Card>
              <h2 className="mb-2 text-xl">Favorieten van de klant</h2>
              <p className="text-xs break-all text-mist">{favs.map((f) => f.file_name).join(", ")}</p>
            </Card>
          )}
          <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
            {items.map((f) => (
              <figure key={f.id} className="group relative aspect-square overflow-hidden rounded-lg bg-ink-850">
                {f.url && !f.mime_type?.startsWith("video/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url} alt={f.file_name} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center p-2 text-center text-[10px] text-mist">{f.file_name}</span>
                )}
                {f.is_favorite && <span className="absolute top-1.5 left-1.5 text-sm text-ember">♥</span>}
                <form action={deleteFile} className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <input type="hidden" name="id" value={f.id} />
                  <ConfirmButton className="flex size-7 items-center justify-center rounded-full bg-ink-950/80 text-bone hover:text-rose" message="Bestand verwijderen?">
                    ×
                  </ConfirmButton>
                </form>
              </figure>
            ))}
          </div>
        </div>

        <Card className="h-fit xl:sticky xl:top-8">
          <h2 className="mb-4 text-2xl">Instellingen</h2>
          <ActionForm action={updateGallery} className="space-y-4">
            <input type="hidden" name="id" value={id} />
            <Field label="Titel">
              <Input name="title" defaultValue={g.title} required />
            </Field>
            <Field label="Shootdatum">
              <Input name="shoot_date" type="date" defaultValue={g.shoot_date ?? ""} />
            </Field>
            <Field label="Bericht bij de galerij">
              <Textarea name="description" defaultValue={g.description ?? ""} rows={3} className="min-h-20" />
            </Field>
            <Checkbox name="published" defaultChecked={g.published} label="Zichtbaar voor de klant" />
            {!g.published && <Checkbox name="notify" defaultChecked label="Stuur de klant een mail bij publiceren" />}
            <Checkbox
              name="downloads_unlocked"
              defaultChecked={g.downloads_unlocked}
              label={
                <>
                  Downloads in hoge resolutie vrijgeven
                  <span className="block text-xs text-mist">Gaat ook automatisch open als de betaalstatus &quot;betaald&quot; is.</span>
                </>
              }
            />
            <SubmitButton className="w-full">Opslaan</SubmitButton>
          </ActionForm>
          <form action={deleteGallery} className="mt-6 border-t border-ink-700/70 pt-4">
            <input type="hidden" name="id" value={id} />
            <ConfirmButton className={buttonClass("danger", "sm")} message="Galerij en alle bestanden definitief verwijderen?">
              Galerij verwijderen
            </ConfirmButton>
          </form>
        </Card>
      </div>
    </>
  );
}
