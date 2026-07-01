/**
 * Pure retry-promotion orchestration for /hq/deploy-health.
 *
 * Extracted so the backoff loop and success/failure classification can be
 * unit-tested without spinning up the full HQ page (auth, supabase, toasts,
 * audit log, react).
 *
 * The component injects `probe` and `sleep`; tests inject fakes.
 */

export type ProbeLike = {
  label: string;
  url: string;
  ok: boolean;
  bundleFile: string | null;
  hasLegacyKey: boolean | null;
  hasModernKey: boolean | null;
};

export type RetryTarget = { label: string; url: string };

export type RetrySnapshot = {
  label: string;
  bundleFile: string | null;
  stuck: boolean;
};

export type RetryStatus = "success" | "partial" | "no_change" | "error";

export type RetryOutcome = {
  startedAt: string;
  finishedAt: string;
  attempts: number;
  before: RetrySnapshot[];
  after: RetrySnapshot[];
  status: RetryStatus;
  message: string;
};

export type RetryLogPhase = "before" | "attempt" | "outcome";

export type RetryLogEvent = {
  /** Stable command name — makes correlation across logs trivial. */
  command: "runRetryPromotion";
  phase: RetryLogPhase;
  /** 0 for the "before" pre-probe, 1..maxAttempts for retry passes, maxAttempts for the final outcome. */
  attempt: number;
  maxAttempts: number;
  /** ISO timestamps for correlation with latency history rows. */
  startedAt: string;
  finishedAt: string;
  /** Wall-clock duration of this phase, in ms. */
  durationMs: number;
  /** Per-target probe result recorded during this phase. */
  targets: Array<{
    label: string;
    url: string;
    ok: boolean;
    bundleFile: string | null;
    stuck: boolean;
  }>;
  /** Only set on `phase: "attempt" | "outcome"`. */
  classification?: {
    stillStuck: boolean;
    changed: boolean;
    willRetry: boolean;
    /** Final RetryOutcome status — only set on `phase: "outcome"`. */
    status?: RetryStatus;
    message?: string;
  };
  /** Present when the loop threw. */
  error?: string;
};

export type RetryDeps<P extends ProbeLike> = {
  targets: RetryTarget[];
  probe: (label: string, url: string) => Promise<P>;
  sleep: (ms: number) => Promise<void>;
  now: () => string;
  maxAttempts?: number;
  backoffMs?: (attemptIndex: number) => number;
  /** Re-use already-fetched probes as the "before" snapshot. */
  initialBefore?: P[] | null;
  /**
   * Progress callback fired once per attempt, before the probe pass runs.
   * Lets the UI show "Retrying promotion… (2/4)" without polling.
   */
  onAttempt?: (attempt: number, maxAttempts: number) => void;
  /**
   * Structured log callback. Fires once for the "before" pre-probe, once per
   * retry attempt, and once with the final classification. Support uses these
   * events to correlate a stuck promotion with the observed latency history.
   */
  onLog?: (event: RetryLogEvent) => void;
};



export function isStuck(r: ProbeLike): boolean {
  if (!r.ok) return false;
  return r.hasLegacyKey === true || r.hasModernKey === false;
}

export function snapshot(r: ProbeLike): RetrySnapshot {
  return { label: r.label, bundleFile: r.bundleFile, stuck: isStuck(r) };
}

/** Default exponential-ish backoff: 1500, 3000, 4500, … */
export const defaultBackoff = (i: number) => 1500 * (i + 1);

/**
 * Classify the final state of a retry pass. Pure — no side effects.
 * Mirrors what the UI banner needs (status + human message).
 */
export function classifyRetryOutcome(
  before: RetrySnapshot[],
  after: RetrySnapshot[],
  attempts: number,
): { status: RetryStatus; message: string } {
  const stillStuck = after.filter((a) => a.stuck);
  const changed = after.filter((a, idx) => {
    const b = before[idx];
    return !!(b && a.bundleFile && b.bundleFile && a.bundleFile !== b.bundleFile);
  });

  if (stillStuck.length === 0 && changed.length > 0) {
    return {
      status: "success",
      message: `Promotion landed — fresh bundle on ${changed.length}/${after.length} target(s).`,
    };
  }
  if (stillStuck.length === 0) {
    return {
      status: "success",
      message: `All targets fresh (no stale markers detected).`,
    };
  }
  if (changed.length > 0) {
    return {
      status: "partial",
      message: `Partial — ${changed.length} target(s) updated, ${stillStuck.length} still stale.`,
    };
  }
  return {
    status: "no_change",
    message: `No change after ${attempts} attempt(s) — promotion still stuck. Escalate to Lovable Support.`,
  };
}

export type RetryResult<P extends ProbeLike> = {
  outcome: RetryOutcome;
  /** Final probe pass with the original (non cache-busted) URLs restored. */
  finalProbes: P[];
};

/**
 * Run the retry-promotion backoff loop.
 *
 * Behaviour:
 *  - Re-probes each target with a `?_rh=<ts>` cache-bust on every attempt.
 *  - Breaks early when no target is still stuck OR any bundleFile changed
 *    relative to `before`.
 *  - Sleeps `backoffMs(i)` between attempts (skipped on the final attempt).
 *  - Caps at `maxAttempts` (default 4).
 *  - If any probe throws, returns status="error" with the before snapshot
 *    used as the after snapshot.
 */
export async function runRetryPromotion<P extends ProbeLike>(
  deps: RetryDeps<P>,
): Promise<RetryResult<P>> {
  const {
    targets,
    probe,
    sleep,
    now,
    maxAttempts = 4,
    backoffMs = defaultBackoff,
    initialBefore = null,
    onAttempt,
  } = deps;

  const startedAt = now();
  const beforeProbes =
    initialBefore && initialBefore.length
      ? initialBefore
      : await Promise.all(targets.map((t) => probe(t.label, t.url)));
  const before = beforeProbes.map(snapshot);

  let afterProbes: P[] = beforeProbes;
  let attempts = 0;

  try {
    for (let i = 0; i < maxAttempts; i++) {
      attempts = i + 1;
      try {
        onAttempt?.(attempts, maxAttempts);
      } catch {
        /* progress callback errors must not break the retry loop */
      }
      afterProbes = await Promise.all(
        targets.map((t) => probe(t.label, `${t.url}?_rh=${i}`)),
      );
      const stillStuck = afterProbes.some(isStuck);
      const changed = afterProbes.some((r, idx) => {
        const b = before[idx];
        return !!(b && r.bundleFile && b.bundleFile && r.bundleFile !== b.bundleFile);
      });
      if (!stillStuck || changed) break;
      if (i < maxAttempts - 1) {
        await sleep(backoffMs(i));
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      outcome: {
        startedAt,
        finishedAt: now(),
        attempts,
        before,
        after: before,
        status: "error",
        message: `Retry failed: ${msg}`,
      },
      finalProbes: beforeProbes,
    };
  }

  // Restore original URLs (strip cache-bust) for display.
  const cleaned = afterProbes.map((r, idx) => ({ ...r, url: targets[idx].url }));
  const after = cleaned.map(snapshot);
  const { status, message } = classifyRetryOutcome(before, after, attempts);

  return {
    outcome: {
      startedAt,
      finishedAt: now(),
      attempts,
      before,
      after,
      status,
      message,
    },
    finalProbes: cleaned,
  };
}
