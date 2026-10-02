"use client";

import { useActionState, useMemo, useState } from "react";
import { bookAppointment, rescheduleAppointment } from "@/lib/actions/appointments";
import { dayKey, formatDate, formatDay, formatTime } from "@/lib/format";
import { Field, FormMessage, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Slot } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props =
  | { mode: "book"; slots: Slot[]; projects: { id: string; title: string }[]; defaultProjectId?: string }
  | { mode: "reschedule"; slots: Slot[]; appointmentId: string };

export function SlotPicker(props: Props) {
  const [state, action] = useActionState(props.mode === "book" ? bookAppointment : rescheduleAppointment, null);
  const days = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of props.slots) {
      const k = dayKey(s.starts_at);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return [...map.entries()];
  }, [props.slots]);

  const [day, setDay] = useState(days[0]?.[0] ?? "");
  const [slot, setSlot] = useState<string>("");

  if (state?.ok) return <FormMessage state={state} />;

  if (!days.length) {
    return (
      <p className="rounded-xl border border-dashed border-ink-700 p-6 text-center text-sm text-mist">
        Er zijn op dit moment geen vrije momenten. Stuur me een bericht, dan zoeken we samen een datum.
      </p>
    );
  }

  const daySlots = days.find(([k]) => k === day)?.[1] ?? [];
  const chosen = props.slots.find((s) => s.id === slot);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="slot_id" value={slot} />
      {props.mode === "reschedule" && <input type="hidden" name="appointment_id" value={props.appointmentId} />}

      <div>
        <p className="mb-3 text-xs font-medium tracking-wide text-mist">1. Kies een dag</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {days.map(([k, s]) => (
            <button
              type="button"
              key={k}
              onClick={() => {
                setDay(k);
                setSlot("");
              }}
              className={cn(
                "flex w-18 shrink-0 flex-col items-center rounded-xl border px-2 py-3 transition-colors",
                k === day ? "border-bone bg-bone text-ink-950" : "border-ink-700 text-bone-dim hover:border-ink-600",
              )}
            >
              <span className="text-[10px] tracking-wider uppercase opacity-70">{formatDate(s[0]!.starts_at, { weekday: "short", day: undefined, month: undefined, year: undefined })}</span>
              <span className="font-display text-2xl leading-tight">{formatDate(s[0]!.starts_at, { day: "numeric", month: undefined, year: undefined })}</span>
              <span className="text-[10px] uppercase opacity-70">{formatDate(s[0]!.starts_at, { month: "short", day: undefined, year: undefined })}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-medium tracking-wide text-mist">2. Kies een tijd</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {daySlots.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => setSlot(s.id)}
              className={cn(
                "rounded-xl border px-3 py-3 text-sm transition-colors",
                s.id === slot ? "border-ember bg-ember/15 text-bone" : "border-ink-700 text-bone-dim hover:border-ink-600",
              )}
            >
              {formatTime(s.starts_at)} – {formatTime(s.ends_at)}
              {s.note && <span className="mt-0.5 block text-[11px] text-mist">{s.note}</span>}
            </button>
          ))}
        </div>
      </div>

      {props.mode === "book" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Voor welk project?">
            <Select name="project_id" defaultValue={props.defaultProjectId ?? props.projects[0]?.id} required>
              {props.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Opmerking (optioneel)">
            <Textarea name="notes" rows={2} className="min-h-12" placeholder="Bijv. locatie of wensen" />
          </Field>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl bg-ink-850 p-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-mist">
          {chosen ? (
            <>
              Gekozen: <span className="text-bone first-letter:uppercase">{formatDay(chosen.starts_at)}</span>, {formatTime(chosen.starts_at)}
            </>
          ) : (
            "Nog geen moment gekozen"
          )}
        </p>
        <SubmitButton disabled={!slot} pendingText="Bevestigen…">
          {props.mode === "book" ? "Bevestig afspraak" : "Verzet naar dit moment"}
        </SubmitButton>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
