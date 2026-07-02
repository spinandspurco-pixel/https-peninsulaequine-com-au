import { describe, expect, it } from "vitest";
import { resolveLandingPath } from "@/lib/authRouting";

describe("resolveLandingPath", () => {
  it("routes client-role users to the client portal", () => {
    expect(resolveLandingPath(["user"])).toBe("/portal");
  });

  it("still honours safe redirect targets", () => {
    expect(resolveLandingPath(["user"], "/portal")).toBe("/portal");
  });

  it("rejects external redirect targets", () => {
    expect(resolveLandingPath(["user"], "//evil.example")).toBe("/portal");
  });
});
