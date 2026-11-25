"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useScrollProgress } from "./use-scroll-progress";
import { Viewfinder } from "./viewfinder";

type Frame = { id: string; src: string; alt: string; width: number; height: number; title: string | null };

/**
 * Een filmrol met eigen foto's. Scroll je naar beneden, dan schuift de rol opzij;
 * sta je stil, dan staat de rol stil. Met "verminder beweging" wordt het een gewone veegstrook.
 */
export function FilmRoll({ frames, title, label }: { frames: Frame[]; title: React.ReactNode; label: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { progress, reduced } = useScrollProgress(sectionRef, "pinned");
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const strip = (
    <div
      ref={trackRef}
      className={reduced ? "flex snap-x gap-3 overflow-x-auto px-5 pb-4 md:gap-5 md:px-10" : "flex w-max gap-3 px-5 will-change-transform md:gap-5 md:px-10"}
      style={reduced ? undefined : { transform: `translate3d(${-progress * distance}px, 0, 0)` }}
    >
      {frames.map((f, i) => (
        <Link key={f.id} href="/portfolio" className="group shrink-0 snap-start">
          <span
            className="relative block h-[42svh] overflow-hidden bg-ink-850 md:h-[52svh]"
            style={{ aspectRatio: `${f.width} / ${f.height}` }}
          >
            <Image
              src={f.src}
              alt={f.alt}
              fill
              sizes="(min-width: 768px) 50vw, 80vw"
              className="object-cover transition duration-[1.4s] ease-[var(--ease-film)] group-hover:scale-[1.03]"
            />
            <Viewfinder />
          </span>
          <span className="mt-2 flex justify-between gap-6 font-mono text-[10px] tracking-[0.08em] text-mist uppercase transition-colors duration-500 group-hover:text-bone">
            <span>
              {String(i + 1).padStart(2, "0")}A ▸ {f.title ?? ""}
            </span>
            <span className="opacity-0 transition-opacity duration-500 group-hover:opacity-100">Portfolio ↗</span>
          </span>
        </Link>
      ))}
    </div>
  );

  const head = (
    <div className="container-x mb-8 flex items-end justify-between gap-6 md:mb-10">
      <h2 className="text-5xl md:text-7xl">{title}</h2>
      <p className="hidden shrink-0 pb-2 font-mono text-[10px] tracking-[0.08em] text-mist uppercase md:block">{label}</p>
    </div>
  );

  if (reduced) {
    return (
      <section ref={sectionRef} className="pt-28 md:pt-40">
        {head}
        {strip}
      </section>
    );
  }

  return (
    // De sectie is hoger dan het scherm; de rol blijft staan terwijl je erdoorheen scrollt.
    <section ref={sectionRef} className="relative mt-28 md:mt-40" style={{ height: `calc(100svh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        {head}
        {strip}
        <div className="container-x mt-8">
          <div className="h-px bg-ink-700">
            <div className="h-px origin-left bg-ember" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
