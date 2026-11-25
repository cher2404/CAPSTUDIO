import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/site/reveal";
import { Accent, SectionHead } from "@/components/site/section";
import { Viewfinder } from "@/components/site/viewfinder";
import { Arrow, LinkButton } from "@/components/ui/button";
import { getSetting, getTexts } from "@/lib/content";
import { md } from "@/lib/markdown";
import { instagramUrl, site } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Over mij",
  description: `Maak kennis met ${site.owner}: fotograaf, videomaker en developer achter ${site.name}.`,
  alternates: { canonical: "/over-mij" },
};

export default async function OverMijPage() {
  const [portrait, t] = await Promise.all([getSetting("about_image", ""), getTexts()]);

  return (
    <div className="container-x pt-32 md:pt-44">
      <Reveal>
        <p className="label">
          Over mij
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
            <span>Foto · Video · Apps</span>
          </div>
        </Reveal>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="font-display text-2xl leading-snug font-medium tracking-[-0.03em] text-bone md:text-[2rem]">{t["over.intro"]}</p>
          </Reveal>

          {t["over.story"].trim() && (
            <Reveal delay={120} className="rule-t mt-10 pt-8">
              <div className="prose-cap" dangerouslySetInnerHTML={{ __html: md(t["over.story"]) }} />
            </Reveal>
          )}

          <Reveal className="mt-12">
            <SectionHead index="01" label="Disciplines" />
            <dl className="mt-2">
              {[
                ["Foto", "Sport, lifestyle en merken"],
                ["Video", "Reels en clips"],
                ["Apps", "Websites en webapps"],
                ["Games", "Interactief en speels"],
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
              Start een project <Arrow />
            </LinkButton>
            <LinkButton href={instagramUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="lg">
              Instagram ↗
            </LinkButton>
          </Reveal>
        </div>
      </section>

      <section className="mt-24 md:mt-36">
        <Reveal>
          <SectionHead index="02" label={t["over.gallery_title"]} />
        </Reveal>
        <Reveal className="mt-8 grid gap-6 md:grid-cols-12">
          <p className="font-display text-2xl leading-snug font-medium tracking-[-0.03em] text-bone md:col-span-6 md:text-[2rem]">
            <Accent text={t["over.gallery_intro"]} />
          </p>
        </Reveal>
        <Reveal className="-mx-5 mt-10 md:mx-0">
          <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
            {wanderings.map((w, i) => (
              <li key={w.src} className={`group w-[72vw] shrink-0 snap-start sm:w-[44vw] md:w-auto ${w.span === 6 ? "md:col-span-6" : w.span === 4 ? "md:col-span-4" : "md:col-span-2"}`}>
                <div className={`relative overflow-hidden bg-ink-850 ${w.span === 6 ? "aspect-[4/3] md:aspect-[3/1]" : w.span === 4 ? "aspect-[4/3] md:aspect-[2/1]" : "aspect-[4/3] md:aspect-[4/5]"}`}>
                  <Image
                    src={w.src}
                    alt={w.alt}
                    fill
                    sizes={w.span === 6 ? "(min-width: 768px) 90vw, 72vw" : w.span === 4 ? "(min-width: 768px) 60vw, 72vw" : "(min-width: 768px) 30vw, 72vw"}
                    className="object-cover grayscale transition duration-700 group-hover:scale-[1.02] group-hover:grayscale-0"
                  />
                  <Viewfinder />
                </div>
                <div className="mt-3 flex justify-between font-mono text-[10px] tracking-[0.04em] text-mist uppercase">
                  <span>{String(i + 1).padStart(2, "0")} / {w.caption}</span>
                  <span>{w.year}</span>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </div>
  );
}

/** Eigen vrij werk (span = kolommen op desktop, samen per rij 6), buiten opdrachten om. Bestanden staan in public/over-mij. */
const wanderings = [
  { src: "/over-mij/keulen-ramen.jpg", alt: "Glas-in-loodramen in de Dom van Keulen", caption: "Dom van Keulen", year: "2018", span: 4 },
  { src: "/over-mij/waterlelie.jpg", alt: "Close-up van het blad van een reuzenwaterlelie", caption: "Waterlelie", year: "2017", span: 2 },
  { src: "/over-mij/trein.jpg", alt: "Gele trein op een perron, gezien door een onscherp raam", caption: "Perron", year: "2018", span: 2 },
  { src: "/over-mij/gevels.jpg", alt: "Rij historische bakstenen gevels tegen een blauwe lucht", caption: "Gevels", year: "2017", span: 2 },
  { src: "/over-mij/muurschildering.jpg", alt: "Verweerde muurschildering van een engel en een duiveltje", caption: "Muurschildering", year: "2018", span: 2 },
  { src: "/over-mij/keulen-schip.jpg", alt: "Gotische pilaren en gewelven in de Dom van Keulen", caption: "Dom van Keulen", year: "2018", span: 6 },
];
