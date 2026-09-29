import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** AVG: download van alle eigen gegevens. Alles loopt via RLS, dus alleen eigen data. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const tables = ["profiles", "clients", "projects", "quotes", "quote_items", "agreements", "signatures", "appointments", "messages", "galleries", "files", "invoices", "deletion_requests"];
  const result: Record<string, unknown> = { exported_at: new Date().toISOString() };
  for (const t of tables) {
    const { data } = await supabase.from(t).select("*");
    result[t] = data ?? [];
  }

  return new NextResponse(JSON.stringify(result, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="cap-studio-gegevens-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
