/**
 * Eased pointer tracking → CSS custom properties, with zero React re-renders.
 *
 * Attaches ONE passive pointermove listener to the target element, keeps raw
 * coordinates in refs, subscribes to the shared frame loop, lerps toward the
 * raw target each frame, and writes clamped normalized values ([-1, 1]) to
 * CSS variables (default --px / --py) on the element. Consumers use them in
 * transforms, e.g. `translate3d(calc(var(--px) * 6px), …)`.
 *
 * Disabled entirely (and variables reset to 0) when the visitor has motion
 * off or the device lacks a fine pointer — per the motion spec, coarse
 * pointers get no pointer-tracking effects.
 *
 * `paused` (e.g. while a focusable control inside the target holds focus)
 * keeps the loop alive but eases the variables back to neutral through the
 * shared frame loop — a soft return, never a snap.
 */
import { useEffect, useRef } from "react";
import { frameLoop } from "./frameLoop";
import { useMotion } from "./MotionProvider";
import { clampUnit, lerpStep, normalizedPointerCoord } from "./pointerMath";

export type InterpolatedPointerOptions = {
  /** Lerp factor per frame at 60fps, 0–1 (default 0.12 — soft trailing). */
  ease?: number;
  /** CSS variable for the x axis (default "--px"). */
  varX?: string;
  /** CSS variable for the y axis (default "--py"). */
  varY?: string;
  /** While true, targets ease back to 0 (used when focus is inside). */
  paused?: boolean;
};

export function useInterpolatedPointer<T extends HTMLElement>(
  targetRef: React.RefObject<T | null>,
  options: InterpolatedPointerOptions = {},
) {
  const { ease = 0.12, varX = "--px", varY = "--py", paused = false } = options;
  const { motionOn, finePointer } = useMotion();
  const enabled = motionOn && finePointer;

  // Raw target + eased current live in plain refs — never React state.
  // Hook-level refs so the eased position survives effect re-runs (e.g. a
  // `paused` toggle) and keeps easing from where it was, snap-free.
  const rawRef = useRef({ x: 0, y: 0 });
  const curRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    if (!enabled) {
      // Neutral resting state; consumers' calc() expressions collapse to 0.
      rawRef.current = { x: 0, y: 0 };
      curRef.current = { x: 0, y: 0 };
      el.style.setProperty(varX, "0");
      el.style.setProperty(varY, "0");
      return;
    }

    const raw = rawRef.current;
    const cur = curRef.current;
    if (paused) {
      // Ease home: the frame loop below reads raw = 0 targets.
      raw.x = 0;
      raw.y = 0;
    }
    let settled = false;

    const onPointerMove = (e: PointerEvent) => {
      if (paused) return; // hold at neutral while paused
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      raw.x = normalizedPointerCoord(e.clientX, rect.left, rect.width);
      raw.y = normalizedPointerCoord(e.clientY, rect.top, rect.height);
      settled = false;
    };
    const onPointerLeave = () => {
      raw.x = 0;
      raw.y = 0;
      settled = false;
    };

    el.addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("pointerleave", onPointerLeave, { passive: true });

    // Seed from the current eased position (not 0) so a `paused` flip
    // re-runs this effect without a visual jump.
    el.style.setProperty(varX, clampUnit(cur.x).toFixed(4));
    el.style.setProperty(varY, clampUnit(cur.y).toFixed(4));

    const unsubscribe = frameLoop.subscribe((_now, deltaMs) => {
      if (settled) return; // no style writes while at rest
      // Frame-rate independent lerp (ease is calibrated for 60fps frames).
      cur.x = lerpStep(cur.x, raw.x, ease, deltaMs);
      cur.y = lerpStep(cur.y, raw.y, ease, deltaMs);
      if (Math.abs(raw.x - cur.x) < 0.001 && Math.abs(raw.y - cur.y) < 0.001) {
        cur.x = raw.x;
        cur.y = raw.y;
        settled = true;
      }
      el.style.setProperty(varX, clampUnit(cur.x).toFixed(4));
      el.style.setProperty(varY, clampUnit(cur.y).toFixed(4));
    });

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      unsubscribe();
      el.style.removeProperty(varX);
      el.style.removeProperty(varY);
    };
  }, [targetRef, enabled, ease, varX, varY, paused]);
}
