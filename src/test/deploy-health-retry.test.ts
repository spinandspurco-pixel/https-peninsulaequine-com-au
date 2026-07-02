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

describe("runRetryPromotion cache-bust behavior", () => {
  const collectProbe = (calls: string[]) => async (label: string, url: string) => {
    calls.push(url);
    // Always report the same stuck legacy bundle so we exhaust maxAttempts.
    return stuckLegacy(label, "index-old.js");
  };

  it("applies ?_rh=<i> to every attempt for every target when never promoted", async () => {
    const calls: string[] = [];
    const { outcome } = await runRetryPromotion({
      targets: TARGETS,
      probe: collectProbe(calls),
      sleep: async () => {},
      now: () => "2026-01-01T00:00:00Z",
      maxAttempts: 4,
      backoffMs: () => 0,
    });

    // 1 initial "before" probe per target + 4 attempts * 2 targets = 10 total
    expect(calls).toHaveLength(2 + 4 * TARGETS.length);
    expect(outcome.attempts).toBe(4);
    expect(outcome.status).toBe("no_change");

    // Initial "before" probes carry NO cache-bust marker.
    expect(calls.slice(0, 2).every((u) => !u.includes("_rh="))).toBe(true);

    // Each attempt hits every target with the same _rh=<i> value.
    for (let i = 0; i < 4; i++) {
      const attempt = calls.slice(2 + i * TARGETS.length, 2 + (i + 1) * TARGETS.length);
      expect(attempt).toEqual([
        `https://example.test?_rh=${i}`,
        `https://example-pub.test?_rh=${i}`,
      ]);
    }
  });

  it("uses the same ?_rh=<i> scheme when initialBefore skips the pre-probe", async () => {
    const calls: string[] = [];
    const before = TARGETS.map((t) => stuckLegacy(t.label, "index-old.js"));

    await runRetryPromotion({
      targets: TARGETS,
      probe: collectProbe(calls),
      sleep: async () => {},
      now: () => "2026-01-01T00:00:00Z",
      maxAttempts: 4,
      backoffMs: () => 0,
      initialBefore: before,
    });

    // No pre-probe when initialBefore is provided: 4 * 2 = 8 calls.
    expect(calls).toHaveLength(4 * TARGETS.length);
    for (let i = 0; i < 4; i++) {
      const attempt = calls.slice(i * TARGETS.length, (i + 1) * TARGETS.length);
      expect(attempt).toEqual([
        `https://example.test?_rh=${i}`,
        `https://example-pub.test?_rh=${i}`,
      ]);
    }
  });

  it("still applies ?_rh=0 on the attempt that promotes and then stops", async () => {
    const calls: string[] = [];
    let attemptIdx = 0;
    const probeFn = async (label: string, url: string) => {
      calls.push(url);
      // "Before" probes (no _rh) return the stuck legacy bundle.
      if (!url.includes("_rh=")) return stuckLegacy(label, "index-old.js");
      // First retry attempt reports a fresh bundle — should terminate the loop.
      attemptIdx = Math.max(attemptIdx, 1);
      return fresh(label, "index-new.js");
    };

    const { outcome } = await runRetryPromotion({
      targets: TARGETS,
      probe: probeFn,
      sleep: async () => {},
      now: () => "2026-01-01T00:00:00Z",
      maxAttempts: 4,
      backoffMs: () => 0,
    });

    expect(outcome.attempts).toBe(1);
    expect(outcome.status).toBe("success");
    // 2 pre-probes + 2 attempt-0 probes, and every attempted probe used _rh=0.
    expect(calls).toHaveLength(2 + TARGETS.length);
    const attemptCalls = calls.slice(2);
    expect(attemptCalls.every((u) => u.endsWith("?_rh=0"))).toBe(true);
    // No further attempts (?_rh=1, ?_rh=2, …) fired once promoted.
    expect(calls.some((u) => /_rh=[1-9]/.test(u))).toBe(false);
  });
});

describe("runRetryPromotion structured logging", () => {
  it("emits before + per-attempt + outcome events with timing and classification", async () => {
    const events: import("@/lib/deployHealth/retry").RetryLogEvent[] = [];
    let tick = 0;
    const now = () => new Date(1_700_000_000_000 + tick++ * 250).toISOString();

    await runRetryPromotion({
      targets: TARGETS,
      probe: async (label) => stuckLegacy(label, "index-old.js"),
      sleep: async () => {},
      now,
      maxAttempts: 3,
      backoffMs: () => 0,
      onLog: (e) => events.push(e),
    });

    const phases = events.map((e) => e.phase);
    expect(phases).toEqual(["before", "attempt", "attempt", "attempt", "outcome"]);

    // Every event is tagged with the command name for grep-ability.
    expect(events.every((e) => e.command === "runRetryPromotion")).toBe(true);

    // Timing is populated and non-negative on every event.
    for (const e of events) {
      expect(typeof e.durationMs).toBe("number");
      expect(e.durationMs).toBeGreaterThanOrEqual(0);
      expect(new Date(e.startedAt).getTime()).toBeGreaterThan(0);
      expect(new Date(e.finishedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(e.startedAt).getTime(),
      );
      expect(e.targets).toHaveLength(TARGETS.length);
      expect(e.targets[0]).toMatchObject({
        label: "Custom domain",
        url: "https://example.test",
        ok: true,
        stuck: true,
      });
    }

    // Middle attempts flag willRetry=true; last attempt has willRetry=false.
    const attempts = events.filter((e) => e.phase === "attempt");
    expect(attempts.map((a) => a.classification?.willRetry)).toEqual([true, true, false]);
    expect(attempts.every((a) => a.classification?.stillStuck === true)).toBe(true);
    expect(attempts.every((a) => a.classification?.changed === false)).toBe(true);

    const outcome = events[events.length - 1]!;
    expect(outcome.phase).toBe("outcome");
    expect(outcome.classification?.status).toBe("no_change");
    expect(outcome.classification?.message).toMatch(/No change/);
  });

  it("emits an outcome event with error classification when probe throws", async () => {
    const events: import("@/lib/deployHealth/retry").RetryLogEvent[] = [];
    let call = 0;
    const probeFn = async (label: string) => {
      call += 1;
      // Let the "before" pass succeed; blow up on the first retry attempt.
      if (call <= TARGETS.length) return stuckLegacy(label, "index-old.js");
      throw new Error("network down");
    };

    const { outcome } = await runRetryPromotion({
      targets: TARGETS,
      probe: probeFn,
      sleep: async () => {},
      now: () => new Date().toISOString(),
      maxAttempts: 4,
      backoffMs: () => 0,
      onLog: (e) => events.push(e),
    });

    expect(outcome.status).toBe("error");
    const last = events[events.length - 1]!;
    expect(last.phase).toBe("outcome");
    expect(last.classification?.status).toBe("error");
    expect(last.error).toBe("network down");
  });

  it("swallows onLog exceptions so logging never breaks the retry loop", async () => {
    const { outcome } = await runRetryPromotion({
      targets: TARGETS,
      probe: async (label) => fresh(label, "index-new.js"),
      sleep: async () => {},
      now: () => new Date().toISOString(),
      maxAttempts: 2,
      backoffMs: () => 0,
      onLog: () => {
        throw new Error("logger crashed");
      },
    });
    expect(outcome.status).toBe("success");
  });
});
