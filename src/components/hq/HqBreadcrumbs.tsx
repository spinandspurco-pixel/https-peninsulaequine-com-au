import { Link, useLocation } from "react-router-dom";
import { Fragment, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";
import {
  HQ_NAV_ITEMS,
  HQ_SECTIONS,
  type HqSection,
} from "@/components/hq/hqAccess";
import { cn } from "@/lib/utils";

type Crumb = { label: string; to?: string };

interface HqBreadcrumbsProps {
  /**
   * Override the label for the current (final) crumb. Defaults to the matched
   * nav item's label, e.g. "Staff", "Media Vault".
   */
  current?: string;
  /**
   * Force a specific HQ section (for detail pages whose pathname doesn't
   * match a nav item exactly, e.g. /hq/projects/:id).
   */
  sectionOverride?: HqSection;
  /**
   * Extra crumbs to insert between the section and the current page,
   * e.g. [{ label: "Jordynn Oakley" }] for a deep detail page.
   */
  trail?: Crumb[];
  className?: string;
}

/**
 * Architectural HQ breadcrumb: HQ / Section / Current.
 * Always renders inside the max-w container directly under <HqNav />.
 * Removes the "dead-end" feeling on every non-overview HQ page.
 */
export function HqBreadcrumbs({
  current,
  sectionOverride,
  trail,
  className,
}: HqBreadcrumbsProps) {
  const { pathname } = useLocation();
  const { roles } = useAuth();
  const { isPreview } = useHqMode();

  const previewSuffix = (to: string) =>
    isPreview ? (to.includes("?") ? "&" : "?") + "view=preview" : "";

  const { sectionKey, sectionLabel, sectionPath, currentLabel } = useMemo(() => {
    const match = HQ_NAV_ITEMS.find(
      (item) => pathname === item.to || pathname.startsWith(item.to + "/"),
    );
    const sec: HqSection =
      sectionOverride ?? match?.sections[0] ?? "applications";
    const secMeta = HQ_SECTIONS.find((s) => s.key === sec);
    return {
      sectionKey: sec,
      sectionLabel: secMeta?.label ?? "HQ",
      sectionPath: secMeta?.defaultPath ?? "/hq",
      currentLabel: current ?? match?.label ?? "Overview",
    };
  }, [pathname, current, sectionOverride]);

  // Top-level /hq overview shouldn't render a breadcrumb at all.
  if (pathname === "/hq") return null;

  const crumbs: Crumb[] = [
    { label: "HQ", to: `/hq${previewSuffix("/hq")}` },
    {
      label: sectionLabel,
      to: `${sectionPath}${previewSuffix(sectionPath)}`,
    },
    ...(trail ?? []),
    { label: currentLabel },
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "max-w-5xl mx-auto px-6 pt-6 pb-2",
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-foreground/50">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          // Section crumb carries router state so HQ overview can highlight it.
          const state =
            i === 1 ? { hqSection: sectionKey } : undefined;
          return (
            <Fragment key={`${c.label}-${i}`}>
              {i > 0 && (
                <li aria-hidden className="text-foreground/25">/</li>
              )}
              <li>
                {isLast || !c.to ? (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={cn(isLast && "text-foreground/80")}
                  >
                    {c.label}
                  </span>
                ) : (
                  <Link
                    to={c.to}
                    state={state}
                    className="transition-colors hover:text-foreground"
                  >
                    {c.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
