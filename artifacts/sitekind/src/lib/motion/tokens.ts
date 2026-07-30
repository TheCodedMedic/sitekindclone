/**
 * Motion design tokens — the typed mirror of the CSS custom properties
 * declared in src/styles.css (`:root` "Motion tokens" block).
 *
 * Keep the two in sync: CSS consumes `var(--motion-*)` / `var(--ease-*)`,
 * JS (framer-motion, rAF interpolation) consumes these constants.
 *
 * Hierarchy (see motion spec):
 *   A — one signature hero scene       → MOTION_SCENE
 *   B — product demonstrations         → MOTION_SLOW
 *   C — interface feedback             → MOTION_FAST / MOTION_BASE
 */

/** Interface feedback: hovers, toggles, focus rings. ~120–180ms band. */
export const MOTION_FAST_MS = 150;

/** Standard UI transitions: panels, list items, state swaps. ~200–280ms band. */
export const MOTION_BASE_MS = 240;

/** Section-level product demonstrations. ~450–750ms band. */
export const MOTION_SLOW_MS = 600;

/** The single signature hero scene sequence. ~2800–3600ms band. */
export const MOTION_SCENE_MS = 3200;

/** Seconds variants for framer-motion `transition.duration`. */
export const MOTION_FAST_S = MOTION_FAST_MS / 1000;
export const MOTION_BASE_S = MOTION_BASE_MS / 1000;
export const MOTION_SLOW_S = MOTION_SLOW_MS / 1000;
export const MOTION_SCENE_S = MOTION_SCENE_MS / 1000;

/** Brand ease-out — decisive start, soft landing. */
export const EASE_OUT_BRAND = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_OUT_BRAND_BEZIER = [0.22, 1, 0.36, 1] as const;

/**
 * Soft spring — the same low-overshoot curve `.reveal` already uses in
 * styles.css, so new motion lands with the existing site vocabulary.
 */
export const EASE_SPRING_SOFT = "cubic-bezier(0.34, 1.3, 0.64, 1)";
export const EASE_SPRING_SOFT_BEZIER = [0.34, 1.3, 0.64, 1] as const;

/** Depth budget (px) for pointer-reactive layers. Near ≤4px, far ≤14px. */
export const DEPTH_NEAR_MAX_PX = 4;
export const DEPTH_FAR_MAX_PX = 12;

/** Max rotation for tilt effects, degrees. */
export const TILT_MAX_DEG = 1.5;
