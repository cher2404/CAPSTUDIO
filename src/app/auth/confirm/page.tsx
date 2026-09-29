import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { confirmLogin } from "./actions";
import { Logo } from "@/components/site/logo";
import { SubmitButton } from "@/components/ui/submit-button";

export const metadata: Metadata = { title: "Inloggen", robots: { index: false } };

/**
 * Tussenpagina met een knop: zo "verbruiken" linkscanners in mailprogramma's
 * de eenmalige inloglink niet voordat de klant erop klikt.
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; code?: string; next?: string }>;
}) {
  const { token_hash, type, code, next } = await searchParams;
  if (!token_hash && !code) redirect("/login?error=link-verlopen");

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-5">
      <div className="absolute inset-0 glow-warm" />
      <form action={confirmLogin} className="relative w-full max-w-sm animate-fade-up text-center">
        <Logo className="mb-10 items-center" />
        <h1 className="text-4xl">Bijna binnen</h1>
        <p className="mt-3 mb-8 text-mist">Klik op de knop om in te loggen op je portaal.</p>
        <input type="hidden" name="token_hash" value={token_hash ?? ""} />
        <input type="hidden" name="type" value={type ?? "magiclink"} />
        <input type="hidden" name="code" value={code ?? ""} />
        <input type="hidden" name="next" value={next ?? ""} />
        <SubmitButton size="lg" className="w-full" pendingText="Inloggen…">
          Inloggen
        </SubmitButton>
      </form>
    </div>
  );
}
