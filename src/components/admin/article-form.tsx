import { saveArticle } from "@/app/admin/_actions/content";
import { ActionForm } from "@/components/admin/forms";
import { Card } from "@/components/ui/card";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Article } from "@/lib/types";

export function ArticleForm({ article }: { article?: Article }) {
  return (
    <ActionForm action={saveArticle} className="space-y-5">
      <input type="hidden" name="id" value={article?.id ?? ""} />
      <Card className="grid gap-4 md:grid-cols-2">
        <Field label="Titel" className="md:col-span-2">
          <Input name="title" defaultValue={article?.title} required />
        </Field>
        <Field label="Slug (url)" hint="Leeg = automatisch uit de titel">
          <Input name="slug" defaultValue={article?.slug} />
        </Field>
        <Field label="Volgorde">
          <Input name="sort" type="number" defaultValue={article?.sort ?? 0} />
        </Field>
        <Field label="Korte samenvatting" className="md:col-span-2">
          <Textarea name="excerpt" defaultValue={article?.excerpt ?? ""} rows={2} className="min-h-16" />
        </Field>
        <Field label="Coverafbeelding (url, optioneel)" className="md:col-span-2">
          <Input name="cover_url" defaultValue={article?.cover_url ?? ""} placeholder="https://…" />
        </Field>
      </Card>
      <Card>
        <Field label="Tekst (markdown: ## kop, **vet**, - lijstje, [link](url))">
          <Textarea name="body" defaultValue={article?.body ?? ""} rows={22} className="font-mono text-xs leading-relaxed" />
        </Field>
      </Card>
      <div className="flex flex-wrap items-center gap-5">
        <Checkbox name="published" defaultChecked={article?.published ?? false} label="Gepubliceerd (zichtbaar voor klanten)" />
        <SubmitButton>Opslaan</SubmitButton>
      </div>
    </ActionForm>
  );
}
