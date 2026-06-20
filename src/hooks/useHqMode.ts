import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type HqMode = "staff" | "preview";

/**
 * HQ runs in two modes:
 *  - staff   : full read/write Command Centre
 *  - preview : view-only client demo (no edits, no destructive actions,
 *              hides Operations / Team / Financial drawers)
 *
 * Preview engages when:
 *  - URL has ?view=preview or ?demo=1
 *  - The signed-in user has the `preview` role in user_roles
 */
export function useHqMode() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasPreviewRole, setHasPreviewRole] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setHasPreviewRole(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        setHasPreviewRole(!!data?.some((r) => r.role === "preview"));
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const params = new URLSearchParams(location.search);
  const urlPreview = params.get("view") === "preview" || params.get("demo") === "1";

  const mode: HqMode = urlPreview || hasPreviewRole ? "preview" : "staff";

  const exitPreview = () => {
    const next = new URLSearchParams(location.search);
    next.delete("view");
    next.delete("demo");
    const qs = next.toString();
    navigate(`${location.pathname}${qs ? `?${qs}` : ""}`, { replace: true });
  };

  const enterPreview = () => {
    const next = new URLSearchParams(location.search);
    next.set("view", "preview");
    navigate(`${location.pathname}?${next.toString()}`, { replace: true });
  };

  return useMemo(
    () => ({ mode, isPreview: mode === "preview", exitPreview, enterPreview }),
    [mode]
  );
}
