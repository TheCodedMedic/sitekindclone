/**
 * Pure pointer-interpolation math — extracted from useInterpolatedPointer so
 * the clamp/lerp guarantees are unit-testable without DOM (see
 * scripts/test-motion.mjs).
 *
 * Invariants the motion spec depends on:
 *  - every value written to --px/--py is clamped to [-1, 1], so CSS
 *    multipliers can never exceed the depth budget (near ≤4px, far ≤14px)
 *    or the tilt budget (≤1.5deg) no matter how extreme the pointer input
 *  - the lerp never overshoots its target for any frame delta
 */

/** Clamp to the normalized [-1, 1] pointer space. */
export const clampUnit = (v: number): number => Math.min(1, Math.max(-1, v));

/**
 * Normalize a client coordinate against an element edge+size to [-1, 1]
 * (-1 = leading edge, 0 = center, +1 = trailing edge; outside is clamped).
 */
export function normalizedPointerCoord(
  client: number,
  start: number,
  size: number,
): number {
  return clampUnit(((client - start) / size) * 2 - 1);
}

/**
 * One frame-rate independent lerp step toward `target` (ease is calibrated
 * for 60fps frames). Never overshoots: the effective factor is in (0, 1]
 * for ease ∈ (0, 1] and any deltaMs ≥ 0.
 */
export function lerpStep(
  cur: number,
  target: number,
  ease: number,
  deltaMs: number,
): number {
  const frames = deltaMs > 0 ? deltaMs / (1000 / 60) : 1;
  const k = 1 - Math.pow(1 - ease, frames);
  return cur + (target - cur) * k;
}
