"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { renderEmail, sendEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { textDefs } from "@/content/texts";
import type { ActionState, PortfolioCategory } from "@/lib/types";
import { bool, num, slugify, str } from "@/lib/utils";

// ---------- Tips ----------

export async function saveArticle(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(form, "id");
  const title = str(form, "title");
  if (!title) return { error: "Geef het artikel een titel." };
  const published = bool(form, "published");
  const row = {
    title,
    slug: slugify(str(form, "slug") || title),
    excerpt: str(form, "excerpt") || null,
    body: str(form, "body"),
    cover_url: str(form, "cover_url") || null,
    published,
    sort: Math.round(num(form, "sort", 0)),
  };
  const { data, error } = id
    ? await supabase.from("articles").update(row).eq("id", id).select("id, published_at").single()
    : await supabase.from("articles").insert(row).select("id, published_at").single();
  if (error) return { error: error.code === "23505" ? "Deze slug bestaat al." : error.message };
  if (published && !data.published_at) await supabase.from("articles").update({ published_at: new Date().toISOString() }).eq("id", data.id);
  revalidatePath("/admin/tips");
  revalidatePath("/portal/tips", "layout");
  if (!id) redirect(`/admin/tips/${data.id}`);
  return { ok: true, message: "Opgeslagen." };
}

export async function deleteArticle(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("articles").delete().eq("id", str(form, "id"));
  redirect("/admin/tips");
}

// ---------- Portfolio ----------

function refreshPublic() {
  revalidatePath("/", "layout");
}

export async function addPortfolioItems(items: { image_url: string; storage_path: string; width: number; height: number; category: PortfolioCategory; alt: string }[]) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("portfolio_items").insert(items.map((i, n) => ({ ...i, sort: n })));
  if (error) return { error: error.message };
  revalidatePath("/admin/portfolio");
  refreshPublic();
  return { ok: true };
}

