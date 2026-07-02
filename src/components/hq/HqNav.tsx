import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";
import {
  HQ_SECTIONS,
  activeHqSection,
  visibleHqItemsForSection,
  type HqSection,
} from "./hqAccess";
import { getNavItemDelayClass, getSubNavDelayClass, BLUEPRINT_MARK_ANIM } from "@/lib/blueprintAnimations";
import { cn } from "@/lib/utils";

interface HqNavProps {
  variant?: "rail";
  className?: string;
}

/**
 * Two-tier HQ navigation.
 *
 * Primary row — the four institutional sections (Applications · Content ·
 * Projects · Clients). Plain text labels, no numbering.
 *
 * Sub-row — contextual to the active section only. Always begins with
 * "Overview" (→ /hq). Hidden entirely when the section has no children
 * beyond Overview that the current role can see.
 *
 * Routes and role gates are preserved from hqAccess.ts; this component
 * only restructures presentation.
 */
export function HqNav({ className }: HqNavProps) {
  const { roles, isPreview: isPreviewRole } = useAuth();
  const { isPreview } = useHqMode();
  const { pathname } = useLocation();

  const effectiveRoles =
    isPreview && !isPreviewRole ? [...roles, "preview" as const] : roles;

  const visibleSections = HQ_SECTIONS.filter(
    (section) => visibleHqItemsForSection(effectiveRoles, section.key).length > 0,
  );

  // If no section has any children for this role, fall back to a bare
  // Overview link rather than an empty bar.
  const hasAnySection = visibleSections.length > 0;
  const currentSection: HqSection = hasAnySection
    ? activeHqSection(pathname, effectiveRoles)
    : "applications";

  const subItems = visibleHqItemsForSection(effectiveRoles, currentSection);

  const previewSuffix = (to: string) =>
    isPreview ? (to.includes("?") ? "&" : "?") + "view=preview" : "";

  const overviewActive = pathname === "/hq";

  const isItemActive = (to: string) =>
    pathname === to || pathname.startsWith(to + "/");

  const isSectionActive = (section: HqSection) =>
    !overviewActive && section === currentSection;

  return (
    <nav
      aria-label="HQ sections"
      className={cn(
        "border-y border-border/10 bg-background/60 backdrop-blur-sm",
        className,
      )}
      data-bp-armed="true"
    >
      {/* ─── Primary row ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pt-3 pb-2 flex flex-wrap items-center gap-x-10 gap-y-2">
        {hasAnySection ? (
          <ul className="flex items-center gap-x-8 sm:gap-x-10 flex-wrap">
            {visibleSections.map((section, idx) => {
              const active = isSectionActive(section.key);
              const to = section.defaultPath;
              return (
                <li key={section.key} className={`${BLUEPRINT_MARK_ANIM} ${getNavItemDelayClass(idx)}`}>
                  <NavLink
                    to={`${to}${previewSuffix(to)}`}
                    state={{ hqSection: section.key }}
                    className={cn(
                      "text-[11px] uppercase tracking-[0.28em] transition-colors whitespace-nowrap",
                      active
                        ? "text-accent"
                        : "text-foreground/70 hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {section.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        ) : (
          <NavLink
            to={`/hq${previewSuffix("/hq")}`}
            className={`text-[11px] uppercase tracking-[0.28em] text-foreground/70 hover:text-foreground ${BLUEPRINT_MARK_ANIM}`}
          >
            Overview
          </NavLink>
        )}
      </div>

      {/* ─── Contextual sub-row ───────────────────────────────────────── */}
      {hasAnySection && subItems.length > 0 && (
        <div className="border-t border-border/5">
          <div className="max-w-5xl mx-auto px-6 py-2 flex flex-wrap items-center gap-x-6 gap-y-2">
            <NavLink
              to={`/hq${previewSuffix("/hq")}`}
              className={cn(
                "text-[10px] uppercase tracking-[0.22em] transition-colors whitespace-nowrap bp-mark bp-delay-1",
                overviewActive
                  ? "text-accent"
                  : "text-muted-foreground/55 hover:text-foreground/85",
              )}
              aria-current={overviewActive ? "page" : undefined}
            >
              Overview
            </NavLink>
            <ul className="flex items-center gap-x-6 gap-y-2 flex-wrap">
              {subItems.map((item, idx) => {
                const active = isItemActive(item.to);
                return (
                  <li key={item.key} className={`${BLUEPRINT_MARK_ANIM} ${getSubNavDelayClass(idx)}`}>
                    <NavLink
                      to={`${item.to}${previewSuffix(item.to)}`}
                      className={cn(
                        "text-[10px] uppercase tracking-[0.22em] transition-colors whitespace-nowrap",
                        active
                          ? "text-accent"
                          : "text-muted-foreground/55 hover:text-foreground/85",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
