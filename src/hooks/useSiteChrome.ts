import { useLocation } from "react-router-dom";

/**
 * Determines which marketing-only chrome should render on the current route.
 * Admin / HQ / portal / staff / login surfaces own their own layout and
 * MUST NOT receive the public SiteRail or OverlayNav.
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
    showSiteRail: !isPrivate,
    showOverlayNav: !isPrivate,
  };
}
