import "server-only";
import { cache } from "react";
import { requireClient } from "@/lib/auth";
import type { Project } from "@/lib/types";

/** Alle projecten van de ingelogde klant (RLS doet de filtering). */
export const getMyProjects = cache(async () => {
  const session = await requireClient();
  const { data } = await session.supabase.from("projects").select("*").order("created_at", { ascending: false });
  return { ...session, projects: (data ?? []) as Project[] };
});

export const getPortalCounts = cache(async () => {
  const { supabase, user } = await requireClient();
  const [messages, quotes, agreements] = await Promise.all([
    supabase.from("messages").select("id", { count: "exact", head: true }).is("read_at", null).neq("sender_id", user.id),
    supabase.from("quotes").select("id", { count: "exact", head: true }).in("status", ["verstuurd", "vraag"]),
    supabase.from("agreements").select("id", { count: "exact", head: true }).eq("status", "te_ondertekenen"),
  ]);
  return { unread: messages.count ?? 0, openQuotes: quotes.count ?? 0, toSign: agreements.count ?? 0 };
});
