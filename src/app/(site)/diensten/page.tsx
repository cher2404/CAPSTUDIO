import type { Metadata } from "next";
import { Reveal } from "@/components/site/reveal";
import { LinkButton } from "@/components/ui/button";
import { getPackages } from "@/lib/content";
import { euro } from "@/lib/format";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Diensten en tarieven",
  description: "Kennismakingsshoot, mini shoot, halve dag of foto plus video. Bekijk de pakketten en tarieven van CAP Studio.",
  alternates: { canonical: "/diensten" },
};

const faq = [
  ["Waar vindt de shoot plaats?", "In jouw gym, op een buitenlocatie of in een studio. Ik denk graag mee over een plek die past bij je verhaal. Reiskosten binnen 30 km zijn inbegrepen."],
  ["Hoe snel krijg ik mijn foto's?", "Meestal binnen 7 tot 10 werkdagen. Je krijgt een mail zodra je galerij online staat."],
  ["Mag ik de foto's overal gebruiken?", "Dat hangt af van je pakket. Persoonlijk gebruik en je eigen social media zitten er altijd in. Voor advertenties of merkgebruik spreken we de gebruiksrechten af in de overeenkomst."],
  ["Kan ik verzetten?", "Ja, tot 24 uur van tevoren doe je dat zelf in je klantportaal."],
  ["Prijzen incl. of excl. btw?", "Alle genoemde tarieven zijn vanafprijzen inclusief 21% btw. Je krijgt altijd eerst een offerte op maat."],
];

export default async function DienstenPage() {
  const packages = await getPackages();

  return (
    <div className="container-x pt-32 md:pt-44">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">Diensten en tarieven</p>
        <h1 className="mt-4 text-5xl leading-none md:text-7xl">
          Helder geprijsd, <span className="italic text-ember-soft">zonder verrassingen</span>
        </h1>
        <p className="mt-5 text-mist md:text-lg">
          Elk pakket is een startpunt. Na een korte kennismaking krijg je een offerte die precies past bij wat je nodig hebt.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-2 xl:grid-cols-4">
        {packages.map((p, i) => (
          <Reveal
            key={p.id}
            delay={i * 90}
            className={cn(
              "relative flex flex-col rounded-2xl border p-7 transition-colors duration-500",
              p.highlighted ? "border-ember/50 bg-gradient-to-b from-ember/10 to-ink-900" : "border-ink-700/70 bg-ink-900/60 hover:border-ink-600",
            )}
          >
            {p.highlighted && (
              <span className="absolute -top-3 left-7 rounded-full bg-ember px-3 py-1 text-[10px] font-semibold tracking-[0.15em] text-ink-950 uppercase">
                Meest gekozen
              </span>
            )}
            <p className="text-xs tracking-wide text-mist">{p.duration}</p>
            <h2 className="mt-3 text-3xl">{p.name}</h2>
            <p className="mt-2 text-sm text-mist">{p.tagline}</p>
            <p className="mt-6 text-sm text-mist">
              {p.price_label} <span className="font-display text-4xl text-bone">{euro(p.price_from).replace(",00", "")}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 border-t border-ink-700/70 pt-6 text-sm text-bone-dim">
              {p.features.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-2 h-px w-3 shrink-0 bg-ember" />
                  {f}
                </li>
              ))}
            </ul>
            <LinkButton
              href={`/contact?type=offerte&pakket=${encodeURIComponent(p.slug)}`}
              variant={p.highlighted ? "primary" : "outline"}
              className="mt-8 w-full"
            >
              Vraag offerte aan
            </LinkButton>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-xs text-mist-dim">Alle prijzen zijn vanafprijzen incl. 21% btw. Maatwerk voor merken en teams op aanvraag.</p>

      <section className="mt-28 grid gap-10 md:mt-36 md:grid-cols-[1fr_1.6fr] md:gap-20">
        <Reveal>
          <p className="eyebrow">Veelgestelde vragen</p>
          <h2 className="mt-3 text-4xl">Goed om te weten</h2>
        </Reveal>
        <div className="divide-y divide-ink-700/70 border-y border-ink-700/70">
          {faq.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-bone">
                <span className="font-display text-xl md:text-2xl">{q}</span>
                <span className="text-xl text-mist transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
