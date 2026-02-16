import { supabase } from "@/integrations/supabase/client";
import { testimonials as staticTestimonials, services } from "@/data/content";

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  mediaType?: "image" | "video" | null;
  mediaUrl?: string | null;
  serviceTags: string[];
}

const SERVICE_IDS = services.map((s) => s.id);

/** Infer service tags from a testimonial's role text */
export function inferServiceTags(role: string): string[] {
  const l = role.toLowerCase();
  if (l.includes("dressage") || l.includes("trainer") || l.includes("jumping"))
    return ["arena-construction"];
  if (l.includes("ranch") || l.includes("estate"))
    return ["barn-construction", "full-facility"];
  if (l.includes("breeding") || l.includes("farm"))
    return ["fencing", "infrastructure"];
  if (l.includes("vet")) return ["barn-construction"];
  return [];
}

/** Convert static testimonials to the unified shape */
function staticToItems(): TestimonialItem[] {
  return staticTestimonials.map((t) => ({
    id: `static-${t.id}`,
    name: t.name,
    role: t.role,
    quote: t.quote,
    rating: t.rating,
    mediaType: (t as any).mediaType ?? null,
    mediaUrl: null,
    serviceTags: inferServiceTags(t.role),
  }));
}

/**
 * Fetch testimonials from the database, merged with static fallbacks.
 * DB records take priority; static entries whose name+quote prefix
 * already exist in the DB are de-duplicated.
 * Returns static data as fallback when the DB is empty or errors.
 */
export async function fetchMergedTestimonials(): Promise<TestimonialItem[]> {
  const staticItems = staticToItems();

  try {
    const { data, error } = await supabase
      .from("managed_testimonials")
      .select("id, client_name, client_role, quote, rating, media_type, media_url, service_tags")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("[Testimonials] DB fetch failed, using static fallback:", error.message);
      return staticItems;
    }

    if (!data || data.length === 0) {
      return staticItems;
    }

    const dbItems: TestimonialItem[] = data.map((t) => ({
      id: t.id,
      name: t.client_name,
      role: t.client_role ?? "",
      quote: t.quote,
      rating: t.rating,
      mediaType: (t.media_type as "image" | "video" | null) ?? null,
      mediaUrl: t.media_url ?? null,
      serviceTags: (t.service_tags as string[]) ?? [],
    }));

    // De-duplicate: remove static entries that match a DB record
    const dbKeys = new Set(
      dbItems.map((d) => `${d.name}::${d.quote.slice(0, 40)}`)
    );
    const uniqueStatic = staticItems.filter(
      (s) => !dbKeys.has(`${s.name}::${s.quote.slice(0, 40)}`)
    );

    return [...dbItems, ...uniqueStatic];
  } catch (err) {
    console.warn("[Testimonials] Unexpected error, using static fallback:", err);
    return staticItems;
  }
}

/** Service filter options derived from content data */
export const SERVICE_FILTERS = services.map((s) => ({ id: s.id, label: s.title }));
