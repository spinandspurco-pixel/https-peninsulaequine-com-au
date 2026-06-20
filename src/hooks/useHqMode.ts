import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
 *
 * Role state is read from useAuth (single source of truth) — this hook
 * no longer issues its own user_roles query.
 */
export function useHqMode() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPreview: hasPreviewRole } = useAuth();

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
    [mode] // eslint-disable-line react-hooks/exhaustive-deps
  );
}
