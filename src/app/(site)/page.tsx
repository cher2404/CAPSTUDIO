import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { getHero, getPortfolio, getTexts } from "@/lib/content";
import { site } from "@/lib/site";

export const revalidate = 300;

const blockIcons = {
  foto: "M4 7h3l2-3h6l2 3h3v13H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  video: "M3 6h13v12H3zM16 10l5-3v10l-5-3z",
  persoonlijk: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
};

export default async function HomePage() {
  const [hero, portfolio, t] = await Promise.all([getHero(), getPortfolio(), getTexts()]);
  const selected = portfolio.filter((p) => p.category !== "video").slice(0, 5);

  const blocks = [
    { key: "foto", title: t["home.block_foto_title"], text: t["home.block_foto_text"], tone: "from-ember/15" },
    { key: "video", title: t["home.block_video_title"], text: t["home.block_video_text"], tone: "from-tide/15" },
    { key: "persoonlijk", title: t["home.block_persoonlijk_title"], text: t["home.block_persoonlijk_text"], tone: "from-bone/10" },
  ] as const;

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

      {/* Hero */}
      <section className="relative flex h-[100svh] min-h-[560px] items-end overflow-hidden">
        <Image src={hero.src} alt={hero.alt} fill priority quality={75} sizes="100vw" className="animate-slow-zoom object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-ink-950/40" />
        <div className="absolute inset-0 glow-warm opacity-70 mix-blend-soft-light" />
        <div className="container-x relative pb-16 md:pb-24">
          <h1 className="max-w-4xl animate-fade-up text-[2.8rem] leading-[0.98] [animation-delay:120ms] md:text-7xl lg:text-8xl">
            {t["home.hero_title"]}
          </h1>
          <p className="mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-bone-dim [animation-delay:240ms] md:text-lg">
            {t["home.hero_subtitle"]}
          </p>
          <div className="mt-9 flex animate-fade-up flex-wrap gap-3 [animation-delay:360ms]">
            <LinkButton href="/contact?type=boeken" size="lg">
              {t["home.hero_button"]}
            </LinkButton>
            <LinkButton href="/portfolio" variant="outline" size="lg">
              Bekijk portfolio
            </LinkButton>
          </div>
        </div>
        <div className="absolute right-6 bottom-8 hidden items-center gap-3 text-[10px] tracking-[0.3em] text-mist uppercase md:flex">
          <span className="h-px w-10 bg-mist/60" /> Scroll
        </div>
      </section>

      {/* Drie blokken */}
      <section className="container-x py-24 md:py-36">
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {blocks.map((b, i) => (
            <Reveal
              key={b.key}
              delay={i * 110}
              className={`relative overflow-hidden rounded-2xl border border-ink-700/70 bg-gradient-to-b ${b.tone} to-ink-900/40 p-7 md:p-9`}
            >
              <svg viewBox="0 0 24 24" className="size-7 text-ember-soft" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round" aria-hidden>
                <path d={blockIcons[b.key]} />
              </svg>
              <h2 className="mt-8 text-4xl md:text-5xl">{b.title}</h2>
              <p className="mt-4 leading-relaxed text-mist">{b.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Geselecteerd werk */}
      <section className="container-x">
        <div className="mb-8 flex items-end justify-between">
          <Reveal>
            <p className="eyebrow">Portfolio</p>
            <h2 className="mt-3 text-3xl md:text-4xl">{t["home.work_title"]}</h2>
          </Reveal>
          <Link href="/portfolio" className="hidden text-sm text-mist hover:text-bone md:block">
            Alles bekijken →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
          {selected.map((item, i) => {
            const layout = [
              "col-span-2 md:col-span-7 md:row-span-2 aspect-[4/5] md:aspect-auto",
              "md:col-span-5 aspect-[4/5] md:aspect-[5/4]",
              "md:col-span-5 aspect-[4/5] md:aspect-[5/4]",
              "md:col-span-4 aspect-[4/5]",
              "col-span-2 md:col-span-8 aspect-[16/10] md:aspect-auto",
            ][i];
            return (
              <Reveal key={item.id} delay={i * 80} className={`group relative overflow-hidden rounded-xl bg-ink-850 ${layout}`}>
                <Image
                  src={item.image_url}
                  alt={item.alt ?? item.title ?? `Portfolio ${site.name}`}
                  fill
                  sizes={i === 0 ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 42vw, 50vw"}
                  className="object-cover transition duration-[1.6s] ease-[var(--ease-film)] group-hover:scale-[1.04]"
                />
              </Reveal>
            );
          })}
        </div>
        <Link href="/portfolio" className="mt-6 inline-block text-sm text-mist hover:text-bone md:hidden">
          Alles bekijken →
        </Link>
      </section>

      {/* Afsluiter */}
      <section className="container-x mt-28 md:mt-40">
        <Reveal className="relative overflow-hidden rounded-3xl border border-ink-700/70 bg-ink-900 px-6 py-16 text-center md:px-16 md:py-24">
          <div className="absolute inset-0 glow-warm" />
          <div className="absolute inset-0 glow-cool" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-4xl leading-tight md:text-6xl">{t["home.cta_title"]}</h2>
            <LinkButton href="/contact?type=offerte" size="lg" className="mt-9">
              {t["home.cta_button"]}
            </LinkButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
