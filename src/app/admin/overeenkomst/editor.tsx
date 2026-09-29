"use client";

import { useState } from "react";
import { saveAgreementTemplate } from "../_actions/quotes";
import { ActionForm } from "@/components/admin/forms";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { AgreementTemplate } from "@/lib/types";

const placeholders: [string, string][] = [
  ["klant_naam", "Naam klant"],
  ["klant_email", "E-mail klant"],
  ["bedrijf", "Bedrijfsnaam"],
  ["project", "Projecttitel"],
  ["offerte_nummer", "Offertenummer"],
  ["totaal", "Totaalbedrag"],
  ["gebruiksrechten", "Gebruiksrechten uit de offerte"],
  ["bewerkingsrondes", "Aantal bewerkingsrondes"],
  ["datum", "Datum van vandaag"],
];

export function AgreementEditor({ template, previewHtml }: { template: AgreementTemplate | null; previewHtml: string }) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  return (
    <ActionForm action={saveAgreementTemplate} className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="space-y-5">
        <input type="hidden" name="id" value={template?.id ?? ""} />
        <Card className="grid gap-4 md:grid-cols-2">
          <Field label="Naam">
            <Input name="name" defaultValue={template?.name ?? "Standaard overeenkomst"} />
          </Field>
          <Field label="Standaard bewerkingsrondes">
            <Input name="default_revision_rounds" type="number" defaultValue={template?.default_revision_rounds ?? 1} />
          </Field>
          <Field label="Standaard gebruiksrechten (als de offerte niets vermeldt)" className="md:col-span-2">
            <Textarea name="default_usage_rights" defaultValue={template?.default_usage_rights ?? ""} rows={2} className="min-h-16" />
          </Field>
        </Card>
        <Card>
          <div className="mb-4 flex gap-2">
            {(["edit", "preview"] as const).map((t) => (
              <button type="button" key={t} onClick={() => setTab(t)} className={`rounded-full border px-4 py-1.5 text-sm ${tab === t ? "border-bone bg-bone text-ink-950" : "border-ink-600 text-mist"}`}>
                {t === "edit" ? "Bewerken" : "Voorbeeld (laatst opgeslagen)"}
              </button>
            ))}
          </div>
          <Textarea name="body" defaultValue={template?.body ?? ""} rows={28} className={`font-mono text-xs leading-relaxed ${tab === "edit" ? "" : "hidden"}`} />
          {tab === "preview" && <div className="prose-cap" dangerouslySetInnerHTML={{ __html: previewHtml }} />}
        </Card>
        <SubmitButton>Sjabloon opslaan</SubmitButton>
      </div>
      <Card className="h-fit lg:sticky lg:top-8">
        <h2 className="text-xl">Variabelen</h2>
        <p className="mt-1 mb-4 text-xs text-mist">Worden automatisch ingevuld als de klant een offerte accepteert.</p>
        <ul className="space-y-2 text-xs">
          {placeholders.map(([k, label]) => (
            <li key={k}>
              <code className="text-ember-soft">{`{{${k}}}`}</code>
              <span className="block text-mist">{label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-mist">Opmaak: # kop, ## subkop, **vet**, - lijstje.</p>
      </Card>
    </ActionForm>
  );
}
