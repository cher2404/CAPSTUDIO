"use client";

import { useActionState } from "react";
import { requestDeletion, updateDetails } from "./actions";
import { Field, FormMessage, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Client } from "@/lib/types";

export function DetailsForm({ client }: { client: Client }) {
  const [state, action] = useActionState(updateDetails, null);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Naam">
          <Input name="full_name" defaultValue={client.full_name ?? ""} autoComplete="name" />
        </Field>
        <Field label="E-mail" hint="Wil je dit wijzigen? Stuur me een bericht.">
          <Input value={client.email} disabled />
        </Field>
        <Field label="Telefoon">
          <Input name="phone" defaultValue={client.phone ?? ""} type="tel" autoComplete="tel" />
        </Field>
        <Field label="Bedrijf (optioneel)">
          <Input name="company" defaultValue={client.company ?? ""} autoComplete="organization" />
        </Field>
        <Field label="Instagram (optioneel)">
          <Input name="instagram" defaultValue={client.instagram ?? ""} placeholder="@jouwaccount" />
        </Field>
        <Field label="Woonplaats (optioneel)">
          <Input name="city" defaultValue={client.city ?? ""} autoComplete="address-level2" />
        </Field>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Opslaan…">Opslaan</SubmitButton>
    </form>
  );
}

export function DeletionForm({ pending }: { pending: boolean }) {
  const [state, action] = useActionState(requestDeletion, null);
  if (pending || state?.ok) {
    return <FormMessage state={{ message: state?.message ?? "Je verwijderverzoek staat open. Ik handel het binnen een maand af." }} />;
  }
  return (
    <form action={action} className="space-y-4">
      <Field label="Reden (optioneel)">
        <Textarea name="reason" rows={3} className="min-h-20" />
      </Field>
      <Field label='Typ "verwijder" om te bevestigen'>
        <Input name="confirm" autoComplete="off" />
      </Field>
      <FormMessage state={state} />
      <SubmitButton variant="danger" pendingText="Versturen…">
        Verwijder mijn gegevens
      </SubmitButton>
    </form>
  );
}
