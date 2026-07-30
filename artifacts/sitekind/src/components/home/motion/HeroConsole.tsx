/**
 * HeroConsole — the always-loaded shell of the hero "living automation
 * console" (the site's ONE Level A signature scene).
 *
 * Renders the existing dashboard preview via a render prop (so the static
 * markup — copy, metrics, CTAs — stays exactly where it was, byte for byte
 * at rest) and adds, additively:
 *
 *  - pointer tilt on the console (≤1.1deg / ≤3px, eased through the shared
 *    frame loop; paused while focus is inside — e.g. the audio controls —
 *    and disabled on coarse pointers / reduced motion / motion off)
 *  - lazy-loads ConsoleRouteLayer into space this shell reserves; if that
 *    chunk never arrives, the hero stays the current static hero.
 */
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useInterpolatedPointer } from "@/lib/motion/useInterpolatedPointer";
import { useSectionVisibility } from "@/lib/motion/useSectionVisibility";

const ConsoleRouteLayer = lazy(() => import("./ConsoleRouteLayer"));

export function HeroConsole({
  children,
}: {
  /** The existing static dashboard preview (unchanged markup). */
  children: (ctx: { sampleBoost: boolean }) => React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const { ref: visRef, isVisible } = useSectionVisibility<HTMLDivElement>({
    threshold: 0.2,
  });

  const [mounted, setMounted] = useState(false);
  const [tiltPaused, setTiltPaused] = useState(false);

  useEffect(() => setMounted(true), []);

  // Console tilt — vars consumed by .hero-console-tilt / .hero-console-route
  // in styles.css. Paused (eases home, no snap) while focus is inside the
  // console, e.g. on the audio play/stop controls or the van.
  useInterpolatedPointer(wrapRef, { ease: 0.1, paused: tiltPaused });

  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      wrapRef.current = el;
      visRef.current = el;
    },
    [visRef],
  );

  return (
    <div
      ref={setRefs}
      className="hero-console-tilt relative"
      onFocusCapture={() => setTiltPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setTiltPaused(false);
        }
      }}
    >
      {/* Decorative route layer — lazy; reserved, absolute space (zero CLS). */}
      {mounted && (
        <Suspense fallback={null}>
          <ConsoleRouteLayer visible={isVisible} phase="idle" />
        </Suspense>
      )}

      {/* The untouched static preview, above the route layer. */}
      <div className="relative">{children({ sampleBoost: false })}</div>
    </div>
  );
}
