import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/site/reveal";
import { LinkButton } from "@/components/ui/button";
import { getPortfolio, getSetting } from "@/lib/content";
import { instagramUrl, site } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Over mij",
  description: `Maak kennis met ${site.owner}, de fotograaf en videomaker achter CAP Studio.`,
  alternates: { canonical: "/over-mij" },
};

export default async function OverMijPage() {
  const [portfolio, portrait] = await Promise.all([getPortfolio(), getSetting("about_image", "")]);
  const images = portfolio.filter((p) => p.category !== "video");
  const main = portrait || images[4]?.image_url || images[0]?.image_url;
  const second = images[1]?.image_url;

  return (
    <div className="pt-32 md:pt-44">
      <section className="container-x grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-20">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-850 md:sticky md:top-32 md:self-start">
          {main && <Image src={main} alt={`Portret van ${site.owner}`} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
          <p className="absolute bottom-5 left-5 text-xs tracking-[0.25em] text-bone uppercase">{site.owner}</p>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">Over mij</p>
            <h1 className="mt-4 text-5xl leading-[1.02] md:text-7xl">
              Hoi, ik ben <span className="italic text-ember-soft">Cheryl</span>
            </h1>
          </Reveal>

          <Reveal delay={100} className="prose-cap mt-10 text-base md:text-lg">
            <p>
              Achter CAP Studio zit ik: Cheryl Aldessa Prijs. Fotograaf, videomaker en al zo lang ik me kan herinneren gefascineerd door
              beweging. Het moment vlak voor de lift. De ademhaling tussen twee sets. Het zweet dat oplicht in een streep zonlicht.
            </p>
            <p>
              Ik kom zelf uit de sport en weet hoeveel uren er zitten achter een lichaam, een prestatie of een merk. Dat verdient meer dan
              een snelle foto met de telefoon. Het verdient beeld met gevoel.
            </p>
          </Reveal>

          <Reveal delay={150} className="mt-14 rounded-2xl border border-ink-700/70 bg-ink-900/60 p-7 md:p-9">
            <p className="eyebrow text-ember-soft">Mijn stijl</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Filmisch, als een still uit een film</h2>
            <div className="prose-cap mt-5">
              <p>
                Mijn beelden zijn donker, rijk aan contrast en spelen met licht en schaduw. Warme huidtinten tegen koele achtergronden.
                Korrel in plaats van plastic. Ik zoek niet de perfecte pose, maar het echte moment ertussen.
              </p>
              <p>
                Tijdens een shoot regisseer ik je rustig en concreet, zodat je vergeet dat er een camera is. Het resultaat: beelden die
                voelen als jouw verhaal, niet als een catalogus.
              </p>
            </div>
          </Reveal>

          {second && (
            <Reveal className="relative mt-14 aspect-[16/10] overflow-hidden rounded-2xl bg-ink-850">
              <Image src={second} alt="Sfeerbeeld uit een shoot" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </Reveal>
          )}

          <Reveal className="mt-14 grid grid-cols-3 gap-4 border-y border-ink-700/70 py-8 text-center">
            {[
              ["Sport", "gym, kracht, run"],
              ["Lifestyle", "merk en persoon"],
              ["Video", "reels en campagnes"],
            ].map(([t, d]) => (
              <div key={t}>
                <p className="font-display text-2xl text-bone md:text-3xl">{t}</p>
                <p className="mt-1 text-xs text-mist">{d}</p>
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
