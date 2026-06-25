// HQ Activity — unified operational feed.
// Reusable across HQ surfaces. Read-only in v1; aggregates from existing
// sources without adding new schema, triggers, or RLS.

import { supabase } from "@/integrations/supabase/client";
import { isToday, isYesterday } from "date-fns";

export type HqActivityKind =
  | "inquiry_created"
  | "inquiry_status_changed"
  | "inquiry_note_added"
  | "project_created"
  | "project_updated"
  | "cms_updated"
  | "staff_profile_updated"
  | "media_updated"
  | "system";

export interface HqActivityEvent {
  id: string;
  kind: HqActivityKind;
  at: string; // ISO timestamp
  actorEmail: string | null;
  actorName: string | null;
  actorRole: string | null;
  actionLabel: string; // short verb phrase, e.g. "Updated project"
  targetType: string | null; // "Inquiry", "Project", "Gallery", etc
  targetLabel: string | null; // human-readable target name
  targetId: string | null;
  detail: string | null;
  href: string | null;
}

interface StaffDirEntry {
  user_id: string | null;
  email: string | null;
  display_name: string | null;
  role: string | null;
}

interface IdentityMaps {
  byEmail: Map<string, StaffDirEntry>;
  byUserId: Map<string, StaffDirEntry>;
}

const emptyMaps = (): IdentityMaps => ({
  byEmail: new Map(),
  byUserId: new Map(),
});

async function loadIdentity(): Promise<IdentityMaps> {
  const { data, error } = await supabase.rpc("list_staff_directory");
  if (error || !data) return emptyMaps();
  const maps = emptyMaps();
  for (const row of data as Array<Record<string, unknown>>) {
    const entry: StaffDirEntry = {
      user_id: (row.user_id as string) ?? null,
      email: ((row.email as string) ?? "").toLowerCase() || null,
      display_name: (row.display_name as string) ?? null,
      role: (row.role as string) ?? null,
    };
    if (entry.email) maps.byEmail.set(entry.email, entry);
    if (entry.user_id) maps.byUserId.set(entry.user_id, entry);
  }
  return maps;
}

function resolveActor(
  ids: IdentityMaps,
  opts: { email?: string | null; userId?: string | null },
): { name: string | null; email: string | null; role: string | null } {
  const email = opts.email?.toLowerCase() ?? null;
  const entry =
    (opts.userId ? ids.byUserId.get(opts.userId) : undefined) ||
    (email ? ids.byEmail.get(email) : undefined) ||
    null;
  if (entry) {
    return {
      name:
        entry.display_name ||
        (entry.email ? entry.email.split("@")[0] : null),
      email: entry.email,
      role: entry.role,
    };
  }
  if (email) {
    return { name: email.split("@")[0], email, role: null };
  }
  return { name: null, email: null, role: null };
}

interface FetchOptions {
  limit?: number;
}

