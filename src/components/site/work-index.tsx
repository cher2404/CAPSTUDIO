"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { portfolioCategoryLabel } from "@/lib/categories";
import type { PortfolioItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Werkindex: projecten als lijst, met een voorvertoning die de cursor volgt.
 * Op touchscreens staat de thumbnail gewoon in de rij.
 */
export function WorkIndex({
  items,
  href = "/portfolio",
  onSelect,
}: {
  items: (PortfolioItem & { year?: string })[];
  href?: string;
  /** Als gezet: klikken opent dit item (bijv. in de lightbox) in plaats van te linken. */
  onSelect?: (index: number) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = previewRef.current;
    const box = listRef.current?.getBoundingClientRect();
    if (!el || !box) return;
    el.style.transform = `translate3d(${e.clientX - box.left + 24}px, ${e.clientY - box.top - 110}px, 0)`;
  }

  return (
    <div ref={listRef} className="relative" onMouseMove={onMove} onMouseLeave={() => setActive(null)}>
      <div className="hidden grid-cols-12 gap-4 border-b border-ink-600 pb-3 font-mono text-[10px] tracking-[0.06em] text-mist uppercase md:grid">
        <span className="col-span-1">Nr</span>
        <span className="col-span-6">Project</span>
        <span className="col-span-3">Discipline</span>
        <span className="col-span-2 text-right">Jaar</span>
      </div>
      <ul>
        {items.map((item, i) => (
          <li key={item.id}>
            <Row
              href={item.link_url && (item.category === "apps" || item.category === "games") ? item.link_url : href}
              external={Boolean(item.link_url)}
              onClick={onSelect ? () => onSelect(i) : undefined}
              onMouseEnter={() => setActive(i)}
            >
              <span className="relative block aspect-square w-14 overflow-hidden bg-ink-850 md:hidden">
                <Image src={item.image_url} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="hidden font-mono text-xs text-mist-dim md:col-span-1 md:block">{String(i + 1).padStart(2, "0")}</span>
              <span
                className={cn(
                  "font-display text-2xl font-medium tracking-[-0.04em] transition-all duration-500 md:col-span-6 md:text-[2.6rem]",
                  active === null || active === i ? "text-bone" : "text-mist-dim",
                  "md:group-hover:translate-x-2",
                )}
              >
                {item.title ?? item.alt ?? "Zonder titel"}
              </span>
              <span className="hidden text-sm text-mist md:col-span-3 md:block">{portfolioCategoryLabel[item.category]}</span>
              <span className="font-mono text-xs text-mist md:col-span-2 md:text-right">{item.year ?? ""}</span>
            </Row>
          </li>
        ))}
      </ul>

      {/* Zwevende voorvertoning (alleen met muis) */}
      <div
        ref={previewRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 left-0 z-10 hidden w-64 transition-opacity duration-300 [@media(hover:hover)]:block",
          active === null ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-ink-850 shadow-2xl">
          {items.map((item, i) => (
            <Image
              key={item.id}
              src={item.image_url}
              alt=""
              fill
              sizes="256px"
              className={cn("object-cover transition-opacity duration-300", active === i ? "opacity-100" : "opacity-0")}
            />
          ))}
        </div>
        {active !== null && (
          <p className="mt-2 font-mono text-[10px] tracking-[0.06em] text-bone/70 uppercase">
            Frame {String(active + 1).padStart(2, "0")} · {portfolioCategoryLabel[items[active]!.category]}
          </p>
        )}
      </div>
    </div>
  );
}

const rowClass =
  "group grid w-full grid-cols-[56px_1fr_auto] items-center gap-4 border-b border-ink-700/80 py-4 text-left transition-colors md:grid-cols-12 md:py-6";

function Row({
  href,
  external,
  onClick,
  onMouseEnter,
  children,
}: {
  href: string;
  external: boolean;
  onClick?: () => void;
  onMouseEnter: () => void;
  children: React.ReactNode;
}) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} onMouseEnter={onMouseEnter} className={rowClass}>
        {children}
      </button>
    );
  }
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onMouseEnter={onMouseEnter}
      className={rowClass}
    >
      {children}
    </Link>
  );
}
