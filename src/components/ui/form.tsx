import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/types";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="label block">{label}</span>
      {children}
      {hint && <span className="block text-xs text-mist-dim">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("field", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("field min-h-32 resize-y", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("field appearance-none", className)} {...props} />;
}

export function Checkbox({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm text-bone-dim", className)}>
      <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-[var(--color-ember)]" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state || (!state.error && !state.message)) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        state.error ? "border-rose/30 bg-rose/10 text-rose" : "border-moss/30 bg-moss/10 text-moss",
      )}
    >
      {state.error ?? state.message}
    </p>
  );
}
