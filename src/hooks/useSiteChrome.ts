import { useLocation } from "react-router-dom";

/**
 * Determines which marketing-only chrome should render on the current route.
 * Admin / HQ / portal / staff / login surfaces own their own layout and
 * MUST NOT receive the public SiteRail, OverlayNav, public Footer, or the
 * GuidedIntake ("Apply to Build") modal.
 */
const PRIVATE_PREFIXES = [
  "/hq",
  "/admin",
  "/employee",
  "/bookings",
  "/schedule",
  "/portal",
  "/documents",
  "/staff",
  "/trainer",
  "/login",
  "/quote",
];

export function useSiteChrome() {
  const { pathname } = useLocation();
  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  return {
    isPrivate,
    showSiteRail: !isPrivate,
    showOverlayNav: !isPrivate,
    showFooter: !isPrivate,
    showGuidedIntake: !isPrivate,
  };
}
