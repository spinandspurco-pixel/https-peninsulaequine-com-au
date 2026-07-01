import { describe, expect, it } from "vitest";
import {
  assertMgmtCall,
  MgmtApiGuardError,
  normaliseMgmtPath,
} from "../../scripts/ci/mgmtApiGuard";

const ALLOWED = "https://api.supabase.com/v1/projects/aizkqajrzkvwuobisnzr/database/lints";

describe("assertMgmtCall", () => {
  it("returns the normalised path for an allowlisted GET", () => {
    expect(assertMgmtCall(ALLOWED, "GET")).toBe(
      "/v1/projects/{ref}/database/lints",
    );
  });

  it("accepts case-insensitive methods", () => {
    expect(assertMgmtCall(ALLOWED, "get")).toBe(
      "/v1/projects/{ref}/database/lints",
    );
  });

  it("ignores query strings, fragments, and trailing slashes", () => {
    expect(assertMgmtCall(`${ALLOWED}/?debug=1#top`, "GET")).toBe(
      "/v1/projects/{ref}/database/lints",
    );
  });

  it("throws when the host is not the Management API", () => {
    expect(() => assertMgmtCall("https://example.com/v1/projects/x/database/lints", "GET"))
      .toThrow(MgmtApiGuardError);
  });

  it("throws when the path is not on the allowlist", () => {
    try {
      assertMgmtCall("https://api.supabase.com/v1/projects/xyz/functions", "GET");
      throw new Error("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(MgmtApiGuardError);
      expect((err as MgmtApiGuardError).code).toBe("path_not_allowed");
    }
  });

  it("throws when the method is not permitted for the path", () => {
    try {
      assertMgmtCall(ALLOWED, "POST");
      throw new Error("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(MgmtApiGuardError);
      expect((err as MgmtApiGuardError).code).toBe("method_not_allowed");
    }
  });

  it("throws on a malformed URL", () => {
    expect(() => assertMgmtCall("not a url", "GET")).toThrow(MgmtApiGuardError);
  });
});

describe("normaliseMgmtPath (guard variant)", () => {
  it("matches the scanner's normalisation for the lints endpoint", () => {
    const variants = [
      "/v1/projects/${ref}/database/lints",
      "/v1/projects/${projectRef}/database/lints",
      "/v1/projects/aizkqajrzkvwuobisnzr/database/lints/",
      "/v1/projects/${ref}/database/lints?x=1",
    ];
    for (const v of variants) {
      expect(normaliseMgmtPath(v)).toBe("/v1/projects/{ref}/database/lints");
    }
  });
});
