import { deletePackage, savePackage } from "../_actions/content";
import { ConfirmButton } from "@/components/admin/forms";
import { Card, PageHeader } from "@/components/ui/card";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/auth";
import type { Package } from "@/lib/types";

export const metadata = { title: "Pakketten" };

function PackageForm({ p }: { p?: Package }) {
  return (
    <form action={savePackage} className="grid gap-3 md:grid-cols-2">
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <Field label="Naam">
        <Input name="name" defaultValue={p?.name} required />
      </Field>
      <Field label="Ondertitel">
        <Input name="tagline" defaultValue={p?.tagline ?? ""} />
      </Field>
      <div className="grid grid-cols-3 gap-3 md:col-span-2">
        <Field label="Prijslabel">
          <Input name="price_label" defaultValue={p?.price_label ?? "vanaf"} />
        </Field>
        <Field label="Prijs (incl. btw)">
          <Input name="price_from" inputMode="decimal" defaultValue={p?.price_from ?? ""} />
        </Field>
        <Field label="Duur">
          <Input name="duration" defaultValue={p?.duration ?? ""} />
        </Field>
      </div>
      <Field label="Wat zit erin (één per regel)" className="md:col-span-2">
        <Textarea name="features" defaultValue={p?.features.join("\n")} rows={5} />
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
  const { data } = await supabase.from("packages").select("*").order("sort");
  return (
    <>
      <PageHeader eyebrow="Website" title="Diensten en tarieven">
        Deze pakketten staan op de pagina Diensten. Tip: maak voor elk pakket ook een offertesjabloon.
      </PageHeader>
      <div className="space-y-5">
        {((data ?? []) as Package[]).map((p) => (
          <Card key={p.id}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl">{p.name}</h2>
              <form action={deletePackage}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton className="text-xs text-rose" message="Pakket verwijderen?">
                  Verwijderen
                </ConfirmButton>
              </form>
            </div>
            <PackageForm p={p} />
          </Card>
        ))}
        <Card>
          <h2 className="mb-4 text-2xl">Nieuw pakket</h2>
          <PackageForm />
        </Card>
      </div>
    </>
  );
}
