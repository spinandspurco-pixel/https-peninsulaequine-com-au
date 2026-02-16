import { supabase } from "@/integrations/supabase/client";

function getVisitorId(): string {
  const key = "pe_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function trackCtaClick(ctaLabel: string, metadata?: Record<string, unknown>) {
  try {
    (supabase as any).from("ab_test_events").insert({
      test_name: "cta_clicks",
      variant: ctaLabel,
      event_type: "click",
      visitor_id: getVisitorId(),
      page_path: window.location.pathname,
      metadata: metadata ?? {},
    });
  } catch (err) {
    console.warn("[CTA Tracking] Failed:", err);
  }
}
