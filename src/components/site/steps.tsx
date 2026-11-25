"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useScrollProgress } from "./use-scroll-progress";

/** Werkwijze in stappen. Een dunne lijn loopt mee met scrollen en kleurt de stappen die je bent gepasseerd. */
export function Steps({ steps }: { steps: { title: string; text: string }[] }) {
  const ref = useRef<HTMLOListElement>(null);
  // Met "verminder beweging" staat de lijn meteen helemaal vol.
  const { progress } = useScrollProgress(ref, "through", 1);
  // De lijn loopt vol terwijl de lijst door het midden van het scherm gaat.
  const fill = Math.min(1, Math.max(0, (progress - 0.2) / 0.5));

  return (
    <ol ref={ref} className="relative">
      <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-ink-700">
        <span className="absolute inset-x-0 top-0 h-full origin-top bg-ember" style={{ transform: `scaleY(${fill})` }} />
      </span>
      {steps.map((s, i) => {
        const reached = fill >= (i + 0.5) / steps.length || fill === 1;
        return (
          <li key={i} className="relative grid gap-2 pb-10 pl-10 last:pb-0 md:grid-cols-9 md:gap-6 md:pb-14">
            <span
              aria-hidden
              className={cn(
                "absolute top-2 left-0 size-[15px] rounded-full border transition-colors duration-500",
                reached ? "border-ember bg-ember" : "border-ink-600 bg-ink-950",
              )}
            />
            <p className={cn("font-mono text-[10px] tracking-[0.08em] uppercase transition-colors duration-500 md:col-span-1 md:pt-3", reached ? "text-ember-soft" : "text-mist-dim")}>
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="font-display text-3xl font-medium tracking-[-0.04em] text-bone md:col-span-3 md:text-4xl">{s.title}</h3>
            <p className="max-w-md leading-relaxed text-mist md:col-span-5 md:pt-2">{s.text}</p>
          </li>
        );
      })}
    </ol>
  );
}
