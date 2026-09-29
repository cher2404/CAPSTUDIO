"use client";

import { useActionState } from "react";
import { sendMagicLink } from "./actions";
import { Field, FormMessage, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm({ next, email }: { next?: string; email?: string }) {
  const [state, action] = useActionState(sendMagicLink, null);

  if (state?.ok) {
    return (
      <div className="animate-fade-up space-y-3 rounded-2xl border border-ink-700 bg-ink-900/70 p-6">
        <p className="font-display text-2xl text-bone">Link verstuurd ✦</p>
        <p className="text-sm leading-relaxed text-mist">{state.message}</p>
        <p className="text-xs text-mist-dim">Niets ontvangen? Kijk even in je spam, of vraag over een paar minuten een nieuwe link aan.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="E-mailadres">
        <Input name="email" type="email" required autoComplete="email" autoFocus defaultValue={email} placeholder="jij@voorbeeld.nl" />
      </Field>
      <FormMessage state={state} />
      <SubmitButton className="w-full" size="lg" pendingText="Link versturen…">
        Stuur mij een inloglink
      </SubmitButton>
    </form>
  );
}
