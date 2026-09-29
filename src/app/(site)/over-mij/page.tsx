import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/site/reveal";
import { LinkButton } from "@/components/ui/button";
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
    <div className="pt-32 md:pt-44">
      <section className="container-x grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-20">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-850 md:sticky md:top-32 md:self-start">
          {portrait ? (
            <Image src={portrait} alt={`Portret van ${site.owner}`} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          ) : (
            // Plek voor je portretfoto: stel hem in via Admin → Instellingen.
            <div className="absolute inset-0 flex items-center justify-center glow-warm">
              <span className="font-display text-[9rem] leading-none text-bone/10 italic">C</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
          <p className="absolute bottom-5 left-5 text-xs tracking-[0.25em] text-bone uppercase">{site.owner}</p>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">Over mij</p>
            <h1 className="mt-4 text-5xl leading-[1.02] md:text-7xl">{t["over.title"]}</h1>
          </Reveal>

          <Reveal delay={100}>
            <p className="mt-10 text-lg leading-relaxed text-bone-dim md:text-xl">{t["over.intro"]}</p>
          </Reveal>

          {t["over.story"].trim() && (
            <Reveal delay={150} className="prose-cap mt-10 md:text-lg" >
              <div dangerouslySetInnerHTML={{ __html: md(t["over.story"]) }} />
            </Reveal>
          )}

          <Reveal className="mt-14 grid grid-cols-3 gap-4 border-y border-ink-700/70 py-8 text-center">
            {[
              ["Foto", "sport en lifestyle"],
              ["Video", "reels en clips"],
              ["Web", "sites en apps"],
            ].map(([title, desc]) => (
              <div key={title}>
                <p className="font-display text-2xl text-bone md:text-3xl">{title}</p>
                <p className="mt-1 text-xs text-mist">{desc}</p>
              </div>
            ))}
          </Reveal>

          <Reveal className="mt-12 flex flex-wrap gap-3">
            <LinkButton href="/contact?type=boeken" size="lg">
              Boek een shoot
            </LinkButton>
            <LinkButton href={instagramUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="lg">
              Volg me op Instagram
            </LinkButton>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
