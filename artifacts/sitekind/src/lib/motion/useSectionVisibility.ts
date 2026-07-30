/**
 * IntersectionObserver hook — lets a section pause its motion while
 * offscreen (spec: pause when tab hidden or section offscreen).
 *
 * Usage:
 *   const { ref, isVisible } = useSectionVisibility<HTMLDivElement>();
 *   <div ref={ref}>… animate only while isVisible …</div>
 *
 * SSR-safe: the observer attaches in an effect; environments without
 * IntersectionObserver fall back to `isVisible = true` (site stays usable
 * if motion plumbing degrades).
 */
import { useEffect, useRef, useState } from "react";

export type SectionVisibilityOptions = {
  /** Portion of the element that must intersect (default 0.15). */
  threshold?: number;
  /** Observer root margin (default "0px"). */
  rootMargin?: string;
  /** If true, stays visible after first intersection (one-shot). */
  once?: boolean;
};

export function useSectionVisibility<T extends Element = HTMLDivElement>(
  options: SectionVisibilityOptions = {},
) {
  const { threshold = 0.15, rootMargin = "0px", once = false } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target !== el) continue;
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setIsVisible(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
