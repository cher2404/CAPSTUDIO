import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

export function Logo({ className, compact = false, href = "/" }: { className?: string; compact?: boolean; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex flex-col leading-none", className)} aria-label={`${site.name}, ${site.tagline}`}>
      <span className="font-display text-2xl tracking-[0.02em] text-bone md:text-[1.7rem]">
        CAP <span className="italic text-ember-soft transition-colors group-hover:text-bone">Studio</span>
      </span>
      {!compact && <span className="mt-1.5 text-[9px] tracking-[0.26em] text-mist uppercase md:text-[10px]">{site.tagline}</span>}
    </Link>
  );
}
