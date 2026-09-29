import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Client, Profile } from "@/lib/types";

/** Huidige sessie + profiel + klantrecord (per request gecachet). */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null, client: null };

  const [{ data: profile }, { data: client }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>(),
    supabase.from("clients").select("*").eq("user_id", user.id).maybeSingle<Client>(),
  ]);
  return { supabase, user, profile, client };
});

export async function requireUser() {
  const session = await getSession();
  if (!session.user) redirect("/login");
  return session as typeof session & { user: NonNullable<typeof session.user> };
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile?.role !== "admin") redirect("/portal");
  return session;
}

/** Voor klantpagina's: zorgt dat er een klantrecord is. */
export async function requireClient() {
  const session = await requireUser();
  if (!session.client) {
    if (session.profile?.role === "admin") redirect("/admin");
    redirect("/login?error=geen-klant");
  }
  return session as typeof session & { client: Client };
}
