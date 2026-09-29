import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-ink-700/70 bg-ink-900/70 p-5 md:p-6", className)} {...props} />;
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warm" | "cool" | "good" | "bad";
  className?: string;
}) {
  const tones = {
    neutral: "border-ink-600 text-mist",
    warm: "border-ember/40 text-ember-soft bg-ember/10",
    cool: "border-tide/40 text-tide-soft bg-tide/10",
    good: "border-moss/40 text-moss bg-moss/10",
    bad: "border-rose/40 text-rose bg-rose/10",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-700 px-6 py-12 text-center">
      <p className="font-display text-2xl text-bone">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-mist">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children, action }: { eyebrow?: string; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-sm text-mist md:text-base">{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
