import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/env";

/**
 * Service role client: omzeilt RLS. Alleen server-side gebruiken, en pas nadat
 * je zelf hebt gecontroleerd dat de gebruiker toegang heeft.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ontbreekt");
  }
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
