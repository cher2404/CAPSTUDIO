"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl md:text-5xl">Oeps, er ging iets mis</h1>
      <p className="mt-4 max-w-md text-mist">Probeer het nog een keer. Blijft het misgaan? Stuur me dan even een mail.</p>
      <Button className="mt-8" onClick={reset}>
        Opnieuw proberen
      </Button>
    </div>
  );
}
