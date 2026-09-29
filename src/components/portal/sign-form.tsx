"use client";

import { useActionState, useState } from "react";
import { signAgreement } from "@/lib/actions/quotes";
import { Checkbox, Field, FormMessage, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

export function SignForm({ agreementId, hash, defaultName }: { agreementId: string; hash: string; defaultName: string }) {
  const [state, action] = useActionState(signAgreement, null);
  const [name, setName] = useState(defaultName);
  const now = new Intl.DateTimeFormat("nl-NL", { dateStyle: "long", timeZone: "Europe/Amsterdam" }).format(new Date());

  if (state?.ok) return <FormMessage state={state} />;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="agreement_id" value={agreementId} />
      <input type="hidden" name="hash" value={hash} />
      <Field label="Je volledige naam" hint="Dit geldt als je digitale handtekening.">
        <Input name="name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </Field>
      {name.trim().length > 2 && (
        <div className="rounded-xl border border-ink-700 bg-ink-950 px-5 py-4">
          <p className="serif text-4xl text-bone">{name}</p>
          <p className="mt-1 text-xs text-mist">Digitaal ondertekend op {now}</p>
        </div>
      )}
      <Checkbox name="agree" required label="Ik heb de overeenkomst gelezen en ga ermee akkoord. Ik begrijp dat mijn naam, datum, tijd en IP-adres worden vastgelegd." />
      <FormMessage state={state} />
      <SubmitButton size="lg" pendingText="Ondertekenen…">
        Onderteken overeenkomst
      </SubmitButton>
    </form>
  );
}
