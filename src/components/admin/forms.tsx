"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/ui/form";
import type { ActionState } from "@/lib/types";

/** Formulier met ingebouwde feedback voor een server action met (state, formData). */
export function ActionForm({
  action,
  children,
  className,
}: {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {children}
      <div className="mt-4">
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/** Knop die eerst om bevestiging vraagt. */
export function ConfirmButton({ children, message = "Weet je het zeker?", className }: { children: React.ReactNode; message?: string; className?: string }) {
  return (
    <button
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
