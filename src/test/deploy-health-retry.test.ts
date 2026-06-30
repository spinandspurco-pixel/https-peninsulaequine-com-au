import { describe, it, expect, vi } from "vitest";
import {
  classifyRetryOutcome,
  isStuck,
  runRetryPromotion,
  defaultBackoff,
  type ProbeLike,
  type RetryTarget,
} from "@/lib/deployHealth/retry";

const TARGETS: RetryTarget[] = [
  { label: "Custom domain", url: "https://example.test" },
  { label: "Lovable published", url: "https://example-pub.test" },
];

function probe(overrides: Partial<ProbeLike> & { label: string }): ProbeLike {
  return {
    url: "https://x",
    ok: true,
    bundleFile: null,
    hasLegacyKey: false,
    hasModernKey: true,
    ...overrides,
  };
}

const stuckLegacy = (label: string, bundle: string): ProbeLike =>
  probe({ label, bundleFile: bundle, hasLegacyKey: true, hasModernKey: false });
const fresh = (label: string, bundle: string): ProbeLike =>
  probe({ label, bundleFile: bundle, hasLegacyKey: false, hasModernKey: true });

describe("isStuck", () => {
  it("treats legacy JWT marker as stuck", () => {
    expect(isStuck(stuckLegacy("a", "index-old.js"))).toBe(true);
  });
  it("treats missing modern marker as stuck", () => {
    expect(
      isStuck(probe({ label: "a", bundleFile: "x", hasLegacyKey: false, hasModernKey: false })),
    ).toBe(true);
  });
  it("treats fresh bundle as not stuck", () => {
    expect(isStuck(fresh("a", "index-new.js"))).toBe(false);
  });
  it("treats failed probe as not stuck (cannot judge)", () => {
    expect(
      isStuck(probe({ label: "a", ok: false, hasLegacyKey: null, hasModernKey: null })),
    ).toBe(false);
  });
});

describe("classifyRetryOutcome", () => {
  const snap = (label: string, bundleFile: string | null, stuck: boolean) => ({
    label,
    bundleFile,
    stuck,
  });

  it("success when nothing is stuck and a bundle changed", () => {
    const out = classifyRetryOutcome(
      [snap("a", "old.js", true), snap("b", "old.js", true)],
      [snap("a", "new.js", false), snap("b", "new.js", false)],
      2,
    );
    expect(out.status).toBe("success");
    expect(out.message).toMatch(/Promotion landed/);
  });

  it("success when nothing is stuck even if bundles unchanged (already fresh)", () => {
    const out = classifyRetryOutcome(
      [snap("a", "new.js", false)],
      [snap("a", "new.js", false)],
      1,
    );
    expect(out.status).toBe("success");
    expect(out.message).toMatch(/All targets fresh/);
  });

  it("partial when some changed but at least one still stuck", () => {
    const out = classifyRetryOutcome(
      [snap("a", "old.js", true), snap("b", "old.js", true)],
      [snap("a", "new.js", false), snap("b", "old.js", true)],
      3,
    );
    expect(out.status).toBe("partial");
    expect(out.message).toMatch(/1 target\(s\) updated, 1 still stale/);
  });

  it("no_change when all still stuck and no bundle changed", () => {
    const out = classifyRetryOutcome(
      [snap("a", "old.js", true)],
      [snap("a", "old.js", true)],
      4,
    );
    expect(out.status).toBe("no_change");
    expect(out.message).toMatch(/No change after 4 attempt/);
  });
});

describe("defaultBackoff", () => {
  it("scales 1500, 3000, 4500", () => {
    expect(defaultBackoff(0)).toBe(1500);
    expect(defaultBackoff(1)).toBe(3000);
    expect(defaultBackoff(2)).toBe(4500);
  });
});

