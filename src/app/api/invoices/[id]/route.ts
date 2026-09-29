import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: invoice } = await supabase.from("invoices").select("number, file_path").eq("id", id).maybeSingle();
  if (!invoice?.file_path) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const { data } = await createAdminClient().storage.from("documents").createSignedUrl(invoice.file_path, 120, { download: `factuur-${invoice.number}.pdf` });
  if (!data) return NextResponse.json({ error: "Bestand niet beschikbaar" }, { status: 500 });
  return NextResponse.redirect(data.signedUrl, { status: 302 });
}
