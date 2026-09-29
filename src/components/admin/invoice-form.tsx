"use client";

import { useRef, useState } from "react";
import { saveInvoice } from "@/app/admin/_actions/crm";
import { createClient } from "@/lib/supabase/client";
import { Field, Input, Select } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

export function InvoiceForm({ projectId }: { projectId: string }) {
  const [path, setPath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    const p = `${projectId}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
    const { error } = await createClient().storage.from("documents").upload(p, file, { contentType: file.type || "application/pdf" });
    setUploading(false);
    if (error) setError(error.message);
    else setPath(p);
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await saveInvoice(fd);
        formRef.current?.reset();
        setPath("");
      }}
      className="grid gap-3 md:grid-cols-2"
    >
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="file_path" value={path} />
      <Field label="Factuurnummer">
        <Input name="number" required placeholder="2026-001" />
      </Field>
      <Field label="Bedrag (incl. btw)">
        <Input name="amount" inputMode="decimal" placeholder="195,00" />
      </Field>
      <Field label="Vervaldatum">
        <Input name="due_date" type="date" />
      </Field>
      <Field label="Status">
        <Select name="payment_status" defaultValue="open">
          <option value="open">Open</option>
          <option value="deels">Deels betaald</option>
          <option value="betaald">Betaald</option>
        </Select>
      </Field>
      <Field label="Pdf (optioneel)" className="md:col-span-2" hint={uploading ? "Uploaden…" : path ? "Geüpload ✓" : error}>
        <Input type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </Field>
      <div className="md:col-span-2">
        <SubmitButton size="sm" variant="subtle" disabled={uploading}>
          Factuur toevoegen
        </SubmitButton>
      </div>
    </form>
  );
}
