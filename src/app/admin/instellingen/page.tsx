import { processDeletion, saveSettings } from "../_actions/content";
import { ActionForm, ConfirmButton } from "@/components/admin/forms";
import { Badge, Card, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { googleCalendarEnabled } from "@/lib/google-calendar";
import { site } from "@/lib/site";
import type { DeletionRequest } from "@/lib/types";

export const metadata = { title: "Instellingen" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: settings }, { data: requests }, { data: log }] = await Promise.all([
    supabase.from("settings").select("*"),
    supabase.from("deletion_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("email_log").select("*").order("created_at", { ascending: false }).limit(30),
  ]);
  const get = (k: string) => ((settings ?? []).find((s) => s.key === k)?.value as string) ?? "";

  const checks = [
    ["Supabase service key", Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY)],
    ["Resend (e-mail)", Boolean(process.env.RESEND_API_KEY)],
    ["Cron-secret (herinneringen)", Boolean(process.env.CRON_SECRET)],
    ["Google Calendar", googleCalendarEnabled],
    ["Website-URL", Boolean(process.env.NEXT_PUBLIC_SITE_URL)],
  ] as const;

  return (
    <>
      <PageHeader eyebrow="Beheer" title="Instellingen en AVG" />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-2xl">Website</h2>
          <ActionForm action={saveSettings} className="space-y-4">
            <Field label="Hero-foto homepage (url)" hint="Leeg = de portfoliofoto die je als 'Hero' hebt gemarkeerd.">
              <Input name="hero_image" defaultValue={get("hero_image")} placeholder="https://…" />
            </Field>
            <Field label="Portretfoto Over mij (url)">
              <Input name="about_image" defaultValue={get("about_image")} placeholder="https://…" />
            </Field>
            <Field label="Showreel (YouTube/Vimeo)">
              <Input name="reel_url" defaultValue={get("reel_url")} />
            </Field>
            <SubmitButton>Opslaan</SubmitButton>
          </ActionForm>
          <p className="mt-5 text-xs text-mist">
            Bedrijfsgegevens (KvK {site.kvk}, e-mail {site.email}, Instagram @{site.instagram}) stel je in via de omgevingsvariabelen in Vercel.
          </p>
        </Card>

        <Card>
          <h2 className="mb-4 text-2xl">Koppelingen</h2>
          <ul className="space-y-2 text-sm">
            {checks.map(([label, ok]) => (
              <li key={label} className="flex items-center justify-between">
                <span className="text-bone-dim">{label}</span>
                <Badge tone={ok ? "good" : "neutral"}>{ok ? "Actief" : "Niet ingesteld"}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card id="avg" className="xl:col-span-2">
          <h2 className="text-2xl">AVG-verwijderverzoeken</h2>
          <p className="mt-1 mb-4 text-sm text-mist">Handel verzoeken binnen een maand af. Bewaar facturen in je boekhouding: in het portaal worden ze mee verwijderd.</p>
          {(requests ?? []).length === 0 ? (
            <p className="text-sm text-mist">Geen verzoeken.</p>
          ) : (
            <ul className="divide-y divide-ink-700/70">
              {((requests ?? []) as DeletionRequest[]).map((r) => (
                <li key={r.id} className="flex flex-col gap-2 py-3 text-sm md:flex-row md:items-center md:justify-between">
                  <span>
                    <span className="block text-bone">{r.email}</span>
                    <span className="text-xs text-mist">
                      {formatDateTime(r.created_at)} {r.reason && `· “${r.reason}”`}
                    </span>
                  </span>
                  {r.status === "open" ? (
                    <span className="flex gap-2">
                      <form action={processDeletion}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="decision" value="afgerond" />
                        <ConfirmButton className="rounded-full border border-rose/40 px-3 py-1.5 text-xs text-rose hover:bg-rose/10" message="Alle gegevens, projecten, berichten en foto's van deze klant definitief verwijderen?">
                          Gegevens verwijderen
                        </ConfirmButton>
                      </form>
                      <form action={processDeletion}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="decision" value="afgewezen" />
                        <Button size="sm" variant="ghost">
                          Afwijzen
                        </Button>
                      </form>
                    </span>
                  ) : (
                    <Badge tone={r.status === "afgerond" ? "good" : "neutral"}>
                      {r.status} {r.processed_at && formatDateTime(r.processed_at)}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="xl:col-span-2">
          <h2 className="mb-4 text-2xl">Laatst verstuurde e-mails</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-xs">
              <tbody className="divide-y divide-ink-700/60">
                {(log ?? []).map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 pr-3 text-mist">{formatDateTime(l.created_at)}</td>
                    <td className="py-2 pr-3 text-bone-dim">{l.recipient}</td>
                    <td className="py-2 pr-3 text-bone-dim">{l.subject}</td>
                    <td className="py-2">
                      <Badge tone={l.status === "sent" ? "good" : l.status === "failed" ? "bad" : "neutral"}>{l.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
