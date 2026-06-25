import { describe, it, expect } from "vitest";
import {
  resolveCommandRole,
  resolveCommandView,
  hasWidget,
} from "./roleView";
import { FOUNDER_EMAIL_ALLOWLIST } from "./founders";

const founderEmail = FOUNDER_EMAIL_ALLOWLIST[0];

describe("resolveCommandRole", () => {
  it("returns 'founder' when admin + email is on the allowlist", () => {
    expect(resolveCommandRole(["admin"], founderEmail)).toBe("founder");
    expect(resolveCommandRole(["admin"], founderEmail.toUpperCase())).toBe(
      "founder",
    );
  });

  it("returns 'admin' for admin role off the allowlist", () => {
    expect(resolveCommandRole(["admin"], "someone@example.com")).toBe("admin");
    expect(resolveCommandRole(["admin"], null)).toBe("admin");
  });

  it("returns 'operations' for employee / trainer / moderator", () => {
    for (const r of ["employee", "trainer", "moderator"] as const) {
      expect(resolveCommandRole([r], "x@y.com")).toBe("operations");
    }
  });

  it("returns 'viewer' for preview role, empty roles, or unknown", () => {
    expect(resolveCommandRole(["preview"], "x@y.com")).toBe("viewer");
    expect(resolveCommandRole([], "x@y.com")).toBe("viewer");
    expect(resolveCommandRole(null, null)).toBe("viewer");
  });
});

describe("resolveCommandView", () => {
  it("only the admin view includes 'system-health'", () => {
    expect(hasWidget(resolveCommandView(["admin"], "x@y.com"), "system-health")).toBe(true);
    expect(hasWidget(resolveCommandView(["admin"], founderEmail), "system-health")).toBe(false);
    expect(hasWidget(resolveCommandView(["employee"], "x@y.com"), "system-health")).toBe(false);
    expect(hasWidget(resolveCommandView(["preview"], "x@y.com"), "system-health")).toBe(false);
  });

  it("every non-viewer role gets the watchlist", () => {
    for (const r of [["admin"], ["employee"], ["trainer"], ["moderator"]] as const) {
      expect(hasWidget(resolveCommandView([...r], "x@y.com"), "watchlist")).toBe(true);
    }
    expect(hasWidget(resolveCommandView(["preview"], "x@y.com"), "watchlist")).toBe(false);
  });

  it("morning brief is always present", () => {
    for (const r of [
      ["admin"], ["employee"], ["trainer"], ["moderator"], ["preview"], [],
    ] as const) {
      expect(hasWidget(resolveCommandView([...r], "x@y.com"), "morning-brief")).toBe(true);
    }
  });
});
