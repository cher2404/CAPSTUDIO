"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/diensten", label: "Diensten" },
  { href: "/over-mij", label: "Over mij" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
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
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open ? "border-b border-ink-700/60 bg-ink-950/80 backdrop-blur-xl" : "bg-gradient-to-b from-ink-950/70 to-transparent",
      )}
    >
      <div className="container-x flex h-18 items-center justify-between md:h-22">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Hoofdmenu">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm tracking-wide transition-colors hover:text-bone",
                pathname.startsWith(item.href) ? "text-bone" : "text-mist",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/login" className="text-sm tracking-wide text-mist transition-colors hover:text-bone">
            Inloggen
          </Link>
          <Link href="/contact?type=boeken" className={buttonClass("primary", "sm")}>
            Boek een shoot
          </Link>
        </nav>
        <button
          className="relative z-50 -mr-2 flex size-11 items-center justify-center md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Menu sluiten" : "Menu openen"}
        >
          <span className={cn("absolute h-px w-6 bg-bone transition-transform duration-300", open ? "rotate-45" : "-translate-y-1")} />
          <span className={cn("absolute h-px w-6 bg-bone transition-transform duration-300", open ? "-rotate-45" : "translate-y-1")} />
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 top-18 z-40 flex flex-col bg-ink-950 px-6 pt-10 pb-10 transition-all duration-500 md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav className="flex flex-col gap-2" aria-label="Mobiel menu">
          {[{ href: "/", label: "Home" }, ...nav, { href: "/login", label: "Inloggen" }].map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-display text-4xl text-bone transition-colors hover:text-ember-soft"
              style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/contact?type=boeken" onClick={() => setOpen(false)} className={buttonClass("primary", "lg", "mt-auto")}>
          Boek een shoot
        </Link>
      </div>
    </header>
  );
}
