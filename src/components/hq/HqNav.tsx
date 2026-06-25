import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHqMode } from "@/hooks/useHqMode";
import { visibleHqItems } from "./hqAccess";
import { cn } from "@/lib/utils";

interface HqNavProps {
  variant?: "rail";
  className?: string;
}

type GroupKey = "content" | "operations";
const STORAGE_KEY = "hq.nav.groups.v1";

function readStored(): Partial<Record<GroupKey, boolean>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<GroupKey, boolean>>) : {};
  } catch {
    return {};
  }
}

function writeStored(state: Record<GroupKey, boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

/**
 * Role-aware navigation strip for the HQ area.
 * Overview is always visible. Content + Operations are collapsible groups
 * that remember their state in localStorage. Default: open for admin/staff,
 * collapsed for preview. Active child route auto-opens its parent group.
 */
export function HqNav({ variant = "rail", className }: HqNavProps) {
  const { roles, isPreview: isPreviewRole } = useAuth();
  const { isPreview } = useHqMode();
  const { pathname } = useLocation();

  const effectiveRoles = isPreview && !isPreviewRole ? [...roles, "preview" as const] : roles;
  const items = visibleHqItems(effectiveRoles);

  const grouped = useMemo(
    () => ({
      overview: items.filter((i) => i.group === "overview"),
      content: items.filter((i) => i.group === "content"),
      operations: items.filter((i) => i.group === "operations"),
    }),
    [items],
  );

  const isItemActive = (to: string) =>
    to === "/hq" ? pathname === "/hq" : pathname === to || pathname.startsWith(to + "/");

  const activeIn = (key: GroupKey) => grouped[key].some((i) => isItemActive(i.to));

  // Initial state: stored value wins; otherwise default by role; active group always opens.
  const defaultOpen = !isPreview;
  const [open, setOpen] = useState<Record<GroupKey, boolean>>(() => {
    const stored = readStored();
    return {
      content: stored.content ?? defaultOpen,
      operations: stored.operations ?? defaultOpen,
    };
  });

  // Auto-open the group containing the active route.
  useEffect(() => {
    setOpen((prev) => {
      const next = { ...prev };
      (["content", "operations"] as GroupKey[]).forEach((k) => {
        if (activeIn(k) && !next[k]) next[k] = true;
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggle = (key: GroupKey) => {
    setOpen((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      writeStored(next);
      return next;
    });
  };

  if (items.length === 0) return null;

  const renderItem = (item: typeof items[number]) => {
    const active = isItemActive(item.to);
    return (
      <li key={item.key}>
        <NavLink
          to={`${item.to}${isPreview ? (item.to.includes("?") ? "&" : "?") + "view=preview" : ""}`}
          className={cn(
            "text-[10px] uppercase tracking-[0.22em] transition-colors whitespace-nowrap",
            active ? "text-accent" : "text-muted-foreground/45 hover:text-foreground/80",
          )}
          aria-current={active ? "page" : undefined}
        >
          {item.label}
        </NavLink>
      </li>
    );
  };

  const renderGroup = (key: GroupKey, label: string) => {
    if (grouped[key].length === 0) return null;
    const isOpen = open[key];
    const hasActive = activeIn(key);
    return (
      <div className="flex items-start sm:items-center gap-x-4 gap-y-2 flex-wrap">
        <button
          type="button"
          onClick={() => toggle(key)}
          aria-expanded={isOpen}
          aria-controls={`hq-nav-${key}`}
          className={cn(
            "inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.3em] transition-colors whitespace-nowrap",
            hasActive ? "text-accent/85" : "text-accent/45 hover:text-accent/70",
          )}
        >
          {label}
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-300",
              isOpen ? "rotate-0" : "-rotate-90",
            )}
            aria-hidden
          />
        </button>
        {isOpen && (
          <ul
            id={`hq-nav-${key}`}
            className="flex items-center gap-x-6 gap-y-2 flex-wrap animate-fade-in"
          >
            {grouped[key].map(renderItem)}
          </ul>
        )}
      </div>
    );
  };

  return (
    <nav
      aria-label="HQ sections"
      className={cn("border-y border-border/10 bg-background/60 backdrop-blur-sm", className)}
    >
      <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-start sm:items-center gap-x-10 gap-y-3">
        {grouped.overview.length > 0 && (
          <ul className="flex items-center gap-x-6 flex-wrap">
            {grouped.overview.map(renderItem)}
          </ul>
        )}
        {renderGroup("content", "Content")}
        {renderGroup("operations", "Operations")}
      </div>
    </nav>
  );
}
