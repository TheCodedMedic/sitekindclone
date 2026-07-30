/**
 * ButtonMagnetics — the site-wide "inner label follows the cursor" layer for
 * .btn-primary / .btn-accent (Stage 4, item 3). One delegated, passive
 * pointermove listener on the document (no per-button listeners, no React
 * state): it writes clamped --bx/--by px offsets (|x| ≤ 3px, |y| ≤ 2px) onto
 * the hovered button; the .btn-label span inside (see CtaLink) reads them in
 * pure CSS. Buttons without a .btn-label span simply ignore the vars.
 *
 * Gates: fine pointer + hover-capable devices only, and only while motion is
 * on — both live via useMotion(). When the gate closes (or on unmount) any
 * written vars are removed, so everything collapses to the static default.
 */
import { useEffect } from "react";
import { useMotion } from "@/lib/motion/MotionProvider";

const SELECTOR = ".btn-primary, .btn-accent";
const MAX_X_PX = 3;
const MAX_Y_PX = 2;

export function ButtonMagnetics() {
  const { motionOn, finePointer } = useMotion();
  const enabled = motionOn && finePointer;

  useEffect(() => {
    if (!enabled) return;
    if (typeof document === "undefined") return;

    let current: HTMLElement | null = null;

    const reset = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.removeProperty("--bx");
      el.style.removeProperty("--by");
    };

    const onPointerMove = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const btn =
        (target?.closest?.(SELECTOR) as HTMLElement | null) ?? null;
      if (btn !== current) {
        reset(current);
        current = btn;
      }
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // Signed -1..1 distance from center, clamped to the depth budget.
      const nx = Math.max(
        -1,
        Math.min(1, ((e.clientX - (rect.left + rect.width / 2)) / rect.width) * 2),
      );
      const ny = Math.max(
        -1,
        Math.min(1, ((e.clientY - (rect.top + rect.height / 2)) / rect.height) * 2),
      );
      btn.style.setProperty("--bx", `${(nx * MAX_X_PX).toFixed(2)}px`);
      btn.style.setProperty("--by", `${(ny * MAX_Y_PX).toFixed(2)}px`);
    };

    const onDocLeave = () => {
      reset(current);
      current = null;
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onDocLeave);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onDocLeave);
      reset(current);
      current = null;
    };
  }, [enabled]);

  return null;
}
