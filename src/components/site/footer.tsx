import Link from "next/link";
import { instagramUrl, site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="rule-t relative mt-28 md:mt-40">
      <div className="container-x grid gap-10 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <p className="label mb-5">Contact</p>
          <a href={`mailto:${site.email}`} className="arrow-link font-display text-2xl font-medium tracking-[-0.03em] text-bone hover:text-ember-soft md:text-3xl">
            {site.email} <span className="arrow">→</span>
          </a>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist">
            Creatieve studio voor foto, video, websites, apps en games. Met een donkere, filmische look die opvalt. Actief in heel {site.region}.
          </p>
        </div>
        <div className="space-y-2.5 text-sm md:col-span-2 md:col-start-7">
          <p className="label mb-5">Menu</p>
          {[
            ["/portfolio", "Portfolio"],
            ["/diensten", "Diensten"],
            ["/over-mij", "Over mij"],
            ["/contact", "Contact"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="block text-bone-dim hover:text-bone">
              {label}
            </Link>
          ))}
        </div>
        <div className="space-y-2.5 text-sm md:col-span-2">
          <p className="label mb-5">Klanten</p>
          <Link href="/login" className="block text-bone-dim hover:text-bone">
            Klantportaal
          </Link>
          <Link href="/privacy" className="block text-bone-dim hover:text-bone">
            Privacyverklaring
          </Link>
          <Link href="/voorwaarden" className="block text-bone-dim hover:text-bone">
            Algemene voorwaarden
          </Link>
        </div>
        <div className="space-y-2.5 text-sm md:col-span-2">
          <p className="label mb-5">Social</p>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="block text-bone-dim hover:text-bone">
            Instagram ↗
          </a>
        </div>
      </div>

      {/* Groot woordmerk */}
      <div className="container-x overflow-hidden">
        <p
          aria-hidden
          className="font-display text-[11vw] leading-[0.85] font-semibold whitespace-nowrap tracking-[-0.06em] text-bone/[0.07] select-none md:text-[11.2vw] xl:text-[9.6rem]"
        >
          CAP Media <em className="font-normal">Studio</em>
        </p>
      </div>

      <div className="container-x rule-t flex flex-col gap-2 py-5 font-mono text-[10px] tracking-[0.04em] text-mist-dim uppercase md:flex-row md:justify-between">
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
