/**
 * AmbientAutomationField — hero-only decorative layer (Level A ambience).
 *
 * Thirteen small "service signal" glyphs — phone waveform, map pin, calendar
 * check, review star, cursor, route node, page frame, status dot — floated
 * behind the hero content in brand clementine/teal at low opacity.
 *
 * Behavior:
 *  - fine pointer + motion on: gentle attraction/repulsion (≤14px) with lag,
 *    via useInterpolatedPointer writing --px/--py on the hero <header>; each
 *    node multiplies those by its own signed factor in pure CSS.
 *  - coarse pointer: one ultra-slow autonomous drift on ≤6 nodes (CSS,
 *    disabled on fine-pointer devices and under motion-off).
 *  - reduced motion / motion off: static composition.
 *
 * Strictly decorative: aria-hidden, pointer-events:none, absolutely
 * positioned (zero CLS), masked out before the next section begins. This
 * chunk is lazy-loaded — if it never arrives the hero is simply the current
 * static hero.
 */
import { CalendarCheck2, MapPin, MousePointer2, Phone, Star } from "lucide-react";
import { useInterpolatedPointer } from "@/lib/motion/useInterpolatedPointer";

type AmbientNode = {
  /** Position, % of the hero header. */
  left: string;
  top: string;
  /** Signed pointer factors (px at full deflection). |value| ≤ 14. */
  fx: number;
  fy: number;
  size: number;
  tone: "primary" | "accent";
  opacity: number;
  /** Ultra-slow autonomous drift for coarse-pointer devices (≤6 nodes). */
  drift?: boolean;
  glyph: "phone" | "pin" | "calendar" | "star" | "cursor" | "route" | "page" | "dot";
};

/**
 * Deterministic composition: 13 nodes (≤14 per spec), kept to the hero's
 * side margins so they never sit behind the headline copy.
 */
const NODES: AmbientNode[] = [
  { left: "7%", top: "18%", fx: 9, fy: 6, size: 20, tone: "accent", opacity: 0.3, glyph: "phone", drift: true },
  { left: "13%", top: "40%", fx: -12, fy: 8, size: 16, tone: "primary", opacity: 0.24, glyph: "pin" },
  { left: "5%", top: "58%", fx: 7, fy: -10, size: 18, tone: "primary", opacity: 0.26, glyph: "calendar", drift: true },
  { left: "16%", top: "72%", fx: -8, fy: -6, size: 14, tone: "accent", opacity: 0.22, glyph: "star" },
  { left: "9%", top: "86%", fx: 11, fy: 9, size: 16, tone: "accent", opacity: 0.2, glyph: "route" },
  { left: "22%", top: "12%", fx: -6, fy: 11, size: 12, tone: "primary", opacity: 0.2, glyph: "dot" },
  { left: "88%", top: "16%", fx: -10, fy: 7, size: 18, tone: "primary", opacity: 0.28, glyph: "pin", drift: true },
  { left: "93%", top: "36%", fx: 8, fy: -9, size: 16, tone: "accent", opacity: 0.26, glyph: "star", drift: true },
  { left: "85%", top: "52%", fx: -13, fy: -7, size: 20, tone: "accent", opacity: 0.28, glyph: "page" },
  { left: "94%", top: "66%", fx: 9, fy: 10, size: 16, tone: "primary", opacity: 0.22, glyph: "cursor", drift: true },
  { left: "87%", top: "82%", fx: -7, fy: 12, size: 18, tone: "primary", opacity: 0.24, glyph: "phone" },
  { left: "78%", top: "10%", fx: 6, fy: -8, size: 12, tone: "accent", opacity: 0.2, glyph: "dot", drift: true },
  { left: "70%", top: "88%", fx: -9, fy: 6, size: 14, tone: "primary", opacity: 0.2, glyph: "route" },
];

const TONE: Record<AmbientNode["tone"], string> = {
  primary: "var(--color-primary)",
  accent: "var(--color-accent)",
};

function Glyph({ node }: { node: AmbientNode }) {
  const common = { size: node.size, strokeWidth: 1.6, "aria-hidden": true as const };
  switch (node.glyph) {
    case "phone":
      return <Phone {...common} />;
    case "pin":
      return <MapPin {...common} />;
    case "calendar":
      return <CalendarCheck2 {...common} />;
    case "star":
      return <Star {...common} />;
    case "cursor":
      return <MousePointer2 {...common} />;
    case "page":
      // tiny generated-page frame
      return (
        <svg width={node.size} height={node.size} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="2" y="3" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <line x1="2" y1="7.5" x2="18" y2="7.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="5" y="10.5" width="6" height="3.5" rx="1" fill="currentColor" opacity="0.7" />
        </svg>
      );
    case "route":
      // route node with two stubs
      return (
        <svg width={node.size} height={node.size} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M1.5 16.5 L7.5 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2.5 3" />
          <path d="M13 8.5 L18.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2.5 3" />
        </svg>
      );
    case "dot":
      return (
        <svg width={node.size} height={node.size} viewBox="0 0 12 12" fill="none" aria-hidden>
          <circle cx="6" cy="6" r="3" fill="currentColor" />
          <circle cx="6" cy="6" r="5.2" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
      );
  }
}

export default function AmbientAutomationField({
  hostRef,
}: {
  /** The hero <header> — receives the pointermove listener and --px/--py. */
  hostRef: React.RefObject<HTMLElement | null>;
}) {
  // Writes eased, clamped --px/--py onto the header (inherited by every
  // node below). Auto-disabled on coarse pointer / reduced motion / motion
  // off — the calc() expressions then collapse to translate3d(0,0,0).
  useInterpolatedPointer(hostRef, { ease: 0.08 });

  return (
    <div className="ambient-field" aria-hidden="true">
      {NODES.map((node, i) => (
        <span
          key={i}
          className="ambient-node"
          style={
            {
              left: node.left,
              top: node.top,
              color: TONE[node.tone],
              opacity: node.opacity,
              "--fx": node.fx,
              "--fy": node.fy,
            } as React.CSSProperties
          }
        >
          <span
            className={node.drift ? "ambient-drift block" : "block"}
            style={node.drift ? { animationDelay: `${-(i * 7)}s` } : undefined}
          >
            <Glyph node={node} />
          </span>
        </span>
      ))}
    </div>
  );
}
