import { NextResponse } from "next/server";
import { renderAgreementPdf } from "@/lib/pdf";
import { createClient } from "@/lib/supabase/server";
import type { Agreement, Signature } from "@/lib/types";
import { slugify } from "@/lib/utils";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: agreement } = await supabase.from("agreements").select("*").eq("id", id).maybeSingle();
  if (!agreement) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const { data: signatures } = await supabase.from("signatures").select("*").eq("agreement_id", id).order("signed_at");
  const pdf = await renderAgreementPdf(agreement as Agreement, (signatures ?? []) as Signature[]);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${slugify((agreement as Agreement).title)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
