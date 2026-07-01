/**
 * Lightweight spam guard for public inquiry forms.
 *
 * Two low-friction checks — no third-party CAPTCHA required:
 *   1. Honeypot: a hidden field ("website") that real users never fill.
 *      Bots that autofill every input give themselves away.
 *   2. Minimum dwell time: a form submitted in under ~1.5s was almost
 *      certainly not typed by a human.
 *
 * `check()` returns a reason on failure so callers can *silently* short-
 * circuit (pretend success) instead of surfacing an error message — the
 * quieter the rejection, the less bots learn about the trap.
 */
import { useMemo, useRef, useState } from "react";

export type SpamCheckResult =
  | { ok: true }
  | { ok: false; reason: "honeypot" | "too_fast" };

export interface SpamGuard {
  /** Bind to a hidden input. Do NOT rename — the name is the bait. */
  honeypotProps: {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    tabIndex: number;
    autoComplete: string;
    "aria-hidden": boolean;
  };
  /** Style block for visually hiding the honeypot from real users. */
  honeypotWrapperStyle: React.CSSProperties;
  /** Run at submit time; returns { ok:false, reason } if suspicious. */
  check: () => SpamCheckResult;
  /** Elapsed ms since mount — useful for server-side timing checks. */
  elapsedMs: () => number;
}

const MIN_DWELL_MS = 1500;

export function useSpamGuard(): SpamGuard {
  const mountedAt = useRef<number>(Date.now());
  const [hp, setHp] = useState("");

  return useMemo(
    () => ({
      honeypotProps: {
        name: "website",
        value: hp,
        onChange: (e) => setHp(e.target.value),
        tabIndex: -1,
        autoComplete: "off",
        "aria-hidden": true,
      },
      honeypotWrapperStyle: {
        position: "absolute",
        left: "-10000px",
        top: "auto",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      },
      check: () => {
        if (hp.trim().length > 0) return { ok: false, reason: "honeypot" };
        if (Date.now() - mountedAt.current < MIN_DWELL_MS) {
          return { ok: false, reason: "too_fast" };
        }
        return { ok: true };
      },
      elapsedMs: () => Date.now() - mountedAt.current,
    }),
    [hp],
  );
}
