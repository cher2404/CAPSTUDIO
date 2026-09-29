import Link from "next/link";
import { Logo } from "./logo";
import { instagramUrl, site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 border-t border-ink-700/60 md:mt-32">
      <div className="container-x grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-mist">
            Foto en video voor sport en lifestyle, met een donkere, filmische look die opvalt. Actief in heel {site.region}.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="eyebrow mb-4">Contact</p>
          <a href={`mailto:${site.email}`} className="block text-bone-dim hover:text-bone">
            {site.email}
          </a>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="block text-bone-dim hover:text-bone">
            Instagram · @{site.instagram}
          </a>
          <Link href="/contact" className="block text-bone-dim hover:text-bone">
            Contactformulier
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="eyebrow mb-4">Klanten</p>
          <Link href="/login" className="block text-bone-dim hover:text-bone">
            Inloggen klantportaal
          </Link>
          <Link href="/diensten" className="block text-bone-dim hover:text-bone">
            Diensten en tarieven
          </Link>
          <Link href="/privacy" className="block text-bone-dim hover:text-bone">
            Privacyverklaring
          </Link>
          <Link href="/voorwaarden" className="block text-bone-dim hover:text-bone">
            Algemene voorwaarden
          </Link>
        </div>
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-ink-700/60 py-6 text-xs text-mist-dim md:flex-row md:justify-between">
        <p>
          © {year} {site.name} · {site.owner}
        </p>
        <p>
          KvK {site.kvk}
          {site.btw && <> · Btw {site.btw}</>}
        </p>
      </div>
    </footer>
  );
}
