import { supabase } from "@/integrations/supabase/client";
import { testimonials as staticTestimonials, services } from "@/data/content";
import trainerGlennImg from "@/assets/trainer-glenn.jpg";
import trainerCiroImg from "@/assets/trainer-ciro.jpg";

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  pinned?: boolean;
  mediaType?: "image" | "video" | null;
  mediaUrl?: string | null;
  serviceTags: string[];
  trainer?: string | null;
}

export interface TrainerInfo {
  name: string;
  portrait: string;
  title: string;
}

/** Known trainers with portrait images */
export const TRAINER_PROFILES: Record<string, TrainerInfo> = {
  "Glenn Browitt": {
    name: "Glenn Browitt",
    portrait: trainerGlennImg,
    title: "Head Riding Instructor",
  },
  "Ciro Postiglione": {
    name: "Ciro Postiglione",
    portrait: trainerCiroImg,
    title: "Facility Builder & Horseman",
  },
};

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

/** Infer trainer name from role text */
function inferTrainer(role: string): string | null {
  const l = role.toLowerCase();
  if (l.includes("lesson") || l.includes("riding") || l.includes("student") || l.includes("beginner") || l.includes("dressage") || l.includes("jumping"))
    return "Glenn Browitt";
  return null;
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
    trainer: inferTrainer(t.role),
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
      .select("id, client_name, client_role, quote, rating, media_type, media_url, service_tags, pinned, trainer")
      .eq("active", true)
      .order("pinned", { ascending: false })
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
      pinned: (t as any).pinned ?? false,
      mediaType: (t.media_type as "image" | "video" | null) ?? null,
      mediaUrl: t.media_url ?? null,
      serviceTags: (t.service_tags as string[]) ?? [],
      trainer: (t as any).trainer ?? null,
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

/** Extract unique trainer names from testimonials */
export function getTrainerFilters(testimonials: TestimonialItem[]): string[] {
  const trainers = new Set<string>();
  testimonials.forEach((t) => {
    if (t.trainer) trainers.add(t.trainer);
  });
  return Array.from(trainers).sort();
}
