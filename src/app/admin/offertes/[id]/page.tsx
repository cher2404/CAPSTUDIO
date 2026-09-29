import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteQuote, duplicateQuote, saveQuote, sendQuote, setQuoteStatus } from "../../_actions/quotes";
import { ActionForm, ConfirmButton } from "@/components/admin/forms";
import { ItemsEditor } from "@/components/admin/items-editor";
import { Card } from "@/components/ui/card";
import { Button, buttonClass } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { QuoteStatusBadge } from "@/components/ui/status";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import type { Quote, QuoteItem } from "@/lib/types";

export default async function QuoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("quotes").select("*, projects(id, title, clients(full_name, email))").eq("id", id).maybeSingle();
  if (!data) notFound();
  const quote = data as Quote & { projects: { id: string; title: string; clients: { full_name: string | null; email: string } } };
  const { data: items } = await supabase.from("quote_items").select("*").eq("quote_id", id).order("sort");
  const locked = quote.status === "geaccepteerd";

  return (
    <>
      <Link href={`/admin/projecten/${quote.projects.id}`} className="mb-6 inline-block text-sm text-mist hover:text-bone">
        ← {quote.projects.clients.full_name ?? quote.projects.clients.email} · {quote.projects.title}
      </Link>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Offerte {quote.number}</p>
          <h1 className="mt-3 text-4xl">{quote.title}</h1>
          <p className="mt-2 text-xs text-mist">
            {quote.sent_at && `Verstuurd ${formatDateTime(quote.sent_at)}`}
            {quote.accepted_at && ` · Geaccepteerd ${formatDateTime(quote.accepted_at)}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <QuoteStatusBadge status={quote.status} />
          <a href={`/api/pdf/quote/${id}`} target="_blank" className={buttonClass("outline", "sm")}>
            Pdf
          </a>
          <form action={duplicateQuote}>
            <input type="hidden" name="id" value={id} />
            <Button size="sm" variant="ghost">
              Dupliceren
            </Button>
          </form>
        </div>
      </div>

      <ActionForm action={saveQuote} className="space-y-5">
        <input type="hidden" name="id" value={id} />
        <fieldset disabled={locked} className="space-y-5">
          <Card className="grid gap-4 md:grid-cols-2">
            <Field label="Titel" className="md:col-span-2">
              <Input name="title" defaultValue={quote.title} required />
            </Field>
            <Field label="Introductie (markdown)" className="md:col-span-2">
              <Textarea name="intro" defaultValue={quote.intro ?? ""} rows={4} />
            </Field>
            <Field label="Geldig tot">
              <Input name="valid_until" type="date" defaultValue={quote.valid_until ?? ""} />
            </Field>
            <Field label="Bewerkingsrondes">
              <Input name="revision_rounds" type="number" min={0} defaultValue={quote.revision_rounds} />
            </Field>
            <Field label="Gebruiksrechten" className="md:col-span-2" hint="Komt ook in de overeenkomst.">
              <Textarea name="usage_rights" defaultValue={quote.usage_rights ?? ""} rows={2} className="min-h-16" />
            </Field>
          </Card>
          <Card>
            <h2 className="mb-4 text-2xl">Regels</h2>
            <ItemsEditor
              initial={((items ?? []) as QuoteItem[]).map((i) => ({ description: i.description, quantity: Number(i.quantity), unit_price: Number(i.unit_price) }))}
              vatRate={Number(quote.vat_rate)}
              onVatChange
            />
          </Card>
        </fieldset>
        {!locked && <SubmitButton pendingText="Opslaan…">Opslaan</SubmitButton>}
      </ActionForm>

      <Card className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl">Versturen</h2>
          <p className="text-sm text-mist">Sla eerst op. De klant krijgt een mail met een link naar de offerte in het portaal.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["concept", "verstuurd", "vraag"].includes(quote.status) && (
            <form action={sendQuote}>
              <input type="hidden" name="id" value={id} />
              <SubmitButton pendingText="Versturen…">{quote.status === "concept" ? "Verstuur naar klant" : "Opnieuw versturen"}</SubmitButton>
            </form>
          )}
          {quote.status !== "geaccepteerd" && quote.status !== "afgewezen" && (
            <form action={setQuoteStatus}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="status" value="afgewezen" />
              <Button variant="ghost">Markeer als afgewezen</Button>
            </form>
          )}
          {["concept", "afgewezen", "verlopen"].includes(quote.status) && (
            <form action={deleteQuote}>
              <input type="hidden" name="id" value={id} />
              <ConfirmButton className={buttonClass("danger")} message="Offerte verwijderen?">
                Verwijderen
              </ConfirmButton>
            </form>
          )}
        </div>
      </Card>
    </>
  );
}
