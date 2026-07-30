import { useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

export function useMotionSafe() {
  const reduced = useReducedMotion();
  return !reduced;
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

export const kenBurns: Variants = {
  hidden: { scale: 1.0 },
  show: { scale: 1.08, transition: { duration: 12, ease: "linear" } },
};

// R10 (design-sweep round 7): the skewY leg is gone — a capture that lands
// mid-flight read the poster headline as rotated text ("zero rotated text"
// is rubric law, and it must hold at every animation frame, not just at
// rest). The vertical crash + spring keeps the variant's character.
export const crashIn: Variants = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

export const slideInRotate: Variants = {
  hidden: { opacity: 0, x: -30, rotate: -1.5 },
  show: { opacity: 1, x: 0, rotate: 0, transition: { type: "spring", stiffness: 200, damping: 18 } },
};

export const revealRight: Variants = {
  hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
  show: { opacity: 1, clipPath: "inset(0 0% 0 0)", transition: { duration: 0.9, ease: [0.65, 0, 0.35, 1] } },
};
