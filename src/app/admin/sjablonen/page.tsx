import Link from "next/link";
import { QuoteTemplateForm } from "@/components/admin/quote-template-form";
import { Card, PageHeader } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { euro } from "@/lib/format";
import type { QuoteTemplate } from "@/lib/types";

export const metadata = { title: "Offertesjablonen" };

export default async function TemplatesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("quote_templates").select("*").order("name");
  const templates = (data ?? []) as QuoteTemplate[];

  return (
    <>
      <PageHeader eyebrow="Sjablonen" title="Offertesjablonen">
        Start elke offerte vanuit een sjabloon en pas hem daarna per klant aan. Prijzen zijn excl. btw.
      </PageHeader>
      <div className="mb-10 grid gap-3 md:grid-cols-2">
        {templates.map((t) => (
          <Link key={t.id} href={`/admin/sjablonen/${t.id}`}>
            <Card className="hover:border-ink-600">
              <p className="text-bone">{t.name}</p>
              <p className="mt-1 text-xs text-mist">
                {t.items.length} regels · {euro(t.items.reduce((s, i) => s + i.quantity * i.unit_price, 0))} excl. btw · {t.revision_rounds} rondes
              </p>
            </Card>
          </Link>
        ))}
      </div>
      <details>
        <summary className="mb-4 cursor-pointer text-bone">+ Nieuw sjabloon</summary>
        <QuoteTemplateForm />
      </details>
    </>
  );
}
