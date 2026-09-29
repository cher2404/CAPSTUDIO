import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteQuoteTemplate } from "../../_actions/quotes";
import { ConfirmButton } from "@/components/admin/forms";
import { QuoteTemplateForm } from "@/components/admin/quote-template-form";
import { PageHeader } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import type { QuoteTemplate } from "@/lib/types";

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("quote_templates").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const t = data as QuoteTemplate;
  return (
    <>
      <Link href="/admin/sjablonen" className="mb-6 inline-block text-sm text-mist hover:text-bone">
        ← Alle sjablonen
      </Link>
      <PageHeader
        eyebrow="Sjabloon"
        title={t.name}
        action={
          <form action={deleteQuoteTemplate}>
            <input type="hidden" name="id" value={id} />
            <ConfirmButton className={buttonClass("danger", "sm")} message="Sjabloon verwijderen?">
              Verwijderen
            </ConfirmButton>
          </form>
        }
      />
      <QuoteTemplateForm template={t} />
    </>
  );
}
