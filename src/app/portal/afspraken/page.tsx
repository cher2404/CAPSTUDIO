import { Badge, Card, PageHeader } from "@/components/ui/card";
import { CancelAppointmentButton } from "@/components/portal/cancel-button";
import { SlotPicker } from "@/components/portal/slot-picker";
import { formatDay, timeRange } from "@/lib/format";
import { getMyProjects } from "@/lib/portal";
import type { Appointment, Slot } from "@/lib/types";

export const metadata = { title: "Afspraken" };

const currentTime = () => new Date().getTime();

export default async function AfsprakenPage({ searchParams }: { searchParams: Promise<{ project?: string; verzet?: string }> }) {
  const { project: projectParam, verzet } = await searchParams;
  const { supabase, projects } = await getMyProjects();

  const [{ data: apptData }, { data: slotData }] = await Promise.all([
    supabase.from("appointments").select("*").order("starts_at", { ascending: false }),
    supabase.rpc("open_slots"),
  ]);
  const appointments = (apptData ?? []) as Appointment[];
  const slots = (slotData ?? []) as Slot[];
  const now = currentTime();
  const upcoming = appointments.filter((a) => a.status === "bevestigd" && new Date(a.ends_at).getTime() > now).reverse();
  const past = appointments.filter((a) => !upcoming.includes(a));
  const bookable = projects.filter((p) => p.status !== "opgeleverd");
  const title = (id: string) => projects.find((p) => p.id === id)?.title ?? "";
  const canChange = (a: Appointment) => new Date(a.starts_at).getTime() - now > 24 * 3600 * 1000;

  return (
    <>
      <PageHeader eyebrow="Afspraken" title="Je afspraken">
        Kies zelf een moment uit mijn agenda. Verzetten of annuleren kan tot 24 uur van tevoren.
      </PageHeader>

      <div className="space-y-6">
        {upcoming.map((a) => (
          <Card key={a.id} className="border-tide/30">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge tone="cool">Gepland</Badge>
                <p className="mt-3 font-display text-3xl text-bone first-letter:uppercase">{formatDay(a.starts_at)}</p>
                <p className="mt-1 text-sm text-mist">
                  {timeRange(a.starts_at, a.ends_at)} · {title(a.project_id)}
                  {a.location && <> · {a.location}</>}
                </p>
              </div>
              {canChange(a) ? (
                <div className="flex flex-wrap items-center gap-2">
                  <a href={`?verzet=${a.id}`} className="rounded-full border border-ink-600 px-4 py-2 text-xs text-bone hover:border-bone/50">
                    Verzetten
                  </a>
                  <CancelAppointmentButton appointmentId={a.id} />
                </div>
              ) : (
                <p className="text-xs text-mist">Binnen 24 uur? Stuur me een bericht als er iets is.</p>
              )}
            </div>
            {verzet === a.id && canChange(a) && (
              <div className="mt-6 border-t border-ink-700/70 pt-6">
                <h2 className="mb-5 text-2xl">Kies een nieuw moment</h2>
                <SlotPicker mode="reschedule" slots={slots} appointmentId={a.id} />
              </div>
            )}
          </Card>
        ))}

        {bookable.length > 0 ? (
          <Card>
            <h2 className="mb-1 text-2xl">{upcoming.length ? "Nog een afspraak plannen" : "Plan een afspraak"}</h2>
            <p className="mb-6 text-sm text-mist">Alle tijden zijn in Nederlandse tijd.</p>
            <SlotPicker mode="book" slots={slots} projects={bookable.map((p) => ({ id: p.id, title: p.title }))} defaultProjectId={projectParam} />
          </Card>
        ) : (
          !upcoming.length && (
            <Card>
              <p className="text-sm text-mist">Je hebt nog geen project om een afspraak voor te plannen. Start eerst een project via de contactpagina.</p>
            </Card>
          )
        )}

        {past.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl">Eerder</h2>
            <ul className="divide-y divide-ink-700/70 rounded-2xl border border-ink-700/70">
              {past.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-4 text-sm">
                  <span>
                    <span className="text-bone first-letter:uppercase">{formatDay(a.starts_at)}</span>
                    <span className="block text-xs text-mist">{title(a.project_id)}</span>
                  </span>
                  <Badge tone={a.status === "geannuleerd" ? "bad" : "neutral"}>{a.status === "geannuleerd" ? "Geannuleerd" : "Afgerond"}</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
