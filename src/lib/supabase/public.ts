import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { hasSupabase, supabaseKey, supabaseUrl } from "@/lib/env";

/** Anonieme client zonder cookies, voor publieke (cachebare) pagina's. */
export function createPublicClient() {
  if (!hasSupabase) return null;
  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
