import Link from "next/link";
import { Card, PageHeader } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import type { EmailTemplate } from "@/lib/types";

export const metadata = { title: "E-mailsjablonen" };

export default async function EmailsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("email_templates").select("*").order("name");
  return (
    <>
      <PageHeader eyebrow="Communicatie" title="E-mailsjablonen">
        Alle automatische mails. Pas de tekst aan in je eigen toon; variabelen tussen {"{{ }}"} worden automatisch ingevuld.
      </PageHeader>
      <div className="grid gap-3 md:grid-cols-2">
        {((data ?? []) as EmailTemplate[]).map((t) => (
          <Link key={t.key} href={`/admin/emails/${t.key}`}>
            <Card className="h-full hover:border-ink-600">
              <p className="text-bone">{t.name}</p>
              <p className="mt-1 text-xs text-mist">{t.description}</p>
              <p className="mt-3 truncate text-xs text-bone-dim">“{t.subject}”</p>
              <p className="mt-1 text-[11px] text-mist-dim">Bijgewerkt {formatDateTime(t.updated_at)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
