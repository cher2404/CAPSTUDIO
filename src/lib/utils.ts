export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function str(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function num(form: FormData, key: string, fallback = 0) {
  const v = Number(str(form, key).replace(",", "."));
  return Number.isFinite(v) ? v : fallback;
}

export function bool(form: FormData, key: string) {
  const v = form.get(key);
  return v === "on" || v === "true" || v === "1";
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** Nette foutmelding uit een Postgres/Supabase-fout (RPC-exceptions zijn al Nederlands). */
export function errorMessage(err: unknown, fallback = "Er ging iets mis. Probeer het opnieuw.") {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    return err.message || fallback;
  }
  return fallback;
}

/** Alleen relatieve redirects toestaan (geen open redirect). */
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "";
}
