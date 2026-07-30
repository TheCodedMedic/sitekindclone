/**
 * CountUpValue — a stat value that counts up ONCE on first viewport entry
 * (Stage 3, proof/stat strips). Additive by design:
 *
 *  - SSR and first client paint render the FINAL value (identical HTML,
 *    no hydration mismatch, SEO-safe)
 *  - the animation arms on first intersection (once) and never re-runs
 *  - reduced motion / motion off → the final number appears instantly
 *  - width is reserved by an invisible copy of the final value, so the
 *    counting text can never shift layout (zero CLS)
 *  - screen readers always get the final value (sr-only), the animated
 *    copy is aria-hidden
 *
 * Parses "$5.4M+", "24 hrs", "91.7%", "+41", "$62k" style strings —
 * anything without a leading number renders as plain static text.
 */
import { useEffect, useRef, useState } from "react";
import { frameLoop } from "@/lib/motion/frameLoop";
import { useMotion } from "@/lib/motion/MotionProvider";
import { useSectionVisibility } from "@/lib/motion/useSectionVisibility";

const VALUE_RE = /^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/;

function parseValue(value: string) {
  const m = VALUE_RE.exec(value);
  if (!m) return null;
  const decimals = m[2].includes(".") ? m[2].split(".")[1].length : 0;
  return {
    prefix: m[1],
    num: Number.parseFloat(m[2]),
    suffix: m[3],
    decimals,
  };
}

export function CountUpValue({
  value,
  durationMs = 900,
  className = "",
}: {
  value: string;
  durationMs?: number;
  className?: string;
}) {
  const { motionOn } = useMotion();
  const motionOnRef = useRef(motionOn);
  motionOnRef.current = motionOn;

  const { ref, isVisible } = useSectionVisibility<HTMLSpanElement>({
    threshold: 0.4,
    once: true,
  });

  const [display, setDisplay] = useState(value);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!isVisible || ranRef.current) return;
    ranRef.current = true; // count up ONCE — never re-run
    const parsed = parseValue(value);
    if (!parsed || !motionOnRef.current) {
      setDisplay(value);
      return;
    }
    const { prefix, num, suffix, decimals } = parsed;
    let startAt: number | null = null;
    const unsubscribe = frameLoop.subscribe((now) => {
      if (startAt === null) startAt = now;
      const t = Math.min(1, (now - startAt) / durationMs);
      if (t >= 1 || !motionOnRef.current) {
        setDisplay(value);
        unsubscribe();
        return;
      }
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(`${prefix}${(num * eased).toFixed(decimals)}${suffix}`);
    });
    return unsubscribe;
  }, [isVisible, value, durationMs]);

  return (
    <span ref={ref} className={`relative inline-block ${className}`}>
      {/* Invisible final value reserves exact width — zero layout shift. */}
      <span className="invisible" aria-hidden="true">
        {value}
      </span>
      <span className="absolute inset-0" aria-hidden="true">
        {display}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
