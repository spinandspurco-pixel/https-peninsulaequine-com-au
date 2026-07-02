/**
 * Animation Timing Constants — Unified Motion Language
 *
 * Single source of truth for all motion parameters across the ecosystem
 * (public site, HQ Command Centre, employee portal, etc.).
 *
 * These tokens ensure that transitions, reveals, and staggered animations
 * feel cohesive and synchronized across all environments.
 *
 * Usage:
 *   import { ANIMATION_TIMING } from '@/lib/animationConstants';
 *   style={{ transition: `opacity ${ANIMATION_TIMING.duration.normal}ms ${ANIMATION_TIMING.ease.default}` }}
 */

/**
 * Easing Functions — the "pen" and "settle" of motion
 * Used consistently for interactive, reveal, and cinematic moments
 */
export const ANIMATION_TIMING = {
  // ─── Easing Curves ──────────────────────────────────────────────
  ease: {
    /** Standard cinematic ease — smooth deceleration. Use for most interactions. */
    default: "cubic-bezier(0.22, 1, 0.36, 1)",

    /** Drafting pen easing — sharp entry, smooth exit. Use for architectural reveals. */
    draw: "cubic-bezier(0.45, 0, 0.15, 1)",

    /** Settle easing — gentle final approach. Use for settle-in animations. */
    settle: "cubic-bezier(0.25, 0.1, 0.2, 1)",

    /** Alias to draw easing for scene transitions (same curve, semantic naming). */
    cinematic: "cubic-bezier(0.45, 0, 0.15, 1)",

    /** Slightly snappier for interactive feedback (hover, active states) */
    interactive: "ease-in-out",

    /** Linear for opacity-only fades — avoids acceleration feeling */
    linear: "linear",
  } as const,

  // ─── Durations (milliseconds) ──────────────────────────────────
  // Follows 3-phase motion language: ARRIVE (800–1200ms) | HOLD (≥1500ms) | EXIT (400–600ms)
  duration: {
    /** Micro interactions — toggle active state, hover glow (300ms) */
    fast: 300,

    /** Quick reveal — form input focus, tooltip appear (420ms) */
    quick: 420,

    /** Standard arrival — section entrance, card fade (800ms) */
    normal: 800,

    /** Hero-level arrivals — heading, cinematic layers (1000ms) */
    hero: 1000,

    /** SVG line drawing, atmospheric fades (1200ms) */
    draw: 1200,

    /** Parallax image transitions (800ms) */
    parallax: 800,

    /** Scene crossfade — Walk the Build / Timeline (1100ms) */
    crossfade: 1100,

    /** Extended hold reveals — structure, arena (1400ms) */
    extended: 1400,

    /** Exit phase — soft fade only (500ms) */
    exit: 500,

    /** Blueprint rules resolve phase (900ms) */
    resolve: 900,

    /** Blueprint lines draw phase (1400ms) */
    arrive: 1400,

    /** Blueprint handoff phase (1800ms) */
    handoff: 1800,
  } as const,

  // ─── Stagger Intervals (milliseconds) ───────────────────────────
  // Controls the cascade effect when revealing multiple children
  stagger: {
    /** Tight stagger for grid cards, fast cascade (120ms) */
    card: 120,

    /** Wider stagger for section-level children (200ms) */
    section: 200,

    /** Cinematic stagger for scene text reveals — intentional pause (500ms) */
    scene: 500,

    /** Blueprint stagger delays — use with .bp-delay-* classes */
    blueprint: {
      delay1: 120,
      delay2: 260,
      delay3: 420,
      delay4: 620,
    },
  } as const,

  // ─── Transform Distances (pixels) ───────────────────────────────
  // Used for translateX/translateY offsets during reveals
  distance: {
    /** Subtle — cards, captions (6px) */
    sm: 6,

    /** Standard — section reveals (12px) */
    md: 12,

    /** Hero / cinematic text (18px) */
    lg: 18,
  } as const,

  // ─── Hold Gap (milliseconds) ────────────────────────────────────
  // Minimum stillness between sequential reveals (prevents visual chaos)
  hold: 1500,

  // ─── Reduced Motion Override ────────────────────────────────────
  // Helpers to respect user's motion preferences
  reducedMotion: {
    duration: 0,
    ease: "none",
    transition: "none",
  } as const,
} as const;

// Type exports for strict TypeScript usage
export type AnimationEase = keyof typeof ANIMATION_TIMING.ease;
export type AnimationDuration = keyof typeof ANIMATION_TIMING.duration;
export type StaggerInterval = keyof typeof ANIMATION_TIMING.stagger;
export type TransformDistance = keyof typeof ANIMATION_TIMING.distance;

/**
 * Helper: Build a CSS transition string
 *
 * Usage:
 *   style={{ transition: buildTransition('opacity', 'normal', 'default') }}
 *   // → "opacity 800ms cubic-bezier(0.22, 1, 0.36, 1)"
 */
export function buildTransition(
  property: string,
  duration: AnimationDuration = "normal",
  ease: AnimationEase = "default",
  delay = 0
): string {
  const dur = ANIMATION_TIMING.duration[duration];
  const easeVal = ANIMATION_TIMING.ease[ease];
  return `${property} ${dur}ms ${easeVal}${delay > 0 ? ` ${delay}ms` : ""}`;
}

/**
 * Helper: Build staggered animation delays
 *
 * Usage:
 *   style={{ "--reveal-delay": getStaggerDelay('section', 2) } as React.CSSProperties}
 *   // → "--reveal-delay": "400ms"
 */
export function getStaggerDelay(
  type: StaggerInterval,
  index: number
): string {
  const interval = ANIMATION_TIMING.stagger[type];
  if (typeof interval === "object") {
    // For blueprint stagger, index maps to delay1, delay2, etc.
    const key = `delay${index + 1}` as keyof typeof interval;
    return `${interval[key]}ms`;
  }
  return `${interval * index}ms`;
}

/**
 * Helper: Get transform distance for reveals
 *
 * Usage:
 *   const offset = getDistance('md'); // → 12
 */
export function getDistance(size: TransformDistance): number {
  return ANIMATION_TIMING.distance[size];
}

export default ANIMATION_TIMING;
