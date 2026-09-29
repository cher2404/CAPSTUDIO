import Link from "next/link";
import { notFound } from "next/navigation";
import { QuoteActions } from "@/components/portal/quote-actions";
import { QuoteView } from "@/components/portal/quote-view";
import { buttonClass } from "@/components/ui/button";
import { QuoteStatusBadge } from "@/components/ui/status";
import { requireClient } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Agreement, Quote, QuoteItem } from "@/lib/types";

export const metadata = { title: "Offerte" };

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireClient();
  const { data } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const quote = data as Quote;

  const [{ data: items }, { data: agreement }] = await Promise.all([
    supabase.from("quote_items").select("*").eq("quote_id", id).order("sort"),
    supabase.from("agreements").select("id, status").eq("quote_id", id).maybeSingle(),
  ]);

  const expired = quote.valid_until && new Date(quote.valid_until + "T23:59:59") < new Date();
  const open = ["verstuurd", "vraag"].includes(quote.status) && !expired;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/portal/offertes" className="text-sm text-mist hover:text-bone">
          ← Alle offertes
        </Link>
        <div className="flex items-center gap-3">
          <QuoteStatusBadge status={expired && open ? "verlopen" : quote.status} />
          <a href={`/api/pdf/quote/${quote.id}`} target="_blank" className={buttonClass("outline", "sm")}>
            Download pdf
          </a>
        </div>
      </div>

      <QuoteView quote={quote} items={(items ?? []) as QuoteItem[]} />

      {open && <QuoteActions quoteId={quote.id} />}
      {quote.status === "geaccepteerd" && (
        <div className="flex flex-col gap-3 rounded-2xl border border-moss/30 bg-moss/5 p-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-bone-dim">Geaccepteerd op {formatDate(quote.accepted_at)}. Thanks!</p>
          {agreement && (
            <Link href={`/portal/overeenkomsten/${(agreement as Pick<Agreement, "id">).id}`} className={buttonClass("primary", "sm")}>
              {(agreement as Pick<Agreement, "status">).status === "ondertekend" ? "Bekijk overeenkomst" : "Onderteken overeenkomst"}
            </Link>
          )}
        </div>
      )}
      {expired && open && (
        <p className="rounded-2xl border border-rose/30 bg-rose/5 p-5 text-sm text-bone-dim">
          Deze offerte is verlopen. Stuur me een bericht, dan maak ik graag een nieuwe.
        </p>
      )}
    </div>
  );
}
