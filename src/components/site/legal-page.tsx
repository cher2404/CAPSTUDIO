import { md } from "@/lib/markdown";
import { CookieSettingsLink } from "./cookie-banner";

export function LegalPage({ title, updated, body, cookies }: { title: string; updated: string; body: string; cookies?: boolean }) {
  return (
    <div className="container-x pt-32 md:pt-44">
      <div className="mx-auto max-w-3xl">
        <p className="label">Laatst bijgewerkt: {updated}</p>
        <h1 className="mt-4 text-5xl md:text-7xl">{title}</h1>
        <div className="prose-cap mt-10" dangerouslySetInnerHTML={{ __html: md(body) }} />
        {cookies && (
          <CookieSettingsLink className="mt-10 rounded-full border border-ink-600 px-5 py-2 text-sm text-bone hover:border-bone/50" />
        )}
      </div>
    </div>
  );
}
