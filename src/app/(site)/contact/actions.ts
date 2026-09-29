"use server";

import { adminEmail, sendEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionState } from "@/lib/types";
import { bool, isEmail, str } from "@/lib/utils";

export async function submitContact(_: ActionState, form: FormData): Promise<ActionState> {
  // Honeypot tegen spam-bots
  if (str(form, "website")) return { ok: true, message: "Thanks! Je bericht is verstuurd." };

  const name = str(form, "name");
  const email = str(form, "email").toLowerCase();
  const type = str(form, "type") || "Nog niet zeker";
  const date = str(form, "date");
  const message = str(form, "message");

  if (!name || !isEmail(email) || message.length < 5) {
    return { error: "Vul je naam, een geldig e-mailadres en een bericht in." };
  }
  if (!bool(form, "privacy")) {
    return { error: "Geef even akkoord op de privacyverklaring, dan kan ik je bericht verwerken." };
  }
  if (message.length > 5000) return { error: "Je bericht is te lang (max. 5000 tekens)." };

  let projectId: string | null = null;
  try {
    const db = createAdminClient();
    const { data: existing } = await db.from("clients").select("id").eq("email", email).maybeSingle();
    let clientId = existing?.id as string | undefined;
    if (!clientId) {
      const { data: created, error } = await db.from("clients").insert({ email, full_name: name, phone: str(form, "phone") || null }).select("id").single();
      if (error) throw error;
      clientId = created.id;
    }
    const { data: project, error: pErr } = await db
      .from("projects")
      .insert({
        client_id: clientId,
        title: `${type} – ${name}`,
        shoot_type: type,
        description: [date && `Voorkeursdatum: ${date}`, message].filter(Boolean).join("\n\n"),
      })
      .select("id")
      .single();
    if (pErr) throw pErr;
    projectId = project.id;
  } catch (err) {
    console.error("[contact] opslaan mislukt", err);
  }

  await Promise.all([
    sendEmail({
      to: adminEmail,
      template: "contact_admin",
      replyTo: email,
      vars: { naam: name, email, type, bericht: [date && `Voorkeursdatum: ${date}`, message].filter(Boolean).join("\n\n") },
      rawVars: { admin_link: absoluteUrl(projectId ? `/admin/projecten/${projectId}` : "/admin") },
    }),
    sendEmail({
      to: email,
      template: "contact_confirmation",
      vars: { naam: name.split(" ")[0] },
      rawVars: { portal_link: absoluteUrl(`/login?email=${encodeURIComponent(email)}`) },
    }),
  ]);

  return { ok: true, message: "Thanks! Je bericht is binnen. Je krijgt een bevestiging per mail en ik reageer binnen twee werkdagen." };
}
