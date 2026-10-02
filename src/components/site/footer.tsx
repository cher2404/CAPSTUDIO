import Link from "next/link";
import { LiveClock } from "./live-clock";
import { instagramUrl, site } from "@/lib/site";

export function SiteFooter({ availability }: { availability?: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-32 md:mt-48">
      <div className="container-x">
        <div className="grid gap-12 border-t border-ink-600 pt-10 md:grid-cols-12 md:pt-14">
          <div className="md:col-span-6">
            {availability && (
              <p className="flex items-center gap-2 text-sm text-bone-dim">
                <span className="size-1.5 rounded-full bg-moss" /> {availability}
              </p>
            )}
            <a
              href={`mailto:${site.email}`}
              className="group mt-6 inline-block font-display text-3xl font-medium tracking-[-0.04em] text-bone md:text-5xl"
            >
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-700 group-hover:bg-[length:100%_1px]">
                {site.email}
              </span>
            </a>
          </div>

          <nav className="grid grid-cols-2 gap-8 text-sm md:col-span-5 md:col-start-8 md:grid-cols-3" aria-label="Footer">
            <div className="space-y-2.5">
              <Link href="/portfolio" className="block text-bone-dim hover:text-bone">
                Portfolio
              </Link>
              <Link href="/diensten" className="block text-bone-dim hover:text-bone">
                Diensten
              </Link>
              <Link href="/over-mij" className="block text-bone-dim hover:text-bone">
                Over mij
              </Link>
              <Link href="/contact" className="block text-bone-dim hover:text-bone">
                Contact
              </Link>
            </div>
            <div className="space-y-2.5">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="block text-bone-dim hover:text-bone">
                Instagram ↗
              </a>
              <Link href="/login" className="block text-bone-dim hover:text-bone">
                Klantportaal
              </Link>
            </div>
            <div className="space-y-2.5">
              <Link href="/privacy" className="block text-mist hover:text-bone">
                Privacy
              </Link>
              <Link href="/voorwaarden" className="block text-mist hover:text-bone">
                Voorwaarden
              </Link>
            </div>
          </nav>
        </div>

        <div className="mt-16 grid gap-3 border-t border-ink-700/70 py-6 text-xs text-mist-dim md:grid-cols-12 md:items-center">
          <p className="md:col-span-4">
            © {year} {site.name} · {site.owner}
          </p>
          <p className="md:col-span-3">
            Nederland · <LiveClock />
          </p>
          <p className="md:col-span-3">
            KvK {site.kvk}
            {site.btw && <> · Btw {site.btw}</>}
          </p>
          <p className="md:col-span-2 md:text-right">Ontwerp en code in eigen huis</p>
        </div>
      </div>
    </footer>
  );
}
