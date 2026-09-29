"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { euro, formatDate } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import type { ActionState, QuoteTemplate } from "@/lib/types";
import { num, str } from "@/lib/utils";

type ItemInput = { description: string; quantity: number; unit_price: number };

function parseItems(form: FormData): ItemInput[] {
  try {
    const items = JSON.parse(str(form, "items") || "[]") as ItemInput[];
    return items
      .filter((i) => i.description?.trim())
      .map((i) => ({ description: i.description.trim(), quantity: Number(i.quantity) || 0, unit_price: Number(i.unit_price) || 0 }));
  } catch {
    return [];
  }
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const DEFAULT_INTRO =
  "Leuk dat je met CAP Media Studio aan de slag wilt! Hieronder vind je de offerte op basis van ons gesprek. Vragen? Stel ze gerust via de knop onderaan.";

/** Nieuwe offerte: leeg, vanuit een sjabloon, of direct vanuit een pakket van de tarievenpagina ("pkg:<id>"). */
export async function createQuote(form: FormData) {
  const { supabase } = await requireAdmin();
  const projectId = str(form, "project_id");
  const source = str(form, "template_id");

  const [{ data: vat }, { data: agreementTpl }] = await Promise.all([
    supabase.from("settings").select("value").eq("key", "vat_rate").maybeSingle(),
    supabase.from("agreement_templates").select("default_usage_rights, default_revision_rounds").eq("is_default", true).maybeSingle(),
  ]);
  const vatRate = vat?.value != null ? Number(vat.value) : 21;

  let base = {
    title: "Offerte",
    intro: DEFAULT_INTRO as string | null,
    validityDays: 14,
    usage: (agreementTpl?.default_usage_rights as string | null) ?? null,
    rounds: (agreementTpl?.default_revision_rounds as number | null) ?? 1,
    items: [] as ItemInput[],
  };

  if (source.startsWith("pkg:")) {
    const { data: pkg } = await supabase.from("packages").select("*").eq("id", source.slice(4)).single();
    if (pkg) {
      base = {
        ...base,
        title: pkg.name,
        items: [
          {
            description: pkg.features?.length ? `${pkg.name}: ${pkg.features.join(", ")}` : pkg.name,
            quantity: 1,
            unit_price: pkg.price != null ? Math.round(Number(pkg.price) * 100) / 100 : 0,
          },
        ],
      };
    }
  } else if (source) {
    const { data } = await supabase.from("quote_templates").select("*").eq("id", source).single();
    const tpl = data as QuoteTemplate | null;
    if (tpl) {
      base = {
        title: tpl.title,
        intro: tpl.intro,
        validityDays: tpl.validity_days,
        usage: tpl.usage_rights ?? base.usage,
        rounds: tpl.revision_rounds,
        items: tpl.items ?? [],
      };
    }
  }

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      project_id: projectId,
      title: base.title,
      intro: base.intro,
      vat_rate: vatRate,
      valid_until: addDays(base.validityDays),
      usage_rights: base.usage,
      revision_rounds: base.rounds,
    })
    .select("id")
    .single();
  if (error) throw error;

  if (base.items.length) {
    await supabase.from("quote_items").insert(base.items.map((it, i) => ({ ...it, quote_id: quote.id, sort: i })));
  }
  redirect(`/admin/offertes/${quote.id}`);
}

