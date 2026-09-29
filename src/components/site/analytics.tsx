"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";
import { getConsent } from "./cookie-banner";

/** Vercel Analytics laadt pas na toestemming via de cookiebanner. */
export function ConsentAnalytics() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    setAllowed(getConsent() === "all");
    const onConsent = (e: Event) => setAllowed((e as CustomEvent).detail === "all");
    window.addEventListener("cap-consent", onConsent);
    return () => window.removeEventListener("cap-consent", onConsent);
  }, []);
  return allowed ? <Analytics /> : null;
}
