import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/site/reveal";
import { Accent, SectionHead } from "@/components/site/section";
import { Arrow, LinkButton } from "@/components/ui/button";
import { getSetting, getTexts } from "@/lib/content";
import { md } from "@/lib/markdown";
import { instagramUrl, site } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Over mij",
  description: `Maak kennis met ${site.owner}, fotograaf en videomaker achter ${site.name}.`,
  alternates: { canonical: "/over-mij" },
};

export default async function OverMijPage() {
  const [portrait, t] = await Promise.all([getSetting("about_image", ""), getTexts()]);

  return (
    <div className="container-x pt-32 md:pt-44">
      <Reveal>
        <p className="label">
          <span className="text-ember-soft">(—)</span> Over mij
        </p>
      </Reveal>
      <Reveal className="mt-6 md:mt-8">
        <h1 className="text-[3rem] leading-[0.92] sm:text-7xl md:text-8xl lg:text-[7.5rem]">
          <Accent text={t["over.title"]} />
        </h1>
      </Reveal>

      <section className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:gap-5">
        <Reveal className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden bg-ink-850">
            {portrait ? (
              <Image src={portrait} alt={`Portret van ${site.owner}`} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            ) : (
              // Plek voor je portretfoto: stel hem in via Admin → Instellingen.
              <div className="absolute inset-0 flex items-end bg-[radial-gradient(70%_60%_at_30%_30%,rgba(201,151,107,.14),transparent_70%)] p-5">
                <span className="label">Portret volgt</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex justify-between font-mono text-[10px] tracking-[0.04em] text-mist uppercase">
            <span>{site.owner}</span>
            <span>Fotograaf · Videomaker</span>
          </div>
        </Reveal>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="font-display text-2xl leading-snug font-medium tracking-[-0.03em] text-bone md:text-[2rem]">{t["over.intro"]}</p>
          </Reveal>

          {t["over.story"].trim() && (
            <Reveal delay={120} className="prose-cap rule-t mt-10 pt-8">
              <div dangerouslySetInnerHTML={{ __html: md(t["over.story"]) }} />
            </Reveal>
          )}

          <Reveal className="mt-12">
            <SectionHead index="01" label="Disciplines" />
            <dl className="mt-2">
              {[
                ["Foto", "Sport en lifestyle"],
                ["Video", "Reels en clips"],
                ["Web", "Websites en apps"],
              ].map(([title, desc]) => (
                <div key={title} className="rule-b flex items-baseline justify-between py-4">
                  <dt className="font-display text-3xl font-medium tracking-[-0.04em] text-bone">{title}</dt>
                  <dd className="label">{desc}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal className="mt-10 flex flex-wrap gap-3">
            <LinkButton href="/contact?type=boeken" size="lg">
              Boek een shoot <Arrow />
            </LinkButton>
            <LinkButton href={instagramUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="lg">
              Instagram ↗
            </LinkButton>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
