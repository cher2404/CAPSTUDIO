import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { Reveal } from "@/components/site/reveal";
import { LinkButton } from "@/components/ui/button";
import { getPortfolio, getSetting, toEmbedUrl } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Filmische foto's en video's van gym-, trainings- en lifestyle shoots door CAP Studio.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const [items, reel] = await Promise.all([getPortfolio(), getSetting("reel_url", "")]);
  const reelEmbed = toEmbedUrl(reel);
  const withEmbeds = items.map((i) => (i.video_url ? { ...i, video_url: toEmbedUrl(i.video_url) } : i));

  return (
    <div className="container-x pt-32 md:pt-44">
      <Reveal className="mb-12 max-w-2xl md:mb-16">
        <p className="eyebrow">Portfolio</p>
        <h1 className="mt-4 text-5xl leading-none md:text-7xl">
          Werk dat <span className="italic text-ember-soft">spreekt</span>
        </h1>
        <p className="mt-5 text-mist md:text-lg">Een selectie uit recente shoots. Klik op een beeld om het groot te bekijken.</p>
      </Reveal>

      {reelEmbed && (
        <Reveal className="mb-16 md:mb-24">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900">
            <iframe
              src={reelEmbed}
              title="Showreel CAP Studio"
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="mt-3 text-xs tracking-[0.2em] text-mist uppercase">Showreel</p>
        </Reveal>
      )}

      <PortfolioGrid items={withEmbeds} />

      <div className="mt-20 text-center">
        <p className="font-display text-3xl text-bone md:text-4xl">Zie je jezelf hier al staan?</p>
        <LinkButton href="/contact?type=boeken" size="lg" className="mt-6">
          Boek een shoot
        </LinkButton>
      </div>
    </div>
  );
}
