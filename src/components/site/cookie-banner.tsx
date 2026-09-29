"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
      className="fixed inset-x-3 bottom-3 z-[70] animate-fade-up rounded-2xl border border-ink-700 bg-ink-900/95 p-5 shadow-2xl backdrop-blur-xl md:inset-x-auto md:right-6 md:bottom-6 md:max-w-sm"
    >
      <p className="font-display text-xl text-bone">Cookies, kort en eerlijk</p>
      <p className="mt-2 text-sm leading-relaxed text-mist">
        Ik gebruik alleen cookies die nodig zijn om de site en het klantportaal te laten werken. Met jouw akkoord meet ik ook anoniem
        bezoek, zodat ik de site kan verbeteren. Meer lezen? Check de{" "}
        <Link href="/privacy" className="text-ember-soft underline underline-offset-2">
          privacyverklaring
        </Link>
        .
      </p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={() => choose("all")}>
          Alles accepteren
        </Button>
        <Button size="sm" variant="outline" onClick={() => choose("necessary")}>
          Alleen noodzakelijk
        </Button>
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
