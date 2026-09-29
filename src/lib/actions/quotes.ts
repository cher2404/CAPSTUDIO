"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireClient } from "@/lib/auth";
import { adminEmail, sendEmail } from "@/lib/email";
import { euro, formatDate } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionState, Agreement, Quote } from "@/lib/types";
import { bool, errorMessage, str } from "@/lib/utils";

export async function acceptQuote(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, client } = await requireClient();
  const quoteId = str(form, "quote_id");
  if (!bool(form, "terms")) return { error: "Ga akkoord met de algemene voorwaarden om te accepteren." };

  const { data: agreementId, error } = await supabase.rpc("accept_quote", { p_quote_id: quoteId });
  if (error) return { error: errorMessage(error) };

  const { data: quote } = await supabase.from("quotes").select("*, projects(title)").eq("id", quoteId).single();
  const q = quote as Quote & { projects: { title: string } };

  await Promise.all([
    sendEmail({
      to: adminEmail,
      template: "quote_accepted",
      vars: { naam: client.full_name ?? client.email, nummer: q.number, totaal: euro(q.total).replace("€", "").trim() },
      rawVars: { admin_link: absoluteUrl(`/admin/projecten/${q.project_id}`) },
    }),
    sendEmail({
      to: client.email,
      template: "agreement_ready",
      vars: { naam: client.full_name?.split(" ")[0] ?? "", project: q.projects.title },
      rawVars: { link: absoluteUrl(`/portal/overeenkomsten/${agreementId}`) },
    }),
  ]);

  revalidatePath("/portal", "layout");
  redirect(`/portal/overeenkomsten/${agreementId}?nieuw=1`);
}

export async function askQuoteQuestion(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user, client } = await requireClient();
  const quoteId = str(form, "quote_id");
  const question = str(form, "question");
  if (question.length < 3) return { error: "Typ eerst je vraag." };

  // RLS-check: kan deze klant de offerte zien?
  const { data: quote } = await supabase.from("quotes").select("id, number, project_id, status").eq("id", quoteId).maybeSingle();
  if (!quote) return { error: "Offerte niet gevonden." };

  const { error } = await supabase
    .from("messages")
    .insert({ project_id: quote.project_id, sender_id: user.id, body: `Vraag over offerte ${quote.number}:\n\n${question}` });
  if (error) return { error: "Je vraag kon niet worden verstuurd." };

  if (quote.status === "verstuurd") {
    await createAdminClient().from("quotes").update({ status: "vraag" }).eq("id", quoteId);
  }

  await sendEmail({
    to: adminEmail,
    template: "quote_question",
    vars: { naam: client.full_name ?? client.email, nummer: quote.number, vraag: question },
    rawVars: { admin_link: absoluteUrl(`/admin/projecten/${quote.project_id}#berichten`) },
    replyTo: client.email,
  });

  revalidatePath("/portal", "layout");
  return { ok: true, message: "Je vraag is verstuurd. Je vindt mijn antwoord straks onder Berichten." };
}

export async function signAgreement(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user, client } = await requireClient();
  const agreementId = str(form, "agreement_id");
  const name = str(form, "name");
  const shownHash = str(form, "hash");

  if (name.length < 3) return { error: "Vul je volledige naam in." };
  if (!bool(form, "agree")) return { error: "Vink aan dat je de overeenkomst hebt gelezen en ermee akkoord gaat." };

  const { data } = await supabase.from("agreements").select("*, projects(title)").eq("id", agreementId).maybeSingle();
  const agreement = data as (Agreement & { projects: { title: string } }) | null;
  if (!agreement) return { error: "Overeenkomst niet gevonden." };
  if (agreement.status !== "te_ondertekenen") return { error: "Deze overeenkomst is al ondertekend of ingetrokken." };

  const hash = createHash("sha256").update(agreement.body, "utf8").digest("hex");
  if (hash !== shownHash) return { error: "De overeenkomst is net gewijzigd. Vernieuw de pagina en lees hem opnieuw." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
  const signedAt = new Date().toISOString();

  const db = createAdminClient();
  const { error: sigErr } = await db.from("signatures").insert({
    agreement_id: agreement.id,
    user_id: user.id,
    signer_role: "client",
    signer_name: name,
    signer_email: client.email,
    signed_at: signedAt,
    ip_address: ip,
    user_agent: h.get("user-agent")?.slice(0, 500) ?? null,
    content_hash: hash,
  });
  if (sigErr) return { error: "Ondertekenen lukte niet. Probeer het opnieuw." };

  await db.from("agreements").update({ status: "ondertekend", signed_at: signedAt, content_hash: hash }).eq("id", agreement.id);

  const vars = { naam: client.full_name?.split(" ")[0] ?? name.split(" ")[0], project: agreement.projects.title, datum: formatDate(signedAt) };
  const link = absoluteUrl(`/portal/overeenkomsten/${agreement.id}`);
  await Promise.all([
    sendEmail({ to: client.email, template: "agreement_signed", vars, rawVars: { link } }),
    sendEmail({ to: adminEmail, template: "agreement_signed", vars: { ...vars, naam: "Cheryl" }, rawVars: { link: absoluteUrl(`/admin/projecten/${agreement.project_id}`) } }),
  ]);

  revalidatePath("/portal", "layout");
  revalidatePath(`/admin/projecten/${agreement.project_id}`);
  return { ok: true, message: "Ondertekend! Je ontvangt een bevestiging per mail." };
}
