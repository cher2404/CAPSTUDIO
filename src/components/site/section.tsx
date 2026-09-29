import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

/** Laatste woord in een elegante italic serif: het vaste accent in koppen. */
export function Accent({ text, className }: { text: string; className?: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return <>{text}</>;
  const last = words.pop()!;
  return (
    <>
      {words.join(" ")} <em className={cn("text-ember-soft", className)}>{last}</em>
    </>
  );
}

/** Sectiekop met index, label en een hairline erboven. */
export function SectionHead({
  index,
  label,
  action,
  className,
}: {
  index: string;
  label: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("rule-t flex items-baseline justify-between gap-4 pt-4", className)}>
      <p className="label">
        <span className="text-ember-soft">({index})</span> {label}
      </p>
      {action}
    </Reveal>
  );
}

/** Paginakop: index-label, grote titel met accent, intro rechts. */
export function PageIntro({ label, title, intro }: { label: string; title: string; intro?: string }) {
  return (
    <div className="container-x pt-32 md:pt-44">
      <Reveal>
        <p className="label">
          <span className="text-ember-soft">(—)</span> {label}
        </p>
      </Reveal>
      <div className="mt-6 grid items-end gap-8 md:mt-8 md:grid-cols-12">
        <Reveal className="md:col-span-8">
          <h1 className="text-[3rem] leading-[0.92] sm:text-7xl md:text-8xl lg:text-[7.5rem]">
            <Accent text={title} />
          </h1>
        </Reveal>
        {intro && (
          <Reveal delay={120} className="md:col-span-4 md:pb-3">
            <p className="max-w-sm leading-relaxed text-mist">{intro}</p>
          </Reveal>
        )}
      </div>
    </div>
  );
}
