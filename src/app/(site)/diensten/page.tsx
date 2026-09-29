import type { Metadata } from "next";
import { Reveal } from "@/components/site/reveal";
import { PageIntro, SectionHead } from "@/components/site/section";
import { Arrow, LinkButton } from "@/components/ui/button";
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
    <>
      <PageIntro label="Pakketten" title={t["diensten.title"]} intro={t["diensten.intro"]} />

      <section className="container-x mt-16 md:mt-24">
        <SectionHead index="01" label="Tarieven" action={<span className="label">{vatNote(pricing)}</span>} />
        <div className="mt-8 grid border-ink-700/70 md:grid-cols-2 md:border-t xl:grid-cols-4">
          {packages.map((p, i) => {
            const price = displayPrice(p, pricing);
            return (
              <Reveal
                key={p.id}
                delay={i * 90}
                className={cn(
                  "relative flex flex-col border-b border-ink-700/70 py-8 md:px-6 md:py-8 xl:border-b-0",
                  "md:[&:nth-child(2n)]:border-l xl:[&:not(:first-child)]:border-l",
                  p.highlighted && "bg-gradient-to-b from-ember/[0.07] to-transparent",
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs text-mist-dim">0{i + 1}</span>
                  {p.highlighted ? <span className="label text-ember-soft">Meest gekozen</span> : <span className="label">{p.duration}</span>}
                </div>
                <h2 className="mt-10 text-4xl md:text-[2.6rem]">{p.name}</h2>

                <div className="mt-8 min-h-20">
                  {price ? (
                    <>
                      <p className="label mb-1">{p.price_label || "\u00a0"}</p>
                      <p className="font-display text-6xl font-medium tracking-[-0.05em] text-bone">{price}</p>
                    </>
                  ) : (
                    <p className="font-display text-4xl font-medium tracking-[-0.04em] text-bone">
                      Prijs na <em className="text-ember-soft">overleg</em>
                    </p>
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
          })}
        </div>
      </section>

      <section className="container-x mt-20 md:mt-32">
        <SectionHead index="02" label="Goed om te weten" />
        <div className="mt-8 grid gap-8 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <p className="font-display text-2xl leading-snug font-medium tracking-[-0.03em] text-bone md:text-3xl">{t["diensten.included"]}</p>
          </Reveal>
          <Reveal delay={100} className="space-y-6 md:col-span-5 md:col-start-8">
            <p className="leading-relaxed text-bone-dim">{t["diensten.extra"]}</p>
            <p className="rule-t pt-6 text-sm text-mist">{t["diensten.disclaimer"]}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
