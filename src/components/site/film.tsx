import { cn } from "@/lib/utils";

/**
 * Filmrand zoals op een contactvel: perforatie met randopdruk en framenummers.
 * Puur decoratief.
 */
export function FilmEdge({ start = 12, count = 8, className }: { start?: number; count?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none select-none", className)}>
      <div className="h-2.5 w-full bg-[repeating-linear-gradient(90deg,transparent_0_10px,rgba(236,230,220,.16)_10px_20px)] [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]" />
      <div className="mt-1.5 flex justify-between font-mono text-[9px] tracking-[0.12em] text-ember-soft/70 uppercase">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={cn(i % 2 === 1 && "hidden sm:inline")}>
            {i % 3 === 0 ? `CAP 400` : ""} ▸ {start + Math.floor(i / 2)}
            {i % 2 ? "A" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Belichtingsgegevens als kleine noot bij een beeld. */
export function Exposure({ className, values = ["f/2.8", "1/250", "ISO 400"] }: { className?: string; values?: string[] }) {
  return (
    <p aria-hidden className={cn("font-mono text-[10px] tracking-[0.08em] text-bone/60 uppercase", className)}>
      {values.join("  ·  ")}
    </p>
  );
}
