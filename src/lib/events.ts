import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ManagedEvent = Tables<"managed_events">;

/**
 * Fetch upcoming events flagged as `featured` for use in homepage sections.
 * Falls back to the next upcoming published events if none are featured.
 */
export async function fetchFeaturedEvents(limit = 3): Promise<ManagedEvent[]> {
  const todayIso = new Date().toISOString().slice(0, 10);

  const { data: featured, error: featuredError } = await supabase
    .from("managed_events")
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .gte("event_date", todayIso)
    .order("sort_order", { ascending: true })
    .order("event_date", { ascending: true })
    .limit(limit);

  if (!featuredError && featured && featured.length > 0) {
    return featured;
  }

  const { data: upcoming } = await supabase
    .from("managed_events")
    .select("*")
    .eq("active", true)
    .gte("event_date", todayIso)
    .order("sort_order", { ascending: true })
    .order("event_date", { ascending: true })
    .limit(limit);

  return upcoming ?? [];
}
