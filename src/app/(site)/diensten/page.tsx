import type { Metadata } from "next";
import { Reveal } from "@/components/site/reveal";
import { LinkButton } from "@/components/ui/button";
import { displayPrice, getPackages, getPricing, getTexts, vatNote } from "@/lib/content";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Diensten en tarieven",
  description: "Mini shoot, halve dag, foto en video of een pakket op maat. Bekijk de pakketten en tarieven van CAP Media Studio.",
  alternates: { canonical: "/diensten" },
};

export default async function DienstenPage() {
  const [packages, pricing, t] = await Promise.all([getPackages(), getPricing(), getTexts()]);

  return (
    <div className="container-x pt-32 md:pt-44">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">Pakketten</p>
        <h1 className="mt-4 text-5xl leading-none md:text-7xl">{t["diensten.title"]}</h1>
        {t["diensten.intro"] && <p className="mt-5 text-mist md:text-lg">{t["diensten.intro"]}</p>}
      </Reveal>

      <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-2 xl:grid-cols-4">
        {packages.map((p, i) => {
          const price = displayPrice(p, pricing);
          return (
            <Reveal
              key={p.id}
              delay={i * 90}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7 transition-colors duration-500",
                p.highlighted ? "border-ember/50 bg-gradient-to-b from-ember/10 to-ink-900" : "border-ink-700/70 bg-ink-900/60 hover:border-ink-600",
              )}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-7 rounded-full bg-ember px-3 py-1 text-[10px] font-semibold tracking-[0.15em] text-ink-950 uppercase">
                  Meest gekozen
                </span>
              )}
              {p.duration && <p className="text-xs tracking-wide text-mist">{p.duration}</p>}
              <h2 className="mt-3 text-3xl">{p.name}</h2>
              <p className="mt-6 min-h-12">
                {price ? (
                  <>
                    {p.price_label && <span className="mr-1.5 text-sm text-mist">{p.price_label}</span>}
                    <span className="font-display text-5xl text-bone">{price}</span>
                    <span className="mt-1 block text-xs text-mist-dim">{vatNote(pricing)}</span>
                  </>
                ) : (
                  <span className="font-display text-3xl text-bone">Prijs na overleg</span>
                )}
              </p>
              <ul className="mt-6 space-y-3 border-t border-ink-700/70 pt-6 text-sm text-bone-dim">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="mt-2 h-px w-3 shrink-0 bg-ember" />
                    {f}
                  </li>
                ))}
              </ul>
              {p.tagline && <p className="mt-6 flex-1 text-sm leading-relaxed text-mist">{p.tagline}</p>}
              <LinkButton
                href={`/contact?type=offerte&pakket=${encodeURIComponent(p.slug)}`}
                variant={p.highlighted ? "primary" : "outline"}
                className="mt-8 w-full"
              >
                Vraag offerte aan
              </LinkButton>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-ember/25 bg-ember/5 p-6 md:p-8">
          <p className="leading-relaxed text-bone-dim">{t["diensten.included"]}</p>
        </div>
        <div className="rounded-2xl border border-tide/25 bg-tide/5 p-6 md:p-8">
          <p className="leading-relaxed text-bone-dim">{t["diensten.extra"]}</p>
        </div>
      </Reveal>

      <p className="mt-6 text-sm text-mist">{t["diensten.disclaimer"]}</p>
    </div>
  );
}
