import type { Metadata } from "next";
import { Reveal } from "@/components/site/reveal";
import { Accent, PageIntro, SectionHead } from "@/components/site/section";
import { Arrow, LinkButton } from "@/components/ui/button";
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

function PackageColumn({ p, i, pricing }: { p: Package; i: number; pricing: Pricing }) {
  const price = displayPrice(p, pricing);
  return (
    <Reveal
      delay={i * 90}
      className={cn("relative flex flex-col border-t border-ink-600 pt-5 pb-2", p.highlighted && "bg-gradient-to-b from-ember/[0.07] to-transparent")}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-xs text-mist-dim">0{i + 1}</span>
        {p.highlighted ? <span className="label text-ember-soft">Meest gekozen</span> : <span className="label">{p.duration}</span>}
      </div>
      <h3 className="mt-10 text-4xl md:text-[2.6rem]">{p.name}</h3>

      <div className="mt-8 min-h-20">
        {price ? (
          <>
            <p className="label mb-1">{p.price_label || " "}</p>
            <p className="font-display text-6xl font-medium tracking-[-0.05em] text-bone">{price}</p>
          </>
        ) : (
          <>
            <p className="label mb-1">{" "}</p>
            <p className="font-display text-4xl font-medium tracking-[-0.04em] text-bone">
              Prijs na <em className="text-ember-soft">overleg</em>
            </p>
          </>
        )}
      </div>

      <ul className="mt-8 text-sm text-bone-dim">
        {p.features.map((f) => (
          <li key={f} className="rule-t flex gap-3 py-2.5">
            <span className="text-ember-soft">+</span>
            {f}
          </li>
        ))}
      </ul>
      {p.tagline && <p className="rule-t flex-1 pt-4 text-sm leading-relaxed text-mist">{p.tagline}</p>}
      <LinkButton
        href={`/contact?type=offerte&pakket=${encodeURIComponent(p.slug)}`}
        variant={p.highlighted ? "primary" : "outline"}
        className="mt-8 w-full justify-between"
      >
        Vraag offerte aan <Arrow />
      </LinkButton>
    </Reveal>
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

      {sections.map((section, si) => (
        <section key={section.value} className="container-x mt-16 md:mt-28">
          <SectionHead
            index={String(si + 1).padStart(2, "0")}
            label={section.title}
            action={section.items.some((p) => p.price != null) ? <span className="label">{vatNote(pricing)}</span> : undefined}
          />
          <div className="mt-8 grid gap-x-6 gap-y-12 md:mt-12 md:grid-cols-12">
            <Reveal className="md:col-span-4">
              <h2 className="text-5xl md:text-6xl">
                <Accent text={section.title} />
              </h2>
              {section.intro && <p className="mt-5 max-w-sm leading-relaxed text-mist">{section.intro}</p>}
            </Reveal>
          </div>
          <div className={cn("mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2", section.items.length >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-3")}>
            {section.items.map((p, i) => (
              <PackageColumn key={p.id} p={p} i={i} pricing={pricing} />
            ))}
          </div>

          {section.value === "beeld" && (
            <div className="mt-14 grid gap-8 md:grid-cols-12">
              <Reveal className="md:col-span-5">
                <p className="font-display text-2xl leading-snug font-medium tracking-[-0.03em] text-bone md:text-3xl">{t["diensten.included"]}</p>
              </Reveal>
              <Reveal delay={100} className="space-y-6 md:col-span-5 md:col-start-8">
                <p className="leading-relaxed text-bone-dim">{t["diensten.extra"]}</p>
              </Reveal>
            </div>
          )}
        </section>
      ))}

      <div className="container-x mt-16">
        <p className="rule-t pt-6 text-sm text-mist">{t["diensten.disclaimer"]}</p>
      </div>
    </>
  );
}