export async function saveQuote(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(form, "id");
  const { data: current } = await supabase.from("quotes").select("status").eq("id", id).single();
  if (current && ["geaccepteerd"].includes(current.status)) return { error: "Een geaccepteerde offerte kun je niet meer wijzigen." };

  const { error } = await supabase
    .from("quotes")
    .update({
      title: str(form, "title"),
      intro: str(form, "intro") || null,
      valid_until: str(form, "valid_until") || null,
      vat_rate: num(form, "vat_rate", 21),
      usage_rights: str(form, "usage_rights") || null,
      revision_rounds: Math.max(0, Math.round(num(form, "revision_rounds", 1))),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  const items = parseItems(form);
  await supabase.from("quote_items").delete().eq("quote_id", id);
  if (items.length) await supabase.from("quote_items").insert(items.map((it, i) => ({ ...it, quote_id: id, sort: i })));

  revalidatePath(`/admin/offertes/${id}`);
  return { ok: true, message: "Offerte opgeslagen." };
}

export async function sendQuote(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(form, "id");
  const { data: q } = await supabase.from("quotes").select("*, projects(title, clients(email, full_name))").eq("id", id).single();
  if (!q) return;

  await supabase.from("quotes").update({ status: "verstuurd", sent_at: new Date().toISOString() }).eq("id", id);
  const client = q.projects.clients as { email: string; full_name: string | null };
  await sendEmail({
    to: client.email,
    template: "quote_sent",
    vars: {
      naam: client.full_name?.split(" ")[0] ?? "",
      project: q.projects.title,
      nummer: q.number,
      totaal: euro(q.total).replace("€", "").trim(),
      geldig_tot: q.valid_until ? formatDate(q.valid_until) : "",
    },
    rawVars: { link: absoluteUrl(`/portal/offertes/${id}`) },
  });
  revalidatePath("/admin", "layout");
}

export async function setQuoteStatus(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("quotes").update({ status: str(form, "status") }).eq("id", str(form, "id"));
  revalidatePath("/admin", "layout");
}

export async function deleteQuote(form: FormData) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("quotes").delete().eq("id", str(form, "id")).in("status", ["concept", "afgewezen", "verlopen"]).select("project_id").maybeSingle();
  redirect(data ? `/admin/projecten/${data.project_id}` : "/admin/offertes");
}

export async function duplicateQuote(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(form, "id");
  const { data: q } = await supabase.from("quotes").select("*").eq("id", id).single();
  const { data: items } = await supabase.from("quote_items").select("description, quantity, unit_price, sort").eq("quote_id", id);
  const { data: copy } = await supabase
    .from("quotes")
    .insert({
      project_id: q.project_id,
      title: q.title,
      intro: q.intro,
      vat_rate: q.vat_rate,
      valid_until: addDays(14),
      usage_rights: q.usage_rights,
      revision_rounds: q.revision_rounds,
    })
    .select("id")
    .single();
  if (items?.length) await supabase.from("quote_items").insert(items.map((i) => ({ ...i, quote_id: copy!.id })));
  redirect(`/admin/offertes/${copy!.id}`);
}

// ---------- Offertesjablonen ----------

export async function saveQuoteTemplate(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(form, "id");
  const row = {
    name: str(form, "name"),
    title: str(form, "title") || str(form, "name"),
    intro: str(form, "intro") || null,
    items: parseItems(form),
    validity_days: Math.round(num(form, "validity_days", 14)),
    usage_rights: str(form, "usage_rights") || null,
    revision_rounds: Math.round(num(form, "revision_rounds", 1)),
  };
  if (!row.name) return { error: "Geef het sjabloon een naam." };
  const { error } = id ? await supabase.from("quote_templates").update(row).eq("id", id) : await supabase.from("quote_templates").insert(row);
  if (error) return { error: error.message };
  revalidatePath("/admin/sjablonen");
  if (!id) redirect("/admin/sjablonen");
  return { ok: true, message: "Sjabloon opgeslagen." };
}

export async function deleteQuoteTemplate(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("quote_templates").delete().eq("id", str(form, "id"));
  redirect("/admin/sjablonen");
}

// ---------- Overeenkomsten ----------

export async function saveAgreementTemplate(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(form, "id");
  const row = {
    name: str(form, "name") || "Standaard overeenkomst",
    body: str(form, "body"),
    default_usage_rights: str(form, "default_usage_rights") || null,
    default_revision_rounds: Math.round(num(form, "default_revision_rounds", 1)),
    is_default: true,
  };
  const { error } = id ? await supabase.from("agreement_templates").update(row).eq("id", id) : await supabase.from("agreement_templates").insert(row);
  if (error) return { error: error.message };
  revalidatePath("/admin/overeenkomst");
  return { ok: true, message: "Sjabloon opgeslagen. Nieuwe overeenkomsten gebruiken deze tekst." };
}

export async function revokeAgreement(form: FormData) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("agreements").update({ status: "ingetrokken" }).eq("id", str(form, "id")).neq("status", "ondertekend").select("project_id").maybeSingle();
  if (data) revalidatePath(`/admin/projecten/${data.project_id}`);
}

/** Tegenondertekening door de fotograaf. */
export async function adminSignAgreement(form: FormData) {
  const { supabase, user, profile } = await requireAdmin();
  const id = str(form, "id");
  const { data: a } = await supabase.from("agreements").select("*").eq("id", id).single();
  if (!a) return;
  const { data: existing } = await supabase.from("signatures").select("id").eq("agreement_id", id).eq("signer_role", "admin").maybeSingle();
  if (existing) return;
  const h = await headers();
  await supabase.from("signatures").insert({
    agreement_id: id,
    user_id: user.id,
    signer_role: "admin",
    signer_name: profile?.full_name || "Cheryl Aldessa Prijs",
    signer_email: profile?.email,
    ip_address: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: h.get("user-agent")?.slice(0, 500) ?? null,
    content_hash: createHash("sha256").update(a.body, "utf8").digest("hex"),
  });
  revalidatePath(`/admin/projecten/${a.project_id}`);
}
