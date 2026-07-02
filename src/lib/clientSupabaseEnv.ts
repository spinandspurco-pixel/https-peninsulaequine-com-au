type ClientSupabaseEnv = {
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

export function getClientSupabaseKey(
  env: ClientSupabaseEnv = import.meta.env,
): string | undefined {
  const publishable = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (publishable) return publishable;

  const anon = env.VITE_SUPABASE_ANON_KEY?.trim();
  return anon || undefined;
}
