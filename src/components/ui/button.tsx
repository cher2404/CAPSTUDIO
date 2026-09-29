import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-3 rounded-none font-medium tracking-[-0.01em] transition duration-300 ease-[var(--ease-film)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-bone text-ink-950 hover:bg-ember-soft",
  outline: "border border-bone/30 text-bone hover:border-bone hover:bg-bone hover:text-ink-950",
  ghost: "text-bone-dim hover:text-bone hover:bg-bone/5",
  subtle: "bg-ink-800 text-bone hover:bg-ink-700 border border-ink-700",
  danger: "border border-rose/40 text-rose hover:bg-rose/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-7 text-sm md:text-[15px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

type LinkButtonProps = React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

/** Pijltje dat meeschuift bij hover, voor in knoppen. */
export function Arrow() {
  return (
    <span aria-hidden className="transition-transform duration-500 ease-[var(--ease-film)] group-hover/btn:translate-x-1">
      →
    </span>
  );
}
