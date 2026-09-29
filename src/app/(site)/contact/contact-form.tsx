"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitContact } from "./actions";
import { Checkbox, Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

const types = ["Kennismakingsshoot", "Mini shoot", "Halve dag", "Foto plus video", "Iets anders / weet ik nog niet"];

export function ContactForm({ defaultType }: { defaultType?: string }) {
  const [state, action] = useActionState(submitContact, null);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-moss/30 bg-moss/10 p-8">
        <p className="font-display text-3xl text-bone">Top, dank je!</p>
        <p className="mt-3 text-mist">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Naam">
          <Input name="name" required autoComplete="name" placeholder="Je voor- en achternaam" />
        </Field>
        <Field label="E-mail">
          <Input name="email" type="email" required autoComplete="email" placeholder="jij@voorbeeld.nl" />
        </Field>
        <Field label="Telefoon (optioneel)">
          <Input name="phone" type="tel" autoComplete="tel" placeholder="06 …" />
        </Field>
        <Field label="Soort shoot">
          <Select name="type" defaultValue={defaultType ?? types[4]}>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Voorkeursdatum of periode (optioneel)">
        <Input name="date" placeholder="Bijv. eind oktober, liefst in het weekend" />
      </Field>
      <Field label="Vertel over je idee">
        <Textarea name="message" required rows={6} placeholder="Wat voor beelden zoek je, waarvoor ga je ze gebruiken en heb je al een locatie in gedachten?" />
      </Field>
      <div aria-hidden className="absolute -left-[9999px]">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Checkbox
        name="privacy"
        required
        label={
          <>
            Ik ga akkoord met de{" "}
            <Link href="/privacy" className="text-ember-soft underline underline-offset-2" target="_blank">
              privacyverklaring
            </Link>
            . Mijn gegevens worden alleen gebruikt om mijn aanvraag te behandelen.
          </>
        }
      />
      <FormMessage state={state} />
      <SubmitButton size="lg" pendingText="Versturen…">
        Verstuur aanvraag
      </SubmitButton>
    </form>
  );
}
