import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

/** Fires a GA4 page_view on every SPA route change. Mount once inside the Router. */
export function RouteAnalytics() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Defer one frame so document.title reflects the new route.
    const id = window.setTimeout(() => trackPageView(pathname + search), 0);
    return () => window.clearTimeout(id);
  }, [pathname, search]);

  return null;
}
