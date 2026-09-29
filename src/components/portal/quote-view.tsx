import { euro, formatDate } from "@/lib/format";
import { md } from "@/lib/markdown";
import type { Quote, QuoteItem } from "@/lib/types";

export function QuoteView({ quote, items }: { quote: Quote; items: QuoteItem[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900/60">
      <div className="flex flex-col gap-2 border-b border-ink-700/70 p-5 md:flex-row md:items-end md:justify-between md:p-7">
        <div>
          <p className="eyebrow">Offerte {quote.number}</p>
          <h2 className="mt-2 text-3xl">{quote.title}</h2>
        </div>
        <div className="text-sm text-mist md:text-right">
          <p>Datum: {formatDate(quote.sent_at ?? quote.created_at)}</p>
          {quote.valid_until && <p>Geldig tot: {formatDate(quote.valid_until)}</p>}
        </div>
      </div>
      {quote.intro && <div className="prose-cap border-b border-ink-700/70 p-5 text-sm md:p-7" dangerouslySetInnerHTML={{ __html: md(quote.intro) }} />}
      <div className="p-5 md:p-7">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-left text-[11px] tracking-wider text-mist uppercase">
              <th className="pb-3 font-normal">Omschrijving</th>
              <th className="hidden pb-3 text-right font-normal sm:table-cell">Aantal</th>
              <th className="hidden pb-3 text-right font-normal sm:table-cell">Prijs</th>
              <th className="pb-3 text-right font-normal">Totaal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-ink-700/60">
                <td className="py-3 pr-3 text-bone-dim">
                  {it.description}
                  <span className="block text-xs text-mist sm:hidden">
                    {Number(it.quantity)} × {euro(it.unit_price)}
                  </span>
                </td>
                <td className="hidden py-3 text-right text-mist sm:table-cell">{Number(it.quantity).toLocaleString("nl-NL")}</td>
                <td className="hidden py-3 text-right text-mist sm:table-cell">{euro(it.unit_price)}</td>
                <td className="py-3 text-right text-bone">{euro(Number(it.quantity) * Number(it.unit_price))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="mt-5 ml-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-mist">
            <dt>Subtotaal</dt>
            <dd>{euro(quote.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-mist">
            <dt>Btw {Number(quote.vat_rate)}%</dt>
            <dd>{euro(quote.vat_amount)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-ink-700 pt-3">
            <dt className="text-bone">Totaal</dt>
            <dd className="font-display text-3xl text-bone">{euro(quote.total)}</dd>
          </div>
        </dl>
      </div>
      <div className="grid gap-4 border-t border-ink-700/70 bg-ink-850/60 p-5 text-sm md:grid-cols-2 md:p-7">
        <div>
          <p className="eyebrow mb-2">Gebruiksrechten</p>
          <p className="text-bone-dim">{quote.usage_rights || "Persoonlijk gebruik en eigen social media."}</p>
        </div>
        <div>
          <p className="eyebrow mb-2">Bewerkingsrondes</p>
          <p className="text-bone-dim">{quote.revision_rounds}</p>
        </div>
      </div>
    </div>
  );
}
