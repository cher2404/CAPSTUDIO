import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { Accent, PageIntro } from "@/components/site/section";
import { disciplines } from "@/lib/categories";
import { displayPrice, getPackages, getPricing, getTexts, vatNote, type Pricing } from "@/lib/content";
import type { Package } from "@/lib/types";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Diensten en tarieven",
  description: "Fotoshoots, video, websites, apps en games. Bekijk de diensten en tarieven van CAP Media Studio.",
  alternates: { canonical: "/diensten" },
};

/** Eén regel op de prijslijst. */
function PriceRow({ p, pricing }: { p: Package; pricing: Pricing }) {
  const price = displayPrice(p, pricing);
  return (
    <li>
      <Link
        href={`/contact?type=offerte&pakket=${encodeURIComponent(p.slug)}`}
        className="group grid gap-4 border-b border-ink-700/80 py-8 transition-colors md:grid-cols-12 md:gap-6 md:py-10"
      >
        <div className="md:col-span-4">
          <h3 className="flex items-baseline gap-3 text-4xl transition-colors duration-500 group-hover:text-ember-soft md:text-5xl">
            {p.name}
            {p.highlighted && <span className="font-mono text-[10px] font-normal tracking-[0.08em] text-ember-soft uppercase">Favoriet</span>}
          </h3>
          {p.duration && <p className="mt-2 font-mono text-[10px] tracking-[0.08em] text-mist uppercase">{p.duration}</p>}
        </div>

        <div className="md:col-span-5">
          <p className="text-bone-dim">{p.features.join(" · ")}</p>
          {p.tagline && <p className="mt-2 text-sm text-mist">{p.tagline}</p>}
        </div>

        <div className="flex items-end justify-between gap-4 md:col-span-3 md:flex-col md:items-end md:justify-between">
          <p className="text-right">
            {price ? (
              <>
                {p.price_label && <span className="mr-2 text-sm text-mist">{p.price_label}</span>}
                <span className="font-display text-4xl font-medium tracking-[-0.04em] text-bone md:text-5xl">{price}</span>
              </>
            ) : (
              <span className="serif text-3xl text-bone md:text-4xl">in overleg</span>
            )}
          </p>
          <span className="inline-flex items-center gap-2 text-sm text-bone-dim transition-colors group-hover:text-bone">
            Offerte aanvragen <span className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
          </span>
        </div>
      </Link>
    </li>
  );
}

export default async function DienstenPage() {
  const [packages, pricing, t] = await Promise.all([getPackages(), getPricing(), getTexts()]);

  const sections = disciplines
    .map((d) => ({
      ...d,
      title: t[`diensten.${d.value}_title`] || d.label,
      intro: d.value === "digitaal" ? t["diensten.digitaal_intro"] : d.value === "games" ? t["diensten.games_intro"] : "",
      items: packages.filter((p) => (p.category ?? "beeld") === d.value),
    }))
    .filter((s) => s.items.length > 0);

  return (
    <>
      <PageIntro label="Diensten" title={t["diensten.title"]} intro={t["diensten.intro"]} />

      {sections.map((section) => (
        <section key={section.value} className="container-x mt-20 md:mt-32">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-3">
              <h2 className="text-4xl md:sticky md:top-28 md:text-5xl">
                <Accent text={section.title} />
              </h2>
              {section.intro && <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist">{section.intro}</p>}
              {section.items.some((p) => p.price != null) && (
                <p className="mt-4 font-mono text-[10px] tracking-[0.08em] text-mist uppercase">Prijzen {vatNote(pricing)}</p>
              )}
            </div>
            <ul className={cn("border-t border-ink-600 md:col-span-9")}>
              {section.items.map((p) => (
                <PriceRow key={p.id} p={p} pricing={pricing} />
              ))}
            </ul>
          </div>

          {section.value === "beeld" && (
            <div className="mt-12 grid gap-6 md:grid-cols-12">
              <Reveal className="md:col-span-5 md:col-start-4">
                <p className="text-lg leading-relaxed text-bone">{t["diensten.included"]}</p>
              </Reveal>
              <Reveal delay={100} className="md:col-span-4">
                <p className="leading-relaxed text-mist">{t["diensten.extra"]}</p>
              </Reveal>
            </div>
          )}
        </section>
      ))}

      <div className="container-x mt-20">
        <p className="text-sm text-mist md:pl-[25%]">{t["diensten.disclaimer"]}</p>
      </div>
    </>
  );
}
