"use server";

import { headers } from "next/headers";
import { adminEmail, recentEmailCount, sendEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { isEmail, safeNext, str } from "@/lib/utils";

const GENERIC = "Check je inbox! Als dit e-mailadres bij CAP Media Studio bekend is, ontvang je binnen een minuut een inloglink.";

export async function sendMagicLink(_: ActionState, form: FormData): Promise<ActionState> {
  const email = str(form, "email").toLowerCase();
  const next = safeNext(str(form, "next"));
  if (!isEmail(email)) return { error: "Vul een geldig e-mailadres in." };

  const db = createAdminClient();

  // Alleen bekende klanten (of de admin) krijgen een link. Het antwoord is altijd hetzelfde.
  const [{ data: client }, { data: profile }] = await Promise.all([
    db.from("clients").select("id, full_name").eq("email", email).maybeSingle(),
    db.from("profiles").select("id, full_name").eq("email", email).maybeSingle(),
  ]);
  const known = Boolean(client || profile || email === adminEmail.toLowerCase());
  if (!known) return { ok: true, message: GENERIC };

  if ((await recentEmailCount(email, "login_link", 15)) >= 3) {
    return { error: "Je hebt net al een paar links aangevraagd. Wacht een kwartiertje en probeer het dan opnieuw." };
  }

  const confirmBase = absoluteUrl("/auth/confirm");

  if (process.env.RESEND_API_KEY) {
    const { data, error } = await db.auth.admin.generateLink({ type: "magiclink", email });
    if (error || !data.properties?.hashed_token) {
      console.error("[login] generateLink", error);
      return { error: "Het lukte niet om een link te maken. Probeer het zo nog eens." };
    }
    const link = `${confirmBase}?token_hash=${data.properties.hashed_token}&type=magiclink${next ? `&next=${encodeURIComponent(next)}` : ""}`;
    const name = client?.full_name ?? profile?.full_name ?? "";
    await sendEmail({
      to: email,
      template: "login_link",
      vars: { naam_komma: name ? ` ${name.split(" ")[0]},` : "," },
      rawVars: { link },
    });
  } else {
    // Zonder Resend verstuurt Supabase de mail zelf (sjabloon in het Supabase-dashboard).
    const supabase = await createClient();
    const origin = (await headers()).get("origin");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: `${origin ?? absoluteUrl("/").slice(0, -1)}/auth/confirm${next ? `?next=${encodeURIComponent(next)}` : ""}` },
    });
    if (error) {
      console.error("[login] signInWithOtp", error);
      return { error: "Het lukte niet om een link te versturen. Probeer het zo nog eens." };
    }
    await db.from("email_log").insert({ recipient: email, template: "login_link", subject: "Supabase magic link", status: "sent" });
  }

  return { ok: true, message: GENERIC };
}
