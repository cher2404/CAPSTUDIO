"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";
import type { ActionState } from "@/lib/types";
import { bool, str } from "@/lib/utils";

export async function createGallery(form: FormData) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("galleries")
    .insert({ project_id: str(form, "project_id"), title: str(form, "title") || "Je shoot", shoot_date: str(form, "shoot_date") || null })
    .select("id")
    .single();
  if (error) throw error;
  redirect(`/admin/galerijen/${data.id}`);
}

export async function updateGallery(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(form, "id");
  const { data: before } = await supabase.from("galleries").select("published").eq("id", id).single();
  const published = bool(form, "published");

  const { data: g, error } = await supabase
    .from("galleries")
    .update({
      title: str(form, "title"),
      description: str(form, "description") || null,
      shoot_date: str(form, "shoot_date") || null,
      published,
      downloads_unlocked: bool(form, "downloads_unlocked"),
    })
    .eq("id", id)
    .select("*, projects(id, payment_status, clients(email, full_name))")
    .single();
  if (error) return { error: error.message };

  if (published && !before?.published && bool(form, "notify")) {
    const client = g.projects.clients as { email: string; full_name: string | null };
    const canDownload = g.downloads_unlocked || g.projects.payment_status === "betaald";
    await sendEmail({
      to: client.email,
      template: "gallery_ready",
      vars: {
        naam: client.full_name?.split(" ")[0] ?? "",
        galerij: g.title,
        download_tekst: canDownload
          ? "Je kunt alles direct downloaden in hoge resolutie."
          : "Downloaden in hoge resolutie kan zodra de betaling binnen is.",
      },
      rawVars: { link: absoluteUrl(`/portal/galerijen/${id}`) },
    });
  }
  revalidatePath(`/admin/galerijen/${id}`);
  return { ok: true, message: published && !before?.published ? "Galerij gepubliceerd!" : "Opgeslagen." };
}

export async function registerFiles(galleryId: string, files: { original_path: string; preview_path: string | null; file_name: string; mime_type: string; width: number; height: number; size_bytes: number }[]) {
  const { supabase } = await requireAdmin();
  const { count } = await supabase.from("files").select("id", { count: "exact", head: true }).eq("gallery_id", galleryId);
  const { error } = await supabase.from("files").insert(files.map((f, i) => ({ ...f, gallery_id: galleryId, sort: (count ?? 0) + i })));
  if (error) return { error: error.message };
  revalidatePath(`/admin/galerijen/${galleryId}`);
  return { ok: true };
}

export async function deleteFile(form: FormData) {
  const { supabase } = await requireAdmin();
  const { data: f } = await supabase.from("files").delete().eq("id", str(form, "id")).select("*").single();
  if (f) {
    await Promise.all([
      supabase.storage.from("originals").remove([f.original_path]),
      f.preview_path ? supabase.storage.from("previews").remove([f.preview_path]) : null,
    ]);
    revalidatePath(`/admin/galerijen/${f.gallery_id}`);
  }
}

export async function deleteGallery(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(form, "id");
  const { data: files } = await supabase.from("files").select("original_path, preview_path").eq("gallery_id", id);
  if (files?.length) {
    await supabase.storage.from("originals").remove(files.map((f) => f.original_path));
    const previews = files.map((f) => f.preview_path).filter(Boolean) as string[];
    if (previews.length) await supabase.storage.from("previews").remove(previews);
  }
  await supabase.from("galleries").delete().eq("id", id);
  redirect("/admin/galerijen");
}
