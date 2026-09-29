import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Download in hoge resolutie. Alleen als de galerij is vrijgegeven of betaald. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: file } = await supabase.from("files").select("id, gallery_id, original_path, file_name").eq("id", id).maybeSingle();
  if (!file) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const { data: allowed } = await supabase.rpc("can_download_gallery", { p_gallery_id: file.gallery_id });
  if (!allowed) return NextResponse.json({ error: "Downloads zijn nog niet vrijgegeven" }, { status: 403 });

  const { data, error } = await createAdminClient().storage.from("originals").createSignedUrl(file.original_path, 300, { download: file.file_name });
  if (error || !data) return NextResponse.json({ error: "Bestand niet beschikbaar" }, { status: 500 });

  return NextResponse.redirect(data.signedUrl, { status: 302 });
}
