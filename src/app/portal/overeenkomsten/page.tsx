import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/ui/card";
import { AgreementStatusBadge } from "@/components/ui/status";
import { formatDate } from "@/lib/format";
import { getMyProjects } from "@/lib/portal";
import type { Agreement } from "@/lib/types";

export const metadata = { title: "Overeenkomsten" };

export default async function OvereenkomstenPage() {
  const { supabase, projects } = await getMyProjects();
  const { data } = await supabase.from("agreements").select("*").order("created_at", { ascending: false });
  const agreements = (data ?? []) as Agreement[];

  return (
    <>
      <PageHeader eyebrow="Overeenkomsten" title="Je overeenkomsten">
        Na het accepteren van een offerte staat hier je overeenkomst klaar om digitaal te ondertekenen.
      </PageHeader>
      {agreements.length === 0 ? (
        <EmptyState title="Nog geen overeenkomsten">Accepteer eerst een offerte, dan maak ik automatisch de overeenkomst aan.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {agreements.map((a) => (
            <li key={a.id}>
              <Link href={`/portal/overeenkomsten/${a.id}`} className="flex flex-col gap-3 rounded-2xl border border-ink-700/70 bg-ink-900/60 p-5 hover:border-ink-600 md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-bone">{a.title}</p>
                  <p className="mt-1 text-xs text-mist">
                    {projects.find((p) => p.id === a.project_id)?.title} · {a.signed_at ? `ondertekend ${formatDate(a.signed_at)}` : `aangemaakt ${formatDate(a.created_at)}`}
                  </p>
                </div>
                <AgreementStatusBadge status={a.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
