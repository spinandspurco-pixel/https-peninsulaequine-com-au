import { describe, it, expect } from "vitest";
import { applyClientFilter, type MediaAsset } from "./mediaVault";

const baseRow = (over: Partial<MediaAsset>): MediaAsset => ({
  id: over.id ?? "00000000-0000-0000-0000-000000000001",
  asset_type: "image",
  storage_path: "x/y.jpg",
  file_url: null,
  mime_type: "image/jpeg",
  width: 100,
  height: 100,
  file_size: 1000,
  title: "Sample",
  description: null,
  alt_text: null,
  project_id: null,
  location: null,
  credit: null,
  usage_rights: null,
  approval_state: "draft",
  is_demo: false,
  tags: [],
  sort_order: 0,
  created_by: null,
  updated_by: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...over,
});

describe("applyClientFilter", () => {
  const rows: MediaAsset[] = [
    baseRow({ id: "1", title: "Pavilion roofline", approval_state: "approved", tags: ["arena"] }),
    baseRow({ id: "2", title: "Stable doors", approval_state: "draft", tags: ["stables"] }),
    baseRow({ id: "3", title: "Archived shot", approval_state: "archived", tags: [] }),
  ];

  it("filters by approval state", () => {
    expect(applyClientFilter(rows, { approvalState: "approved" })).toHaveLength(1);
    expect(applyClientFilter(rows, { approvalState: "all" })).toHaveLength(3);
  });

  it("matches search across title and tags", () => {
    expect(applyClientFilter(rows, { search: "pavilion" })).toHaveLength(1);
    expect(applyClientFilter(rows, { search: "stables" })).toHaveLength(1);
    expect(applyClientFilter(rows, { search: "nope" })).toHaveLength(0);
  });

  it("filters by asset type", () => {
    expect(applyClientFilter(rows, { assetType: "image" })).toHaveLength(3);
    expect(applyClientFilter(rows, { assetType: "video" })).toHaveLength(0);
  });
});
