import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteArticle } from "../../_actions/content";
import { ArticleForm } from "@/components/admin/article-form";
import { ConfirmButton } from "@/components/admin/forms";
import { PageHeader } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import type { Article } from "@/lib/types";

export default async function AdminTipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const a = data as Article;
  return (
    <>
      <Link href="/admin/tips" className="mb-6 inline-block text-sm text-mist hover:text-bone">
        ← Alle tips
      </Link>
      <PageHeader
        eyebrow="Tip"
        title={a.title}
        action={
          <div className="flex gap-2">
            {a.published && (
              <Link href={`/portal/tips/${a.slug}`} className={buttonClass("outline", "sm")}>
                Bekijk
              </Link>
            )}
            <form action={deleteArticle}>
              <input type="hidden" name="id" value={id} />
              <ConfirmButton className={buttonClass("danger", "sm")} message="Tip verwijderen?">
                Verwijderen
              </ConfirmButton>
            </form>
          </div>
        }
      />
      <ArticleForm article={a} />
    </>
  );
}
