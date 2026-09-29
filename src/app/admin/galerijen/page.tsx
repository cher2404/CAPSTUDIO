import Link from "next/link";
import { createGallery } from "../_actions/galleries";
import { Badge, Card, PageHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Gallery } from "@/lib/types";

export const metadata = { title: "Galerijen" };

export default async function AdminGalleriesPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, { data: projects }] = await Promise.all([
    supabase.from("galleries").select("*, projects(title, clients(full_name, email)), files(count)").order("created_at", { ascending: false }),
    supabase.from("projects").select("id, title, clients(full_name, email)").order("created_at", { ascending: false }),
  ]);
  const galleries = (data ?? []) as (Gallery & { projects: { title: string; clients: { full_name: string | null; email: string } }; files: { count: number }[] })[];

  return (
    <>
      <PageHeader eyebrow="Oplevering" title="Galerijen" />
      <Card className="mb-8">
        <h2 className="mb-4 text-xl">Nieuwe galerij</h2>
        <form action={createGallery} className="grid gap-3 md:grid-cols-[1.3fr_1fr_160px_auto] md:items-end">
          <Field label="Project / klant">
            <Select name="project_id" required>
              {((projects ?? []) as unknown as { id: string; title: string; clients: { full_name: string | null; email: string } }[]).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.clients.full_name ?? p.clients.email} · {p.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Titel">
            <Input name="title" placeholder="Gymshoot oktober" required />
          </Field>
          <Field label="Shootdatum">
            <Input name="shoot_date" type="date" />
          </Field>
          <SubmitButton>Aanmaken</SubmitButton>
        </form>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {galleries.map((g) => (
          <Link key={g.id} href={`/admin/galerijen/${g.id}`}>
            <Card className="hover:border-ink-600">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-bone">{g.title}</p>
                  <p className="mt-1 text-xs text-mist">
                    {g.projects.clients.full_name ?? g.projects.clients.email} · {g.files[0]?.count ?? 0} bestanden
                    {g.shoot_date && ` · ${formatDate(g.shoot_date)}`}
                  </p>
                </div>
                <Badge tone={g.published ? "good" : "neutral"}>{g.published ? "Online" : "Concept"}</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
