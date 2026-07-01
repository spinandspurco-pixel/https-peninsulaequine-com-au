import { describe, it, expect } from "vitest";
import { buildKeyDebugPayload, type KeyDebugPayloadInput } from "./buildKeyDebugPayload";

const RAW_KEY =
  "sb_publishable_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_supersecret_do_not_leak";

const baseInput = (overrides: Partial<KeyDebugPayloadInput> = {}): KeyDebugPayloadInput => ({
  capturedAt: "2026-07-01T00:00:00.000Z",
  origin: "https://peninsulaequine.systems",
  bundleHash: "abc123",
  supaUrl: "https://aizkqajrzkvwuobisnzr.supabase.co",
  supaUrlValid: true,
  supaKey: RAW_KEY,
  supaKeyPrefix: "sb_publishable_",
  supaKeyMasked: "sb_publishable_••••••…(chk:9F2C)",
  supaKeyChecksum: "9F2C",
  supaKeyLen: RAW_KEY.length,
  supaKeyShape: "sb_publishable",
  family: "new",
  paletteLabel: "OK",
  paletteMsg: "New-format publishable key detected.",
  diag: {
    supabase: {
      urlHost: "aizkqajrzkvwuobisnzr.supabase.co",
      key: { family: "sb_publishable", prefix: "sb_publishable_", length: RAW_KEY.length },
    },
  },
  ...overrides,
});

/** Recursively collect every string value in the payload for leak scanning. */
function collectStrings(value: unknown, acc: string[] = []): string[] {
  if (typeof value === "string") acc.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, acc));
  else if (value && typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((v) => collectStrings(v, acc));
  }
  return acc;
}

describe("buildKeyDebugPayload", () => {
  it("never includes the raw publishable key in any field or as JSON", () => {
    const payload = buildKeyDebugPayload(baseInput());
    const strings = collectStrings(payload);

    for (const s of strings) {
      expect(s).not.toBe(RAW_KEY);
      expect(s.includes(RAW_KEY)).toBe(false);
    }

    const serialised = JSON.stringify(payload);
    expect(serialised.includes(RAW_KEY)).toBe(false);
    // Also assert no long high-entropy tail of the key leaks (last 20 chars).
    expect(serialised.includes(RAW_KEY.slice(-20))).toBe(false);
    // Nothing named `key`, `rawKey`, `value`, or `secret` should exist at any depth.
    expect(serialised).not.toMatch(/"rawKey"|"secret"|"apiKey"/);
  });

  it("always contains the masked representation and the checksum fields", () => {
    const payload = buildKeyDebugPayload(baseInput());
    expect(payload.publishableKey.masked).toBe("sb_publishable_••••••…(chk:9F2C)");
    expect(payload.publishableKey.checksum).toBe("9F2C");
    expect(payload.publishableKey.masked).toContain("•");
    expect(payload.publishableKey.masked).toContain("chk:");
    expect(payload.publishableKey.expectedPrefix).toBe("sb_publishable_");
  });

  it("keeps masked+checksum populated even when the raw key is missing", () => {
    const payload = buildKeyDebugPayload(
      baseInput({
        supaKey: null,
        supaKeyPrefix: "",
        supaKeyMasked: "(missing)",
        supaKeyChecksum: "0000",
        supaKeyLen: 0,
        family: "missing",
        paletteLabel: "MISSING",
      }),
    );
    expect(payload.publishableKey.masked).toBe("(missing)");
    expect(payload.publishableKey.checksum).toBe("0000");
    expect(payload.publishableKey.length).toBeNull();
    expect(payload.publishableKey.family).toBe("missing");
  });

  it("keeps masked+checksum populated for legacy JWT keys and does not echo the JWT", () => {
    const legacyJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature";
    const payload = buildKeyDebugPayload(
      baseInput({
        supaKey: legacyJwt,
        supaKeyPrefix: "eyJhbGciOi",
        supaKeyMasked: "eyJhbGciOi••••••…(chk:DEAD)",
        supaKeyChecksum: "DEAD",
        supaKeyLen: legacyJwt.length,
        family: "legacy",
      }),
    );
    expect(payload.publishableKey.masked).toContain("chk:DEAD");
    expect(payload.publishableKey.checksum).toBe("DEAD");
    expect(JSON.stringify(payload).includes(legacyJwt)).toBe(false);
  });

  it("emits pending / error / ok server comparison states without leaking the key", () => {
    const pending = buildKeyDebugPayload(baseInput({ diag: null }));
    expect(pending.serverComparison).toEqual({ state: "pending" });

    const errored = buildKeyDebugPayload(
      baseInput({ diag: { error: "network", httpStatus: 502 } }),
    );
    expect(errored.serverComparison).toMatchObject({
      state: "error",
      error: "network",
      httpStatus: 502,
    });

    const ok = buildKeyDebugPayload(baseInput());
    expect(ok.serverComparison).toMatchObject({
      state: "ok",
      familyMatch: true,
      prefixMatch: true,
      lengthMatch: true,
    });

    for (const p of [pending, errored, ok]) {
      expect(JSON.stringify(p).includes(RAW_KEY)).toBe(false);
      expect(p.publishableKey.masked).toBeTruthy();
      expect(p.publishableKey.checksum).toBeTruthy();
    }
  });
});
