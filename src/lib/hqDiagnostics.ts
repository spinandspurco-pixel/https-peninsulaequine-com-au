/**
 * HQ Diagnostics
 * ──────────────
 * Lightweight, temporary instrumentation for the HQ login-hang investigation.
 * Lets us see, in the browser console:
 *   - which HQ children actually mounted
 *   - which Supabase queries fired, finished, errored or timed out
 *   - whether the Admin shell is gated on auth, role or child data
 *
 * Pattern:
 *   import { hqLog, useHqMount, withHqTimeout, HQ_DEFAULT_TIMEOUT_MS } from "@/lib/hqDiagnostics";
 *   useHqMount("CommandOverview");
 *   const result = await withHqTimeout("CommandOverview:load", Promise.all([...]));
 *
 * Remove once HQ load is confirmed stable end-to-end.
 */
import { useEffect, useRef } from "react";

export const HQ_DEFAULT_TIMEOUT_MS = 8000;

export function hqLog(scope: string, payload: Record<string, unknown> = {}): void {
  // Unconditional, prefixed for easy filtering: console filter `[hq:`
   
  console.log(`[hq:${scope}]`, payload);
}

/** Logs `mount` / `unmount` for a component exactly once per lifecycle. */
export function useHqMount(componentName: string, extra: Record<string, unknown> = {}): void {
  const t0 = useRef<number>(0);
  useEffect(() => {
    t0.current = Date.now();
    hqLog(`${componentName}:mount`, extra);
    return () => {
      hqLog(`${componentName}:unmount`, { lifetimeMs: Date.now() - t0.current });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export type HqTimeoutResult<T> =
  | { kind: "ok"; data: T; ms: number }
  | { kind: "timeout"; ms: number }
  | { kind: "error"; error: unknown; ms: number };

/**
 * Race a promise against an 8s default timeout. Always resolves — never throws.
 * The caller decides what to render based on `result.kind`.
 *
 * On timeout the original promise is NOT cancelled (Supabase doesn't expose
 * cancellation here), but the caller stops waiting and can show an inline
 * "this is taking too long" state with a retry button.
 */
export async function withHqTimeout<T>(
  queryName: string,
  promise: Promise<T> | PromiseLike<T>,
  timeoutMs: number = HQ_DEFAULT_TIMEOUT_MS,
): Promise<HqTimeoutResult<T>> {
  const t0 = Date.now();
  hqLog(`query:begin`, { queryName, timeoutMs });

  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<HqTimeoutResult<T>>((resolve) => {
    timer = setTimeout(
      () => resolve({ kind: "timeout", ms: Date.now() - t0 }),
      timeoutMs,
    );
  });

  const wrapped = Promise.resolve(promise).then(
    (data): HqTimeoutResult<T> => ({ kind: "ok", data, ms: Date.now() - t0 }),
    (error): HqTimeoutResult<T> => ({ kind: "error", error, ms: Date.now() - t0 }),
  );

  const result = await Promise.race([wrapped, timeoutPromise]);
  if (timer) clearTimeout(timer);

  if (result.kind === "ok") {
    hqLog(`query:end`, { queryName, ms: result.ms });
  } else if (result.kind === "timeout") {
    hqLog(`query:timeout`, { queryName, ms: result.ms, timeoutMs });
  } else {
    hqLog(`query:error`, {
      queryName,
      ms: result.ms,
      error: result.error instanceof Error ? result.error.message : String(result.error),
    });
  }

  return result;
}
