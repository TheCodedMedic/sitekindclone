/**
 * NavActiveIndicator — the sliding active-route underline in the desktop
 * navbar (Stage 4, item 1). A single framer-motion `layoutId` span: when the
 * active nav item changes, the underline glides from the old item to the new
 * one (shared-layout transition). Lazy-loaded by Navbar after mount so
 * framer-motion stays out of the critical bundle; until then the active item
 * is distinguished by its existing text color (unchanged SSR behavior).
 *
 * Reduced motion / motion off → duration 0 (the underline simply appears
 * under the new item, no glide).
 */
import { motion } from "framer-motion";
import { useMotion } from "@/lib/motion/MotionProvider";

export function NavActiveIndicator() {
  const { motionOn } = useMotion();
  return (
    <motion.span
      layoutId="nav-active-underline"
      className="nav-active-pill"
      aria-hidden="true"
      transition={
        motionOn
          ? { type: "spring", stiffness: 480, damping: 42, mass: 0.8 }
          : { duration: 0 }
      }
    />
  );
}

export default NavActiveIndicator;
