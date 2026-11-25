"use client";

import Image from "next/image";
import { useRef } from "react";
import { useScrollProgress } from "./use-scroll-progress";

/** Herofoto die alleen meebeweegt met scrollen: een lichte zoom en een trage verschuiving. */
export function HeroImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { progress } = useScrollProgress(ref, "leave");

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${progress * 12}%, 0) scale(${1 + progress * 0.08})` }}
      >
        <Image src={src} alt={alt} fill priority quality={75} sizes="100vw" className="object-cover" />
      </div>
    </div>
  );
}
