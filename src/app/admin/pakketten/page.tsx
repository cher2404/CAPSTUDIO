import Link from "next/link";
import { deletePackage, savePackage } from "../_actions/content";
import { ConfirmButton } from "@/components/admin/forms";
import { Card, PageHeader } from "@/components/ui/card";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/auth";
import { displayPrice, type Pricing } from "@/lib/content";
import { disciplineLabel, disciplines } from "@/lib/categories";
import type { Package } from "@/lib/types";

export const metadata = { title: "Pakketten" };

function PackageForm({ p, pricing }: { p?: Package; pricing: Pricing }) {
  const shown = p && p.price != null ? displayPrice(p, pricing)!.replace(/[^\d,.]/g, "") : "";
  return (
    <form action={savePackage} className="grid gap-3 md:grid-cols-2">
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <input type="hidden" name="vat_rate" value={pricing.vatRate} />
      <Field label="Naam">
        <Input name="name" defaultValue={p?.name} required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Discipline">
          <Select name="category" defaultValue={p?.category ?? "beeld"}>
            {disciplines.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Label rechtsboven">
          <Input name="duration" defaultValue={p?.duration ?? ""} placeholder="1 uur" />
        </Field>
      </div>
      <div className="grid grid-cols-[90px_1fr_130px] gap-3 md:col-span-2">
        <Field label="Voorvoegsel">
          <Input name="price_label" defaultValue={p?.price_label ?? ""} placeholder="vanaf" />
        </Field>
        <Field label="Prijs (leeg = prijs na overleg)">
          <Input name="price" inputMode="decimal" defaultValue={shown} placeholder="175" />
        </Field>
        <Field label="Ingevoerd">
          <Select name="price_mode" defaultValue={pricing.display}>
            <option value="incl">incl. btw</option>
            <option value="excl">excl. btw</option>
          </Select>
        </Field>
      </div>
      <Field label="Wat zit erin (één per regel)">
        <Textarea name="features" defaultValue={p?.features.join("\n")} rows={4} />
      </Field>
      <Field label="Omschrijving onder de lijst">
        <Textarea name="tagline" defaultValue={p?.tagline ?? ""} rows={4} />
      </Field>
      <Field label="Volgorde">
        <Input name="sort" type="number" defaultValue={p?.sort ?? 0} />
      </Field>
      <div className="flex flex-col justify-end gap-2">
        <Checkbox name="highlighted" defaultChecked={p?.highlighted} label="Uitlichten (meest gekozen)" />
        <Checkbox name="active" defaultChecked={p?.active ?? true} label="Tonen op de website" />
      </div>
      <div className="md:col-span-2">
        <SubmitButton size="sm">{p ? "Opslaan" : "Toevoegen"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function PackagesPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, { data: settings }] = await Promise.all([
    supabase.from("packages").select("*").order("sort"),
    supabase.from("settings").select("key, value").in("key", ["vat_rate", "price_display"]),
  ]);
  const get = (k: string) => settings?.find((s) => s.key === k)?.value;
  const pricing: Pricing = { vatRate: Number(get("vat_rate") ?? 21), display: get("price_display") === "excl" ? "excl" : "incl" };

  return (
    <>
      <PageHeader eyebrow="Website" title="Diensten en tarieven">
        Deze pakketten staan op de tarievenpagina en zijn de basis voor je offertes. De website toont prijzen nu{" "}
        <strong className="text-bone">{pricing.display === "incl" ? "inclusief" : "exclusief"} btw</strong> ({pricing.vatRate}%). Wijzigen kan bij{" "}
        <Link href="/admin/instellingen" className="text-ember-soft underline underline-offset-2">
          Instellingen
        </Link>
        . De teksten onder de kaarten pas je aan bij{" "}
        <Link href="/admin/teksten" className="text-ember-soft underline underline-offset-2">
          Websiteteksten
        </Link>
        .
      </PageHeader>
      <div className="space-y-5">
        {((data ?? []) as Package[]).map((p) => (
          <Card key={p.id}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl">
                <span className="label mr-3 align-middle">{disciplineLabel[p.category ?? "beeld"]}</span>
                {p.name}{" "}
                <span className="font-sans text-sm text-mist">
                  {p.price != null ? `${displayPrice(p, pricing)} ${pricing.display === "incl" ? "incl." : "excl."} btw` : "prijs na overleg"}
                </span>
              </h2>
              <form action={deletePackage}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton className="text-xs text-rose" message="Pakket verwijderen?">
                  Verwijderen
                </ConfirmButton>
              </form>
            </div>
            <PackageForm p={p} pricing={pricing} />
          </Card>
        ))}
        <Card>
          <h2 className="mb-4 text-2xl">Nieuw pakket</h2>
          <PackageForm pricing={pricing} />
        </Card>
      </div>
    </>
  );
}
