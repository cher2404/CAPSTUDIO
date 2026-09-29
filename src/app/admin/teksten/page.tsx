import { saveTexts } from "../_actions/content";
import { ActionForm } from "@/components/admin/forms";
import { Card, PageHeader } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { textDefs, type TextDef } from "@/content/texts";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Websiteteksten" };

export default async function TextsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_texts").select("key, value");
  const overrides = new Map((data ?? []).map((r) => [r.key as string, r.value as string]));

  const pages = new Map<string, [string, TextDef][]>();
  for (const [key, def] of Object.entries(textDefs) as [string, TextDef][]) {
    pages.set(def.page, [...(pages.get(def.page) ?? []), [key, def]]);
  }

  return (
    <>
      <PageHeader eyebrow="Website" title="Websiteteksten">
        Pas de teksten van de publieke website aan. Een veld dat gelijk is aan de standaardtekst blijft gewoon de standaard volgen.
      </PageHeader>
      <ActionForm action={saveTexts} className="space-y-5">
        {[...pages.entries()].map(([page, fields]) => (
          <Card key={page}>
            <h2 className="mb-5 text-2xl">{page}</h2>
            <div className="space-y-4">
              {fields.map(([key, def]) => {
                const value = overrides.get(key) ?? def.default;
                const changed = overrides.has(key);
                return (
                  <Field key={key} label={`${def.label}${changed ? " · aangepast" : ""}`} hint={changed && def.default ? `Standaard: ${def.default}` : undefined}>
                    {def.multiline ? (
                      <Textarea name={key} defaultValue={value} rows={def.markdown ? 10 : 3} className={def.markdown ? "font-mono text-xs leading-relaxed" : "min-h-20"} />
                    ) : (
                      <Input name={key} defaultValue={value} />
                    )}
                  </Field>
                );
              })}
            </div>
          </Card>
        ))}
        <div className="sticky bottom-4 z-10">
          <SubmitButton size="lg" className="shadow-2xl">
            Alle teksten opslaan
          </SubmitButton>
        </div>
      </ActionForm>
    </>
  );
}
