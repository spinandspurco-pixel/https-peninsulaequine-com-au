import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";
import { visibleHqItems } from "./hqAccess";
import { cn } from "@/lib/utils";

interface HqNavProps {
  /** Visual variant. `rail` is the slim in-page rail used inside HQ pages. */
  variant?: "rail";
  className?: string;
}

/**
 * Role-aware navigation strip for the HQ area.
 * Each staff role only sees the destinations they're permitted to open.
 * Preview users see the same surfaces in read-only mode.
 */
export function HqNav({ variant = "rail", className }: HqNavProps) {
  const { roles, isPreview: isPreviewRole } = useAuth();
  const { isPreview } = useHqMode();
  const { pathname } = useLocation();

  // Preview-as-admin should still see the preview-allowed surfaces.
  const effectiveRoles = isPreview && !isPreviewRole ? [...roles, "preview" as const] : roles;
  const items = visibleHqItems(effectiveRoles);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="HQ sections"
      className={cn("border-y border-border/10 bg-background/60 backdrop-blur-sm", className)}
    >
      <div className="max-w-5xl mx-auto px-6 py-3">
        <ul className="flex items-center gap-x-8 gap-y-2 flex-wrap">
          {items.map((item) => {
            const active =
              item.to === "/hq" ? pathname === "/hq" : pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <li key={item.key}>
                <NavLink
                  to={`${item.to}${isPreview ? (item.to.includes("?") ? "&" : "?") + "view=preview" : ""}`}
                  className={cn(
                    "text-[10px] uppercase tracking-[0.22em] transition-colors whitespace-nowrap",
                    active
                      ? "text-accent"
                      : "text-muted-foreground/45 hover:text-foreground/80"
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
    </nav>
  );
}
