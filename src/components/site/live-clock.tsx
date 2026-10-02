"use client";

import { useSyncExternalStore } from "react";

const fmt = new Intl.DateTimeFormat("nl-NL", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Amsterdam",
});

function subscribe(cb: () => void) {
  const id = setInterval(cb, 15_000);
  return () => clearInterval(id);
}

/** Lokale tijd in Nederland, zoals een studio die laat zien waar ze zit. */
export function LiveClock({ className }: { className?: string }) {
  const time = useSyncExternalStore(
    subscribe,
    () => fmt.format(new Date()),
    () => "",
  );
  return (
    <span className={className} suppressHydrationWarning>
      {time || "--:--"}
    </span>
  );
}
