import "server-only";
import { adminEmail, sendEmail } from "@/lib/email";
import { formatDay, formatTime, timeRange } from "@/lib/format";
import { deleteCalendarEvent, upsertCalendarEvent } from "@/lib/google-calendar";
import { createIcs } from "@/lib/ics";
import { absoluteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Appointment } from "@/lib/types";

type Kind = "confirmed" | "rescheduled" | "cancelled" | "reminder";

const templates: Record<Kind, string> = {
  confirmed: "appointment_confirmed",
  rescheduled: "appointment_rescheduled",
  cancelled: "appointment_cancelled",
  reminder: "appointment_reminder",
};

const adminAction: Record<Exclude<Kind, "reminder">, string> = {
  confirmed: "Nieuwe shoot geboekt",
  rescheduled: "Shoot verzet",
  cancelled: "Shoot geannuleerd",
};

/** Mail + agenda-uitnodiging + Google Calendar-sync na een wijziging. */
export async function afterAppointmentChange(appointmentId: string, kind: Kind, opts: { notifyAdmin?: boolean } = {}) {
  const db = createAdminClient();
  const { data } = await db
    .from("appointments")
    .select("*, projects(id, title, location, clients(email, full_name))")
    .eq("id", appointmentId)
    .single();
  if (!data) return;

  const appt = data as Appointment & {
    projects: { id: string; title: string; location: string | null; clients: { email: string; full_name: string | null } };
  };
  const client = appt.projects.clients;
  const title = `Shoot CAP Studio – ${appt.projects.title}`;
  const location = appt.location ?? appt.projects.location;

  // Google Calendar
  if (kind === "cancelled") {
    await deleteCalendarEvent(appt.google_event_id);
    if (appt.google_event_id) await db.from("appointments").update({ google_event_id: null }).eq("id", appt.id);
  } else if (kind !== "reminder") {
    const eventId = await upsertCalendarEvent(appt.google_event_id, {
      title: `${client.full_name ?? client.email} – ${appt.projects.title}`,
      description: `${appt.notes ?? ""}\n\n${absoluteUrl(`/admin/projecten/${appt.projects.id}`)}`.trim(),
      location,
      start: appt.starts_at,
      end: appt.ends_at,
    });
    if (eventId && eventId !== appt.google_event_id) await db.from("appointments").update({ google_event_id: eventId }).eq("id", appt.id);
  }

  const vars = {
    naam: client.full_name?.split(" ")[0] ?? "",
    datum: formatDay(appt.starts_at),
    tijd: timeRange(appt.starts_at, appt.ends_at),
    project: appt.projects.title,
  };
  const ics = createIcs({
    uid: appt.id,
    start: appt.starts_at,
    end: appt.ends_at,
    title,
    description: `Je shoot met CAP Studio. Details: ${absoluteUrl("/portal/afspraken")}`,
    location,
    cancelled: kind === "cancelled",
  });

  await sendEmail({
    to: client.email,
    template: templates[kind],
    vars,
    rawVars: { link: absoluteUrl("/portal/afspraken"), tips_link: absoluteUrl("/portal/tips") },
    attachments: kind === "reminder" ? undefined : [{ filename: "shoot.ics", content: ics, contentType: "text/calendar; charset=utf-8" }],
  });

  if (kind !== "reminder" && opts.notifyAdmin) {
    await sendEmail({
      to: adminEmail,
      template: "appointment_admin",
      vars: { ...vars, actie: adminAction[kind], naam: client.full_name ?? client.email },
      rawVars: { admin_link: absoluteUrl(`/admin/projecten/${appt.projects.id}`) },
      attachments: [{ filename: "shoot.ics", content: ics, contentType: "text/calendar; charset=utf-8" }],
    });
  }
}

export function describeSlot(start: string, end: string) {
  return `${formatDay(start)}, ${formatTime(start)} – ${formatTime(end)}`;
}
