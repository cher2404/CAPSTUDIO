import { cn } from "@/lib/utils";

/**
 * Vier zoekerhoekjes, zoals in de zoeker van een camera. Verschijnen bij hover op de
 * dichtstbijzijnde `group`. Alleen op apparaten met een muis (Tailwinds hover-variant).
 */
export function Viewfinder({ className }: { className?: string }) {
  const corner = "absolute size-4 border-bone/90 md:size-5";
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-3 z-10 opacity-0 transition-all duration-500 ease-[var(--ease-film)] group-hover:inset-4 group-hover:opacity-100 md:inset-4 md:group-hover:inset-5",
        className,
      )}
    >
      <span className={cn(corner, "top-0 left-0 border-t border-l")} />
      <span className={cn(corner, "top-0 right-0 border-t border-r")} />
      <span className={cn(corner, "bottom-0 left-0 border-b border-l")} />
      <span className={cn(corner, "right-0 bottom-0 border-r border-b")} />
    </span>
  );
}
