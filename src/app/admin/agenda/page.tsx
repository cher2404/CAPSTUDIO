import Link from "next/link";
import { addSlots, deleteOpenSlotsInRange, deleteSlot } from "../_actions/agenda";
import { ActionForm, ConfirmButton } from "@/components/admin/forms";
import { Badge, Card, PageHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/auth";
import { dayKey, formatDay, timeRange } from "@/lib/format";
import { googleCalendarEnabled } from "@/lib/google-calendar";
import type { Appointment, Slot } from "@/lib/types";

export const metadata = { title: "Agenda" };

const weekdays = [
  [1, "ma"],
  [2, "di"],
  [3, "wo"],
  [4, "do"],
  [5, "vr"],
  [6, "za"],
  [0, "zo"],
] as const;

export default async function AgendaPage() {
  const { supabase } = await requireAdmin();
  const now = new Date().toISOString();
  const [{ data: slotData }, { data: apptData }] = await Promise.all([
    supabase.from("availability").select("*").gte("ends_at", now).order("starts_at").limit(400),
    supabase.from("appointments").select("*, projects(id, title, clients(full_name, email))").eq("status", "bevestigd").gte("ends_at", now).order("starts_at"),
  ]);
  const slots = (slotData ?? []) as Slot[];
  const appts = (apptData ?? []) as (Appointment & { projects: { id: string; title: string; clients: { full_name: string | null; email: string } } })[];
  const bookedBy = new Map(appts.filter((a) => a.availability_id).map((a) => [a.availability_id!, a]));

  const byDay = new Map<string, Slot[]>();
  for (const s of slots) byDay.set(dayKey(s.starts_at), [...(byDay.get(dayKey(s.starts_at)) ?? []), s]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader eyebrow="Agenda" title="Beschikbaarheid">
        Zet momenten open waarop klanten zelf een shoot kunnen boeken (minimaal 24 uur vooruit).
        {googleCalendarEnabled ? " Boekingen worden automatisch in je Google Calendar gezet." : " Tip: koppel Google Calendar via de omgevingsvariabelen (zie README)."}
      </PageHeader>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {appts.length > 0 && (
            <Card>
              <h2 className="mb-4 text-2xl">Geboekte shoots</h2>
              <ul className="divide-y divide-ink-700/70">
                {appts.map((a) => (
                  <li key={a.id}>
                    <Link href={`/admin/projecten/${a.projects.id}`} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                      <span className="text-bone first-letter:uppercase">
                        {formatDay(a.starts_at)} · {timeRange(a.starts_at, a.ends_at)}
                      </span>
                      <span className="text-mist">
                        {a.projects.clients.full_name ?? a.projects.clients.email} · {a.projects.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <h2 className="mb-4 text-2xl">Open momenten</h2>
            {byDay.size === 0 && <p className="text-sm text-mist">Nog geen momenten. Voeg ze rechts toe.</p>}
            <div className="space-y-5">
              {[...byDay.entries()].map(([day, list]) => (
                <div key={day}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm text-bone first-letter:uppercase">{formatDay(list[0]!.starts_at)}</p>
                    {list.some((s) => !bookedBy.has(s.id)) && (
                      <form action={deleteOpenSlotsInRange}>
                        <input type="hidden" name="day" value={list[0]!.starts_at.slice(0, 10)} />
                        <ConfirmButton className="text-[11px] text-mist hover:text-rose" message="Alle vrije momenten op deze dag verwijderen?">
                          Dag leegmaken
                        </ConfirmButton>
                      </form>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {list.map((s) => {
                      const booked = bookedBy.get(s.id);
                      return booked ? (
                        <Link key={s.id} href={`/admin/projecten/${booked.projects.id}`}>
                          <Badge tone="cool">
                            {timeRange(s.starts_at, s.ends_at)} · {booked.projects.clients.full_name?.split(" ")[0] ?? "geboekt"}
                          </Badge>
                        </Link>
                      ) : (
                        <form key={s.id} action={deleteSlot} className="group">
                          <input type="hidden" name="id" value={s.id} />
                          <button className="rounded-full border border-ink-600 px-3 py-1 text-xs text-bone-dim hover:border-rose/50 hover:text-rose" title="Klik om te verwijderen">
                            {timeRange(s.starts_at, s.ends_at)} <span className="opacity-0 group-hover:opacity-100">×</span>
                          </button>
                        </form>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="h-fit xl:sticky xl:top-8">
          <h2 className="mb-4 text-2xl">Momenten toevoegen</h2>
          <ActionForm action={addSlots} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Van">
                <Input name="from" type="date" min={today} defaultValue={today} required />
              </Field>
              <Field label="Tot en met">
                <Input name="to" type="date" min={today} />
              </Field>
            </div>
            <div>
              <p className="mb-2 text-xs text-mist">Alleen op (leeg = elke dag)</p>
              <div className="flex flex-wrap gap-1.5">
                {weekdays.map(([v, l]) => (
                  <label key={v} className="cursor-pointer">
                    <input type="checkbox" name="weekday" value={v} className="peer sr-only" />
                    <span className="block rounded-full border border-ink-600 px-3 py-1 text-xs text-mist peer-checked:border-bone peer-checked:bg-bone peer-checked:text-ink-950">{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <Field label="Starttijden" hint="Gescheiden door komma's, bijv. 09:00, 13:00, 18:30">
              <Input name="times" placeholder="09:00, 13:00" required />
            </Field>
            <Field label="Duur per moment (minuten)">
              <Input name="duration" type="number" defaultValue={60} min={15} step={15} />
            </Field>
            <Field label="Notitie (optioneel, zichtbaar voor klant)">
              <Input name="note" placeholder="Bijv. alleen regio Utrecht" />
            </Field>
            <SubmitButton className="w-full">Toevoegen</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
