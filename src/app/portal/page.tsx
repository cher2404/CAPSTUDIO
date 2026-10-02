import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ProjectStatusBadge, QuoteStatusBadge } from "@/components/ui/status";
import { euro, firstName, formatDate, formatDay, projectStatuses, projectStatusLabel, timeRange } from "@/lib/format";
import { getMyProjects } from "@/lib/portal";
import type { Agreement, Appointment, Gallery, Message, Quote } from "@/lib/types";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const { supabase, client, user, projects } = await getMyProjects();

  const [appts, quotes, agreements, messages, galleries] = await Promise.all([
    supabase.from("appointments").select("*").eq("status", "bevestigd").gte("starts_at", new Date().toISOString()).order("starts_at").limit(3),
    supabase.from("quotes").select("*").in("status", ["verstuurd", "vraag"]).order("created_at", { ascending: false }),
    supabase.from("agreements").select("*").eq("status", "te_ondertekenen"),
    supabase.from("messages").select("*").is("read_at", null).neq("sender_id", user.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("galleries").select("*").order("published_at", { ascending: false }).limit(2),
  ]);

  const upcoming = (appts.data ?? []) as Appointment[];
  const openQuotes = (quotes.data ?? []) as Quote[];
  const toSign = (agreements.data ?? []) as Agreement[];
  const unread = (messages.data ?? []) as Message[];
  const newGalleries = (galleries.data ?? []) as Gallery[];
  const projectTitle = (id: string) => projects.find((p) => p.id === id)?.title ?? "";

  const todo = [
    ...toSign.map((a) => ({ href: `/portal/overeenkomsten/${a.id}`, label: `Onderteken ${a.title}`, tone: "warm" as const })),
    ...openQuotes.map((q) => ({ href: `/portal/offertes/${q.id}`, label: `Bekijk offerte ${q.number}`, tone: "warm" as const })),
    ...projects
      .filter((p) => p.status === "akkoord" && !upcoming.some((a) => a.project_id === p.id))
      .map((p) => ({ href: `/portal/afspraken?project=${p.id}`, label: `Kies een moment voor ${p.title}`, tone: "cool" as const })),
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Dashboard</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Hoi {firstName(client.full_name) || "daar"} ✦</h1>
        <p className="mt-2 text-mist">
          {todo.length ? `Er ${todo.length === 1 ? "staat 1 ding" : `staan ${todo.length} dingen`} voor je klaar.` : "Alles is bijgewerkt. Lekker bezig."}
        </p>
      </div>

      {todo.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {todo.map((t) => (
            <Link
              key={t.href + t.label}
              href={t.href}
              className={cn(
                "group flex items-center justify-between rounded-2xl border px-5 py-4 transition-colors",
                t.tone === "warm" ? "border-ember/30 bg-ember/5 hover:bg-ember/10" : "border-tide/30 bg-tide/5 hover:bg-tide/10",
              )}
            >
              <span className="text-sm text-bone">{t.label}</span>
              <span className="text-mist transition-transform group-hover:translate-x-1">→</span>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl">Aankomende afspraken</h2>
            <Link href="/portal/afspraken" className="text-xs text-mist hover:text-bone">
              Alles →
            </Link>
          </div>
          {upcoming.length ? (
            <ul className="space-y-3">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-center gap-4 rounded-xl bg-ink-850 p-4">
                  <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border border-ink-700 bg-ink-900">
                    <span className="font-display text-2xl leading-none text-bone">{formatDate(a.starts_at, { day: "numeric", month: undefined, year: undefined })}</span>
                    <span className="text-[10px] tracking-wider text-mist uppercase">{formatDate(a.starts_at, { month: "short", day: undefined, year: undefined })}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-bone first-letter:uppercase">{formatDay(a.starts_at)}</p>
                    <p className="text-sm text-mist">
                      {timeRange(a.starts_at, a.ends_at)} · {projectTitle(a.project_id)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mist">Nog niets gepland.</p>
          )}
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl">Nieuwe berichten</h2>
            <Link href="/portal/berichten" className="text-xs text-mist hover:text-bone">
              Alles →
            </Link>
          </div>
          {unread.length ? (
            <ul className="space-y-3">
              {unread.map((m) => (
                <li key={m.id}>
                  <Link href={`/portal/berichten/${m.project_id}`} className="block rounded-xl bg-ink-850 p-3 hover:bg-ink-800">
                    <p className="text-xs text-ember-soft">{projectTitle(m.project_id)}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-bone-dim">{m.body}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mist">Geen ongelezen berichten.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="mb-5 text-2xl">Openstaande offertes en documenten</h2>
          {openQuotes.length + toSign.length ? (
            <ul className="divide-y divide-ink-700/70">
              {openQuotes.map((q) => (
                <li key={q.id}>
                  <Link href={`/portal/offertes/${q.id}`} className="flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-bone">{q.title}</span>
                      <span className="text-xs text-mist">
                        {q.number} · {euro(q.total)}
                      </span>
                    </span>
                    <QuoteStatusBadge status={q.status} />
                  </Link>
                </li>
              ))}
              {toSign.map((a) => (
                <li key={a.id}>
                  <Link href={`/portal/overeenkomsten/${a.id}`} className="flex items-center justify-between gap-3 py-3">
                    <span className="truncate text-sm text-bone">{a.title}</span>
                    <Badge tone="warm">Te ondertekenen</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mist">Niets openstaand.</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-5 text-2xl">Mijn projecten</h2>
          {projects.length ? (
            <ul className="space-y-5">
              {projects.map((p) => {
                const step = projectStatuses.indexOf(p.status);
                return (
                  <li key={p.id}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm text-bone">{p.title}</span>
                      <ProjectStatusBadge status={p.status} />
                    </div>
                    <div className="mt-3 flex gap-1" aria-label={`Status: ${projectStatusLabel[p.status]}`}>
                      {projectStatuses.map((s, i) => (
                        <span key={s} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-ember" : "bg-ink-700")} title={projectStatusLabel[s]} />
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              title="Nog geen project"
              action={
                <LinkButton href="/contact" size="sm">
                  Start een project
                </LinkButton>
              }
            >
              Zodra je een project start, zie je hier de voortgang.
            </EmptyState>
          )}
        </Card>
      </div>

      {newGalleries.length > 0 && (
        <Card className="flex flex-col items-start justify-between gap-4 border-moss/30 bg-moss/5 md:flex-row md:items-center">
          <div>
            <p className="eyebrow text-moss">Je foto&apos;s staan klaar</p>
            <p className="mt-2 font-display text-2xl text-bone">{newGalleries[0]!.title}</p>
          </div>
          <LinkButton href={`/portal/galerijen/${newGalleries[0]!.id}`}>Bekijk galerij</LinkButton>
        </Card>
      )}
    </div>
  );
}
