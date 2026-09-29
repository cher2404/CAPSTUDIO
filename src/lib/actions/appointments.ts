"use server";

import { revalidatePath } from "next/cache";
import { afterAppointmentChange } from "@/lib/appointments";
import { getSession } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { errorMessage, str } from "@/lib/utils";

function refresh() {
  revalidatePath("/portal", "layout");
  revalidatePath("/admin", "layout");
}

export async function bookAppointment(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user, profile } = await getSession();
  if (!user) return { error: "Je bent niet ingelogd." };

  const slotId = str(form, "slot_id");
  const projectId = str(form, "project_id");
  if (!slotId) return { error: "Kies eerst een moment." };
  if (!projectId) return { error: "Kies voor welk project de shoot is." };

  const { data, error } = await supabase.rpc("book_slot", { p_slot_id: slotId, p_project_id: projectId, p_notes: str(form, "notes") || null });
  if (error) return { error: errorMessage(error) };

  await afterAppointmentChange(data as string, "confirmed", { notifyAdmin: profile?.role !== "admin" });
  refresh();
  return { ok: true, message: "Gelukt! Je shoot staat vast. Je krijgt een bevestiging met agenda-uitnodiging per mail." };
}

export async function rescheduleAppointment(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user, profile } = await getSession();
  if (!user) return { error: "Je bent niet ingelogd." };

  const appointmentId = str(form, "appointment_id");
  const slotId = str(form, "slot_id");
  if (!slotId) return { error: "Kies eerst een nieuw moment." };

  const { error } = await supabase.rpc("reschedule_appointment", { p_appointment_id: appointmentId, p_new_slot_id: slotId });
  if (error) return { error: errorMessage(error) };

  await afterAppointmentChange(appointmentId, "rescheduled", { notifyAdmin: profile?.role !== "admin" });
  refresh();
  return { ok: true, message: "Je shoot is verzet. Je krijgt een nieuwe bevestiging per mail." };
}

export async function cancelAppointment(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user, profile } = await getSession();
  if (!user) return { error: "Je bent niet ingelogd." };

  const appointmentId = str(form, "appointment_id");
  const { error } = await supabase.rpc("cancel_appointment", { p_appointment_id: appointmentId });
  if (error) return { error: errorMessage(error) };

  await afterAppointmentChange(appointmentId, "cancelled", { notifyAdmin: profile?.role !== "admin" });
  refresh();
  return { ok: true, message: "Je shoot is geannuleerd." };
}
