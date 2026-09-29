import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteInvoice, deleteProject, updateInvoiceStatus, updateProject } from "../../_actions/crm";
import { createGallery } from "../../_actions/galleries";
import { adminSignAgreement, createQuote, revokeAgreement } from "../../_actions/quotes";
import { ActionForm, ConfirmButton } from "@/components/admin/forms";
import { InvoiceForm } from "@/components/admin/invoice-form";
import { CancelAppointmentButton } from "@/components/portal/cancel-button";
import { MessageThread } from "@/components/portal/message-thread";
import { SlotPicker } from "@/components/portal/slot-picker";
import { Badge, Card } from "@/components/ui/card";
import { Button, buttonClass } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { AgreementStatusBadge, PaymentStatusBadge, ProjectStatusBadge, QuoteStatusBadge } from "@/components/ui/status";
import { requireAdmin } from "@/lib/auth";
import { euro, formatDate, formatDateTime, paymentStatusLabel, projectStatuses, projectStatusLabel, timeRange } from "@/lib/format";
import type { Agreement, Appointment, Client, Gallery, Invoice, Message, Project, Quote, QuoteTemplate, Signature, Slot } from "@/lib/types";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireAdmin();
  const { data } = await supabase.from("projects").select("*, clients(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const project = data as Project & { clients: Client };
  const client = project.clients;

  const [quotes, agreements, signatures, appts, galleries, invoices, messages, templates, packages, slots] = await Promise.all([
    supabase.from("quotes").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("agreements").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("signatures").select("*, agreements!inner(project_id)").eq("agreements.project_id", id),
    supabase.from("appointments").select("*").eq("project_id", id).order("starts_at", { ascending: false }),
    supabase.from("galleries").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("messages").select("*").eq("project_id", id).order("created_at"),
    supabase.from("quote_templates").select("id, name").order("name"),
    supabase.from("packages").select("id, name").order("sort"),
    supabase.rpc("open_slots", { p_from: new Date().toISOString() }),
  ]);
  await supabase.rpc("mark_messages_read", { p_project_id: id });

  const sigs = (signatures.data ?? []) as Signature[];

  return (
    <>
      <Link href={`/admin/klanten/${client.id}`} className="mb-6 inline-block text-sm text-mist hover:text-bone">
        ← {client.full_name ?? client.email}
      </Link>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Project</p>
          <h1 className="mt-3 text-4xl md:text-5xl">{project.title}</h1>
          <p className="mt-2 text-sm text-mist">
            {client.full_name} · <a href={`mailto:${client.email}`} className="hover:text-bone">{client.email}</a>
            {client.phone && <> · {client.phone}</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ProjectStatusBadge status={project.status} />
          <PaymentStatusBadge status={project.payment_status} />
          <Badge tone={project.portfolio_consent ? "good" : "neutral"}>{project.portfolio_consent ? "Portfolio: toestemming" : "Portfolio: geen toestemming"}</Badge>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          {/* Offertes */}
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl">Offertes</h2>
              <form action={createQuote} className="flex gap-2">
                <input type="hidden" name="project_id" value={id} />
                <Select name="template_id" className="py-2 text-sm">
                  <optgroup label="Pakketten">
                    {((packages.data ?? []) as { id: string; name: string }[]).map((p) => (
                      <option key={p.id} value={`pkg:${p.id}`}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Sjablonen">
                    {((templates.data ?? []) as Pick<QuoteTemplate, "id" | "name">[]).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                  <option value="">Lege offerte</option>
                </Select>
                <Button size="sm" variant="subtle">
                  + Offerte
                </Button>
              </form>
            </div>
            <ul className="divide-y divide-ink-700/70">
              {((quotes.data ?? []) as Quote[]).map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/offertes/${q.id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span>
                      <span className="block text-bone">
                        {q.number} · {q.title}
                      </span>
                      <span className="text-xs text-mist">
                        {euro(q.total)} · {q.sent_at ? `verstuurd ${formatDate(q.sent_at)}` : "nog niet verstuurd"}
                      </span>
                    </span>
                    <QuoteStatusBadge status={q.status} />
                  </Link>
                </li>
              ))}
              {!quotes.data?.length && <li className="py-2 text-sm text-mist">Nog geen offertes.</li>}
            </ul>
          </Card>

          {/* Overeenkomsten */}
          <Card>
            <h2 className="mb-4 text-2xl">Overeenkomsten</h2>
            <ul className="divide-y divide-ink-700/70">
              {((agreements.data ?? []) as Agreement[]).map((a) => {
                const own = sigs.filter((s) => s.agreement_id === a.id);
                const adminSigned = own.some((s) => s.signer_role === "admin");
                const clientSig = own.find((s) => s.signer_role === "client");
                return (
                  <li key={a.id} className="flex flex-col gap-2 py-3 text-sm md:flex-row md:items-center md:justify-between">
                    <span>
                      <span className="block text-bone">{a.title}</span>
                      <span className="text-xs text-mist">
                        {clientSig ? `Ondertekend door ${clientSig.signer_name} op ${formatDateTime(clientSig.signed_at)} (IP ${clientSig.ip_address ?? "?"})` : `Aangemaakt ${formatDate(a.created_at)}`}
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <AgreementStatusBadge status={a.status} />
                      <a href={`/api/pdf/agreement/${a.id}`} target="_blank" className="text-xs text-ember-soft">
                        Pdf
                      </a>
                      {!adminSigned && a.status !== "ingetrokken" && (
                        <form action={adminSignAgreement}>
                          <input type="hidden" name="id" value={a.id} />
                          <button className="text-xs text-bone-dim hover:text-bone">Tegenondertekenen</button>
                        </form>
                      )}
                      {a.status === "te_ondertekenen" && (
                        <form action={revokeAgreement}>
                          <input type="hidden" name="id" value={a.id} />
                          <ConfirmButton className="text-xs text-rose" message="Overeenkomst intrekken?">
                            Intrekken
                          </ConfirmButton>
                        </form>
                      )}
                    </span>
                  </li>
                );
              })}
              {!agreements.data?.length && <li className="py-2 text-sm text-mist">Wordt automatisch aangemaakt als de klant een offerte accepteert.</li>}
            </ul>
          </Card>

          {/* Afspraken */}
          <Card>
            <h2 className="mb-4 text-2xl">Afspraken</h2>
            <ul className="mb-4 divide-y divide-ink-700/70">
              {((appts.data ?? []) as Appointment[]).map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span>
                    <span className="block text-bone first-letter:uppercase">{formatDate(a.starts_at, { weekday: "long" })}</span>
                    <span className="text-xs text-mist">
                      {timeRange(a.starts_at, a.ends_at)}
                      {a.notes && <> · “{a.notes}”</>}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge tone={a.status === "bevestigd" ? "cool" : a.status === "geannuleerd" ? "bad" : "neutral"}>{a.status}</Badge>
                    {a.status === "bevestigd" && <CancelAppointmentButton appointmentId={a.id} />}
                  </span>
                </li>
              ))}
            </ul>
            <details>
              <summary className="cursor-pointer text-sm text-bone-dim">Shoot inplannen namens klant</summary>
              <div className="mt-4">
                <SlotPicker mode="book" slots={(slots.data ?? []) as Slot[]} projects={[{ id, title: project.title }]} />
              </div>
            </details>
          </Card>

          {/* Berichten */}
          <div id="berichten">
            <h2 className="mb-4 text-2xl">Berichten</h2>
            <MessageThread projectId={id} initial={(messages.data ?? []) as Message[]} currentUserId={user.id} otherName={client.full_name?.split(" ")[0] ?? "Klant"} />
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <h2 className="mb-4 text-2xl">Project</h2>
            <ActionForm action={updateProject} className="space-y-4">
              <input type="hidden" name="id" value={id} />
              <Field label="Titel">
                <Input name="title" defaultValue={project.title} required />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <Select name="status" defaultValue={project.status}>
                    {projectStatuses.map((s) => (
                      <option key={s} value={s}>
                        {projectStatusLabel[s]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Betaalstatus">
                  <Select name="payment_status" defaultValue={project.payment_status}>
                    {(["open", "deels", "betaald"] as const).map((s) => (
                      <option key={s} value={s}>
                        {paymentStatusLabel[s]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Soort shoot">
                <Input name="shoot_type" defaultValue={project.shoot_type ?? ""} />
              </Field>
              <Field label="Locatie">
                <Input name="location" defaultValue={project.location ?? ""} />
              </Field>
              <Field label="Omschrijving / aanvraag">
                <Textarea name="description" defaultValue={project.description ?? ""} rows={5} />
              </Field>
              <SubmitButton>Opslaan</SubmitButton>
            </ActionForm>
            {project.portfolio_consent_at && <p className="mt-4 text-xs text-mist">Portfoliotoestemming gegeven op {formatDateTime(project.portfolio_consent_at)}.</p>}
          </Card>

          <Card>
            <h2 className="mb-4 text-2xl">Galerijen</h2>
            <ul className="mb-4 divide-y divide-ink-700/70">
              {((galleries.data ?? []) as Gallery[]).map((g) => (
                <li key={g.id}>
                  <Link href={`/admin/galerijen/${g.id}`} className="flex items-center justify-between py-3 text-sm">
                    <span className="text-bone">{g.title}</span>
                    <Badge tone={g.published ? "good" : "neutral"}>{g.published ? "Online" : "Concept"}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
            <form action={createGallery} className="flex gap-2">
              <input type="hidden" name="project_id" value={id} />
              <Input name="title" placeholder="Titel galerij" defaultValue={project.title} />
              <Button size="sm" variant="subtle">
                + Galerij
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-1 text-2xl">Facturen</h2>
            <p className="mb-4 text-xs text-mist">Betaald = downloads in hoge resolutie gaan automatisch open.</p>
            <ul className="mb-5 divide-y divide-ink-700/70">
              {((invoices.data ?? []) as Invoice[]).map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span>
                    <span className="block text-bone">{inv.number}</span>
                    <span className="text-xs text-mist">
                      {inv.amount ? euro(inv.amount) : ""} {inv.due_date && `· vervalt ${formatDate(inv.due_date)}`}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <form action={updateInvoiceStatus} className="flex gap-1">
                      <input type="hidden" name="id" value={inv.id} />
                      <select name="payment_status" defaultValue={inv.payment_status} className="field w-auto py-1 text-xs">
                        <option value="open">Open</option>
                        <option value="deels">Deels</option>
                        <option value="betaald">Betaald</option>
                      </select>
                      <button className="text-xs text-bone-dim">✓</button>
                    </form>
                    {inv.file_path && (
                      <a href={`/api/invoices/${inv.id}`} className="text-xs text-ember-soft">
                        Pdf
                      </a>
                    )}
                    <form action={deleteInvoice}>
                      <input type="hidden" name="id" value={inv.id} />
                      <input type="hidden" name="project_id" value={id} />
                      <ConfirmButton className="text-xs text-rose" message="Factuur verwijderen?">
                        ×
                      </ConfirmButton>
                    </form>
                  </span>
                </li>
              ))}
            </ul>
            <details>
              <summary className="cursor-pointer text-sm text-bone-dim">+ Factuur toevoegen</summary>
              <div className="mt-4">
                <InvoiceForm projectId={id} />
              </div>
            </details>
          </Card>

          <form action={deleteProject} className="text-right">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="confirm" value="true" />
            <ConfirmButton className={buttonClass("danger", "sm")} message="Project en alles wat erbij hoort definitief verwijderen?">
              Project verwijderen
            </ConfirmButton>
          </form>
        </div>
      </div>
    </>
  );
}
