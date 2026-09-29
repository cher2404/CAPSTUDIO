export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True als Supabase geconfigureerd is. Zonder config draait de publieke site op voorbeelddata. */
export const hasSupabase = Boolean(supabaseUrl && supabaseKey);
