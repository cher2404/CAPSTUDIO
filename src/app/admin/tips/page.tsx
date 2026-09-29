import Link from "next/link";
import { ArticleForm } from "@/components/admin/article-form";
import { Badge, Card, PageHeader } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import type { Article } from "@/lib/types";

export const metadata = { title: "Tips" };

export default async function AdminTipsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("articles").select("*").order("sort");
  const articles = (data ?? []) as Article[];
  return (
    <>
      <PageHeader eyebrow="Kennisbank" title="Tips" />
      <div className="mb-10 space-y-3">
        {articles.map((a) => (
          <Link key={a.id} href={`/admin/tips/${a.id}`}>
            <Card className="flex items-center justify-between gap-3 hover:border-ink-600">
              <span>
                <span className="block text-bone">{a.title}</span>
                <span className="text-xs text-mist">/portal/tips/{a.slug}</span>
              </span>
              <Badge tone={a.published ? "good" : "neutral"}>{a.published ? "Gepubliceerd" : "Concept"}</Badge>
            </Card>
          </Link>
        ))}
      </div>
      <details>
        <summary className="mb-4 cursor-pointer text-bone">+ Nieuwe tip</summary>
        <ArticleForm />
      </details>
    </>
  );
}
