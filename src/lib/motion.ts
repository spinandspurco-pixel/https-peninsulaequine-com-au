/**
 * Projects Page — Unified Motion System
 *
 * Centralised timing, easing, and animation tokens.
 * All components on the Projects page import from here
 * to guarantee a single, cohesive motion language.
 *
 * Principles:
 *  - GPU-friendly (opacity + transform only)
 *  - No bounce / spring / rubber-band
 *  - Calm, architectural pacing
 *  - Reduced-motion safe
 */

/* ── Easing ─────────────────────────────────────────── */
export const EASE = {
  /** Standard cinematic ease — smooth deceleration */
  default: "cubic-bezier(0.22, 1, 0.36, 1)",
  /** Slightly snappier for interactive feedback */
  interactive: "cubic-bezier(0.25, 0.8, 0.25, 1)",
  /** Linear for opacity-only fades */
  linear: "linear",
} as const;

/* ── Duration (ms) ──────────────────────────────────── */
export const DURATION = {
  /** Micro interactions — toggle active state, hover glow */
  fast: 200,
  /** Standard reveal — section entrance, card fade */
  normal: 450,
  /** Hero-level reveals — heading, cinematic layers */
  slow: 700,
  /** SVG line drawing, atmospheric fades */
  cinematic: 1000,
  /** Parallax image transitions */
  parallax: 600,
} as const;

/* ── Stagger interval (ms) ──────────────────────────── */
export const STAGGER = {
  /** Tight stagger for cards in a grid */
  card: 100,
  /** Wider stagger for section-level children */
  section: 150,
} as const;

/* ── Transform distances (px) ───────────────────────── */
export const DISTANCE = {
  /** Subtle — cards, captions */
  sm: 8,
  /** Standard — section reveals */
  md: 14,
  /** Hero / cinematic text */
  lg: 20,
} as const;

/* ── Reusable inline style builders ─────────────────── */

/**
 * Section / card reveal style.
 * Usage: style={revealStyle(isVisible, { delay: 100 })}
 */
export function revealStyle(
  visible: boolean,
  opts: {
    delay?: number;
    duration?: number;
    distance?: number;
    direction?: "up" | "down" | "none";
  } = {}
): React.CSSProperties {
  const {
    delay = 0,
    duration = DURATION.normal,
    distance = DISTANCE.md,
    direction = "up",
  } = opts;

  const yMap = { up: distance, down: -distance, none: 0 };

  return {
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translateY(0)"
      : `translateY(${yMap[direction]}px)`,
    transition: `opacity ${duration}ms ${EASE.default} ${delay}ms, transform ${duration}ms ${EASE.default} ${delay}ms`,
    willChange: "opacity, transform",
  };
}

/**
 * Crossfade style for layer toggles.
 * Keeps element in flow; only changes opacity.
 */
export function crossfadeStyle(
  active: boolean,
  opts: { duration?: number; inactiveOpacity?: number } = {}
): React.CSSProperties {
  const { duration = DURATION.fast, inactiveOpacity = 0.04 } = opts;
  return {
    opacity: active ? 1 : inactiveOpacity,
    transition: `opacity ${duration}ms ${EASE.interactive}`,
  };
}

/**
 * Hover image zoom style (for editorial cards).
 * Apply to the <img> element with group-hover.
 */
export const IMAGE_HOVER_DURATION = `${DURATION.parallax}ms`;
export const IMAGE_HOVER_SCALE = "1.03";

/**
 * SVG stroke-draw animation CSS class name.
 * Pairs with the @keyframes already in index.css.
 */
export const HERO_DRAW_DURATION = "2.4s";
export const HERO_DRAW_EASE = EASE.default;
