import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/ui/card";
import { AgreementStatusBadge, PaymentStatusBadge, QuoteStatusBadge } from "@/components/ui/status";
import { euro, formatDate } from "@/lib/format";
import { getMyProjects } from "@/lib/portal";
import type { Agreement, Invoice, Quote } from "@/lib/types";

export const metadata = { title: "Documenten" };

type Row = { key: string; kind: string; title: string; sub: string; date: string; badge: React.ReactNode; view?: string; pdf?: string };

export default async function DocumentenPage() {
  const { supabase, projects } = await getMyProjects();
  const [{ data: q }, { data: a }, { data: i }] = await Promise.all([
    supabase.from("quotes").select("*"),
    supabase.from("agreements").select("*"),
    supabase.from("invoices").select("*"),
  ]);
  const project = (id: string) => projects.find((p) => p.id === id)?.title ?? "";

  const rows: Row[] = [
    ...((q ?? []) as Quote[]).map((x) => ({
      key: x.id, kind: "Offerte", title: `${x.number} · ${x.title}`, sub: `${project(x.project_id)} · ${euro(x.total)}`,
      date: x.sent_at ?? x.created_at, badge: <QuoteStatusBadge status={x.status} />, view: `/portal/offertes/${x.id}`, pdf: `/api/pdf/quote/${x.id}`,
    })),
    ...((a ?? []) as Agreement[]).map((x) => ({
      key: x.id, kind: "Overeenkomst", title: x.title, sub: project(x.project_id),
      date: x.signed_at ?? x.created_at, badge: <AgreementStatusBadge status={x.status} />, view: `/portal/overeenkomsten/${x.id}`, pdf: `/api/pdf/agreement/${x.id}`,
    })),
    ...((i ?? []) as Invoice[]).map((x) => ({
      key: x.id, kind: "Factuur", title: `Factuur ${x.number}`, sub: `${project(x.project_id)}${x.amount ? ` · ${euro(x.amount)}` : ""}${x.due_date ? ` · vervalt ${formatDate(x.due_date)}` : ""}`,
      date: x.created_at, badge: <PaymentStatusBadge status={x.payment_status} />, pdf: x.file_path ? `/api/invoices/${x.id}` : undefined,
    })),
  ].sort((x, y) => y.date.localeCompare(x.date));

  return (
    <>
      <PageHeader eyebrow="Documenten" title="Alles op één plek">
        Je offertes, overeenkomsten en facturen. Alles is te downloaden als pdf.
      </PageHeader>
      {rows.length === 0 ? (
        <EmptyState title="Nog geen documenten" />
      ) : (
        <ul className="divide-y divide-ink-700/70 overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900/60">
          {rows.map((r) => (
            <li key={r.key} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:px-6">
              <span className="w-28 shrink-0 text-[11px] tracking-[0.18em] text-mist uppercase">{r.kind}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-bone">{r.title}</p>
                <p className="truncate text-xs text-mist">
                  {r.sub} · {formatDate(r.date)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {r.badge}
                {r.view && (
                  <Link href={r.view} className="text-xs text-bone-dim hover:text-bone">
                    Bekijken
                  </Link>
                )}
                {r.pdf && (
                  <a href={r.pdf} target="_blank" className="text-xs text-ember-soft hover:text-bone">
                    Pdf ↓
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
