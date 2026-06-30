import { describe, it, expect } from "vitest";
import {
  isHealthResponse,
  makeBuildInfoPayload,
  makeHealthPayload,
} from "@/lib/healthPayload";
import type { HealthResponse } from "@/types/health";

const fixture = {
  buildTime: "2026-06-30T12:00:00.000Z",
  buildCommit: "abc1234",
  bundleHash: "index-ABCD1234.js",
};

describe("/api/health payload contract", () => {
  it("returns the four required top-level fields", () => {
    const payload = makeHealthPayload(fixture);
    expect(payload.status).toBe("ok");
    expect(payload.service).toBe("peninsula-os-web");
    expect(typeof payload.checkedAt).toBe("string");
    expect(Number.isNaN(Date.parse(payload.checkedAt))).toBe(false);
    expect(payload.buildInfo).toEqual(makeBuildInfoPayload(fixture));
  });

  it("embeds the full buildInfo block", () => {
    const payload = makeHealthPayload(fixture);
    expect(payload.buildInfo.buildTime).toBe(fixture.buildTime);
    expect(payload.buildInfo.buildCommit).toBe(fixture.buildCommit);
    expect(payload.buildInfo.bundleHash).toBe(fixture.bundleHash);
  });

  it("tolerates a null bundleHash during dev / pre-build", () => {
    const payload = makeHealthPayload({ ...fixture, bundleHash: null });
    expect(payload.buildInfo.bundleHash).toBeNull();
    expect(isHealthResponse(payload)).toBe(true);
  });

  it("uses the override checkedAt when supplied", () => {
    const fixed = "2026-01-01T00:00:00.000Z";
    expect(makeHealthPayload({ ...fixture, checkedAt: fixed }).checkedAt).toBe(fixed);
  });

  it("serialises to JSON that round-trips into the same HealthResponse", () => {
    const payload = makeHealthPayload(fixture);
    const wire = JSON.parse(JSON.stringify(payload)) as unknown;
    expect(isHealthResponse(wire)).toBe(true);
    expect(wire).toEqual(payload);
  });
});

describe("isHealthResponse guard", () => {
  const valid: HealthResponse = makeHealthPayload(fixture);

  it("accepts a well-formed payload", () => {
    expect(isHealthResponse(valid)).toBe(true);
  });

  it.each([
    ["missing status", { ...valid, status: undefined }],
    ["bad status value", { ...valid, status: "fine" }],
    ["missing service", { ...valid, service: "" }],
    ["non-ISO checkedAt", { ...valid, checkedAt: "yesterday" }],
    ["missing buildInfo", { ...valid, buildInfo: undefined }],
    ["bad bundleHash type", { ...valid, buildInfo: { ...valid.buildInfo, bundleHash: 42 } }],
    ["missing buildTime", { ...valid, buildInfo: { ...valid.buildInfo, buildTime: undefined } }],
    ["null", null],
    ["string", "ok"],
  ])("rejects %s", (_label, bad) => {
    expect(isHealthResponse(bad)).toBe(false);
  });
});
