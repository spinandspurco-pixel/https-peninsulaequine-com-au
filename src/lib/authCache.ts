import { supabase } from "@/integrations/supabase/client";

const AUTH_STORAGE_MATCHERS = [
  (key: string) => key.startsWith("sb-") && key.endsWith("-auth-token"),
  (key: string) => key.toLowerCase().includes("supabase.auth"),
  (key: string) => key.toLowerCase().includes("gotrue"),
  (key: string) => key.toLowerCase().includes("lovable.auth"),
];

function clearAuthKeys(storage: Storage | undefined): number {
  if (!storage) return 0;
  const keysToRemove: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key && AUTH_STORAGE_MATCHERS.some((matches) => matches(key))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => storage.removeItem(key));
  return keysToRemove.length;
}

export async function clearLocalAuthCacheAndSignOut(): Promise<number> {
  try {
    await supabase.auth.signOut();
  } catch {
    // A stale or expired token can make remote sign-out fail. Local cleanup is
    // the important recovery path for the production "No staff access" state.
  }

  const removed =
    clearAuthKeys(typeof window !== "undefined" ? window.localStorage : undefined) +
    clearAuthKeys(typeof window !== "undefined" ? window.sessionStorage : undefined);

  if (typeof window !== "undefined") {
    window.location.href = "/login?cache=cleared";
  }

  return removed;
}