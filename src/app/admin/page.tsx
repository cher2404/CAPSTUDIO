import Link from "next/link";
import { Card, PageHeader } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ProjectStatusBadge, QuoteStatusBadge } from "@/components/ui/status";
import { requireAdmin } from "@/lib/auth";
import { euro, formatDateTime, projectStatuses, projectStatusLabel } from "@/lib/format";
import type { Appointment, Message, Project, Quote } from "@/lib/types";

export const metadata = { title: "Overzicht" };

type ProjectRow = Project & { clients: { full_name: string | null; email: string } };

export default async function AdminDashboard() {
  const { supabase, user } = await requireAdmin();
  const [projects, appts, quotes, messages, agreements] = await Promise.all([
    supabase.from("projects").select("*, clients(full_name, email)").order("updated_at", { ascending: false }),
    supabase.from("appointments").select("*").eq("status", "bevestigd").gte("starts_at", new Date().toISOString()).order("starts_at").limit(6),
    supabase.from("quotes").select("*").in("status", ["verstuurd", "vraag"]).order("sent_at", { ascending: false }),
    supabase.from("messages").select("*").is("read_at", null).neq("sender_id", user.id).order("created_at", { ascending: false }).limit(8),
    supabase.from("agreements").select("id", { count: "exact", head: true }).eq("status", "te_ondertekenen"),
  ]);
  const all = (projects.data ?? []) as ProjectRow[];
  const byId = new Map(all.map((p) => [p.id, p]));
  const who = (projectId: string) => {
    const p = byId.get(projectId);
    return p ? `${p.clients.full_name ?? p.clients.email} · ${p.title}` : "";
  };
  const openQuotes = (quotes.data ?? []) as Quote[];
  const pipelineValue = openQuotes.reduce((s, q) => s + Number(q.total), 0);

  return (
    <>
      <PageHeader eyebrow="Admin" title="Overzicht" action={<LinkButton href="/admin/klanten?nieuw=1">Nieuwe klant</LinkButton>} />

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-6">
        {projectStatuses.map((s) => (
          <Link key={s} href={`/admin/klanten?status=${s}`} className="rounded-2xl border border-ink-700/70 bg-ink-900/60 p-4 hover:border-ink-600">
            <p className="font-display text-4xl text-bone">{all.filter((p) => p.status === s).length}</p>
            <p className="mt-1 text-xs text-mist">{projectStatusLabel[s]}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-2xl">Aankomende shoots</h2>
          {(appts.data ?? []).length ? (
            <ul className="divide-y divide-ink-700/70">
              {((appts.data ?? []) as Appointment[]).map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/projecten/${a.project_id}`} className="flex justify-between gap-4 py-3 text-sm hover:text-bone">
                    <span className="truncate text-bone-dim">{who(a.project_id)}</span>
                    <span className="shrink-0 text-mist">{formatDateTime(a.starts_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mist">Geen geplande shoots.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-2xl">Ongelezen berichten</h2>
          {(messages.data ?? []).length ? (
            <ul className="space-y-2">
              {((messages.data ?? []) as Message[]).map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/projecten/${m.project_id}#berichten`} className="block rounded-xl bg-ink-850 p-3 hover:bg-ink-800">
                    <p className="truncate text-xs text-ember-soft">{who(m.project_id)}</p>
                    <p className="mt-1 line-clamp-2 text-sm">{m.body}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mist">Alles gelezen.</p>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-2xl">Openstaande offertes</h2>
            <span className="text-sm text-mist">{euro(pipelineValue)}</span>
          </div>
          {openQuotes.length ? (
            <ul className="divide-y divide-ink-700/70">
              {openQuotes.map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/offertes/${q.id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate text-bone-dim">{who(q.project_id)}</span>
                      <span className="text-xs text-mist">
                        {q.number} · {euro(q.total)}
                      </span>
                    </span>
                    <QuoteStatusBadge status={q.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mist">Geen openstaande offertes.</p>
          )}
          {!!agreements.count && <p className="mt-4 text-xs text-mist">{agreements.count} overeenkomst(en) wachten op ondertekening door de klant.</p>}
        </Card>

        <Card>
          <h2 className="mb-4 text-2xl">Recent bijgewerkt</h2>
          <ul className="divide-y divide-ink-700/70">
            {all.slice(0, 8).map((p) => (
              <li key={p.id}>
                <Link href={`/admin/projecten/${p.id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate text-bone-dim">{p.title}</span>
                    <span className="text-xs text-mist">{p.clients.full_name ?? p.clients.email}</span>
                  </span>
                  <ProjectStatusBadge status={p.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