export async function updatePortfolioItem(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("portfolio_items")
    .update({
      title: str(form, "title") || null,
      alt: str(form, "alt") || null,
      category: str(form, "category"),
      video_url: str(form, "video_url") || null,
      ...(form.has("description") ? { description: str(form, "description") || null } : {}),
      ...(form.has("link_url") ? { link_url: /^https?:\/\//i.test(str(form, "link_url")) ? str(form, "link_url") : null } : {}),
      featured: bool(form, "featured"),
      published: bool(form, "published"),
      sort: Math.round(num(form, "sort", 0)),
    })
    .eq("id", str(form, "id"));
  revalidatePath("/admin/portfolio");
  refreshPublic();
}

export async function deletePortfolioItem(form: FormData) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("portfolio_items").delete().eq("id", str(form, "id")).select("storage_path").single();
  if (data?.storage_path) await supabase.storage.from("portfolio").remove([data.storage_path]);
  revalidatePath("/admin/portfolio");
  refreshPublic();
}

// ---------- Pakketten ----------

/** Pakketprijzen worden excl. btw opgeslagen; invoeren mag incl. of excl. Leeg = prijs na overleg. */
function packagePrice(raw: string, mode: string, vatRate: number) {
  if (!raw) return null;
  // "1.250,50" (NL) en "1250.50" allebei goed lezen
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const value = Number(normalized.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(value)) return null;
  const excl = mode === "incl" ? value / (1 + vatRate / 100) : value;
  return Math.round(excl * 10000) / 10000;
}

export async function savePackage(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(form, "id");
  const name = str(form, "name");
  const row = {
    name,
    slug: slugify(str(form, "slug") || name),
    tagline: str(form, "tagline") || null,
    price: packagePrice(str(form, "price"), str(form, "price_mode"), num(form, "vat_rate", 21)),
    price_label: str(form, "price_label") || "vanaf",
    duration: str(form, "duration") || null,
    features: str(form, "features").split("\n").map((l) => l.trim()).filter(Boolean),
    category: ["beeld", "digitaal", "games"].includes(str(form, "category")) ? str(form, "category") : "beeld",
    highlighted: bool(form, "highlighted"),
    active: bool(form, "active"),
    sort: Math.round(num(form, "sort", 0)),
  };
  if (id) await supabase.from("packages").update(row).eq("id", id);
  else await supabase.from("packages").insert(row);
  revalidatePath("/admin/pakketten");
  refreshPublic();
}

export async function deletePackage(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("packages").delete().eq("id", str(form, "id"));
  revalidatePath("/admin/pakketten");
  refreshPublic();
}

// ---------- E-mailsjablonen ----------

export async function saveEmailTemplate(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const key = str(form, "key");
  const { error } = await supabase.from("email_templates").update({ subject: str(form, "subject"), body: str(form, "body") }).eq("key", key);
  if (error) return { error: error.message };
  revalidatePath(`/admin/emails/${key}`);
  return { ok: true, message: "Sjabloon opgeslagen." };
}

export async function previewEmail(subject: string, body: string, variables: string[]) {
  await requireAdmin();
  const vars = Object.fromEntries(variables.map((v) => [v, v.includes("link") ? undefined : `[${v}]`]));
  const raw = Object.fromEntries(variables.filter((v) => v.includes("link")).map((v) => [v, "https://capmediastudio.nl"]));
  return renderEmail({ subject, body }, vars, raw);
}

export async function sendTestEmail(form: FormData) {
  const { profile } = await requireAdmin();
  const key = str(form, "key");
  const { data } = await createAdminClient().from("email_templates").select("variables").eq("key", key).single();
  const variables = (data?.variables ?? []) as string[];
  await sendEmail({
    to: profile!.email,
    template: key,
    vars: Object.fromEntries(variables.filter((v) => !v.includes("link")).map((v) => [v, `[${v}]`])),
    rawVars: Object.fromEntries(variables.filter((v) => v.includes("link")).map((v) => [v, "https://capmediastudio.nl"])),
  });
  redirect(`/admin/emails/${key}?test=1`);
}

// ---------- Instellingen ----------

export async function saveSettings(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const now = new Date().toISOString();
  const rows: { key: string; value: unknown; updated_at: string }[] = ["reel_url", "hero_image", "about_image"]
    .filter((key) => form.has(key))
    .map((key) => ({ key, value: str(form, key), updated_at: now }));
  if (form.has("vat_rate")) rows.push({ key: "vat_rate", value: Math.max(0, num(form, "vat_rate", 21)), updated_at: now });
  if (form.has("price_display")) rows.push({ key: "price_display", value: str(form, "price_display") === "excl" ? "excl" : "incl", updated_at: now });
  const { error } = await supabase.from("settings").upsert(rows);
  if (error) return { error: error.message };
  refreshPublic();
  return { ok: true, message: "Instellingen opgeslagen." };
}

// ---------- Websiteteksten ----------

export async function saveTexts(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const upserts: { key: string; value: string; updated_at: string }[] = [];
  const resets: string[] = [];
  for (const [key, def] of Object.entries(textDefs)) {
    if (!form.has(key)) continue;
    const value = String(form.get(key) ?? "").replace(/\r\n/g, "\n").trim();
    if (value === def.default.trim()) resets.push(key);
    else upserts.push({ key, value, updated_at: new Date().toISOString() });
  }
  if (upserts.length) {
    const { error } = await supabase.from("site_texts").upsert(upserts);
    if (error) return { error: error.message };
  }
  if (resets.length) await supabase.from("site_texts").delete().in("key", resets);
  refreshPublic();
  return { ok: true, message: "Teksten opgeslagen. De website is bijgewerkt." };
}

/**
 * AVG: verwijdert account, klantgegevens, projecten, berichten en foto's.
 * Let op: facturen moet je 7 jaar bewaren. Bewaar ze in je boekhouding (bijv. Moneybird); de kopie in het portaal wordt mee verwijderd.
 */
export async function processDeletion(form: FormData) {
  await requireAdmin();
  const db = createAdminClient();
  const id = str(form, "id");
  const decision = str(form, "decision");
  const { data: req } = await db.from("deletion_requests").select("*").eq("id", id).single();
  if (!req) return;

  if (decision === "afgewezen") {
    await db.from("deletion_requests").update({ status: "afgewezen", processed_at: new Date().toISOString() }).eq("id", id);
    revalidatePath("/admin/instellingen");
    return;
  }

  const { data: client } = await db.from("clients").select("id").eq("email", req.email.toLowerCase()).maybeSingle();
  if (client) {
    const { data: projects } = await db.from("projects").select("id").eq("client_id", client.id);
    const projectIds = (projects ?? []).map((p) => p.id);
    if (projectIds.length) {
      const { data: galleries } = await db.from("galleries").select("id").in("project_id", projectIds);
      const galleryIds = (galleries ?? []).map((g) => g.id);
      if (galleryIds.length) {
        const { data: files } = await db.from("files").select("original_path, preview_path").in("gallery_id", galleryIds);
        if (files?.length) {
          await db.storage.from("originals").remove(files.map((f) => f.original_path));
          const previews = files.map((f) => f.preview_path).filter(Boolean) as string[];
          if (previews.length) await db.storage.from("previews").remove(previews);
        }
      }
    }
    await db.from("clients").delete().eq("id", client.id); // cascade: projecten, offertes, berichten, galerijen, ...
  }
  if (req.user_id) await db.auth.admin.deleteUser(req.user_id);
  await db.from("email_log").delete().eq("recipient", req.email.toLowerCase());
  await db
    .from("deletion_requests")
    .update({ status: "afgerond", processed_at: new Date().toISOString(), email: "verwijderd", reason: null, user_id: null })
    .eq("id", id);
  revalidatePath("/admin", "layout");
}
