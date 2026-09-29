import { createHash } from "node:crypto";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SignForm } from "@/components/portal/sign-form";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AgreementStatusBadge } from "@/components/ui/status";
import { requireClient } from "@/lib/auth";
import { md } from "@/lib/markdown";
import type { Agreement, Signature } from "@/lib/types";

export const metadata = { title: "Overeenkomst" };

export default async function AgreementPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ nieuw?: string }> }) {
  const [{ id }, { nieuw }] = await Promise.all([params, searchParams]);
  const { supabase, client } = await requireClient();
  const { data } = await supabase.from("agreements").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const agreement = data as Agreement;
  const { data: sigs } = await supabase.from("signatures").select("*").eq("agreement_id", id).order("signed_at");
  const signatures = (sigs ?? []) as Signature[];
  const hash = createHash("sha256").update(agreement.body, "utf8").digest("hex");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/portal/overeenkomsten" className="text-sm text-mist hover:text-bone">
          ← Alle overeenkomsten
        </Link>
        <div className="flex items-center gap-3">
          <AgreementStatusBadge status={agreement.status} />
          <a href={`/api/pdf/agreement/${agreement.id}`} target="_blank" className={buttonClass("outline", "sm")}>
            Download pdf
          </a>
        </div>
      </div>

      {nieuw && agreement.status === "te_ondertekenen" && (
        <p className="rounded-2xl border border-moss/30 bg-moss/5 p-5 text-sm text-bone-dim">
          Thanks voor je akkoord op de offerte! Lees de overeenkomst hieronder rustig door en onderteken onderaan.
        </p>
      )}

      <Card className="md:p-10">
        <div className="grid gap-4 border-b border-ink-700/70 pb-6 text-sm md:grid-cols-2">
          <div>
            <p className="eyebrow mb-1">Gebruiksrechten</p>
            <p className="text-bone-dim">{agreement.usage_rights}</p>
          </div>
          <div>
            <p className="eyebrow mb-1">Bewerkingsrondes</p>
            <p className="text-bone-dim">{agreement.revision_rounds}</p>
          </div>
        </div>
        <article className="prose-cap mt-6 max-w-3xl" dangerouslySetInnerHTML={{ __html: md(agreement.body) }} />
      </Card>

      {agreement.status === "te_ondertekenen" ? (
        <Card id="ondertekenen" className="border-ember/40">
          <h2 className="mb-5 text-3xl">Digitaal ondertekenen</h2>
          <SignForm agreementId={agreement.id} hash={hash} defaultName={client.full_name ?? ""} />
        </Card>
      ) : (
        signatures.length > 0 && (
          <Card>
            <h2 className="mb-4 text-2xl">Ondertekening</h2>
            <ul className="space-y-3 text-sm">
              {signatures.map((s) => (
                <li key={s.id}>
                  <p className="serif text-3xl text-bone">{s.signer_name}</p>
                  <p className="text-xs text-mist">
                    {new Intl.DateTimeFormat("nl-NL", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(new Date(s.signed_at))} · IP{" "}
                    {s.ip_address ?? "onbekend"}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        )
      )}
    </div>
  );
}
