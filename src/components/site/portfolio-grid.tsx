"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { PortfolioCategory, PortfolioItem } from "@/lib/types";

const filters: { value: "alles" | PortfolioCategory; label: string }[] = [
  { value: "alles", label: "Alles" },
  { value: "gym", label: "Gym" },
  { value: "training", label: "Training" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "video", label: "Video" },
];

export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("alles");
  const [active, setActive] = useState<number | null>(null);

  const visible = useMemo(() => (filter === "alles" ? items : items.filter((i) => i.category === filter)), [items, filter]);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (dir: 1 | -1) => setActive((i) => (i === null ? i : (i + dir + visible.length) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, step]);

  const current = active !== null ? visible[active] : null;

  return (
    <>
      <div className="-mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0" role="tablist" aria-label="Filter portfolio">
        {filters.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "shrink-0 rounded-full border px-5 py-2 text-sm transition-all duration-300",
              filter === f.value ? "border-bone bg-bone text-ink-950" : "border-ink-600 text-mist hover:border-bone/50 hover:text-bone",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-20 text-center text-mist">Hier komt binnenkort nieuw werk te staan.</p>
      ) : (
        <div className="columns-1 gap-3 sm:columns-2 md:gap-4 lg:columns-3">
          {visible.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setActive(i)}
              className="group relative mb-3 block w-full animate-fade-in overflow-hidden rounded-xl bg-ink-850 md:mb-4"
              style={{ aspectRatio: `${item.width} / ${item.height}` }}
              aria-label={`Bekijk ${item.alt ?? item.title ?? "foto"}`}
            >
              <Image
                src={item.image_url}
                alt={item.alt ?? item.title ?? "Portfolio CAP Media Studio"}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-[1.4s] ease-[var(--ease-film)] group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink-950/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className="text-left text-xs tracking-[0.2em] text-bone uppercase">{item.title ?? item.category}</span>
              </div>
              {item.category === "video" && (
                <span className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-ink-950/60 backdrop-blur">
                  <svg viewBox="0 0 24 24" className="ml-0.5 size-4 fill-bone" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {current && (
        <div
          className="fixed inset-0 z-[80] flex animate-fade-in items-center justify-center bg-ink-950/96 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Lightbox"
          onClick={close}
        >
          <div className="relative flex h-full w-full items-center justify-center p-4 md:p-16" onClick={(e) => e.stopPropagation()}>
            {current.video_url ? (
              <div className="aspect-video w-full max-w-5xl">
                <iframe
                  src={current.video_url}
                  className="h-full w-full rounded-lg"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={current.title ?? "Video"}
                />
              </div>
            ) : (
              <div className="relative h-full w-full">
                <Image
                  key={current.id}
                  src={current.image_url}
                  alt={current.alt ?? current.title ?? "Portfolio CAP Media Studio"}
                  fill
                  sizes="100vw"
                  quality={85}
                  className="animate-fade-in object-contain"
                />
              </div>
            )}
          </div>
          <button onClick={close} className="absolute top-4 right-4 flex size-11 items-center justify-center text-2xl text-bone/80 hover:text-bone" aria-label="Sluiten">
            ×
          </button>
          {visible.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-2 flex size-12 items-center justify-center text-3xl text-bone/70 hover:text-bone md:left-6"
                aria-label="Vorige"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-2 flex size-12 items-center justify-center text-3xl text-bone/70 hover:text-bone md:right-6"
                aria-label="Volgende"
              >
                ›
              </button>
            </>
          )}
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-mist">
            {(active ?? 0) + 1} / {visible.length}
          </p>
        </div>
      )}
    </>
  );
}
