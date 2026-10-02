import Image from "next/image";
import Link from "next/link";
import { Exposure, FilmEdge } from "@/components/site/film";
import { GreaseMark } from "@/components/site/grease-mark";
import { LiveClock } from "@/components/site/live-clock";
import { Reveal } from "@/components/site/reveal";
import { Accent } from "@/components/site/section";
import { WorkIndex } from "@/components/site/work-index";
import { getHero, getPortfolio, getTexts } from "@/lib/content";
import type { PortfolioCategory, PortfolioItem } from "@/lib/types";
import { site } from "@/lib/site";

export const revalidate = 300;

/** Statement met kleine beelden tussen de woorden: {foto} {video} {apps} {games}. */
function Statement({ text, portfolio }: { text: string; portfolio: PortfolioItem[] }) {
  const pick: Record<string, PortfolioCategory[]> = {
    foto: ["sport", "lifestyle"],
    video: ["video", "sport"],
    apps: ["apps", "lifestyle"],
    games: ["games", "sport"],
  };
  const used = new Set<string>();
  const imageFor = (token: string) => {
    for (const cat of pick[token] ?? []) {
      const hit = portfolio.find((p) => p.category === cat && !used.has(p.id));
      if (hit) {
        used.add(hit.id);
        return hit;
      }
    }
    return portfolio.find((p) => !used.has(p.id));
  };

  return (
    <p className="font-display text-[2rem] leading-[1.08] font-medium tracking-[-0.04em] text-bone sm:text-5xl md:text-6xl lg:text-[4.6rem]">
      {text.split(/(\{\w+\})/g).map((part, i) => {
        const token = part.match(/^\{(\w+)\}$/)?.[1];
        if (!token) return <span key={i}>{part}</span>;
        if (!pick[token]) return null;
        const img = imageFor(token);
        return (
          <span
            key={i}
            className="relative mx-1 inline-block h-[0.78em] w-[1.25em] -rotate-2 overflow-hidden bg-ink-800 align-[-0.04em] ring-1 ring-bone/10 transition-transform duration-500 odd:rotate-2 hover:scale-150 md:w-[1.35em]"
          >
            {img && <Image src={img.image_url} alt="" fill sizes="120px" className="object-cover" />}
          </span>
        );
      })}
    </p>
  );
}

