import Link from "next/link";
import { notFound } from "next/navigation";
import { addClientNote, createProject, deleteClientNote, updateClient } from "../../_actions/crm";
import { ActionForm } from "@/components/admin/forms";
import { Card, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { ProjectStatusBadge } from "@/components/ui/status";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Client, Project } from "@/lib/types";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data }, { data: notes }] = await Promise.all([
    supabase.from("clients").select("*, projects(*)").eq("id", id).maybeSingle(),
    supabase.from("client_notes").select("*").eq("client_id", id).order("created_at", { ascending: false }),
  ]);
  if (!data) notFound();
  const client = data as Client & { projects: Project[] };

  return (
    <>
      <Link href="/admin/klanten" className="mb-6 inline-block text-sm text-mist hover:text-bone">
        ← Alle klanten
      </Link>
      <PageHeader eyebrow="Klant" title={client.full_name ?? client.email}>
        {client.user_id ? "Heeft een portaalaccount." : "Heeft nog niet ingelogd op het portaal."}
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl">Projecten</h2>
            </div>
            <ul className="divide-y divide-ink-700/70">
              {client.projects.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/projecten/${p.id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span>
                      <span className="block text-bone">{p.title}</span>
                      <span className="text-xs text-mist">aangemaakt {formatDate(p.created_at)}</span>
                    </span>
                    <ProjectStatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
            <form action={createProject} className="mt-4 flex gap-2">
              <input type="hidden" name="client_id" value={client.id} />
              <Input name="title" placeholder="Nieuw project…" required />
              <Button variant="subtle">Toevoegen</Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-4 text-2xl">Gegevens</h2>
            <ActionForm action={updateClient}>
              <input type="hidden" name="id" value={client.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Naam">
                  <Input name="full_name" defaultValue={client.full_name ?? ""} />
                </Field>
                <Field label="E-mail">
                  <Input name="email" type="email" defaultValue={client.email} required />
                </Field>
                <Field label="Telefoon">
                  <Input name="phone" defaultValue={client.phone ?? ""} />
                </Field>
                <Field label="Bedrijf">
                  <Input name="company" defaultValue={client.company ?? ""} />
                </Field>
                <Field label="Instagram">
                  <Input name="instagram" defaultValue={client.instagram ?? ""} />
                </Field>
                <Field label="Woonplaats">
                  <Input name="city" defaultValue={client.city ?? ""} />
                </Field>
              </div>
              <SubmitButton className="mt-4">Opslaan</SubmitButton>
            </ActionForm>
          </Card>
        </div>

        <Card>
          <h2 className="mb-1 text-2xl">Notities</h2>
          <p className="mb-4 text-xs text-mist">Alleen zichtbaar voor jou.</p>
          <form action={addClientNote} className="space-y-2">
            <input type="hidden" name="client_id" value={client.id} />
            <Textarea name="body" rows={3} className="min-h-20" placeholder="Bijv. voorkeur voor ochtendshoots, traint bij…" required />
            <SubmitButton size="sm" variant="subtle">
              Notitie toevoegen
            </SubmitButton>
          </form>
          <ul className="mt-5 space-y-3">
            {(notes ?? []).map((n) => (
              <li key={n.id} className="rounded-xl bg-ink-850 p-3 text-sm">
                <p className="whitespace-pre-wrap">{n.body}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-mist-dim">
                  {formatDateTime(n.created_at)}
                  <form action={deleteClientNote}>
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="client_id" value={client.id} />
                    <button className="hover:text-rose">Verwijder</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
