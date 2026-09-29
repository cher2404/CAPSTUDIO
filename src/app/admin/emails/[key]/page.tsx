import Link from "next/link";
import { notFound } from "next/navigation";
import { EmailEditor } from "./editor";
import { sendTestEmail } from "../../_actions/content";
import { PageHeader } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/auth";
import type { EmailTemplate } from "@/lib/types";

export default async function EmailTemplatePage({ params, searchParams }: { params: Promise<{ key: string }>; searchParams: Promise<{ test?: string }> }) {
  const [{ key }, { test }] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("email_templates").select("*").eq("key", key).maybeSingle();
  if (!data) notFound();
  const t = data as EmailTemplate;
  return (
    <>
      <Link href="/admin/emails" className="mb-6 inline-block text-sm text-mist hover:text-bone">
        ← Alle e-mails
      </Link>
      <PageHeader
        eyebrow="E-mailsjabloon"
        title={t.name}
        action={
          <form action={sendTestEmail}>
            <input type="hidden" name="key" value={key} />
            <SubmitButton variant="outline" size="sm" pendingText="Versturen…">
              {test ? "Testmail verstuurd ✓" : "Stuur testmail naar mij"}
            </SubmitButton>
          </form>
        }
      >
        {t.description}
      </PageHeader>
      <EmailEditor template={t} />
    </>
  );
}
