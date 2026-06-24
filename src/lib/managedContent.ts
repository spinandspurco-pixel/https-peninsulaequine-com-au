// Read-only client helpers that fetch CMS content from the `managed_*` tables
// and overlay the hardcoded content used by public pages. If the query
// returns zero rows or errors, callers fall back to the hardcoded data so
// public pages never go blank.

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Types ────────────────────────────────────────────────────────────────
export type ManagedService = {
  id: string;
  slug: string;
  title: string | null;
  short_description: string | null;
  description: string | null;
  summary: string | null;
  body: string | null;
  features: string[] | null;
  starting_price: string | null;
  cta_label: string | null;
  cta_url: string | null;
  image_url: string | null;
  sort_order: number | null;
  active: boolean | null;
};

export type ManagedProject = {
  id: string;
  code: string | null;
  name: string | null;
  location: string | null;
  build_type: string | null;
  status: string | null;
  scope: string | null;
  client_summary: string | null;
  hero_image: string | null;
  sort_order: number | null;
};

// ── Pure overlay helpers (exported for tests) ────────────────────────────

/**
 * Pick the first non-empty string from a list of candidates. Empty strings
 * and null/undefined values are treated as missing.
 */
export function firstNonEmpty(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return undefined;
}

/**
 * Overlay a single hardcoded service entry with managed_services values.
 * Returns a shallow-merged object; visual/layout fields (image, alt, crop,
 * etc.) on the hardcoded entry are preserved.
 */
export function overlayService<T extends { title: string; body?: string; href?: string }>(
  hardcoded: T,
  managed: ManagedService | undefined,
): T {
  if (!managed) return hardcoded;
  const title = firstNonEmpty(managed.title) ?? hardcoded.title;
  const body =
    firstNonEmpty(
      managed.body,
      managed.summary,
      managed.short_description,
      managed.description,
    ) ?? hardcoded.body;
  const href = firstNonEmpty(managed.cta_url) ?? hardcoded.href;
  return { ...hardcoded, title, body, href };
}

/**
 * Overlay a hardcoded project entry with managed_projects values. Image,
 * alt, slug, code and crop are preserved from the hardcoded entry.
 */
export function overlayProject<
  T extends {
    code: string;
    title: string;
    category: string;
    location: string;
    status: "Resolved" | "In Progress";
    scope: string;
    thesis: string;
  },
>(hardcoded: T, managed: ManagedProject | undefined): T {
  if (!managed) return hardcoded;
  const title = firstNonEmpty(managed.name) ?? hardcoded.title;
  const location = firstNonEmpty(managed.location) ?? hardcoded.location;
  const category = firstNonEmpty(managed.build_type) ?? hardcoded.category;
  const scope = firstNonEmpty(managed.scope) ?? hardcoded.scope;
  const thesis = firstNonEmpty(managed.client_summary) ?? hardcoded.thesis;
  const status =
    managed.status === "completed"
      ? "Resolved"
      : managed.status === "in_progress"
        ? "In Progress"
        : hardcoded.status;
  return { ...hardcoded, title, location, category, scope, thesis, status };
}

/**
 * Match a hardcoded project to a managed_projects row by code-family prefix
 * (e.g. `PE-MR-024` matches managed `PE-MR-014`). Useful while the admin
 * code numbers drift from the hardcoded ones.
 */
export function findProjectByCodeFamily(
  hardcodedCode: string,
  managed: ManagedProject[],
): ManagedProject | undefined {
  const family = hardcodedCode.split("-").slice(0, 2).join("-").toUpperCase();
  if (!family) return undefined;
  return managed.find((m) => (m.code ?? "").toUpperCase().startsWith(family));
}

// ── Hooks ────────────────────────────────────────────────────────────────

type MapState<T> = { data: Record<string, T> | null; loading: boolean };
type ListState<T> = { data: T[] | null; loading: boolean };

const SERVICE_COLS =
  "id,slug,title,short_description,description,summary,body,features,starting_price,cta_label,cta_url,image_url,sort_order,active";
const PROJECT_COLS =
  "id,code,name,location,build_type,status,scope,client_summary,hero_image,sort_order";

/**
 * Subscribe to active managed_services. Returns a map keyed by slug. On
 * error or zero rows `data` stays null so callers use their hardcoded
 * fallback.
 */
export function useManagedServicesMap(): MapState<ManagedService> {
  const [state, setState] = useState<MapState<ManagedService>>({
    data: null,
    loading: true,
  });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("managed_services")
          .select(SERVICE_COLS)
          .eq("active", true)
          .order("sort_order", { ascending: true });
        if (cancelled) return;
        if (error || !data || data.length === 0) {
          setState({ data: null, loading: false });
          return;
        }
        const map: Record<string, ManagedService> = {};
        for (const row of data as unknown as ManagedService[]) {
          if (row.slug) map[row.slug] = row;
        }
        setState({ data: map, loading: false });
      } catch {
        if (!cancelled) setState({ data: null, loading: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}

/**
 * Subscribe to managed_projects ordered by sort_order. Returns null on
 * error or zero rows so callers fall back to hardcoded content.
 */
export function useManagedProjects(): ListState<ManagedProject> {
  const [state, setState] = useState<ListState<ManagedProject>>({
    data: null,
    loading: true,
  });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("managed_projects")
          .select(PROJECT_COLS)
          .order("sort_order", { ascending: true });
        if (cancelled) return;
        if (error || !data || data.length === 0) {
          setState({ data: null, loading: false });
          return;
        }
        setState({ data: data as unknown as ManagedProject[], loading: false });
      } catch {
        if (!cancelled) setState({ data: null, loading: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
}