export default async function HomePage() {
  const [hero, portfolio, t] = await Promise.all([getHero(), getPortfolio(), getTexts()]);
  const stills = portfolio.filter((p) => p.image_url);
  const frames = stills.slice(0, 6);
  const work = stills.slice(0, 6).map((p) => ({ ...p, year: p.created_at ? String(new Date(p.created_at).getFullYear()) : "" }));

  const disciplines = ([1, 2, 3, 4] as const)
    .map((n) => ({ title: t[`home.block_${n}_title`], text: t[`home.block_${n}_text`], tag: t[`home.block_${n}_tag`] }))
    .filter((d) => d.title.trim());

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    founder: { "@type": "Person", name: site.owner },
    areaServed: { "@type": "Country", name: "Nederland" },
    sameAs: [`https://instagram.com/${site.instagram}`],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero: het scherm als één frame op de film */}
      <section className="relative flex h-[100svh] min-h-[620px] flex-col overflow-hidden">
        <Image src={hero.src} alt={hero.alt} fill priority quality={75} sizes="100vw" className="animate-slow-zoom object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-ink-950/50" />

        <div className="container-x relative mt-22 md:mt-24">
          <FilmEdge start={12} />
          <div className="mt-6 flex items-start justify-between">
            <Exposure />
            <p className="font-mono text-[10px] tracking-[0.08em] text-bone/60 uppercase">
              NL <LiveClock />
            </p>
          </div>
        </div>

        <div className="container-x relative mt-auto pb-10 md:pb-14">
          <p className="mb-5 font-mono text-[10px] tracking-[0.08em] text-ember-soft uppercase">Frame 12A — {site.name}</p>
          <h1 className="max-w-[13ch] animate-fade-up text-[3.2rem] leading-[0.9] sm:text-7xl md:text-8xl lg:text-[9rem]">
            <Accent text={t["home.hero_title"]} />
          </h1>
          <div className="mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md text-[15px] leading-relaxed text-bone-dim md:text-base">{t["home.hero_subtitle"]}</p>
            <Link
              href="/contact?type=boeken"
              className="group inline-flex items-center gap-4 self-start border-b border-bone pb-1.5 font-display text-2xl font-medium tracking-[-0.03em] text-bone transition-colors hover:border-ember-soft hover:text-ember-soft md:self-auto md:text-3xl"
            >
              {t["home.hero_button"]}
              <span className="transition-transform duration-500 group-hover:translate-x-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Contactvel: een strook frames, de favoriet omcirkeld */}
      {frames.length > 0 && (
        <section className="container-x mt-4">
          <div className="grid grid-cols-3 gap-1.5 md:grid-cols-6">
            {frames.map((f, i) => (
              <Link key={f.id} href="/portfolio" className={`group relative block ${i >= 3 ? "hidden md:block" : ""}`}>
                <span className="relative block aspect-[3/2] overflow-hidden bg-ink-850">
                  <Image src={f.image_url} alt={f.alt ?? ""} fill sizes="(min-width: 768px) 16vw, 33vw" className="object-cover grayscale transition duration-700 group-hover:grayscale-0" />
                </span>
                <span className="mt-1.5 block font-mono text-[9px] tracking-[0.1em] text-mist-dim uppercase">
                  {13 + Math.floor(i / 2)}
                  {i % 2 ? "A" : ""} ▸
                </span>
                {i === 1 && <GreaseMark className="absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] text-ember" />}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Statement */}
      <section className="container-x pt-28 md:pt-44">
        <Reveal className="max-w-6xl">
          <Statement text={t["home.statement"]} portfolio={stills} />
        </Reveal>
      </section>

      {/* Disciplines als index */}
      <section className="container-x pt-28 md:pt-40">
        <div className="grid gap-6 md:grid-cols-12">
          <p className="font-mono text-[10px] tracking-[0.08em] text-mist uppercase md:col-span-3">Wat ik doe</p>
          <ul className="md:col-span-9">
            {disciplines.map((d, i) => (
              <li key={i} className="group grid gap-3 border-t border-ink-600 py-7 md:grid-cols-9 md:gap-6 md:py-9">
                <h2 className="text-5xl transition-colors duration-500 group-hover:text-ember-soft md:col-span-4 md:text-6xl">
                  {d.title}
                  {d.tag && <sup className="ml-2 align-super font-mono text-[10px] font-normal tracking-[0.08em] text-ember-soft uppercase">{d.tag}</sup>}
                </h2>
                <p className="max-w-md leading-relaxed text-mist md:col-span-5 md:pt-2">{d.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Werk */}
      {work.length > 0 && (
        <section className="container-x pt-28 md:pt-40">
          <div className="mb-8 flex items-end justify-between gap-6 md:mb-12">
            <h2 className="text-5xl md:text-7xl">
              <Accent text={t["home.work_title"]} />
            </h2>
            <Link href="/portfolio" className="arrow-link shrink-0 pb-2 text-sm text-bone-dim hover:text-bone">
              Alles bekijken <span className="arrow">→</span>
            </Link>
          </div>
          <WorkIndex items={work} />
        </section>
      )}

      {/* Werkwijze */}
      <section className="container-x pt-28 md:pt-44">
        <figure className="grid gap-8 md:grid-cols-12">
          <figcaption className="font-mono text-[10px] tracking-[0.08em] text-mist uppercase md:col-span-3">Werkwijze</figcaption>
          <blockquote className="md:col-span-8">
            <p className="serif text-4xl leading-[1.1] text-bone md:text-6xl">
              <span className="text-ember-soft">{t["home.approach_title"]}.</span> {t["home.approach_text"]}
            </p>
            <p className="mt-8 font-mono text-[10px] tracking-[0.08em] text-mist uppercase">— Cheryl, {site.name}</p>
          </blockquote>
        </figure>
      </section>

      {/* Afsluiter: één grote link */}
      <section className="container-x pt-28 md:pt-44">
        <p className="font-mono text-[10px] tracking-[0.08em] text-mist uppercase">{t["home.cta_title"]}</p>
        <Link
          href="/contact?type=offerte"
          className="group mt-4 flex items-end justify-between gap-6 border-b border-ink-600 pb-6 transition-colors hover:border-ember"
        >
          <span className="font-display text-[3.2rem] leading-[0.9] font-semibold tracking-[-0.05em] text-bone transition-colors duration-500 group-hover:text-ember-soft sm:text-7xl md:text-8xl lg:text-[9.5rem]">
            <Accent text={t["home.cta_link"]} className="font-normal" />
          </span>
          <span className="mb-2 font-display text-4xl text-bone transition-transform duration-500 group-hover:translate-x-3 group-hover:-rotate-45 md:text-7xl">
            →
          </span>
        </Link>
        <div className="mt-5 flex flex-col justify-between gap-2 text-sm text-mist md:flex-row">
          <span>{t["home.cta_button"]}</span>
          <a href={`mailto:${site.email}`} className="text-bone-dim hover:text-bone">
            {site.email}
          </a>
        </div>
      </section>
    </>
  );
}
