import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { Reveal } from "@/components/site/reveal";
import { instagramUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Boek een shoot of vraag een offerte aan bij CAP Studio. Foto en video voor sport en lifestyle.",
  alternates: { canonical: "/contact" },
};

const packageToType: Record<string, string> = {
  kennismaking: "Kennismakingsshoot",
  mini: "Mini shoot",
  "halve-dag": "Halve dag",
  "foto-video": "Foto plus video",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ pakket?: string; type?: string }> }) {
  const { pakket, type } = await searchParams;

  return (
    <div className="container-x pt-32 md:pt-44">
      <div className="grid gap-14 md:grid-cols-[1fr_1.3fr] md:gap-20">
        <Reveal>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 text-5xl leading-none md:text-7xl">
            {type === "offerte" ? "Vraag een offerte aan" : "Laten we iets moois maken"}
          </h1>
          <p className="mt-6 max-w-md text-mist md:text-lg">
            Vertel me kort wat je zoekt. Ik reageer binnen twee werkdagen met een voorstel, en je krijgt direct toegang tot je eigen
            klantportaal.
          </p>
          <dl className="mt-12 space-y-6 border-t border-ink-700/70 pt-8 text-sm">
            <div>
              <dt className="eyebrow mb-2">E-mail</dt>
              <dd>
                <a href={`mailto:${site.email}`} className="font-display text-2xl text-bone hover:text-ember-soft">
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow mb-2">Instagram</dt>
              <dd>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="font-display text-2xl text-bone hover:text-ember-soft">
                  @{site.instagram}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow mb-2">Werkgebied</dt>
              <dd className="text-bone-dim">Heel Nederland, in overleg ook daarbuiten</dd>
            </div>
          </dl>
        </Reveal>
        <Reveal delay={120} className="relative">
          <ContactForm defaultType={pakket ? packageToType[pakket] : undefined} />
        </Reveal>
      </div>
    </div>
  );
}
