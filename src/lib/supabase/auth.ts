import { hasSupabaseEnv, supabase } from "@/lib/supabase/client";

export async function signInWithGoogle() {
  if (!supabase || !hasSupabaseEnv) {
    throw new Error("Supabase Google auth is not configured yet.");
  }

  const redirectTo = import.meta.env.VITE_SUPABASE_REDIRECT_URL || window.location.origin;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) {
    throw error;
  }
}
