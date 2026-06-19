import { supabase } from "@/integrations/supabase/client";

type LogPayload = Record<string, unknown>;

const pending: Array<Record<string, unknown>> = [];
let flushTimer: number | null = null;

function flush() {
  if (pending.length === 0) return;
  const batch = pending.splice(0, pending.length);
  supabase
    .from("client_logs")
    .insert(batch)
    .then(() => {})
    .catch(() => {});
}

function scheduleFlush() {
  if (flushTimer != null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    flush();
  }, 2000);
}

/**
 * Lightweight, fire-and-forget client event logger.
 * Batches inserts to avoid spamming the DB on rapid events.
 */
export function logClientEvent(eventType: string, payload?: LogPayload) {
  if (typeof window === "undefined") return;

  pending.push({
    event_type: eventType,
    payload: payload ?? null,
    page_path: window.location.pathname + window.location.search,
    user_agent: navigator.userAgent,
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,
  });

  scheduleFlush();
}

/**
 * Force-flush any buffered logs. Call before page unload if critical.
 */
export function flushClientLogs() {
  if (flushTimer != null) {
    window.clearTimeout(flushTimer);
    flushTimer = null;
  }
  flush();
}
