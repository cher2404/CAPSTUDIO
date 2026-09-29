import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/ui/card";
import { requireClient } from "@/lib/auth";
import type { Article } from "@/lib/types";

export const metadata = { title: "Tips" };

export default async function TipsPage() {
  const { supabase } = await requireClient();
  const { data } = await supabase.from("articles").select("id, slug, title, excerpt, cover_url, sort").eq("published", true).order("sort");
  const articles = (data ?? []) as Article[];

  return (
    <>
      <PageHeader eyebrow="Kennisbank" title="Tips voor je shoot">
        Alles wat je moet weten om er het maximale uit te halen.
      </PageHeader>
      {articles.length === 0 ? (
        <EmptyState title="Binnenkort meer tips" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {articles.map((a, i) => (
            <Link key={a.id} href={`/portal/tips/${a.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900/60 transition-colors hover:border-ink-600">
              {a.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.cover_url} alt="" loading="lazy" className="aspect-[16/8] w-full object-cover" />
              )}
              <div className="flex flex-1 flex-col p-6">
                <span className="font-display text-lg text-ember-soft italic">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="mt-2 text-2xl md:text-3xl">{a.title}</h2>
                {a.excerpt && <p className="mt-3 flex-1 text-sm text-mist">{a.excerpt}</p>}
                <span className="mt-5 text-sm text-bone-dim transition-transform group-hover:translate-x-1">Lezen →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
