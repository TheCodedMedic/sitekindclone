/**
 * CtaConvergence — decorative background layer for the final CTA band
 * (Stage 3, item 9): a handful of local-business automation glyphs (call,
 * review star, map pin, booking, page) drift slowly from the band's edges
 * toward the CTA and fade out. Staggered long loops keep only ~2 nodes
 * visibly moving at any moment.
 *
 * aria-hidden + pointer-events:none; transform/opacity only; pauses when
 * the band is offscreen or the tab is hidden (animation only runs with the
 * JS-gated `.cta-converge-live` class); under html.motion-off the nodes sit
 * static and faint. Buttons keep their standard response — nothing here
 * touches the conversion controls.
 */
import type { CSSProperties } from "react";
import {
  CalendarCheck2,
  FileText,
  Globe,
  MapPin,
  PhoneCall,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useMotion } from "@/lib/motion/MotionProvider";
import { useSectionVisibility } from "@/lib/motion/useSectionVisibility";

type ConvergeNode = {
  Icon: LucideIcon;
  left: string;
  top: string;
  /** Drift toward the band's center, px (kept small — works at all widths). */
  cx: number;
  cy: number;
  dur: number;
  delay: number;
  size?: number;
};

const NODES: ConvergeNode[] = [
  { Icon: PhoneCall, left: "7%", top: "24%", cx: 150, cy: 60, dur: 8400, delay: 0, size: 14 },
  { Icon: Star, left: "15%", top: "72%", cx: 130, cy: -55, dur: 9600, delay: 2200, size: 12 },
  { Icon: MapPin, left: "89%", top: "30%", cx: -150, cy: 45, dur: 8800, delay: 1100, size: 14 },
  { Icon: CalendarCheck2, left: "83%", top: "74%", cx: -125, cy: -60, dur: 10400, delay: 3600, size: 13 },
  { Icon: Globe, left: "27%", top: "10%", cx: 85, cy: 70, dur: 9200, delay: 5000, size: 12 },
  { Icon: FileText, left: "69%", top: "8%", cx: -80, cy: 72, dur: 10000, delay: 6400, size: 12 },
];

export function CtaConvergence() {
  const { motionOn } = useMotion();
  const { ref, isVisible } = useSectionVisibility<HTMLDivElement>({
    threshold: 0.2,
  });
  const live = motionOn && isVisible;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`cta-converge pointer-events-none absolute inset-0 overflow-hidden ${
        live ? "cta-converge-live" : ""
      }`}
    >
      {NODES.map((n, i) => (
        <span
          key={i}
          className="cta-node absolute"
          style={
            {
              left: n.left,
              top: n.top,
              "--cx": `${n.cx}px`,
              "--cy": `${n.cy}px`,
              "--dur": `${n.dur}ms`,
              "--delay": `${n.delay}ms`,
            } as CSSProperties
          }
        >
          <n.Icon size={n.size ?? 13} />
        </span>
      ))}
    </div>
  );
}

export default CtaConvergence;
