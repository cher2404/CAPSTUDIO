"use client";

import { useState } from "react";
import { euro } from "@/lib/format";

export type EditableItem = { description: string; quantity: number; unit_price: number };

/** Regels bewerken; geeft ze door als JSON in een hidden input "items". */
export function ItemsEditor({ initial, vatRate, onVatChange }: { initial: EditableItem[]; vatRate?: number; onVatChange?: boolean }) {
  const [items, setItems] = useState<EditableItem[]>(initial.length ? initial : [{ description: "", quantity: 1, unit_price: 0 }]);
  const [vat, setVat] = useState(vatRate ?? 21);
  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0);
  const vatAmount = Math.round(subtotal * vat) / 100;

  const update = (i: number, patch: Partial<EditableItem>) => setItems((prev) => prev.map((it, n) => (n === i ? { ...it, ...patch } : it)));

  return (
    <div className="space-y-3">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <div className="hidden grid-cols-[1fr_70px_110px_90px_28px] gap-2 text-[11px] tracking-wider text-mist uppercase md:grid">
        <span>Omschrijving</span>
        <span>Aantal</span>
        <span>Prijs excl. btw</span>
        <span className="text-right">Totaal</span>
        <span />
      </div>
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-[1fr_70px] gap-2 rounded-xl bg-ink-850 p-2 md:grid-cols-[1fr_70px_110px_90px_28px] md:bg-transparent md:p-0">
          <input className="field col-span-2 py-2 md:col-span-1" value={it.description} placeholder="Omschrijving" onChange={(e) => update(i, { description: e.target.value })} />
          <input className="field py-2" inputMode="decimal" value={it.quantity} onChange={(e) => update(i, { quantity: Number(e.target.value.replace(",", ".")) || 0 })} />
          <input className="field py-2" inputMode="decimal" value={it.unit_price} onChange={(e) => update(i, { unit_price: Number(e.target.value.replace(",", ".")) || 0 })} />
          <span className="self-center text-right text-sm text-bone">{euro((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))}</span>
          <button type="button" onClick={() => setItems((p) => p.filter((_, n) => n !== i))} className="self-center text-mist hover:text-rose" aria-label="Regel verwijderen">
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setItems((p) => [...p, { description: "", quantity: 1, unit_price: 0 }])} className="text-sm text-ember-soft">
        + Regel toevoegen
      </button>
      {onVatChange && (
        <div className="ml-auto max-w-xs space-y-1 border-t border-ink-700 pt-3 text-sm">
          <div className="flex justify-between text-mist">
            <span>Subtotaal (excl. btw)</span>
            <span>{euro(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-mist">
            <span className="flex items-center gap-2">
              Btw
              <input name="vat_rate" className="field w-16 px-2 py-1 text-xs" value={vat} inputMode="decimal" onChange={(e) => setVat(Number(e.target.value.replace(",", ".")) || 0)} />%
            </span>
            <span>{euro(vatAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-ink-700 pt-2 text-bone">
            <span>Totaal</span>
            <span className="font-display text-2xl">{euro(subtotal + vatAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
