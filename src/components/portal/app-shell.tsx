"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site/logo";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof icons;
  badge?: number;
  exact?: boolean;
}

const icons = {
  home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  quote: "M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4",
  sign: "M4 20h16M6 16l9.5-9.5 3 3L9 19H6z",
  chat: "M4 5h16v11H9l-5 4z",
  image: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01",
  folder: "M3 6h6l2 2h10v11H3z",
  book: "M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4zM5 16a4 4 0 0 1 4-4h10",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a3 3 0 1 0 0-6M22 21a6 6 0 0 0-5-6",
  template: "M4 4h16v6H4zM4 14h7v6H4zM15 14h5v6h-5z",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.7l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 14H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.3 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 10h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  tag: "M3 12V3h9l9 9-9 9zM7.5 7.5h.01",
};

function Icon({ name, className }: { name: keyof typeof icons; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-[18px] shrink-0", className)} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <path d={icons[name]} />
    </svg>
  );
}

export function AppShell({
  nav,
  label,
  userName,
  userEmail,
  children,
  switchLink,
}: {
  nav: NavItem[];
  label: string;
  userName: string | null;
  userEmail: string;
  children: React.ReactNode;
  switchLink?: { href: string; label: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (item: NavItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/"));

  const navList = (
    <nav className="space-y-0.5" aria-label={label}>
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
            isActive(item) ? "bg-ink-800 text-bone" : "text-mist hover:bg-ink-850 hover:text-bone",
          )}
        >
          <Icon name={item.icon} className={isActive(item) ? "text-ember-soft" : undefined} />
          <span className="flex-1">{item.label}</span>
          {!!item.badge && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1.5 text-[10px] font-semibold text-ink-950">{item.badge}</span>
          )}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-3 border-t border-ink-700/70 pt-4">
      <div className="flex items-center gap-3 px-1">
        <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-ember/40 to-tide/40 text-xs font-semibold text-bone">
          {initials(userName, userEmail[0]?.toUpperCase())}
        </span>
        <div className="min-w-0 text-xs">
          <p className="truncate text-bone">{userName ?? "Welkom"}</p>
          <p className="truncate text-mist-dim">{userEmail}</p>
        </div>
      </div>
      <div className="flex gap-2 px-1 text-xs">
        {switchLink && (
          <Link href={switchLink.href} className="text-mist hover:text-bone">
            {switchLink.label}
          </Link>
        )}
        <form action="/auth/signout" method="post" className="ml-auto">
          <button className="text-mist hover:text-bone">Uitloggen</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-ink-700/60 bg-ink-950 px-4 py-7 lg:flex">
        <div className="px-2">
          <Logo compact href={nav[0]!.href} />
          <p className="eyebrow mt-2 text-[9px]">{label}</p>
        </div>
        <div className="flex-1 overflow-y-auto">{navList}</div>
        {footer}
      </aside>

      {/* Mobiele topbar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-ink-700/60 bg-ink-950/90 px-4 backdrop-blur-xl lg:hidden">
        <Logo compact href={nav[0]!.href} />
        <button onClick={() => setOpen((v) => !v)} className="flex size-10 items-center justify-center rounded-full border border-ink-700" aria-expanded={open} aria-label="Menu">
          <span className="relative block h-3 w-4">
            <span className={cn("absolute left-0 h-px w-4 bg-bone transition-all", open ? "top-1.5 rotate-45" : "top-0")} />
            <span className={cn("absolute left-0 h-px w-4 bg-bone transition-all", open ? "top-1.5 -rotate-45" : "top-3")} />
          </span>
          {nav.some((n) => n.badge) && !open && <span className="absolute top-3 right-3 size-2 rounded-full bg-ember" />}
        </button>
      </header>
      <div
        className={cn(
          "fixed inset-x-0 top-16 bottom-0 z-30 flex flex-col gap-6 overflow-y-auto bg-ink-950 p-4 transition-all duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        {navList}
        {footer}
      </div>

      <main className="min-w-0 px-4 py-8 md:px-10 md:py-12">
        <div className="mx-auto max-w-6xl animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
