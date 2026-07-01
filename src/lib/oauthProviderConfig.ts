import { supabase } from "@/integrations/supabase/client";

/**
 * Admin-only persistence for OAuth provider verification config
 * (intended Google client ID + expected redirect URI).
 *
 * Reads/writes `public.oauth_provider_config` — RLS restricts to admins.
 * Falls back gracefully if the row doesn't exist yet.
 */

export type OAuthProviderConfig = {
  provider: string;
  intended_client_id: string | null;
  expected_redirect_uri: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
};

export async function fetchOAuthProviderConfig(
  provider = "google",
): Promise<OAuthProviderConfig | null> {
  const { data, error } = await supabase
    .from("oauth_provider_config")
    .select("provider, intended_client_id, expected_redirect_uri, updated_at, updated_by")
    .eq("provider", provider)
    .maybeSingle();
  if (error) throw error;
  return data as OAuthProviderConfig | null;
}

export async function saveOAuthProviderConfig(
  patch: {
    provider?: string;
    intended_client_id?: string | null;
    expected_redirect_uri?: string | null;
  },
): Promise<OAuthProviderConfig> {
  const provider = patch.provider ?? "google";
  const { data: userRes } = await supabase.auth.getUser();
  const row = {
    provider,
    intended_client_id: patch.intended_client_id ?? null,
    expected_redirect_uri: patch.expected_redirect_uri ?? null,
    updated_by: userRes.user?.id ?? null,
  };
  const { data, error } = await supabase
    .from("oauth_provider_config")
    .upsert(row, { onConflict: "provider" })
    .select("provider, intended_client_id, expected_redirect_uri, updated_at, updated_by")
    .single();
  if (error) throw error;
  return data as OAuthProviderConfig;
}
