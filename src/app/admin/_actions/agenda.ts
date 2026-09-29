"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { num, str } from "@/lib/utils";

/** Zet een lokale Nederlandse datum + tijd om naar een ISO-tijdstempel (houdt rekening met zomertijd). */
function amsterdamToIso(date: string, time: string) {
  const naive = new Date(`${date}T${time}:00Z`);
  const tzName = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Amsterdam", timeZoneName: "shortOffset" })
    .formatToParts(naive)
    .find((p) => p.type === "timeZoneName")?.value; // bijv. "GMT+2"
  const offset = Number(tzName?.replace("GMT", "") || 0);
  return new Date(naive.getTime() - offset * 3600_000).toISOString();
}

export async function addSlots(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const from = str(form, "from");
  const to = str(form, "to") || from;
  const weekdays = form.getAll("weekday").map(Number);
  const times = str(form, "times")
    .split(/[\s,;]+/)
    .filter((t) => /^\d{1,2}:\d{2}$/.test(t))
    .map((t) => t.padStart(5, "0"));
  const duration = num(form, "duration", 60);
  const note = str(form, "note") || null;

  if (!from || !times.length) return { error: "Kies een datum en minstens één starttijd (bijv. 09:00, 13:30)." };

  const rows: { starts_at: string; ends_at: string; note: string | null }[] = [];
  const start = new Date(`${from}T12:00:00Z`);
  const end = new Date(`${to}T12:00:00Z`);
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    if (weekdays.length && !weekdays.includes(d.getUTCDay())) continue;
    const day = d.toISOString().slice(0, 10);
    for (const t of times) {
      const s = amsterdamToIso(day, t);
      rows.push({ starts_at: s, ends_at: new Date(new Date(s).getTime() + duration * 60_000).toISOString(), note });
    }
    if (rows.length > 500) return { error: "Dat zijn te veel momenten in één keer (max. 500)." };
  }
  if (!rows.length) return { error: "Geen momenten gevonden met deze instellingen." };

  const { error } = await supabase.from("availability").insert(rows);
  if (error) return { error: error.message };
  revalidatePath("/admin/agenda");
  return { ok: true, message: `${rows.length} moment${rows.length === 1 ? "" : "en"} toegevoegd.` };
}

export async function deleteSlot(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(form, "id");
  const { count } = await supabase.from("appointments").select("id", { count: "exact", head: true }).eq("availability_id", id).eq("status", "bevestigd");
  if (!count) await supabase.from("availability").delete().eq("id", id);
  revalidatePath("/admin/agenda");
}

export async function deleteOpenSlotsInRange(form: FormData) {
  const { supabase } = await requireAdmin();
  const { data: slots } = await supabase.rpc("open_slots", { p_from: new Date().toISOString(), p_to: new Date(Date.now() + 365 * 86400_000).toISOString() });
  const day = str(form, "day");
  const ids = ((slots ?? []) as { id: string; starts_at: string }[]).filter((s) => !day || s.starts_at.startsWith(day)).map((s) => s.id);
  if (ids.length) await supabase.from("availability").delete().in("id", ids);
  revalidatePath("/admin/agenda");
}
