import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { Reveal } from "@/components/site/reveal";
import { Accent } from "@/components/site/section";
import { getTexts } from "@/lib/content";
import { instagramUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start een project of vraag een vrijblijvende offerte aan bij CAP Media Studio: foto, video, websites, apps en games.",
  alternates: { canonical: "/contact" },
};

const packageToType: Record<string, string> = {
  mini: "Mini shoot",
  "halve-dag": "Halve dag",
  "foto-video": "Foto en video",
  "op-maat": "Foto of video op maat",
  website: "Website",
  app: "App of webapp",
  game: "Game of interactief",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ pakket?: string; type?: string }> }) {
  const [{ pakket, type }, t] = await Promise.all([searchParams, getTexts()]);

  return (
    <div className="container-x pt-32 md:pt-44">
      <Reveal>
        <p className="label">
          Contact
        </p>
      </Reveal>
      <Reveal className="mt-6 md:mt-8">
        <h1 className="max-w-[16ch] text-[3rem] leading-[0.92] sm:text-7xl md:text-8xl">
          <Accent text={type === "offerte" ? t["contact.title_quote"] : t["contact.title"]} />
        </h1>
      </Reveal>

      <div className="mt-14 grid gap-14 md:mt-20 md:grid-cols-12 md:gap-5">
        <Reveal className="md:col-span-4">
          <p className="max-w-sm leading-relaxed text-mist">{t["contact.intro"]}</p>
          <dl className="mt-10">
            <div className="rule-t py-5">
              <dt className="label mb-2">E-mail</dt>
              <dd>
                <a href={`mailto:${site.email}`} className="arrow-link font-display text-xl font-medium tracking-[-0.03em] text-bone hover:text-ember-soft md:text-2xl">
                  {site.email} <span className="arrow">→</span>
                </a>
              </dd>
            </div>
            <div className="rule-t py-5">
              <dt className="label mb-2">Instagram</dt>
              <dd>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="arrow-link font-display text-xl font-medium tracking-[-0.03em] text-bone hover:text-ember-soft md:text-2xl">
                  @{site.instagram} <span className="arrow">↗</span>
                </a>
              </dd>
            </div>
            <div className="rule-t rule-b py-5">
              <dt className="label mb-2">Werkgebied</dt>
              <dd className="text-bone-dim">Heel Nederland, in overleg ook daarbuiten</dd>
            </div>
          </dl>
        </Reveal>
        <Reveal delay={120} className="relative md:col-span-7 md:col-start-6">
          <ContactForm defaultType={pakket ? packageToType[pakket] : undefined} />
        </Reveal>
      </div>
    </div>
  );
}
