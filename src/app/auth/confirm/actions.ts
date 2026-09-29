"use server";

import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext, str } from "@/lib/utils";

export async function confirmLogin(form: FormData) {
  const tokenHash = str(form, "token_hash");
  const type = (str(form, "type") || "magiclink") as EmailOtpType;
  const code = str(form, "code");
  const next = safeNext(str(form, "next"));

  const supabase = await createClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) redirect("/login?error=link-verlopen");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).maybeSingle();
  redirect(next || (profile?.role === "admin" ? "/admin" : "/portal"));
}
