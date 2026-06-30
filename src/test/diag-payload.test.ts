import { describe, it, expect } from "vitest";
import { classifySupabaseKey, isDiagResponse, makeDiagPayload } from "@/lib/healthPayload";

const baseInput = {
  buildTime: "2026-06-30T12:00:00.000Z",
  buildCommit: "abc1234",
  bundleHash: "index-ABCD1234.js",
  supabaseUrl: "https://aizkqajrzkvwuobisnzr.supabase.co",
};

describe("classifySupabaseKey", () => {
  it("classifies the new sb_publishable_ format as ok", () => {
    const info = classifySupabaseKey("sb_publishable_abcdefghij1234567890");
    expect(info.family).toBe("sb_publishable");
    expect(info.prefix).toBe("sb_publishable_");
    expect(info.ok).toBe(true);
    expect(info.isLegacyJwt).toBe(false);
  });

  it("flags the legacy JWT format as not ok", () => {
    const info = classifySupabaseKey("eyJhbGciOiJIUzI1NiJ9.payload.sig");
    expect(info.family).toBe("legacy_jwt");
    expect(info.prefix).toBe("eyJ…");
    expect(info.ok).toBe(false);
    expect(info.isLegacyJwt).toBe(true);
  });

  it("flags a sb_secret_ key as not ok (server key in client)", () => {
    const info = classifySupabaseKey("sb_secret_xxxxxxxxxxxx");
    expect(info.family).toBe("sb_secret");
    expect(info.ok).toBe(false);
  });

  it("reports missing when the key is empty", () => {
    expect(classifySupabaseKey(null).family).toBe("missing");
    expect(classifySupabaseKey("").family).toBe("missing");
    expect(classifySupabaseKey(undefined).family).toBe("missing");
  });

  it("reports unknown when the prefix is unrecognised", () => {
    const info = classifySupabaseKey("totally-bogus");
    expect(info.family).toBe("unknown");
    expect(info.ok).toBe(false);
  });

  it("never returns the raw key value in any field", () => {
    const raw = "sb_publishable_SUPERSECRETPART";
    const info = classifySupabaseKey(raw);
    const serialised = JSON.stringify(info);
    expect(serialised.includes("SUPERSECRETPART")).toBe(false);
  });
});

describe("/api/diag payload contract", () => {
  it("emits service, checkedAt, buildInfo, and a supabase block", () => {
    const payload = makeDiagPayload({
      ...baseInput,
      supabaseKey: "sb_publishable_zzzzzzzzzzzz",
    });
    expect(payload.service).toBe("peninsula-os-web");
    expect(Number.isNaN(Date.parse(payload.checkedAt))).toBe(false);
    expect(payload.buildInfo.bundleHash).toBe(baseInput.bundleHash);
    expect(payload.supabase.urlPresent).toBe(true);
    expect(payload.supabase.urlValid).toBe(true);
    expect(payload.supabase.urlHost).toBe("aizkqajrzkvwuobisnzr.supabase.co");
    expect(payload.supabase.key.ok).toBe(true);
  });

  it("never includes the raw publishable key value", () => {
    const raw = "sb_publishable_MUSTNOTLEAK";
    const payload = makeDiagPayload({ ...baseInput, supabaseKey: raw });
    const serialised = JSON.stringify(payload);
    expect(serialised.includes("MUSTNOTLEAK")).toBe(false);
  });

  it("marks invalid Supabase URLs as not valid but still exposes the host", () => {
    const payload = makeDiagPayload({
      ...baseInput,
      supabaseUrl: "https://example.com",
      supabaseKey: "eyJabc",
    });
    expect(payload.supabase.urlValid).toBe(false);
    expect(payload.supabase.urlHost).toBe("example.com");
    expect(payload.supabase.key.family).toBe("legacy_jwt");
  });

  it("round-trips through JSON and satisfies isDiagResponse", () => {
    const payload = makeDiagPayload({
      ...baseInput,
      supabaseKey: "sb_publishable_abc",
    });
    const wire = JSON.parse(JSON.stringify(payload)) as unknown;
    expect(isDiagResponse(wire)).toBe(true);
  });

  it("rejects malformed payloads via isDiagResponse", () => {
    expect(isDiagResponse(null)).toBe(false);
    expect(isDiagResponse({})).toBe(false);
    expect(isDiagResponse({ service: "x", checkedAt: "no" })).toBe(false);
  });
});
