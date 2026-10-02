import Image from "next/image";
import Link from "next/link";
import { Arrow, LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { Accent, SectionHead } from "@/components/site/section";
import { getHero, getPortfolio, getTexts } from "@/lib/content";
import { site } from "@/lib/site";

export const revalidate = 300;

const categoryLabel: Record<string, string> = { sport: "Sport", lifestyle: "Lifestyle", video: "Video", apps: "Apps", games: "Games" };

export default async function HomePage() {
  const [hero, portfolio, t] = await Promise.all([getHero(), getPortfolio(), getTexts()]);
  const selected = portfolio.filter((p) => p.category !== "video" || p.image_url).slice(0, 5);

  const blocks = ([1, 2, 3, 4] as const)
    .map((n) => ({
      title: t[`home.block_${n}_title`],
      text: t[`home.block_${n}_text`],
      tag: t[`home.block_${n}_tag`],
    }))
    .filter((b) => b.title.trim());

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

  // Raster voor geselecteerd werk: bewust asymmetrisch
  const layout = [
    "col-span-12 md:col-span-7 aspect-[4/5] md:aspect-[7/8]",
    "col-span-6 md:col-span-5 aspect-[4/5] md:mt-40",
    "col-span-6 md:col-span-4 md:col-start-2 aspect-[4/5]",
    "col-span-12 md:col-span-6 md:col-start-7 aspect-[3/2] md:mt-32",
    "col-span-12 md:col-span-5 md:col-start-5 aspect-[4/5]",
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative flex h-[100svh] min-h-[600px] flex-col justify-end overflow-hidden">
        <Image src={hero.src} alt={hero.alt} fill priority quality={75} sizes="100vw" className="animate-slow-zoom object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_10%_90%,rgba(201,151,107,.18),transparent_70%)]" />

        <div className="container-x relative">
          <h1 className="max-w-[14ch] animate-fade-up text-[3.1rem] leading-[0.92] [animation-delay:100ms] sm:text-7xl md:text-8xl lg:text-[8.5rem]">
            <Accent text={t["home.hero_title"]} />
          </h1>

          <div className="rule-t mt-10 grid animate-fade-up grid-cols-2 gap-y-6 pt-5 pb-8 [animation-delay:300ms] md:mt-14 md:grid-cols-12 md:pb-10">
            <p className="col-span-2 max-w-md text-[15px] leading-relaxed text-bone-dim md:col-span-5 md:text-base">{t["home.hero_subtitle"]}</p>
            <div className="hidden md:col-span-2 md:col-start-7 md:block">
              <p className="label">Disciplines</p>
              <p className="mt-1.5 text-sm text-bone">Foto · Video · Apps</p>
            </div>
            <div className="hidden md:col-span-2 md:block">
              <p className="label">Werkgebied</p>
              <p className="mt-1.5 text-sm text-bone">Heel Nederland</p>
            </div>
            <div className="col-span-2 flex md:col-span-1 md:col-start-12 md:justify-end">
              <LinkButton href="/contact?type=boeken" size="lg" className="w-full md:w-auto">
                {t["home.hero_button"]} <Arrow />
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Wat ik doe */}
      <section className="container-x pt-24 md:pt-40">
        <SectionHead index="01" label="Disciplines" />
        <div className={`mt-10 grid gap-x-6 gap-y-12 md:mt-16 md:grid-cols-2 ${blocks.length === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
          {blocks.map((b, i) => (
            <Reveal
              key={i}
              delay={i * 100}
              className="border-t border-ink-600 pt-5"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-mist-dim">0{i + 1}</span>
                {b.tag && <span className="label border border-ember/40 px-1.5 py-0.5 text-ember-soft">{b.tag}</span>}
              </div>
              <h2 className="mt-5 text-5xl md:mt-10 xl:text-[3.4rem]">{b.title}</h2>
              <p className="mt-5 max-w-sm leading-relaxed text-mist">{b.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Werkwijze */}
      <section className="container-x pt-24 md:pt-40">
        <SectionHead index="02" label="Werkwijze" />
        <Reveal className="mt-10 grid gap-6 md:mt-14 md:grid-cols-12">
          <h2 className="text-5xl md:col-span-4 md:text-7xl">
            <em className="text-ember-soft">{t["home.approach_title"]}</em>
          </h2>
          <p className="font-display text-2xl leading-snug font-medium tracking-[-0.03em] text-bone md:col-span-7 md:col-start-6 md:text-[2.1rem]">
            {t["home.approach_text"]}
          </p>
        </Reveal>
      </section>

      {/* Geselecteerd werk */}
      <section className="container-x pt-24 md:pt-40">
        <SectionHead
          index="03"
          label={t["home.work_title"]}
          action={
            <Link href="/portfolio" className="arrow-link label text-bone hover:text-ember-soft">
              Alles bekijken <span className="arrow">→</span>
            </Link>
          }
        />
        <div className="mt-10 grid grid-cols-12 gap-x-3 gap-y-10 md:mt-16 md:gap-x-5 md:gap-y-16">
          {selected.map((item, i) => (
            <Reveal key={item.id} delay={(i % 2) * 100} className={layout[i]} as="article">
              <Link href="/portfolio" className="group block h-full">
                <div className="relative h-full overflow-hidden bg-ink-850">
                  <Image
                    src={item.image_url}
                    alt={item.alt ?? item.title ?? `Portfolio ${site.name}`}
                    fill
                    sizes={i === 0 ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 42vw, 50vw"}
                    className="object-cover grayscale-[15%] transition duration-[1.4s] ease-[var(--ease-film)] group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                </div>
                <div className="mt-3 flex justify-between font-mono text-[10px] tracking-[0.04em] text-mist uppercase">
                  <span>
                    {String(i + 1).padStart(2, "0")} / {item.title ?? categoryLabel[item.category]}
                  </span>
                  <span className="transition-colors group-hover:text-ember-soft">{categoryLabel[item.category]}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Afsluiter */}
      <section className="container-x pt-28 md:pt-44">
        <SectionHead index="04" label="Samenwerken" />
        <Reveal className="mt-10 grid items-end gap-10 md:mt-14 md:grid-cols-12">
          <h2 className="text-[2.6rem] leading-[0.95] sm:text-6xl md:col-span-8 md:text-7xl lg:text-8xl">
            <Accent text={t["home.cta_title"]} />
          </h2>
          <div className="md:col-span-4 md:flex md:justify-end">
            <LinkButton href="/contact?type=offerte" size="lg" className="w-full md:w-auto">
              {t["home.cta_button"]} <Arrow />
            </LinkButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
