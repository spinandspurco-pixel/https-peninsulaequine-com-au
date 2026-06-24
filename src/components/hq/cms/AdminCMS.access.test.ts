import { describe, it, expect } from "vitest";
import { HQ_NAV_ITEMS, visibleHqItems, canSeeHqItem } from "@/components/hq/hqAccess";

describe("HQ CMS access", () => {
  it("registers the CMS nav item as admin-only", () => {
    const item = HQ_NAV_ITEMS.find((i) => i.key === "cms");
    expect(item, "CMS nav item is missing from HQ_NAV_ITEMS").toBeDefined();
    expect(item!.to).toBe("/hq/cms");
    expect(item!.roles).toEqual(["admin"]);
  });

  it("is visible to admins", () => {
    expect(canSeeHqItem(["admin"], "cms")).toBe(true);
    expect(visibleHqItems(["admin"]).some((i) => i.key === "cms")).toBe(true);
  });

  it("is hidden from non-admin staff and preview", () => {
    for (const r of ["employee", "trainer", "moderator", "preview", "user"] as const) {
      expect(canSeeHqItem([r], "cms")).toBe(false);
      expect(visibleHqItems([r]).some((i) => i.key === "cms")).toBe(false);
    }
  });

  it("is hidden when no roles are present", () => {
    expect(visibleHqItems([])).toEqual([]);
  });
});
