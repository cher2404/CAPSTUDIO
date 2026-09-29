import Link from "next/link";
import { PageHeader } from "@/components/ui/card";
import { QuoteStatusBadge } from "@/components/ui/status";
import { requireAdmin } from "@/lib/auth";
import { euro, formatDate, quoteStatusLabel } from "@/lib/format";
import type { Quote, QuoteStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata = { title: "Offertes" };

export default async function AdminQuotesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const { supabase } = await requireAdmin();
  let query = supabase.from("quotes").select("*, projects(title, clients(full_name, email))").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data } = await query;
  const quotes = (data ?? []) as (Quote & { projects: { title: string; clients: { full_name: string | null; email: string } } })[];

  return (
    <>
      <PageHeader eyebrow="Offertes" title="Alle offertes">
        Maak een nieuwe offerte vanuit een project. Zo is hij altijd aan de juiste klant gekoppeld.
      </PageHeader>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/offertes" className={cn("rounded-full border px-3 py-1 text-xs", !status ? "border-bone bg-bone text-ink-950" : "border-ink-600 text-mist")}>
          Alle
        </Link>
        {(Object.keys(quoteStatusLabel) as QuoteStatus[]).map((s) => (
          <Link key={s} href={`/admin/offertes?status=${s}`} className={cn("rounded-full border px-3 py-1 text-xs", status === s ? "border-bone bg-bone text-ink-950" : "border-ink-600 text-mist")}>
            {quoteStatusLabel[s]}
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-ink-700/70">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-ink-900 text-left text-[11px] tracking-wider text-mist uppercase">
            <tr>
              <th className="px-4 py-3 font-normal">Nummer</th>
              <th className="px-4 py-3 font-normal">Klant / project</th>
              <th className="px-4 py-3 font-normal">Verstuurd</th>
              <th className="px-4 py-3 text-right font-normal">Totaal</th>
              <th className="px-4 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700/60">
            {quotes.map((q) => (
              <tr key={q.id} className="hover:bg-ink-900/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/offertes/${q.id}`} className="text-bone hover:underline">
                    {q.number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-bone-dim">
                  {q.projects.clients.full_name ?? q.projects.clients.email}
                  <span className="block text-xs text-mist">{q.projects.title}</span>
                </td>
                <td className="px-4 py-3 text-mist">{q.sent_at ? formatDate(q.sent_at, { month: "short" }) : "–"}</td>
                <td className="px-4 py-3 text-right text-bone">{euro(q.total)}</td>
                <td className="px-4 py-3">
                  <QuoteStatusBadge status={q.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotes.length === 0 && <p className="p-8 text-center text-sm text-mist">Geen offertes.</p>}
      </div>
    </>
  );
}
