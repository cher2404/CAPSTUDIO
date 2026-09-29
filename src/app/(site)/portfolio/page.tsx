import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { Reveal } from "@/components/site/reveal";
import { Arrow, LinkButton } from "@/components/ui/button";
import { PageIntro, SectionHead } from "@/components/site/section";
import { getPortfolio, getSetting, getTexts, toEmbedUrl } from "@/lib/content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Filmische foto's en video's van gym-, trainings- en lifestyle shoots door CAP Media Studio.",
  alternates: { canonical: "/portfolio" },
};

export default async function PortfolioPage() {
  const [items, reel, t] = await Promise.all([getPortfolio(), getSetting("reel_url", ""), getTexts()]);
  const reelEmbed = toEmbedUrl(reel);
  const withEmbeds = items.map((i) => (i.video_url ? { ...i, video_url: toEmbedUrl(i.video_url) } : i));

  return (
    <>
      <PageIntro label="Werk" title={t["portfolio.title"]} intro={t["portfolio.intro"]} />

      {reelEmbed && (
        <section className="container-x mt-16 md:mt-24">
          <SectionHead index="01" label="Showreel" />
          <Reveal className="mt-8">
            <div className="relative aspect-video overflow-hidden bg-ink-900">
              <iframe
                src={reelEmbed}
                title="Showreel CAP Media Studio"
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Reveal>
        </section>
      )}

      <section className="container-x mt-16 md:mt-24">
        <SectionHead index={reelEmbed ? "02" : "01"} label="Selectie" />
        <div className="mt-8">
          <PortfolioGrid items={withEmbeds} />
        </div>
      </section>

      <section className="container-x mt-24 md:mt-36">
        <Reveal className="rule-t grid items-end gap-8 pt-10 md:grid-cols-12">
          <p className="font-display text-4xl leading-[0.95] font-medium tracking-[-0.04em] text-bone md:col-span-8 md:text-6xl">
            Zie je jezelf hier al <em className="text-ember-soft">staan?</em>
          </p>
          <div className="md:col-span-4 md:flex md:justify-end">
            <LinkButton href="/contact?type=boeken" size="lg" className="w-full md:w-auto">
              Boek een shoot <Arrow />
            </LinkButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
