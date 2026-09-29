import { saveQuoteTemplate } from "@/app/admin/_actions/quotes";
import { ActionForm } from "@/components/admin/forms";
import { ItemsEditor } from "@/components/admin/items-editor";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { QuoteTemplate } from "@/lib/types";

export function QuoteTemplateForm({ template }: { template?: QuoteTemplate }) {
  return (
    <ActionForm action={saveQuoteTemplate} className="space-y-5">
      <input type="hidden" name="id" value={template?.id ?? ""} />
      <Card className="grid gap-4 md:grid-cols-2">
        <Field label="Naam sjabloon">
          <Input name="name" defaultValue={template?.name} required />
        </Field>
        <Field label="Titel op de offerte">
          <Input name="title" defaultValue={template?.title} />
        </Field>
        <Field label="Introductie (markdown)" className="md:col-span-2">
          <Textarea name="intro" defaultValue={template?.intro ?? ""} rows={3} />
        </Field>
        <Field label="Geldigheid (dagen)">
          <Input name="validity_days" type="number" defaultValue={template?.validity_days ?? 14} />
        </Field>
        <Field label="Bewerkingsrondes">
          <Input name="revision_rounds" type="number" defaultValue={template?.revision_rounds ?? 1} />
        </Field>
        <Field label="Gebruiksrechten" className="md:col-span-2">
          <Textarea name="usage_rights" defaultValue={template?.usage_rights ?? ""} rows={2} className="min-h-16" />
        </Field>
      </Card>
      <Card>
        <h2 className="mb-4 text-2xl">Standaardregels</h2>
        <ItemsEditor initial={template?.items ?? []} />
      </Card>
      <SubmitButton>Opslaan</SubmitButton>
    </ActionForm>
  );
}
