import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { Logo } from "@/components/site/logo";
import { getSession } from "@/lib/auth";
import { hasSupabase } from "@/lib/env";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = { title: "Inloggen", robots: { index: false } };

const errors: Record<string, string> = {
  "link-verlopen": "Deze inloglink is verlopen of al gebruikt. Vraag hieronder een nieuwe aan.",
  "geen-klant": "We konden geen klantgegevens bij dit account vinden. Stuur me even een bericht.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; email?: string; error?: string }> }) {
  const { next, email, error } = await searchParams;

  if (hasSupabase) {
    const { user, profile } = await getSession();
    if (user && error !== "geen-klant") redirect(safeNext(next) || (profile?.role === "admin" ? "/admin" : "/portal"));
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-16">
      <div className="absolute inset-0 glow-warm" />
      <div className="absolute inset-0 glow-cool" />
      <div className="relative w-full max-w-md animate-fade-up">
        <Logo className="mb-12" />
        <h1 className="text-5xl md:text-6xl">Welkom <em className="text-ember-soft">terug</em></h1>
        <p className="mt-3 mb-8 text-mist">
          Log in op je klantportaal met je e-mailadres. Je krijgt een persoonlijke link, geen wachtwoord nodig.
        </p>
        {error && errors[error] && (
          <p className="mb-5 rounded-xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose">{errors[error]}</p>
        )}
        {hasSupabase ? (
          <LoginForm next={next} email={email} />
        ) : (
          <p className="rounded-xl border border-ink-700 p-4 text-sm text-mist">Het portaal is nog niet gekoppeld aan Supabase. Zie de README.</p>
        )}
        <p className="mt-10 text-sm text-mist">
          Nog geen klant?{" "}
          <Link href="/contact" className="text-bone underline-offset-4 hover:underline">
            Vraag een shoot aan
          </Link>{" "}
          en je krijgt automatisch toegang.
        </p>
      </div>
    </div>
  );
}