export async function fetchHqActivity(
  opts: FetchOptions = {},
): Promise<HqActivityEvent[]> {
  const limit = opts.limit ?? 50;
  const sinceIso = new Date(Date.now() - 60 * 86400_000).toISOString();
  const perSource = Math.min(limit, 50);

  const [
    ids,
    activityLogRes,
    inquiryActivityRes,
    inquiriesRes,
    projectsRes,
    galleryRes,
    staffRes,
    mediaRes,
  ] = await Promise.all([
    loadIdentity(),
    supabase
      .from("activity_log")
      .select("id, created_at, action_type, title, description, entity_type, entity_id, performed_by")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(perSource),
    supabase
      .from("inquiry_activity")
      .select("id, created_at, event_type, actor_id, actor_email, inquiry_id, from_value, to_value, detail")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(perSource),
    supabase
      .from("inquiries")
      .select("id, created_at, name, services")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(perSource),
    supabase
      .from("managed_projects")
      .select("id, created_at, updated_at, name, code, status")
      .gte("updated_at", sinceIso)
      .order("updated_at", { ascending: false })
      .limit(perSource),
    supabase
      .from("cms_gallery_items")
      .select("id, created_at, updated_at, title, updated_by, created_by")
      .gte("updated_at", sinceIso)
      .order("updated_at", { ascending: false })
      .limit(perSource),
    supabase
      .from("staff_profiles")
      .select("user_id, updated_at, created_at, display_name, title")
      .gte("updated_at", sinceIso)
      .order("updated_at", { ascending: false })
      .limit(perSource),
    supabase
      .from("media_assets")
      .select("id, title, asset_type, approval_state, created_at, updated_at, updated_by, created_by")
      .gte("updated_at", sinceIso)
      .order("updated_at", { ascending: false })
      .limit(perSource),
  ]);

  const events: HqActivityEvent[] = [];

  // ── activity_log ───────────────────────────────────────────────────────────
  for (const row of activityLogRes.data ?? []) {
    const actor = resolveActor(ids, { email: row.performed_by });
    events.push({
      id: `al:${row.id}`,
      kind: "system",
      at: row.created_at,
      actorEmail: actor.email,
      actorName: actor.name,
      actorRole: actor.role,
      actionLabel: row.title || row.action_type,
      targetType: row.entity_type,
      targetLabel: row.description,
      targetId: row.entity_id,
      detail: row.description,
      href: null,
    });
  }

  // ── inquiry_activity ──────────────────────────────────────────────────────
  for (const row of inquiryActivityRes.data ?? []) {
    const actor = resolveActor(ids, {
      email: row.actor_email,
      userId: row.actor_id,
    });
    let kind: HqActivityKind = "system";
    let action = row.event_type;
    if (row.event_type === "created") {
      kind = "inquiry_created";
      action = "Inquiry submitted";
    } else if (row.event_type === "status_changed") {
      kind = "inquiry_status_changed";
      action = "Inquiry status changed";
    } else if (row.event_type === "note_added") {
      kind = "inquiry_note_added";
      action = "Note added";
    }
    const detailParts: string[] = [];
    if (row.from_value && row.to_value) {
      detailParts.push(`${row.from_value} → ${row.to_value}`);
    } else if (row.to_value) {
      detailParts.push(String(row.to_value));
    }
    if (row.detail) detailParts.push(row.detail);
    events.push({
      id: `ia:${row.id}`,
      kind,
      at: row.created_at,
      actorEmail: actor.email,
      actorName: actor.name,
      actorRole: actor.role,
      actionLabel: action,
      targetType: "Inquiry",
      targetLabel: null,
      targetId: row.inquiry_id,
      detail: detailParts.join(" · ") || null,
      href: row.inquiry_id ? `/hq/inquiries?id=${row.inquiry_id}` : null,
    });
  }

  // ── inquiries (created) ───────────────────────────────────────────────────
  const seenInquiryCreated = new Set(
    events
      .filter((e) => e.kind === "inquiry_created" && e.targetId)
      .map((e) => e.targetId as string),
  );
  for (const row of inquiriesRes.data ?? []) {
    if (seenInquiryCreated.has(row.id)) continue;
    const services = Array.isArray(row.services) ? row.services.join(", ") : null;
    events.push({
      id: `inq:${row.id}`,
      kind: "inquiry_created",
      at: row.created_at,
      actorEmail: null,
      actorName: row.name ?? "Public visitor",
      actorRole: "client",
      actionLabel: "Inquiry submitted",
      targetType: "Inquiry",
      targetLabel: row.name ?? null,
      targetId: row.id,
      detail: services,
      href: `/hq/inquiries?id=${row.id}`,
    });
  }

  // ── managed_projects (created / updated) ──────────────────────────────────
  for (const row of projectsRes.data ?? []) {
    const isCreate = row.created_at === row.updated_at;
    const code = row.code ? `${row.code} · ` : "";
    events.push({
      id: `${isCreate ? "pjc" : "pju"}:${row.id}`,
      kind: isCreate ? "project_created" : "project_updated",
      at: row.updated_at,
      actorEmail: null,
      actorName: null,
      actorRole: null,
      actionLabel: isCreate ? "Project created" : "Project updated",
      targetType: "Project",
      targetLabel: `${code}${row.name}`,
      targetId: row.id,
      detail: row.status ? row.status.replace(/_/g, " ") : null,
      href: `/hq/projects/${row.id}`,
    });
  }

  // ── cms_gallery_items ─────────────────────────────────────────────────────
  for (const row of galleryRes.data ?? []) {
    const editor = row.updated_by ?? row.created_by ?? null;
    const actor = resolveActor(ids, { email: editor });
    const isCreate = row.created_at === row.updated_at;
    events.push({
      id: `cms:${row.id}:${row.updated_at}`,
      kind: "cms_updated",
      at: row.updated_at,
      actorEmail: actor.email ?? editor,
      actorName: actor.name,
      actorRole: actor.role,
      actionLabel: isCreate ? "Gallery item added" : "Gallery item updated",
      targetType: "Gallery",
      targetLabel: row.title ?? null,
      targetId: row.id,
      detail: null,
      href: "/hq/cms",
    });
  }

  // ── staff_profiles ────────────────────────────────────────────────────────
  for (const row of staffRes.data ?? []) {
    if (!row.user_id) continue;
    const actor = resolveActor(ids, { userId: row.user_id });
    const isCreate = row.created_at === row.updated_at;
    events.push({
      id: `sp:${row.user_id}:${row.updated_at}`,
      kind: "staff_profile_updated",
      at: row.updated_at,
      actorEmail: actor.email,
      actorName: actor.name ?? row.display_name,
      actorRole: actor.role,
      actionLabel: isCreate ? "Staff profile created" : "Staff profile updated",
      targetType: "Staff",
      targetLabel: row.display_name ?? actor.name ?? null,
      targetId: row.user_id,
      detail: row.title ?? null,
      href: "/hq/staff",
    });
  }

  // ── media_assets ──────────────────────────────────────────────────────────
  for (const row of mediaRes.data ?? []) {
    const editorId = row.updated_by ?? row.created_by ?? null;
    const actor = resolveActor(ids, { userId: editorId });
    const isCreate = row.created_at === row.updated_at;
    events.push({
      id: `mv:${row.id}:${row.updated_at}`,
      kind: "media_updated",
      at: row.updated_at,
      actorEmail: actor.email,
      actorName: actor.name,
      actorRole: actor.role,
      actionLabel: isCreate ? "Media added" : "Media updated",
      targetType: "Media",
      targetLabel: row.title,
      targetId: row.id,
      detail: row.approval_state ? row.approval_state : null,
      href: "/hq/media",
    });
  }

  events.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  return events.slice(0, limit);
}

