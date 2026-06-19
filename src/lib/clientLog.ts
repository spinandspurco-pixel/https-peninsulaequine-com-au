import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface ClientLogEntry {
  event_type: string;
  payload?: Json | null;
  page_path?: string | null;
  user_agent?: string | null;
  viewport_w?: number | null;
  viewport_h?: number | null;
}

const pending: ClientLogEntry[] = [];
let flushTimer: number | null = null;

function flush() {
  if (pending.length === 0) return;
  const batch = pending.splice(0, pending.length);
  Promise.resolve(supabase.from("client_logs").insert(batch)).then(
    () => {},
    () => {}
  );
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
export function logClientEvent(eventType: string, payload?: Record<string, unknown>) {
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
