"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Hoe ver een element door het scherm is gescrold, van 0 tot 1.
 * Beweging op de site hangt alleen aan scrollen: staat de bezoeker stil, dan staat alles stil.
 * Met "verminder beweging" aan blijft de waarde op `rest`.
 *
 * mode "through": 0 als de bovenkant onderaan het scherm binnenkomt, 1 als de onderkant bovenin verdwijnt.
 * mode "pinned":  0 als de bovenkant de bovenrand raakt, 1 als de onderkant de onderrand raakt (voor sticky secties).
 * mode "leave":   0 als de bovenkant de bovenrand raakt, 1 als het element helemaal uit beeld is gescrold.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, mode: "through" | "pinned" | "leave" = "through", rest = 0) {
  const [progress, setProgress] = useState(rest);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p: number;
      if (mode === "pinned") p = -r.top / Math.max(1, r.height - vh);
      else if (mode === "leave") p = -r.top / Math.max(1, r.height);
      else p = (vh - r.top) / Math.max(1, vh + r.height);
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, mode, rest, reduced]);

  return { progress: reduced ? rest : progress, reduced };
}
