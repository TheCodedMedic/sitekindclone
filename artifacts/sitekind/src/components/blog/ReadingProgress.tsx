/**
 * ReadingProgress — the ONLY motion on blog articles (Stage 4, item 8): a
 * thin fixed bar under the navbar whose fill mirrors scroll position.
 * Functional feedback (it only moves when the reader scrolls), so it stays
 * under reduced motion / motion off too — there is no animation, just a
 * direct scroll → scaleX mapping written to the element style (never React
 * state), rAF-coalesced. Fixed overlay = zero layout shift; decorative for
 * AT (aria-hidden). If JS never runs, the bar simply stays empty.
 */
import { useEffect, useRef } from "react";

export function ReadingProgress() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="reading-progress" aria-hidden="true">
      <div ref={fillRef} className="reading-progress-fill" />
    </div>
  );
}
