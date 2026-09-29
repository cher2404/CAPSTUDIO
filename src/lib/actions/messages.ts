"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { adminEmail, recentEmailCount, sendEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionState } from "@/lib/types";
import { str } from "@/lib/utils";

export async function sendMessage(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user, profile } = await getSession();
  if (!user) return { error: "Je bent niet ingelogd." };

  const projectId = str(form, "project_id");
  const body = str(form, "body");
  if (!body) return { error: "Typ eerst een bericht." };
  if (body.length > 5000) return { error: "Je bericht is te lang." };

  const { error } = await supabase.from("messages").insert({ project_id: projectId, sender_id: user.id, body });
  if (error) return { error: "Versturen lukte niet. Probeer het opnieuw." };

  await notifyNewMessage(projectId, body, profile?.role === "admin");

  revalidatePath(`/portal/berichten/${projectId}`);
  revalidatePath(`/admin/projecten/${projectId}`);
  return { ok: true };
}

/** Mail de andere partij. Max. één melding per 10 minuten per ontvanger, zodat een chat niet tot spam leidt. */
export async function notifyNewMessage(projectId: string, body: string, fromAdmin: boolean) {
  const db = createAdminClient();
  const { data: project } = await db.from("projects").select("id, title, clients(email, full_name)").eq("id", projectId).single();
  if (!project) return;
  const client = project.clients as unknown as { email: string; full_name: string | null } | null;

  const to = fromAdmin ? client?.email : adminEmail;
  if (!to) return;
  if ((await recentEmailCount(to, "new_message", 10)) > 0) return;

  await sendEmail({
    to,
    template: "new_message",
    vars: {
      naam: fromAdmin ? (client?.full_name?.split(" ")[0] ?? "") : "Cheryl",
      project: project.title,
      bericht: body.length > 400 ? body.slice(0, 400) + "…" : body,
    },
    rawVars: { link: absoluteUrl(fromAdmin ? `/portal/berichten/${projectId}` : `/admin/projecten/${projectId}#berichten`) },
  });
}

export async function markRead(projectId: string) {
  const { supabase, user } = await getSession();
  if (!user) return;
  await supabase.rpc("mark_messages_read", { p_project_id: projectId });
}
