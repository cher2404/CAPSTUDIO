import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

export function Logo({ className, compact = false, href = "/" }: { className?: string; compact?: boolean; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex flex-col leading-none", className)} aria-label={`${site.name}, ${site.tagline}`}>
      <span className="font-display text-[1.35rem] font-semibold tracking-[-0.04em] text-bone md:text-2xl">
        CAP Media <em className="font-normal text-ember-soft transition-colors duration-500 group-hover:text-bone">Studio</em>
      </span>
      {!compact && <span className="label mt-1.5 text-[9px] tracking-[0.06em] md:text-[10px]">{site.tagline}</span>}
    </Link>
  );
}
