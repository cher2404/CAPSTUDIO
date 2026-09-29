import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/ui/card";
import { QuoteStatusBadge } from "@/components/ui/status";
import { euro, formatDate } from "@/lib/format";
import { getMyProjects } from "@/lib/portal";
import type { Quote } from "@/lib/types";

export const metadata = { title: "Offertes" };

export default async function OffertesPage() {
  const { supabase, projects } = await getMyProjects();
  const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
  const quotes = (data ?? []) as Quote[];

  return (
    <>
      <PageHeader eyebrow="Offertes" title="Je offertes">
        Bekijk de details, accepteer direct of stel een vraag.
      </PageHeader>
      {quotes.length === 0 ? (
        <EmptyState title="Nog geen offertes">Zodra ik een offerte voor je klaarzet, krijg je een mail en verschijnt hij hier.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => (
            <li key={q.id}>
              <Link href={`/portal/offertes/${q.id}`} className="flex flex-col gap-3 rounded-2xl border border-ink-700/70 bg-ink-900/60 p-5 transition-colors hover:border-ink-600 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-bone">{q.title}</p>
                  <p className="mt-1 text-xs text-mist">
                    {q.number} · {projects.find((p) => p.id === q.project_id)?.title} · {formatDate(q.sent_at ?? q.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl text-bone">{euro(q.total)}</span>
                  <QuoteStatusBadge status={q.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
