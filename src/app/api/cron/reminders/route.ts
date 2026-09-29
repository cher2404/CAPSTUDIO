import { NextResponse, type NextRequest } from "next/server";
import { afterAppointmentChange } from "@/lib/appointments";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Stuurt herinneringen voor shoots die binnen REMINDER_WINDOW_HOURS (standaard 36: dagelijkse run om 18:00 dekt alle shoots van morgen; bij een uurlijkse cron zet je 24) beginnen,
 * en zet afgelopen afspraken op "afgerond". Aangeroepen door Vercel Cron (zie vercel.json).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  const hours = Number(process.env.REMINDER_WINDOW_HOURS ?? 36);
  const now = new Date();
  const until = new Date(now.getTime() + hours * 3600_000);

  const { data: due } = await db
    .from("appointments")
    .select("id")
    .eq("status", "bevestigd")
    .is("reminder_sent_at", null)
    .gt("starts_at", now.toISOString())
    .lte("starts_at", until.toISOString());

  let sent = 0;
  for (const { id } of due ?? []) {
    // Eerst markeren, zodat een dubbele cron-run geen tweede mail stuurt.
    const { data: claimed } = await db
      .from("appointments")
      .update({ reminder_sent_at: now.toISOString() })
      .eq("id", id)
      .is("reminder_sent_at", null)
      .select("id");
    if (!claimed?.length) continue;
    await afterAppointmentChange(id, "reminder");
    sent++;
  }

  const { count: completed } = await db
    .from("appointments")
    .update({ status: "afgerond" }, { count: "exact" })
    .eq("status", "bevestigd")
    .lt("ends_at", now.toISOString());

  return NextResponse.json({ reminders: sent, completed: completed ?? 0 });
}
