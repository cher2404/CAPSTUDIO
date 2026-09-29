"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toggleFavorite } from "@/lib/actions/galleries";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  url: string | null;
  file_name: string;
  width: number | null;
  height: number | null;
  is_favorite: boolean;
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5", filled ? "fill-ember text-ember" : "fill-none text-bone")} stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  );
}

export function ClientGallery({ items: initial, canDownload }: { items: Item[]; canDownload: boolean }) {
  const [items, setItems] = useState(initial);
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [, start] = useTransition();

  const visible = onlyFavs ? items.filter((i) => i.is_favorite) : items;
  const favCount = items.filter((i) => i.is_favorite).length;

  const fav = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_favorite: !i.is_favorite } : i)));
    start(async () => {
      const res = await toggleFavorite(id);
      if ("error" in res) setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_favorite: !i.is_favorite } : i)));
    });
  }, []);

  const step = useCallback((d: 1 | -1) => setActive((i) => (i === null ? i : (i + d + visible.length) % visible.length)), [visible.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, step]);

  const current = active !== null ? visible[active] : null;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => setOnlyFavs(false)} className={cn("rounded-full border px-4 py-1.5 text-sm", !onlyFavs ? "border-bone bg-bone text-ink-950" : "border-ink-600 text-mist")}>
            Alles ({items.length})
          </button>
          <button onClick={() => setOnlyFavs(true)} className={cn("rounded-full border px-4 py-1.5 text-sm", onlyFavs ? "border-bone bg-bone text-ink-950" : "border-ink-600 text-mist")}>
            Favorieten ({favCount})
          </button>
        </div>
        <p className="text-xs text-mist">Tik op het hartje om je favorieten te kiezen.</p>
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-mist">Nog geen favorieten gekozen.</p>
      ) : (
        <div className="columns-2 gap-2 md:columns-3 md:gap-3 xl:columns-4">
          {visible.map((item, i) => (
            <figure key={item.id} className="group relative mb-2 break-inside-avoid overflow-hidden rounded-lg bg-ink-850 md:mb-3" style={{ aspectRatio: `${item.width ?? 4} / ${item.height ?? 5}` }}>
              {item.url && (
                // eslint-disable-next-line @next/next/no-img-element -- privé signed URL, al geschaald bij upload
                <img
                  src={item.url}
                  alt={item.file_name}
                  loading="lazy"
                  decoding="async"
                  onClick={() => setActive(i)}
                  className="h-full w-full cursor-zoom-in object-cover transition duration-700 group-hover:scale-[1.02]"
                  onContextMenu={(e) => !canDownload && e.preventDefault()}
                />
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink-950/80 to-transparent p-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                <button onClick={() => fav(item.id)} className="flex size-9 items-center justify-center rounded-full bg-ink-950/50 backdrop-blur" aria-label={item.is_favorite ? "Verwijder uit favorieten" : "Markeer als favoriet"}>
                  <Heart filled={item.is_favorite} />
                </button>
                {canDownload && (
                  <a href={`/api/files/${item.id}/download`} className="rounded-full bg-ink-950/50 px-3 py-1.5 text-xs text-bone backdrop-blur" aria-label={`Download ${item.file_name}`}>
                    ↓ HR
                  </a>
                )}
              </div>
              {item.is_favorite && (
                <span className="absolute top-2 right-2 md:group-hover:opacity-0">
                  <Heart filled />
                </span>
              )}
            </figure>
          ))}
        </div>
      )}

      {current && (
        <div className="fixed inset-0 z-[80] flex animate-fade-in flex-col bg-ink-950/97" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between p-3 md:p-5">
            <p className="truncate text-xs text-mist">
              {(active ?? 0) + 1} / {visible.length} · {current.file_name}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => fav(current.id)} className="flex size-10 items-center justify-center rounded-full border border-ink-700" aria-label="Favoriet">
                <Heart filled={current.is_favorite} />
              </button>
              {canDownload && (
                <a href={`/api/files/${current.id}/download`} className="rounded-full border border-ink-700 px-4 py-2 text-xs text-bone">
                  Download
                </a>
              )}
              <button onClick={() => setActive(null)} className="flex size-10 items-center justify-center text-2xl text-bone" aria-label="Sluiten">
                ×
              </button>
            </div>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-2 pb-6 md:px-16">
            {current.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={current.id} src={current.url} alt={current.file_name} className="max-h-full max-w-full animate-fade-in object-contain" onContextMenu={(e) => !canDownload && e.preventDefault()} />
            )}
            <button onClick={() => step(-1)} className="absolute left-1 flex size-12 items-center justify-center text-3xl text-bone/70 hover:text-bone md:left-4" aria-label="Vorige">
              ‹
            </button>
            <button onClick={() => step(1)} className="absolute right-1 flex size-12 items-center justify-center text-3xl text-bone/70 hover:text-bone md:right-4" aria-label="Volgende">
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );
}
