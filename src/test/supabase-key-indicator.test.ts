import { describe, expect, it } from "vitest";
import { classifyClientSupabaseKey } from "@/lib/supabaseKeyIndicator";

describe("classifyClientSupabaseKey", () => {
  describe("sb_publishable_* (modern, expected)", () => {
    const info = classifyClientSupabaseKey(
      "sb_publishable_abcdefghij1234567890ABCDEF",
    );
    it("is family=modern, severity=ok", () => {
      expect(info.family).toBe("modern");
      expect(info.severity).toBe("ok");
    });
    it("uses the OK label and ✓ message", () => {
      expect(info.label).toBe("OK");
      expect(info.message).toContain("sb_publishable_");
      expect(info.message).toContain("✓");
    });
    it("reports the modern prefix exactly", () => {
      expect(info.detectedPrefix).toBe("sb_publishable_");
      expect(info.expectedPrefix).toBe("sb_publishable_");
    });
  });

  describe("legacy eyJ… JWT", () => {
    const info = classifyClientSupabaseKey(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature",
    );
    it("is family=legacy_jwt, severity=error", () => {
      expect(info.family).toBe("legacy_jwt");
      expect(info.severity).toBe("error");
    });
    it("uses the MISMATCH label and disabled-keys message", () => {
      expect(info.label).toBe("MISMATCH");
      expect(info.message).toMatch(/legacy/i);
      expect(info.message).toMatch(/disabled|expected sb_publishable_/i);
    });
    it("detects the eyJ prefix", () => {
      expect(info.detectedPrefix).toBe("eyJ");
    });
  });

  describe("sb_secret_* (server key leaked into client bundle)", () => {
    const info = classifyClientSupabaseKey("sb_secret_xxxxxxxxxxxxxxxxxxxx");
    it("is family=secret, severity=danger", () => {
      expect(info.family).toBe("secret");
      expect(info.severity).toBe("danger");
    });
    it("uses the DANGER label and explicit server-key warning", () => {
      expect(info.label).toBe("DANGER");
      expect(info.message).toMatch(/server key/i);
      expect(info.message).toMatch(/never ship to the client/i);
    });
    it("detects the sb_secret_ prefix", () => {
      expect(info.detectedPrefix).toBe("sb_secret_");
    });
  });

  describe.each([
    ["null", null],
    ["undefined", undefined],
    ["empty string", ""],
    ["whitespace only", "   "],
  ])("missing key (%s)", (_label, value) => {
    const info = classifyClientSupabaseKey(value as string | null | undefined);
    it("is family=missing, severity=error", () => {
      expect(info.family).toBe("missing");
      expect(info.severity).toBe("error");
    });
    it("uses the MISSING label and length=0", () => {
      expect(info.label).toBe("MISSING");
      expect(info.length).toBe(0);
      expect(info.detectedPrefix).toBe("(empty)");
    });
  });

  describe("unknown prefix", () => {
    const info = classifyClientSupabaseKey("totally-bogus-key-value");
    it("is family=unknown, severity=warn", () => {
      expect(info.family).toBe("unknown");
      expect(info.severity).toBe("warn");
      expect(info.label).toBe("UNKNOWN");
    });
    it("truncates the detected prefix to ≤16 chars", () => {
      expect(info.detectedPrefix.length).toBeLessThanOrEqual(16);
      expect(info.detectedPrefix).toBe("totally-bogus-ke");
    });
  });

  it("trims surrounding whitespace before classifying", () => {
    const info = classifyClientSupabaseKey("  sb_publishable_zzz  ");
    expect(info.family).toBe("modern");
    expect(info.length).toBe("sb_publishable_zzz".length);
  });

  it("always reports sb_publishable_ as the expected prefix", () => {
    for (const k of [null, "", "eyJ.x.y", "sb_secret_xyz", "garbage", "sb_publishable_x"]) {
      expect(classifyClientSupabaseKey(k as string | null).expectedPrefix).toBe(
        "sb_publishable_",
      );
    }
  });
});
