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
  /** Cinematic ease-in-out for scene transitions */
  cinematic: "cubic-bezier(0.45, 0, 0.15, 1)",
  /** Slightly snappier for interactive feedback */
  interactive: "ease-in-out",
  /** Linear for opacity-only fades */
  linear: "linear",
} as const;

/* ── Duration (ms) ──────────────────────────────────── */
export const DURATION = {
  /** Micro interactions — toggle active state, hover glow */
  fast: 300,
  /** Standard reveal — section entrance, card fade */
  normal: 450,
  /** Hero-level reveals — heading, cinematic layers */
  slow: 800,
  /** SVG line drawing, atmospheric fades */
  cinematic: 1200,
  /** Parallax image transitions */
  parallax: 800,
  /** Scene crossfade — Walk the Build / Timeline */
  crossfade: 1100,
  /** Extended hold reveals — structure, arena */
  extended: 1400,
} as const;

/* ── Stagger interval (ms) ──────────────────────────── */
export const STAGGER = {
  /** Tight stagger for cards in a grid */
  card: 100,
  /** Wider stagger for section-level children */
  section: 150,
  /** Cinematic stagger for scene text reveals */
  scene: 400,
} as const;

/* ── Transform distances (px) ───────────────────────── */
export const DISTANCE = {
  /** Subtle — cards, captions */
  sm: 6,
  /** Standard — section reveals */
  md: 12,
  /** Hero / cinematic text */
  lg: 18,
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
 * Hover style — opacity only, no scale or transform.
 */
export const IMAGE_HOVER_DURATION = `${DURATION.fast}ms`;
export const IMAGE_HOVER_SCALE = "1"; // No scale on hover

/**
 * SVG stroke-draw animation CSS class name.
 * Pairs with the @keyframes already in index.css.
 */
export const HERO_DRAW_DURATION = "2.4s";
export const HERO_DRAW_EASE = EASE.default;
