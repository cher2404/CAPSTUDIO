"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "cap-cookie-consent";

export type Consent = "all" | "necessary";

export function getConsent(): Consent | null {
  try {
    return (localStorage.getItem(KEY) as Consent | null) ?? null;
  } catch {
    return null;
  }
}

/**
 * De site gebruikt standaard alleen noodzakelijke cookies (inloggen).
 * Analytische cookies laden pas na "Alles accepteren" (event: cap-consent).
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(getConsent() === null), 800);
    const reopen = () => setVisible(true);
    window.addEventListener("cap-open-cookies", reopen);
    return () => {
      clearTimeout(t);
      window.removeEventListener("cap-open-cookies", reopen);
    };
  }, []);

  function choose(value: Consent) {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    window.dispatchEvent(new CustomEvent("cap-consent", { detail: value }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies"
      className="fixed inset-x-3 bottom-3 z-[70] flex animate-fade-up flex-col gap-3 border border-ink-600 bg-ink-950/95 px-4 py-3 text-sm backdrop-blur-xl md:right-auto md:bottom-5 md:left-5 md:max-w-xl md:flex-row md:items-center md:gap-6"
    >
      <p className="text-mist">
        Alleen noodzakelijke cookies, tenzij je anoniem bezoek laat meten.{" "}
        <Link href="/privacy" className="text-bone-dim underline underline-offset-2 hover:text-bone">
          Privacy
        </Link>
      </p>
      <div className="flex shrink-0 gap-4">
        <button onClick={() => choose("all")} className="text-bone underline decoration-ember underline-offset-4 hover:text-ember-soft">
          Akkoord
        </button>
        <button onClick={() => choose("necessary")} className="text-mist hover:text-bone">
          Alleen noodzakelijk
        </button>
      </div>
    </div>
  );
}

export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("cap-open-cookies"))}>
      Cookie-instellingen
    </button>
  );
}
