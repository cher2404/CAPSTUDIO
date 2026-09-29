import { NextResponse } from "next/server";
import { renderQuotePdf } from "@/lib/pdf";
import { createClient } from "@/lib/supabase/server";
import type { Client, Project, Quote, QuoteItem } from "@/lib/types";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  // RLS bepaalt of deze gebruiker de offerte mag zien.
  const { data: quote } = await supabase.from("quotes").select("*, projects(*, clients(*))").eq("id", id).maybeSingle();
  if (!quote) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const { data: items } = await supabase.from("quote_items").select("*").eq("quote_id", id).order("sort");
  const project = quote.projects as Project & { clients: Client };
  const pdf = await renderQuotePdf(quote as Quote, (items ?? []) as QuoteItem[], project, project.clients);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="offerte-${(quote as Quote).number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
