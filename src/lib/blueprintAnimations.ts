/**
 * Blueprint Animation Utilities
 *
 * Helper functions for consistent application of blueprint animation delay classes
 * across HQ components. Ensures all classes match the defined delays in blueprint.css:
 * bp-delay-1 (120ms), bp-delay-2 (260ms), bp-delay-3 (420ms), bp-delay-4 (620ms)
 */

/**
 * Get the appropriate blueprint delay class based on index.
 * Caps delay to bp-delay-4 (maximum defined in blueprint.css).
 *
 * @param index - Zero-based item index
 * @param offset - Optional offset to apply before capping (e.g., start at delay-2)
 * @returns CSS class name: "bp-delay-1" | "bp-delay-2" | "bp-delay-3" | "bp-delay-4"
 *
 * @example
 * getDelayClass(0) => "bp-delay-1"
 * getDelayClass(3) => "bp-delay-4"
 * getDelayClass(2, 1) => "bp-delay-4" (offset of 1 + index 2 = 3, capped at 4)
 */
export function getDelayClass(index: number, offset = 0): string {
  const delayIndex = Math.min(index + offset + 1, 4);
  return `bp-delay-${delayIndex}`;
}

/**
 * Get delay class for breadcrumb items, with consistent staggering.
 * Each breadcrumb reveals in sequence with a fixed delay.
 *
 * @param index - Position in breadcrumb trail
 * @returns CSS class name for animation delay
 */
export function getBreadcrumbDelayClass(index: number): string {
  return getDelayClass(index);
}

/**
 * Get delay class for navigation items in primary nav row.
 * Items stagger naturally by their index, capped at bp-delay-4.
 *
 * @param index - Position in nav items list
 * @returns CSS class name for animation delay
 */
export function getNavItemDelayClass(index: number): string {
  return getDelayClass(index);
}

/**
 * Get delay class for sub-navigation items.
 * Starts at bp-delay-2 (offset of 1) to avoid collision with primary nav,
 * allowing smooth sequential reveal across both nav layers.
 *
 * @param index - Position in sub-nav items list
 * @returns CSS class name for animation delay
 */
export function getSubNavDelayClass(index: number): string {
  return getDelayClass(index, 1);
}

/**
 * Blueprint animation CSS class combinations for common patterns.
 * Ensures consistent usage across components.
 */
export const BLUEPRINT_MARK_ANIM = "bp-mark";
export const BLUEPRINT_RULE_ANIM = "bp-rule";
export const BLUEPRINT_LINE_ANIM = "bp-line";
export const BLUEPRINT_BRACKET_ANIM = "bp-bracket";
export const BLUEPRINT_IMAGE_ANIM = "bp-image-photo";
