"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { notifyNewMessage } from "@/lib/actions/messages";
import type { ActionState, PaymentStatus, ProjectStatus } from "@/lib/types";
import { bool, isEmail, str } from "@/lib/utils";

export async function createClientWithProject(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const email = str(form, "email").toLowerCase();
  if (!isEmail(email)) return { error: "Vul een geldig e-mailadres in." };

  let { data: client } = await supabase.from("clients").select("id").eq("email", email).maybeSingle();
  if (!client) {
    const { data, error } = await supabase
      .from("clients")
      .insert({ email, full_name: str(form, "full_name") || null, phone: str(form, "phone") || null, company: str(form, "company") || null })
      .select("id")
      .single();
    if (error) return { error: error.message };
    client = data;
  }

  const title = str(form, "project_title");
  if (title) {
    const { data: project, error } = await supabase
      .from("projects")
      .insert({ client_id: client!.id, title, shoot_type: str(form, "shoot_type") || null, description: str(form, "description") || null })
      .select("id")
      .single();
    if (error) return { error: error.message };
    redirect(`/admin/projecten/${project.id}`);
  }
  redirect(`/admin/klanten/${client!.id}`);
}

export async function updateClient(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(form, "id");
  const { error } = await supabase
    .from("clients")
    .update({
      full_name: str(form, "full_name") || null,
      email: str(form, "email").toLowerCase(),
      phone: str(form, "phone") || null,
      company: str(form, "company") || null,
      instagram: str(form, "instagram") || null,
      city: str(form, "city") || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/klanten/${id}`);
  return { ok: true, message: "Opgeslagen." };
}

export async function addClientNote(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(form, "client_id");
  const body = str(form, "body");
  if (body) await supabase.from("client_notes").insert({ client_id: id, body });
  revalidatePath(`/admin/klanten/${id}`);
}

export async function deleteClientNote(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("client_notes").delete().eq("id", str(form, "id"));
  revalidatePath(`/admin/klanten/${str(form, "client_id")}`);
}

export async function createProject(form: FormData) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("projects")
    .insert({ client_id: str(form, "client_id"), title: str(form, "title") || "Nieuw project", shoot_type: str(form, "shoot_type") || null })
    .select("id")
    .single();
  if (error) throw error;
  redirect(`/admin/projecten/${data.id}`);
}

export async function updateProject(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(form, "id");
  const { error } = await supabase
    .from("projects")
    .update({
      title: str(form, "title"),
      description: str(form, "description") || null,
      shoot_type: str(form, "shoot_type") || null,
      location: str(form, "location") || null,
      status: str(form, "status") as ProjectStatus,
      payment_status: str(form, "payment_status") as PaymentStatus,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/projecten/${id}`);
  revalidatePath("/admin/klanten");
  return { ok: true, message: "Project opgeslagen." };
}

export async function setProjectStatus(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("projects").update({ status: str(form, "status") }).eq("id", str(form, "id"));
  revalidatePath("/admin", "layout");
}

export async function deleteProject(form: FormData) {
  const { supabase } = await requireAdmin();
  if (!bool(form, "confirm")) return;
  const { data } = await supabase.from("projects").delete().eq("id", str(form, "id")).select("client_id").single();
  redirect(data ? `/admin/klanten/${data.client_id}` : "/admin/klanten");
}

export async function adminSendMessage(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const projectId = str(form, "project_id");
  const body = str(form, "body");
  if (!body) return { error: "Typ eerst een bericht." };
  const { error } = await supabase.from("messages").insert({ project_id: projectId, sender_id: user.id, body });
  if (error) return { error: error.message };
  await notifyNewMessage(projectId, body, true);
  revalidatePath(`/admin/projecten/${projectId}`);
  return { ok: true };
}

export async function saveInvoice(form: FormData) {
  const { supabase } = await requireAdmin();
  const projectId = str(form, "project_id");
  await supabase.from("invoices").insert({
    project_id: projectId,
    number: str(form, "number"),
    amount: Number(str(form, "amount").replace(",", ".")) || null,
    due_date: str(form, "due_date") || null,
    payment_status: str(form, "payment_status") || "open",
    file_path: str(form, "file_path") || null,
  });
  revalidatePath(`/admin/projecten/${projectId}`);
}

export async function updateInvoiceStatus(form: FormData) {
  const { supabase } = await requireAdmin();
  const status = str(form, "payment_status") as PaymentStatus;
  const { data } = await supabase.from("invoices").update({ payment_status: status }).eq("id", str(form, "id")).select("project_id").single();
  if (data) {
    // Projectstatus volgt de factuur: betaald → downloads gaan automatisch open.
    const { data: all } = await supabase.from("invoices").select("payment_status").eq("project_id", data.project_id);
    const statuses = (all ?? []).map((i) => i.payment_status);
    const project = statuses.every((s) => s === "betaald") ? "betaald" : statuses.some((s) => s !== "open") ? "deels" : "open";
    await supabase.from("projects").update({ payment_status: project }).eq("id", data.project_id);
    revalidatePath(`/admin/projecten/${data.project_id}`);
  }
}

export async function deleteInvoice(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("invoices").delete().eq("id", str(form, "id"));
  revalidatePath(`/admin/projecten/${str(form, "project_id")}`);
}
