import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { getHero, getPackages, getPortfolio } from "@/lib/content";
import { euro } from "@/lib/format";
import { site } from "@/lib/site";

export const revalidate = 300;

export default async function HomePage() {
  const [hero, portfolio, packages] = await Promise.all([getHero(), getPortfolio(), getPackages()]);
  const selected = portfolio.filter((p) => p.category !== "video").slice(0, 5);

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
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          quality={75}
          sizes="100vw"
          className="animate-slow-zoom object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-ink-950/40" />
        <div className="absolute inset-0 glow-warm opacity-70 mix-blend-soft-light" />
        <div className="container-x relative pb-16 md:pb-24">
          <p className="eyebrow animate-fade-up text-bone-dim">{site.tagline}</p>
          <h1 className="mt-5 max-w-4xl animate-fade-up text-[2.9rem] leading-[0.98] [animation-delay:120ms] md:text-7xl lg:text-8xl">
            Kracht, zweet en licht.
            <span className="block italic text-ember-soft">Filmisch vastgelegd.</span>
          </h1>
          <p className="mt-6 max-w-lg animate-fade-up text-base leading-relaxed text-bone-dim [animation-delay:240ms] md:text-lg">
            Ik maak foto&apos;s en video&apos;s van sporters, coaches en merken. Echt, rauw en met gevoel voor sfeer, zodat je beelden
            opvallen tussen alle gewone content.
          </p>
          <div className="mt-9 flex animate-fade-up flex-wrap gap-3 [animation-delay:360ms]">
            <LinkButton href="/contact?type=boeken" size="lg">
              Boek een shoot
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

      {/* Intro */}
      <section className="container-x grid gap-10 py-24 md:grid-cols-[1fr_1.2fr] md:gap-20 md:py-36">
        <Reveal>
          <p className="eyebrow">CAP Studio</p>
          <h2 className="mt-4 text-4xl leading-tight md:text-5xl">
            Geen stockfoto&apos;s.
            <br />
            <span className="italic text-mist">Jouw verhaal.</span>
          </h2>
        </Reveal>
        <Reveal delay={120} className="space-y-5 text-base leading-relaxed text-mist md:text-lg">
          <p>
            Of je nu personal trainer bent, een sportmerk runt of gewoon trots bent op waar je staat: je verdient beelden die voelen
            zoals jij traint. Donker, contrastrijk en met aandacht voor elk detail.
          </p>
          <p>
            Van een snelle mini shoot in de gym tot een hele dag foto en video voor je nieuwe campagne. Alles regel je makkelijk in je
            eigen klantportaal: offerte, planning, overeenkomst en je galerij.
          </p>
          <Link href="/over-mij" className="inline-flex items-center gap-2 text-sm text-bone underline-offset-4 hover:underline">
            Meer over mij <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </section>

      {/* Geselecteerd werk */}
      <section className="container-x">
        <div className="mb-8 flex items-end justify-between">
          <Reveal>
            <p className="eyebrow">Geselecteerd werk</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Uit het portfolio</h2>
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
                  alt={item.alt ?? item.title ?? "Portfolio CAP Studio"}
                  fill
                  sizes={i === 0 ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 42vw, 50vw"}
                  className="object-cover transition duration-[1.6s] ease-[var(--ease-film)] group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Diensten */}
      <section className="relative mt-28 overflow-hidden md:mt-40">
        <div className="absolute inset-0 glow-cool" />
        <div className="container-x relative">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Diensten</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Kies wat bij je past</h2>
            <p className="mt-4 text-mist">Van een eerste kennismaking tot een complete dag foto en video. Altijd met een heldere offerte vooraf.</p>
          </Reveal>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-700/70 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((p, i) => (
              <Reveal key={p.id} delay={i * 80} className="flex flex-col bg-ink-950 p-6 md:p-8">
                <p className="text-xs tracking-wide text-mist">{p.duration}</p>
                <h3 className="mt-3 text-2xl">{p.name}</h3>
                <p className="mt-2 text-sm text-mist">{p.tagline}</p>
                <p className="mt-6 text-sm text-mist">
                  {p.price_label} <span className="font-display text-3xl text-bone">{euro(p.price_from).replace(",00", "")}</span>
                </p>
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <LinkButton href="/diensten" variant="outline">
              Bekijk alle diensten en tarieven
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Werkwijze */}
      <section className="container-x mt-28 md:mt-40">
        <Reveal>
          <p className="eyebrow">Zo werkt het</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Van idee tot galerij</h2>
        </Reveal>
        <ol className="mt-12 grid gap-10 md:grid-cols-4 md:gap-8">
          {[
            ["01", "Aanvraag", "Vertel me wat je zoekt. Je krijgt direct toegang tot je eigen portaal."],
            ["02", "Offerte en akkoord", "Je ontvangt een heldere offerte. Accepteren en ondertekenen doe je online."],
            ["03", "De shoot", "Kies zelf een moment uit mijn agenda. Een dag vooraf krijg je een herinnering."],
            ["04", "Je galerij", "Kies je favorieten in je privé galerij en download alles in hoge resolutie."],
          ].map(([n, t, d], i) => (
            <Reveal as="li" key={n} delay={i * 100} className="border-t border-ink-700 pt-6">
              <span className="font-display text-lg text-ember-soft italic">{n}</span>
              <h3 className="mt-3 text-2xl">{t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{d}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="container-x mt-28 md:mt-40">
        <Reveal className="relative overflow-hidden rounded-3xl border border-ink-700/70 bg-ink-900 px-6 py-16 text-center md:px-16 md:py-24">
          <div className="absolute inset-0 glow-warm" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-4xl leading-tight md:text-6xl">
              Klaar om te laten zien <span className="italic text-ember-soft">waar je voor traint?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-mist">Vertel me je idee. Ik reageer binnen twee werkdagen.</p>
            <LinkButton href="/contact?type=boeken" size="lg" className="mt-9">
              Boek een shoot
            </LinkButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
