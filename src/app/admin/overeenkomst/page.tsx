import Link from "next/link";
import { AgreementEditor } from "./editor";
import { deleteAgreementTemplate } from "../_actions/quotes";
import { ConfirmButton } from "@/components/admin/forms";
import { PageHeader } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { disciplineLabel } from "@/lib/categories";
import { fill, md } from "@/lib/markdown";
import type { AgreementTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata = { title: "Overeenkomsten" };

export default async function AgreementTemplatePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("agreement_templates").select("*").order("is_default", { ascending: false }).order("name");
  const templates = (data ?? []) as AgreementTemplate[];
  const isNew = id === "nieuw";
  const template = isNew ? null : (templates.find((t) => t.id === id) ?? templates[0] ?? null);

  const preview = md(
    fill(template?.body ?? "", {
      klant_naam: "Sanne de Vries",
      klant_email: "sanne@voorbeeld.nl",
      bedrijf: "",
      project: "Voorbeeldproject",
      offerte_nummer: "CAP-2026-0012",
      totaal: "495,00",
      gebruiksrechten: template?.default_usage_rights ?? "",
      bewerkingsrondes: String(template?.default_revision_rounds ?? 1),
      datum: new Intl.DateTimeFormat("nl-NL").format(new Date()),
    }),
  );

  return (
    <>
      <PageHeader eyebrow="Sjablonen" title="Overeenkomsten">
        Per offerte kies je welk sjabloon wordt gebruikt. Offertes vanuit een pakket krijgen automatisch het sjabloon van die discipline. Al
        ondertekende overeenkomsten veranderen niet mee.
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-2">
        {templates.map((t) => (
          <Link
            key={t.id}
            href={`/admin/overeenkomst?id=${t.id}`}
            className={cn(
              "border px-4 py-2 text-sm transition-colors",
              template?.id === t.id ? "border-bone bg-bone text-ink-950" : "border-ink-600 text-bone-dim hover:border-bone/60",
            )}
          >
            {t.name}
            <span className="ml-2 font-mono text-[10px] uppercase opacity-60">
              {disciplineLabel[t.category]}
              {t.is_default && " · standaard"}
            </span>
          </Link>
        ))}
        <Link
          href="/admin/overeenkomst?id=nieuw"
          className={cn("border border-dashed px-4 py-2 text-sm", isNew ? "border-bone text-bone" : "border-ink-600 text-mist hover:text-bone")}
        >
          + Nieuw sjabloon
        </Link>
      </div>

      <AgreementEditor key={template?.id ?? "nieuw"} template={template} previewHtml={preview} />

      {template && !template.is_default && (
        <form action={deleteAgreementTemplate} className="mt-6">
          <input type="hidden" name="id" value={template.id} />
          <ConfirmButton className="text-xs text-rose" message="Dit sjabloon verwijderen?">
            Sjabloon verwijderen
          </ConfirmButton>
        </form>
      )}
    </>
  );
}
