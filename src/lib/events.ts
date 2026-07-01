import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ManagedEvent = Tables<"managed_events">;

/**
 * Fetch upcoming events for the homepage strip.
 * STRICT: returns only events that are Published (active=true) AND Featured
 * AND still upcoming. Draft/unfeatured events never render on the homepage.
 */
export async function fetchFeaturedEvents(limit = 3): Promise<ManagedEvent[]> {
  const todayIso = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("managed_events")
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .gte("event_date", todayIso)
    .order("sort_order", { ascending: true })
    .order("event_date", { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return data;
}
