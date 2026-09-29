"use client";

import { useActionState, useState } from "react";
import { cancelAppointment } from "@/lib/actions/appointments";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action] = useActionState(cancelAppointment, null);

  if (state) return <FormMessage state={state} />;
  if (!confirming)
    return (
      <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
        Annuleren
      </Button>
    );
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="appointment_id" value={appointmentId} />
      <span className="text-sm text-mist">Zeker weten?</span>
      <SubmitButton variant="danger" size="sm" pendingText="Annuleren…">
        Ja, annuleer
      </SubmitButton>
      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Nee
      </Button>
    </form>
  );
}
