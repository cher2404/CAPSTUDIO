"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/auth";
import { adminEmail, sendEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";
import type { ActionState } from "@/lib/types";
import { bool, str } from "@/lib/utils";

export async function updateDetails(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, client } = await requireClient();
  const { error } = await supabase
    .from("clients")
    .update({
      full_name: str(form, "full_name") || null,
      phone: str(form, "phone") || null,
      company: str(form, "company") || null,
      instagram: str(form, "instagram").replace(/^@/, "") || null,
      city: str(form, "city") || null,
    })
    .eq("id", client.id);
  if (error) return { error: "Opslaan lukte niet." };
  revalidatePath("/portal", "layout");
  return { ok: true, message: "Je gegevens zijn opgeslagen." };
}

export async function setConsent(form: FormData) {
  const { supabase } = await requireClient();
  await supabase.rpc("set_portfolio_consent", { p_project_id: str(form, "project_id"), p_consent: bool(form, "consent") });
  revalidatePath("/portal/account");
}

export async function requestDeletion(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user, client } = await requireClient();
  if (str(form, "confirm").toLowerCase() !== "verwijder") return { error: 'Typ "verwijder" om te bevestigen.' };

  const { data: existing } = await supabase.from("deletion_requests").select("id").eq("status", "open").maybeSingle();
  if (existing) return { ok: true, message: "Je verzoek staat al open. Ik handel het binnen een maand af." };

  const reason = str(form, "reason") || null;
  const { error } = await supabase.from("deletion_requests").insert({ user_id: user.id, email: client.email, reason });
  if (error) return { error: "Het verzoek kon niet worden opgeslagen. Mail me gerust direct." };

  await sendEmail({
    to: adminEmail,
    template: "deletion_requested",
    vars: { email: client.email, reden: reason ?? "Geen reden opgegeven" },
    rawVars: { admin_link: absoluteUrl("/admin/instellingen#avg") },
  });
  revalidatePath("/portal/account");
  return { ok: true, message: "Je verzoek is ontvangen. Je krijgt bericht zodra je gegevens verwijderd zijn (uiterlijk binnen een maand)." };
}
