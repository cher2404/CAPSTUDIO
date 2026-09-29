import Link from "next/link";
import { setConsent } from "./actions";
import { DeletionForm, DetailsForm } from "./forms";
import { Card, PageHeader } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { getMyProjects } from "@/lib/portal";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const { supabase, client, projects } = await getMyProjects();
  const { data: deletion } = await supabase.from("deletion_requests").select("id").eq("status", "open").maybeSingle();

  return (
    <>
      <PageHeader eyebrow="Account" title="Jouw gegevens" />
      <div className="space-y-6">
        <Card>
          <h2 className="mb-5 text-2xl">Contactgegevens</h2>
          <DetailsForm client={client} />
        </Card>

        <Card id="toestemming">
          <h2 className="text-2xl">Toestemming portfolio</h2>
          <p className="mt-2 mb-5 max-w-2xl text-sm text-mist">
            Mag ik beelden van jouw shoot gebruiken in mijn portfolio en op social media? Dat bepaal je per project, en je kunt het altijd
            weer intrekken.
          </p>
          {projects.length ? (
            <ul className="divide-y divide-ink-700/70">
              {projects.map((p) => (
                <li key={p.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-bone">{p.title}</p>
                    <p className="text-xs text-mist">
                      {p.portfolio_consent ? `Toestemming gegeven op ${formatDate(p.portfolio_consent_at)}` : "Geen toestemming"}
                    </p>
                  </div>
                  <form action={setConsent}>
                    <input type="hidden" name="project_id" value={p.id} />
                    <input type="hidden" name="consent" value={p.portfolio_consent ? "false" : "true"} />
                    <button className={buttonClass(p.portfolio_consent ? "outline" : "subtle", "sm")}>
                      {p.portfolio_consent ? "Toestemming intrekken" : "Ja, dat mag"}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mist">Nog geen projecten.</p>
          )}
        </Card>

        <Card id="privacy">
          <h2 className="text-2xl">Privacy en je gegevens</h2>
          <p className="mt-2 max-w-2xl text-sm text-mist">
            Je hebt altijd recht op inzage en verwijdering van je gegevens. Lees meer in de{" "}
            <Link href="/privacy" className="text-ember-soft underline underline-offset-2">
              privacyverklaring
            </Link>
            .
          </p>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl">Download je gegevens</h3>
              <p className="mt-2 mb-4 text-sm text-mist">Een bestand met al je gegevens, projecten, offertes, afspraken en berichten.</p>
              <a href="/api/account/export" className={buttonClass("outline", "sm")}>
                Download (JSON)
              </a>
            </div>
            <div>
              <h3 className="text-xl">Gegevens laten verwijderen</h3>
              <p className="mt-2 mb-4 text-sm text-mist">
                Ik verwijder je account, berichten en foto&apos;s. Facturen moet ik wettelijk 7 jaar bewaren.
              </p>
              <DeletionForm pending={Boolean(deletion)} />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