export interface HqActivityGroup {
  key: "today" | "yesterday" | "earlier";
  label: string;
  events: HqActivityEvent[];
}

export function groupHqActivity(events: HqActivityEvent[]): HqActivityGroup[] {
  const today: HqActivityEvent[] = [];
  const yesterday: HqActivityEvent[] = [];
  const earlier: HqActivityEvent[] = [];
  for (const e of events) {
    const d = new Date(e.at);
    if (isToday(d)) today.push(e);
    else if (isYesterday(d)) yesterday.push(e);
    else earlier.push(e);
  }
  const groups: HqActivityGroup[] = [];
  if (today.length) groups.push({ key: "today", label: "Today", events: today });
  if (yesterday.length)
    groups.push({ key: "yesterday", label: "Yesterday", events: yesterday });
  if (earlier.length)
    groups.push({ key: "earlier", label: "Earlier", events: earlier });
  return groups;
}

export const KIND_BADGE: Record<HqActivityKind, string> = {
  inquiry_created: "Inquiry",
  inquiry_status_changed: "Inquiry",
  inquiry_note_added: "Inquiry",
  project_created: "Project",
  project_updated: "Project",
  cms_updated: "CMS",
  staff_profile_updated: "Staff",
  media_updated: "Media",
  system: "System",
};
