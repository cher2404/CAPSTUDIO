"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/diensten", label: "Diensten" },
  { href: "/over-mij", label: "Over mij" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ availability }: { availability?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled || open ? "rule-b bg-ink-950/85 backdrop-blur-xl" : "bg-gradient-to-b from-ink-950/60 to-transparent",
      )}
    >
      <div className="container-x grid h-18 grid-cols-[1fr_auto] items-center md:h-20 md:grid-cols-12">
        <div className="flex items-center gap-8 md:col-span-5">
          <Logo />
          {availability && (
            <span className="hidden items-center gap-2 text-xs text-mist lg:flex">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-moss opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-moss" />
              </span>
              {availability}
            </span>
          )}
        </div>
        <nav className="hidden items-center gap-8 md:col-span-7 md:flex md:justify-end" aria-label="Hoofdmenu">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("relative text-sm transition-colors hover:text-bone", active ? "text-bone" : "text-mist")}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-ember transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            );
          })}
          <Link href="/login" className="text-sm text-mist transition-colors hover:text-bone">
            Inloggen
          </Link>
          <Link
            href="/contact?type=boeken"
            className="group/btn flex h-10 items-center gap-2.5 border border-bone/30 px-4 text-sm text-bone transition-colors duration-300 hover:border-bone hover:bg-bone hover:text-ink-950"
          >
            Start een project <span className="transition-transform duration-500 group-hover/btn:translate-x-1">→</span>
          </Link>
        </nav>
        <button
          className="relative z-50 -mr-2 flex h-11 items-center gap-3 px-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Menu sluiten" : "Menu openen"}
        >
          <span className="label text-bone">{open ? "Sluit" : "Menu"}</span>
          <span className="relative block h-3 w-5">
            <span className={cn("absolute left-0 h-px w-5 bg-bone transition-all duration-300", open ? "top-1.5 rotate-45" : "top-0.5")} />
            <span className={cn("absolute left-0 h-px w-5 bg-bone transition-all duration-300", open ? "top-1.5 -rotate-45" : "top-2.5")} />
          </span>
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 top-18 z-40 flex flex-col bg-ink-950 px-5 pt-6 pb-8 transition-all duration-500 md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav className="flex flex-col" aria-label="Mobiel menu">
          {[{ href: "/", label: "Home" }, ...nav, { href: "/login", label: "Klantportaal" }].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rule-b flex items-baseline justify-between py-4 font-display text-4xl font-medium tracking-[-0.04em] text-bone transition-colors hover:text-ember-soft"
            >
              {item.label}
              <span className="font-mono text-[10px] tracking-normal text-mist">{String(i).padStart(2, "0")}</span>
            </Link>
          ))}
        </nav>
        <Link
          href="/contact?type=boeken"
          onClick={() => setOpen(false)}
          className="mt-auto flex h-14 items-center justify-between bg-bone px-5 font-medium text-ink-950"
        >
          Start een project <span>→</span>
        </Link>
      </div>
    </header>
  );
}
