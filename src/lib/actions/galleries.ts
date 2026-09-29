"use server";

import { getSession } from "@/lib/auth";

export async function toggleFavorite(fileId: string) {
  const { supabase, user } = await getSession();
  if (!user) return { error: "Niet ingelogd" };
  const { data, error } = await supabase.rpc("toggle_favorite", { p_file_id: fileId });
  if (error) return { error: error.message };
  return { favorite: data as boolean };
}
