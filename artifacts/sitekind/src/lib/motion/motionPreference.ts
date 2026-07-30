/**
 * Pure motion-preference logic — extracted from MotionProvider so it is
 * unit-testable without React/DOM (see scripts/test-motion.mjs).
 *
 * Resolution rule: an explicit visitor override always wins; with no
 * override the OS `prefers-reduced-motion` preference decides.
 * Persistence: localStorage "sitekind-motion" = "on" | "off"; anything
 * else (missing, garbage, storage unavailable) means "no override".
 */

export const MOTION_STORAGE_KEY = "sitekind-motion";
export const MOTION_OFF_CLASS = "motion-off";

export type MotionOverride = "on" | "off" | null;

/** Final resolved switch: override wins, otherwise OS preference. */
export function resolveMotionOn(
  override: MotionOverride,
  reducedMotion: boolean,
): boolean {
  if (override === "on") return true;
  if (override === "off") return false;
  return !reducedMotion;
}

/** Minimal storage surface so tests can inject a mock. */
export type OverrideStorageReader = Pick<Storage, "getItem">;
export type OverrideStorageWriter = Pick<Storage, "setItem" | "removeItem">;

/** Read the persisted override; unknown/absent/throwing storage → null. */
export function readStoredOverride(
  storage: OverrideStorageReader | null | undefined,
): MotionOverride {
  try {
    const stored = storage?.getItem(MOTION_STORAGE_KEY);
    return stored === "on" || stored === "off" ? stored : null;
  } catch {
    return null; // storage unavailable — stay on OS default
  }
}

/** Persist a new override; `null` clears back to the OS default. */
export function persistOverride(
  storage: OverrideStorageWriter | null | undefined,
  value: MotionOverride,
): void {
  try {
    if (!storage) return;
    if (value === "on" || value === "off") {
      storage.setItem(MOTION_STORAGE_KEY, value);
    } else {
      storage.removeItem(MOTION_STORAGE_KEY);
    }
  } catch {
    // storage unavailable — in-memory only
  }
}
