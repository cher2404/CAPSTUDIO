import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/auth";
import { md } from "@/lib/markdown";
import type { Article } from "@/lib/types";

export default async function TipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase } = await requireClient();
  const { data } = await supabase.from("articles").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (!data) notFound();
  const article = data as Article;

  return (
    <article className="mx-auto max-w-2xl">
      <Link href="/portal/tips" className="mb-8 inline-block text-sm text-mist hover:text-bone">
        ← Alle tips
      </Link>
      <p className="eyebrow">Tip</p>
      <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{article.title}</h1>
      {article.excerpt && <p className="mt-4 text-lg text-mist">{article.excerpt}</p>}
      {article.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.cover_url} alt="" className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />
      )}
      <div className="prose-cap mt-10" dangerouslySetInnerHTML={{ __html: md(article.body) }} />
      <div className="mt-14 rounded-2xl border border-ink-700/70 p-6">
        <p className="text-bone">Nog vragen?</p>
        <p className="mt-1 text-sm text-mist">
          Stuur me gerust een{" "}
          <Link href="/portal/berichten" className="text-ember-soft underline underline-offset-2">
            bericht
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
