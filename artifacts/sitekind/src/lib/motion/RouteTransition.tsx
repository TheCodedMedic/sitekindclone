/**
 * RouteTransition — short content dissolve + 8px rise on route change
 * (Stage 4, item 2). Deliberately NOT an AnimatePresence/keyed-remount
 * approach: the wrapper never remounts, so TanStack Router's scroll
 * restoration, deep links, hash links, history and focus management are all
 * untouched. Instead we subscribe to the router's `onResolved` event and
 * re-trigger a one-shot CSS entry animation (opacity + translateY, 240ms)
 * on the wrapper — enter-only, no exit phase.
 *
 * Safety details:
 *  - only fires when `pathChanged` (hash/search-only navigations are skipped)
 *  - skipped entirely under reduced motion / motion off (JS gate here plus
 *    the html.motion-off CSS gate)
 *  - the class is removed on animationend so no lingering transform can
 *    create a containing block for fixed-position descendants
 *  - if this chunk fails or JS is off, navigation is simply instant.
 */
import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { useMotion } from "@/lib/motion/MotionProvider";

const RUN_CLASS = "route-enter-run";

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const { motionOn } = useMotion();
  const motionOnRef = useRef(motionOn);
  motionOnRef.current = motionOn;
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = router.subscribe("onResolved", (event) => {
      if (!event.pathChanged) return;
      if (!motionOnRef.current) return;
      // Hidden tabs freeze CSS animations AND their events — a navigation
      // that happens while hidden must land instantly, not paused at
      // opacity 0 until the visitor returns.
      if (document.visibilityState === "hidden") return;
      const el = ref.current;
      if (!el) return;
      el.classList.remove(RUN_CLASS);
      // Force a reflow so re-adding the class restarts the animation.
      void el.offsetWidth;
      el.classList.add(RUN_CLASS);
      // Safety net: if animationend never arrives (tab hidden mid-flight),
      // still shed the class shortly after the nominal duration.
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove(RUN_CLASS), 600);
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onEnd = (e: AnimationEvent) => {
      // Drop the class as soon as the entry finishes so the wrapper carries
      // no transform outside the 240ms window (position:fixed descendants
      // must not be contained by a transformed ancestor).
      if (e.target === el) el.classList.remove(RUN_CLASS);
    };
    el.addEventListener("animationend", onEnd);
    return () => el.removeEventListener("animationend", onEnd);
  }, []);

  return <div ref={ref}>{children}</div>;
}
