/**
 * useTweenedNumber — eases a displayed integer toward a changing target
 * (Stage 3, ValueComparison savings figure). Runs on the shared frame loop,
 * ~240ms ease-out per change, and snaps instantly when motion is off or the
 * visitor prefers reduced motion (spec: "state changes instant under
 * reduced motion").
 *
 * SSR-safe: the first render simply shows the target; the tween only ever
 * starts in an effect after a *change*.
 */
import { useEffect, useRef, useState } from "react";
import { frameLoop } from "@/lib/motion/frameLoop";
import { MOTION_BASE_MS } from "@/lib/motion/tokens";
import { useMotion } from "@/lib/motion/MotionProvider";

export function useTweenedNumber(
  target: number,
  durationMs: number = MOTION_BASE_MS,
): number {
  const { motionOn } = useMotion();
  const motionOnRef = useRef(motionOn);
  motionOnRef.current = motionOn;

  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);

  useEffect(() => {
    if (displayRef.current === target) return;
    if (!motionOnRef.current) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }
    const from = displayRef.current;
    let startAt: number | null = null;
    const unsubscribe = frameLoop.subscribe((now) => {
      if (startAt === null) startAt = now;
      const t = Math.min(1, (now - startAt) / durationMs);
      if (t >= 1 || !motionOnRef.current) {
        displayRef.current = target;
        setDisplay(target);
        unsubscribe();
        return;
      }
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (target - from) * eased);
      displayRef.current = value;
      setDisplay(value);
    });
    return unsubscribe;
  }, [target, durationMs]);

  return display;
}
