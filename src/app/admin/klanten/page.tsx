import Link from "next/link";
import { createClientWithProject } from "../_actions/crm";
import { ActionForm } from "@/components/admin/forms";
import { Card, PageHeader } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { ProjectStatusBadge, PaymentStatusBadge } from "@/components/ui/status";
import { requireAdmin } from "@/lib/auth";
import { formatDate, projectStatuses, projectStatusLabel } from "@/lib/format";
import type { Client, Project } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata = { title: "Klanten" };

export default async function KlantenPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; nieuw?: string }> }) {
  const { status, q, nieuw } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("clients").select("*, projects(*)").order("created_at", { ascending: false });
  let clients = (data ?? []) as (Client & { projects: Project[] })[];

  if (q) {
    const needle = q.toLowerCase();
    clients = clients.filter((c) => [c.full_name, c.email, c.company, ...c.projects.map((p) => p.title)].some((v) => v?.toLowerCase().includes(needle)));
  }
  if (status) clients = clients.filter((c) => c.projects.some((p) => p.status === status));

  return (
    <>
      <PageHeader eyebrow="CRM" title="Klanten en projecten" />

      <details open={Boolean(nieuw)} className="mb-8 rounded-2xl border border-ink-700/70 bg-ink-900/60">
        <summary className="cursor-pointer px-6 py-4 text-bone">+ Nieuwe klant of project</summary>
        <ActionForm action={createClientWithProject} className="border-t border-ink-700/70 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="E-mail (bestaande klant? dan wordt het project daaraan gekoppeld)">
              <Input name="email" type="email" required />
            </Field>
            <Field label="Naam">
              <Input name="full_name" />
            </Field>
            <Field label="Telefoon">
              <Input name="phone" />
            </Field>
            <Field label="Bedrijf">
              <Input name="company" />
            </Field>
            <Field label="Projecttitel (optioneel)">
              <Input name="project_title" placeholder="Bijv. Gymshoot oktober" />
            </Field>
            <Field label="Soort shoot">
              <Input name="shoot_type" placeholder="Mini shoot" />
            </Field>
          </div>
          <Field label="Omschrijving" className="mt-4">
            <Textarea name="description" rows={3} className="min-h-20" />
          </Field>
          <SubmitButton className="mt-4">Aanmaken</SubmitButton>
        </ActionForm>
      </details>

      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Zoek op naam, e-mail of project…" className="field max-w-xs py-2" />
        {status && <input type="hidden" name="status" value={status} />}
      </form>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/klanten" className={cn("rounded-full border px-3 py-1 text-xs", !status ? "border-bone bg-bone text-ink-950" : "border-ink-600 text-mist")}>
          Alle
        </Link>
        {projectStatuses.map((s) => (
          <Link key={s} href={`/admin/klanten?status=${s}`} className={cn("rounded-full border px-3 py-1 text-xs", status === s ? "border-bone bg-bone text-ink-950" : "border-ink-600 text-mist")}>
            {projectStatusLabel[s]}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {clients.map((c) => (
          <Card key={c.id} className="p-0 md:p-0">
            <Link href={`/admin/klanten/${c.id}`} className="flex flex-col gap-1 px-5 pt-4 md:flex-row md:items-baseline md:justify-between">
              <span className="text-bone">
                {c.full_name ?? c.email} {c.company && <span className="text-mist">· {c.company}</span>}
              </span>
              <span className="text-xs text-mist">
                {c.email} · klant sinds {formatDate(c.created_at, { month: "short" })} {!c.user_id && "· nog niet ingelogd"}
              </span>
            </Link>
            <ul className="mt-3 divide-y divide-ink-700/60 border-t border-ink-700/60">
              {c.projects.length === 0 && <li className="px-5 py-3 text-xs text-mist">Geen projecten</li>}
              {c.projects
                .filter((p) => !status || p.status === status)
                .map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/projecten/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-ink-850">
                      <span className="truncate">{p.title}</span>
                      <span className="flex shrink-0 gap-2">
                        <PaymentStatusBadge status={p.payment_status} />
                        <ProjectStatusBadge status={p.status} />
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </Card>
        ))}
        {clients.length === 0 && <p className="py-10 text-center text-sm text-mist">Geen klanten gevonden.</p>}
      </div>
    </>
  );
}
