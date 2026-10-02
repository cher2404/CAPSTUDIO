import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState, PageHeader } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/ui/status";
import { LinkButton } from "@/components/ui/button";
import { getMyProjects } from "@/lib/portal";
import type { Message } from "@/lib/types";

export const metadata = { title: "Berichten" };

export default async function BerichtenPage() {
  const { supabase, user, projects } = await getMyProjects();
  if (projects.length === 1) redirect(`/portal/berichten/${projects[0]!.id}`);

  const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
  const messages = (data ?? []) as Message[];

  return (
    <>
      <PageHeader eyebrow="Berichten" title="Berichten per project">
        Stel je vragen, deel ideeën of stuur voorbeelden. Ik krijg direct een seintje.
      </PageHeader>
      {projects.length === 0 ? (
        <EmptyState title="Nog geen projecten" action={<LinkButton href="/contact" size="sm">Start een project</LinkButton>}>
          Berichten horen bij een project. Zodra je een project start, kun je hier chatten.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => {
            const last = messages.find((m) => m.project_id === p.id);
            const unread = messages.filter((m) => m.project_id === p.id && !m.read_at && m.sender_id !== user.id).length;
            return (
              <li key={p.id}>
                <Link href={`/portal/berichten/${p.id}`} className="flex items-center gap-4 rounded-2xl border border-ink-700/70 bg-ink-900/60 p-5 hover:border-ink-600">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="truncate text-bone">{p.title}</p>
                      <ProjectStatusBadge status={p.status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-mist">{last?.body ?? "Nog geen berichten"}</p>
                  </div>
                  {unread > 0 && <span className="rounded-full bg-ember px-2 py-0.5 text-xs font-semibold text-ink-950">{unread}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
