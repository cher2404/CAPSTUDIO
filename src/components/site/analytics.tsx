"use client";

import { Analytics } from "@vercel/analytics/next";
import { useSyncExternalStore } from "react";
import { getConsent } from "./cookie-banner";

function subscribe(callback: () => void) {
  window.addEventListener("cap-consent", callback);
  return () => window.removeEventListener("cap-consent", callback);
}

/** Vercel Analytics laadt pas na toestemming via de cookiebanner. */
export function ConsentAnalytics() {
  const allowed = useSyncExternalStore(subscribe, () => getConsent() === "all", () => false);
  return allowed ? <Analytics /> : null;
}
