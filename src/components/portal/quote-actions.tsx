"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { acceptQuote, askQuoteQuestion } from "@/lib/actions/quotes";
import { Button } from "@/components/ui/button";
import { Checkbox, FormMessage, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

export function QuoteActions({ quoteId }: { quoteId: string }) {
  const [acceptState, accept] = useActionState(acceptQuote, null);
  const [askState, ask] = useActionState(askQuoteQuestion, null);
  const [asking, setAsking] = useState(false);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <form action={accept} className="space-y-4 rounded-2xl border border-ember/40 bg-ember/5 p-5 md:p-6">
        <h3 className="text-2xl">Akkoord?</h3>
        <p className="text-sm text-mist">Na accepteren staat de overeenkomst direct voor je klaar om digitaal te ondertekenen.</p>
        <input type="hidden" name="quote_id" value={quoteId} />
        <Checkbox
          name="terms"
          required
          label={
            <>
              Ik ga akkoord met de offerte en de{" "}
              <Link href="/voorwaarden" target="_blank" className="text-ember-soft underline underline-offset-2">
                algemene voorwaarden
              </Link>
              .
            </>
          }
        />
        <FormMessage state={acceptState} />
        <SubmitButton className="w-full" pendingText="Accepteren…">
          Offerte accepteren
        </SubmitButton>
      </form>

      <div className="space-y-4 rounded-2xl border border-ink-700/70 bg-ink-900/60 p-5 md:p-6">
        <h3 className="text-2xl">Vraag of wijziging?</h3>
        {askState?.ok ? (
          <FormMessage state={askState} />
        ) : asking ? (
          <form action={ask} className="space-y-3">
            <input type="hidden" name="quote_id" value={quoteId} />
            <Textarea name="question" required rows={4} placeholder="Bijv. kan er een extra outfitwissel bij?" autoFocus />
            <FormMessage state={askState} />
            <div className="flex gap-2">
              <SubmitButton variant="subtle" pendingText="Versturen…">
                Verstuur vraag
              </SubmitButton>
              <Button type="button" variant="ghost" onClick={() => setAsking(false)}>
                Annuleer
              </Button>
            </div>
          </form>
        ) : (
          <>
            <p className="text-sm text-mist">Iets niet helemaal zoals je wilt? Stel je vraag, dan pas ik de offerte zo nodig aan.</p>
            <Button variant="outline" onClick={() => setAsking(true)}>
              Stel een vraag
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
