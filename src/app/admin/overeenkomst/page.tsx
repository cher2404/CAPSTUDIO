import { AgreementEditor } from "./editor";
import { PageHeader } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { fill, md } from "@/lib/markdown";
import type { AgreementTemplate } from "@/lib/types";

export const metadata = { title: "Overeenkomst" };

export default async function AgreementTemplatePage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("agreement_templates").select("*").order("is_default", { ascending: false }).limit(1).maybeSingle();
  const template = data as AgreementTemplate | null;
  const preview = md(
    fill(template?.body ?? "", {
      klant_naam: "Sanne de Vries",
      klant_email: "sanne@voorbeeld.nl",
      bedrijf: "",
      project: "Gymshoot oktober",
      offerte_nummer: "CAP-2026-0012",
      totaal: "495,00",
      gebruiksrechten: template?.default_usage_rights ?? "",
      bewerkingsrondes: String(template?.default_revision_rounds ?? 1),
      datum: new Intl.DateTimeFormat("nl-NL").format(new Date()),
    }),
  );

  return (
    <>
      <PageHeader eyebrow="Sjabloon" title="Overeenkomst">
        Deze tekst wordt gebruikt voor elke nieuwe overeenkomst. Al ondertekende overeenkomsten veranderen niet mee.
      </PageHeader>
      <AgreementEditor template={template} previewHtml={preview} />
    </>
  );
}
