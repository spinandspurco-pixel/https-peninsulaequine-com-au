// Media Vault — PE's canonical evidence vault.
// Source of truth is `storage_path` in the private `media-vault` bucket.
// `file_url` is reserved for optional legacy/external fallbacks. Signed URLs
// are generated on demand and never persisted to the row.

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type MediaAsset = Database["public"]["Tables"]["media_assets"]["Row"];
export type MediaInsert = Database["public"]["Tables"]["media_assets"]["Insert"];
export type MediaUpdate = Database["public"]["Tables"]["media_assets"]["Update"];

export type MediaApprovalState = "draft" | "approved" | "archived";
export type MediaAssetType = "image" | "video" | "pdf";

export const MEDIA_VAULT_BUCKET = "media-vault";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

export interface MediaFilters {
  projectId?: string | null;
  approvalState?: MediaApprovalState | "all";
  assetType?: MediaAssetType | "all";
  search?: string;
}

export async function listMedia(filters: MediaFilters = {}): Promise<MediaAsset[]> {
  let q = supabase
    .from("media_assets")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters.projectId) q = q.eq("project_id", filters.projectId);
  if (filters.approvalState && filters.approvalState !== "all")
    q = q.eq("approval_state", filters.approvalState);
  if (filters.assetType && filters.assetType !== "all")
    q = q.eq("asset_type", filters.assetType);
  if (filters.search && filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    q = q.or(`title.ilike.${term},description.ilike.${term},alt_text.ilike.${term},location.ilike.${term}`);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export function applyClientFilter(
  rows: MediaAsset[],
  filters: MediaFilters,
): MediaAsset[] {
  return rows.filter((r) => {
    if (filters.projectId && r.project_id !== filters.projectId) return false;
    if (filters.approvalState && filters.approvalState !== "all" && r.approval_state !== filters.approvalState)
      return false;
    if (filters.assetType && filters.assetType !== "all" && r.asset_type !== filters.assetType)
      return false;
    if (filters.search && filters.search.trim()) {
      const t = filters.search.trim().toLowerCase();
      const hay = [r.title, r.description, r.alt_text, r.location, ...(r.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(t)) return false;
    }
    return true;
  });
}

export async function getSignedUrl(
  storagePath: string | null,
  fallbackUrl: string | null = null,
): Promise<string | null> {
  if (!storagePath) return fallbackUrl;
  const { data, error } = await supabase
    .storage
    .from(MEDIA_VAULT_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) return fallbackUrl;
  return data.signedUrl;
}

export interface UploadInput {
  file: File;
  title: string;
  description?: string;
  altText?: string;
  projectId?: string | null;
  location?: string;
  credit?: string;
  usageRights?: string;
  approvalState?: MediaApprovalState;
  isDemo?: boolean;
  tags?: string[];
}

function sanitiseFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80) || "file";
}

async function readImageDimensions(file: File): Promise<{ width: number | null; height: number | null }> {
  if (!file.type.startsWith("image/")) return { width: null, height: null };
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const result = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(result);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: null, height: null });
    };
    img.src = url;
  });
}

export async function uploadImage(input: UploadInput): Promise<MediaAsset> {
  const { file } = input;
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are supported in v1.");
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("Image is larger than 20 MB.");
  }

  // Pre-create the row to get a UUID for the storage folder.
  const { data: row, error: insertError } = await supabase
    .from("media_assets")
    .insert({
      asset_type: "image",
      storage_path: "pending",
      title: input.title,
      description: input.description ?? null,
      alt_text: input.altText ?? null,
      project_id: input.projectId ?? null,
      location: input.location ?? null,
      credit: input.credit ?? null,
      usage_rights: input.usageRights ?? null,
      approval_state: input.approvalState ?? "draft",
      is_demo: input.isDemo ?? false,
      tags: input.tags ?? [],
      mime_type: file.type,
      file_size: file.size,
    } satisfies MediaInsert)
    .select("*")
    .single();

  if (insertError || !row) {
    throw insertError ?? new Error("Failed to create media asset row.");
  }

  const filename = sanitiseFilename(file.name);
  const storagePath = `${row.id}/${filename}`;

  const { error: uploadError } = await supabase
    .storage
    .from(MEDIA_VAULT_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    // Roll back the row so the vault stays consistent.
    await supabase.from("media_assets").delete().eq("id", row.id);
    throw uploadError;
  }

  const dims = await readImageDimensions(file);

  const { data: updated, error: updateError } = await supabase
    .from("media_assets")
    .update({
      storage_path: storagePath,
      width: dims.width,
      height: dims.height,
    })
    .eq("id", row.id)
    .select("*")
    .single();

  if (updateError || !updated) {
    throw updateError ?? new Error("Failed to finalise media asset.");
  }

  return updated;
}

export async function updateMedia(id: string, patch: MediaUpdate): Promise<MediaAsset> {
  const { data, error } = await supabase
    .from("media_assets")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) throw error ?? new Error("Failed to update media asset.");
  return data;
}

export async function archiveMedia(id: string): Promise<MediaAsset> {
  return updateMedia(id, { approval_state: "archived" });
}

export async function deleteMedia(asset: Pick<MediaAsset, "id" | "storage_path">): Promise<void> {
  if (asset.storage_path && asset.storage_path !== "pending") {
    await supabase.storage.from(MEDIA_VAULT_BUCKET).remove([asset.storage_path]);
  }
  const { error } = await supabase.from("media_assets").delete().eq("id", asset.id);
  if (error) throw error;
}

export const APPROVAL_LABEL: Record<MediaApprovalState, string> = {
  draft: "Draft",
  approved: "Approved",
  archived: "Archived",
};