describe("runRetryPromotion", () => {
  const now = () => "2026-06-30T00:00:00.000Z";

  it("returns success on first attempt when fresh bundle is already live", async () => {
    const probeFn = vi.fn(async (label: string) =>
      fresh(label, "index-new.js"),
    );
    const sleep = vi.fn(async (_ms: number) => {});
    const result = await runRetryPromotion({
      targets: TARGETS,
      probe: probeFn,
      sleep,
      now,
    });
    expect(result.outcome.status).toBe("success");
    expect(result.outcome.attempts).toBe(1);
    expect(sleep).not.toHaveBeenCalled();
    // Each target probed twice: before snapshot + 1 retry attempt.
    expect(probeFn).toHaveBeenCalledTimes(TARGETS.length * 2);
  });

  it("retries with backoff and succeeds when the bundle eventually flips", async () => {
    // Pass 0 (initial before): stuck
    // Pass 1 (retry 1): still stuck
    // Pass 2 (retry 2): still stuck
    // Pass 3 (retry 3): fresh -> break
    let pass = 0;
    const seenUrls: string[] = [];
    const probeFn = vi.fn(async (label: string, url: string) => {
      seenUrls.push(url);
      // 2 targets per pass
      const passIndex = Math.floor((seenUrls.length - 1) / TARGETS.length);
      pass = passIndex;
      if (passIndex < 3) return stuckLegacy(label, "index-old.js");
      return fresh(label, "index-new.js");
    });
    const sleep = vi.fn(async (_ms: number) => {});
    const result = await runRetryPromotion({
      targets: TARGETS,
      probe: probeFn,
      sleep,
      now,
      maxAttempts: 4,
    });

    expect(result.outcome.status).toBe("success");
    expect(result.outcome.message).toMatch(/Promotion landed/);
    expect(result.outcome.attempts).toBe(3);
    // Sleep called between attempts 1->2 and 2->3 (2 sleeps), with default backoff.
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(sleep.mock.calls[0][0]).toBe(1500);
    expect(sleep.mock.calls[1][0]).toBe(3000);

    // After URLs were restored on the final probes (no _rh= suffix).
    expect(result.finalProbes.every((p) => !p.url.includes("_rh"))).toBe(true);
    // Cache-bust query was used on every retry probe.
    const retryUrls = seenUrls.slice(TARGETS.length); // skip "before" pass
    expect(retryUrls.every((u) => u.includes("?_rh="))).toBe(true);
    // suppress unused-var warning while keeping the running counter for clarity
    expect(pass).toBe(3);
  });

  it("returns partial when one domain updates but the other stays stuck", async () => {
    let attempt = 0;
    const probeFn = vi.fn(async (label: string) => {
      const isBeforePass = attempt < TARGETS.length;
      attempt += 1;
      if (isBeforePass) return stuckLegacy(label, "index-old.js");
      if (label === "Custom domain") return fresh(label, "index-new.js");
      return stuckLegacy(label, "index-old.js");
    });
    const sleep = vi.fn(async (_ms: number) => {});
    const result = await runRetryPromotion({
      targets: TARGETS,
      probe: probeFn,
      sleep,
      now,
      maxAttempts: 4,
    });

    expect(result.outcome.status).toBe("partial");
    expect(result.outcome.message).toMatch(/1 target\(s\) updated, 1 still stale/);
    // Loop breaks early because `changed` is true on the first retry pass.
    expect(result.outcome.attempts).toBe(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("returns no_change after exhausting maxAttempts when nothing flips", async () => {
    const probeFn = vi.fn(async (label: string) =>
      stuckLegacy(label, "index-old.js"),
    );
    const sleep = vi.fn(async (_ms: number) => {});
    const result = await runRetryPromotion({
      targets: TARGETS,
      probe: probeFn,
      sleep,
      now,
      maxAttempts: 4,
    });

    expect(result.outcome.status).toBe("no_change");
    expect(result.outcome.attempts).toBe(4);
    // Sleep called 3 times (between attempts 1-2, 2-3, 3-4) — not after the last.
    expect(sleep).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls.map((c) => c[0])).toEqual([1500, 3000, 4500]);
  });

  it("returns status=error when a probe throws", async () => {
    let calls = 0;
    const probeFn = vi.fn(async (label: string) => {
      calls += 1;
      // First pass (before) succeeds; first retry throws.
      if (calls <= TARGETS.length) return stuckLegacy(label, "index-old.js");
      throw new Error("network down");
    });
    const sleep = vi.fn(async (_ms: number) => {});
    const result = await runRetryPromotion({
      targets: TARGETS,
      probe: probeFn,
      sleep,
      now,
    });

    expect(result.outcome.status).toBe("error");
    expect(result.outcome.message).toMatch(/Retry failed: network down/);
    // Before snapshot is reused as after when retry errors out.
    expect(result.outcome.after).toEqual(result.outcome.before);
  });

  it("reuses initialBefore probes instead of refetching the before snapshot", async () => {
    const initial = TARGETS.map((t) => stuckLegacy(t.label, "index-old.js"));
    const probeFn = vi.fn(async (label: string) =>
      fresh(label, "index-new.js"),
    );
    const sleep = vi.fn(async (_ms: number) => {});
    const result = await runRetryPromotion({
      targets: TARGETS,
      probe: probeFn,
      sleep,
      now,
      initialBefore: initial,
    });

    expect(result.outcome.status).toBe("success");
    // Only retry probes were made — before snapshot reused.
    expect(probeFn).toHaveBeenCalledTimes(TARGETS.length);
    // before reflects the injected initial (stuck), after reflects the retry (fresh).
    expect(result.outcome.before.every((b) => b.stuck)).toBe(true);
    expect(result.outcome.after.every((a) => !a.stuck)).toBe(true);
  });
});

describe("retry outcome -> UI banner mapping", () => {
  // The UI selects banner colour + label from outcome.status. This mirrors
  // the switch in HqDeployHealth.tsx so a regression in either stays caught.
  const bannerFor = (status: "success" | "partial" | "no_change" | "error") => {
    switch (status) {
      case "success":
        return { tone: "emerald", label: "Retry succeeded" };
      case "partial":
        return { tone: "amber", label: "Retry partial" };
      case "no_change":
        return { tone: "amber", label: "Retry — no change" };
      case "error":
        return { tone: "red", label: "Retry error" };
    }
  };

  it("success -> emerald 'Retry succeeded'", () => {
    expect(bannerFor("success")).toEqual({ tone: "emerald", label: "Retry succeeded" });
  });
  it("partial -> amber 'Retry partial'", () => {
    expect(bannerFor("partial")).toEqual({ tone: "amber", label: "Retry partial" });
  });
  it("no_change -> amber 'Retry — no change'", () => {
    expect(bannerFor("no_change")).toEqual({ tone: "amber", label: "Retry — no change" });
  });
  it("error -> red 'Retry error'", () => {
    expect(bannerFor("error")).toEqual({ tone: "red", label: "Retry error" });
  });
});
