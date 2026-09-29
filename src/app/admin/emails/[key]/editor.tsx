"use client";

import { useEffect, useState } from "react";
import { previewEmail, saveEmailTemplate } from "../../_actions/content";
import { ActionForm } from "@/components/admin/forms";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { EmailTemplate } from "@/lib/types";

export function EmailEditor({ template }: { template: EmailTemplate }) {
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [html, setHtml] = useState("");

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await previewEmail(subject, body, template.variables);
      setHtml(res.html);
    }, 400);
    return () => clearTimeout(t);
  }, [subject, body, template.variables]);

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ActionForm action={saveEmailTemplate} className="space-y-4">
        <input type="hidden" name="key" value={template.key} />
        <Card className="space-y-4">
          <Field label="Onderwerp">
            <Input name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </Field>
          <Field label="Tekst (markdown). Een link op een eigen regel wordt een knop.">
            <Textarea name="body" value={body} onChange={(e) => setBody(e.target.value)} rows={18} className="font-mono text-xs leading-relaxed" />
          </Field>
          <div>
            <p className="mb-2 text-xs text-mist">Beschikbare variabelen</p>
            <div className="flex flex-wrap gap-1.5">
              {template.variables.map((v) => (
                <button type="button" key={v} onClick={() => setBody((b) => `${b}{{${v}}}`)} className="rounded-full border border-ink-600 px-2.5 py-0.5 font-mono text-[11px] text-ember-soft hover:border-ember/50">
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>
        </Card>
        <SubmitButton>Opslaan</SubmitButton>
      </ActionForm>
      <div>
        <p className="eyebrow mb-3">Voorbeeld</p>
        <iframe title="Voorbeeld e-mail" srcDoc={html} className="h-[640px] w-full rounded-2xl border border-ink-700 bg-ink-950" sandbox="" />
      </div>
    </div>
  );
}
