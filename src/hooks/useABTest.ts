import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Visitor ID (anonymous, persisted in localStorage) ──────

function getVisitorId(): string {
  const key = "pe_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// ── Variant assignment (deterministic per visitor per test) ──

function assignVariant(testName: string, variants: string[]): string {
  const storageKey = `pe_ab_${testName}`;
  const stored = localStorage.getItem(storageKey);
  if (stored && variants.includes(stored)) return stored;

  // Simple hash-based assignment for even distribution
  const visitorId = getVisitorId();
  const combined = `${visitorId}:${testName}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % variants.length;
  const variant = variants[index];
  localStorage.setItem(storageKey, variant);
  return variant;
}

// ── Types ───────────────────────────────────────────────────

export interface ABTestConfig {
  /** Unique test identifier, e.g. "hero_cta_q1_2026" */
  testName: string;
  /** Variant names, e.g. ["control", "urgency", "social_proof"] */
  variants: string[];
}

export type FunnelStep = "impression" | "engage" | "click" | "convert";

export interface UseABTestReturn {
  /** The variant assigned to this visitor */
  variant: string;
  /** Log an impression (called once automatically) */
  trackImpression: () => void;
  /** Log a click / conversion */
  trackClick: (metadata?: Record<string, unknown>) => void;
  /** Log any funnel step (impression, engage, click, convert) */
  trackStep: (step: FunnelStep, metadata?: Record<string, unknown>) => void;
}

// ── Hook ────────────────────────────────────────────────────

export function useABTest({ testName, variants }: ABTestConfig): UseABTestReturn {
  const [variant] = useState(() => assignVariant(testName, variants));
  const impressionSent = useRef(false);
  const firedSteps = useRef(new Set<string>());

  const track = useCallback(
    async (eventType: string, metadata?: Record<string, unknown>) => {
      try {
        await (supabase as any).from("ab_test_events").insert({
          test_name: testName,
          variant,
          event_type: eventType,
          visitor_id: getVisitorId(),
          page_path: window.location.pathname,
          metadata: metadata ?? {},
        });
      } catch (err) {
        console.warn("[AB Test] Failed to track event:", err);
      }
    },
    [testName, variant]
  );

  const trackImpression = useCallback(() => {
    if (!impressionSent.current) {
      impressionSent.current = true;
      track("impression");
    }
  }, [track]);

  const trackClick = useCallback(
    (metadata?: Record<string, unknown>) => {
      track("click", metadata);
    },
    [track]
  );

  const trackStep = useCallback(
    (step: FunnelStep, metadata?: Record<string, unknown>) => {
      // Deduplicate impression and engage per session
      if ((step === "impression" || step === "engage") && firedSteps.current.has(step)) return;
      firedSteps.current.add(step);
      track(step, metadata);
    },
    [track]
  );

  // Auto-track impression on mount
  useEffect(() => {
    trackImpression();
  }, [trackImpression]);

  return { variant, trackImpression, trackClick, trackStep };
}
