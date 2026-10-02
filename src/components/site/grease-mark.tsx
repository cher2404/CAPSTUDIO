/** Met vetpotlood omcirkeld frame, zoals een fotograaf de beste opname op het contactvel markeert. */
export function GreaseMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 160" preserveAspectRatio="none" className={className} fill="none">
      <path
        d="M101 9c38-3 79 13 88 49 9 37-22 78-74 87-49 8-98-8-108-45C-3 64 30 18 92 11c22-2 46 1 60 9"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        className="[stroke-dasharray:640] [stroke-dashoffset:640] animate-[draw_1.4s_0.8s_var(--ease-film)_forwards]"
      />
    </svg>
  );
}
