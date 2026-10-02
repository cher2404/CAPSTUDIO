import Image from "next/image";
import { deletePortfolioItem, saveSettings, updatePortfolioItem } from "../_actions/content";
import { ActionForm, ConfirmButton } from "@/components/admin/forms";
import { PortfolioUploader } from "@/components/admin/portfolio-uploader";
import { Card, PageHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/auth";
import { portfolioCategories } from "@/lib/categories";
import type { PortfolioItem } from "@/lib/types";

export const metadata = { title: "Portfolio" };

export default async function AdminPortfolioPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, { data: reel }] = await Promise.all([
    supabase.from("portfolio_items").select("*").order("sort").order("created_at", { ascending: false }),
    supabase.from("settings").select("value").eq("key", "reel_url").maybeSingle(),
  ]);
  const items = (data ?? []) as PortfolioItem[];

  return (
    <>
      <PageHeader eyebrow="Website" title="Portfolio">
        {items.length === 0
          ? "Er staan nu voorbeeldfoto's op de website. Zodra je hier je eigen werk toevoegt, worden die vervangen."
          : "Gebruik alleen werk waarvoor de klant toestemming heeft gegeven (zie projecten). Voor apps en games upload je een screenshot en vul je een omschrijving en link in."}
      </PageHeader>

      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-xl">Foto&apos;s toevoegen</h2>
          <PortfolioUploader />
        </Card>
        <Card>
          <h2 className="mb-4 text-xl">Showreel</h2>
          <ActionForm action={saveSettings} className="flex flex-col gap-3 md:flex-row md:items-end">
            <Field label="YouTube- of Vimeo-link" className="flex-1">
              <Input name="reel_url" defaultValue={(reel?.value as string) ?? ""} placeholder="https://vimeo.com/…" />
            </Field>
            <SubmitButton variant="subtle">Opslaan</SubmitButton>
          </ActionForm>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="p-3 md:p-3">
            <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-ink-850">
              <Image src={item.image_url} alt={item.alt ?? ""} fill sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover" />
            </div>
            <form action={updatePortfolioItem} className="space-y-2 text-sm">
              <input type="hidden" name="id" value={item.id} />
              <div className="grid grid-cols-[1fr_70px] gap-2">
                <select name="category" defaultValue={item.category} className="field py-2">
                  {portfolioCategories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input name="sort" type="number" defaultValue={item.sort} className="field py-2" title="Volgorde" />
              </div>
              <input name="title" defaultValue={item.title ?? ""} placeholder="Titel (optioneel)" className="field py-2" />
              <input name="alt" defaultValue={item.alt ?? ""} placeholder="Beschrijving voor SEO/toegankelijkheid" className="field py-2" />
              {item.category === "video" && <input name="video_url" defaultValue={item.video_url ?? ""} placeholder="Video-link (YouTube/Vimeo)" className="field py-2" />}
              {(item.category === "apps" || item.category === "games") && (
                <>
                  <textarea name="description" defaultValue={item.description ?? ""} placeholder="Korte omschrijving van het project" rows={2} className="field py-2" />
                  <input name="link_url" defaultValue={item.link_url ?? ""} placeholder="Link naar de app, site of game (optioneel)" className="field py-2" />
                </>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-mist">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" name="featured" defaultChecked={item.featured} className="accent-[var(--color-ember)]" /> Hero
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" name="published" defaultChecked={item.published} className="accent-[var(--color-ember)]" /> Zichtbaar
                </label>
                <SubmitButton size="sm" variant="subtle" className="ml-auto">
                  Opslaan
                </SubmitButton>
              </div>
            </form>
            <form action={deletePortfolioItem} className="mt-2 text-right">
              <input type="hidden" name="id" value={item.id} />
              <ConfirmButton className="text-xs text-rose" message="Foto verwijderen?">
                Verwijderen
              </ConfirmButton>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}
