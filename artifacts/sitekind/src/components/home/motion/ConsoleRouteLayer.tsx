/**
 * ConsoleRouteLayer — the decorative automation route drawn around the hero
 * dashboard preview (lazy chunk of the Level A signature scene).
 *
 *  - a faint dashed rounded-rect route with four semantic nodes along it:
 *    Website → Incoming Call → Booked Job → Maps Rank, plus a calm
 *    "LIVE · SAMPLE" dot (opacity breathing only — no scale pulse).
 *  - ONE pulse travels the route every ~7.5s, only while the section is
 *    visible AND motion is on (shared frame loop — pauses with the tab).
 *    Passing the pulse triggers each node's micro-response: the phone
 *    brightens with a single ring, the calendar reveals its check, the
 *    website assembles one block, the maps pin steps up a sample rank.
 *  - the sample-lead sequence phase (from HeroConsole) pings the matching
 *    node so the story reads on the route too.
 *  - ServiceVanReward: a tiny van — a real <button>, 44×44 hit target,
 *    keyboard operable — that drives along the route to the Booked Job
 *    node, drops a check, and returns (~1.2s, soft-spring easing). The one
 *    toy in the first viewport.
 *
 * Everything here is absolutely positioned inside space the shell reserves,
 * so its arrival never shifts layout. SVG visuals are aria-hidden; only the
 * van button is exposed to AT.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarCheck2, Check, Globe, MapPin, Phone } from "lucide-react";
import { frameLoop } from "@/lib/motion/frameLoop";
import { useMotion } from "@/lib/motion/MotionProvider";
import { track } from "@/lib/motionAnalytics";
import type { SampleLeadPhase } from "./sampleLead";

type NodeKey = "website" | "call" | "booked" | "maps";

const NODE_KEYS: NodeKey[] = ["website", "call", "booked", "maps"];

/** Fractions along the clockwise route path (starts after the top-left arc). */
const NODE_FRACS: Record<NodeKey, number> = {
  website: 0.06,
  call: 0.29,
  booked: 0.53,
  maps: 0.79,
};

const NODE_LABELS: Record<NodeKey, string> = {
  website: "Website",
  call: "Incoming Call",
  booked: "Booked Job",
  maps: "Maps Rank",
};

const VAN_HOME_FRAC = 0.655;

/** Route line inset from the layer's edge (px). */
const EDGE = 12;
const CORNER = 22;

const PULSE_PERIOD_MS = 7500; // one pulse every 6–10s
const PULSE_TRAVEL_MS = 2600;
const PULSE_FIRST_DELAY_MS = 1100;

const VAN_GO_MS = 480;
const VAN_PAUSE_MS = 280;
const VAN_BACK_MS = 480; // total ≈ 1240ms

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
/** Soft spring: gentle overshoot on arrival. */
const easeOutBackSoft = (t: number) => {
  const c1 = 0.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function roundedRectPath(w: number, h: number): string {
  const i = EDGE;
  const r = Math.min(CORNER, (w - 2 * i) / 2, (h - 2 * i) / 2);
  const right = w - i;
  const bottom = h - i;
  return [
    `M ${i + r} ${i}`,
    `H ${right - r}`,
    `A ${r} ${r} 0 0 1 ${right} ${i + r}`,
    `V ${bottom - r}`,
    `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
    `H ${i + r}`,
    `A ${r} ${r} 0 0 1 ${i} ${bottom - r}`,
    `V ${i + r}`,
    `A ${r} ${r} 0 0 1 ${i + r} ${i}`,
    "Z",
  ].join(" ");
}

type Pt = { x: number; y: number };

type Geometry = {
  w: number;
  h: number;
  d: string;
};

type RoutePoints = {
  total: number;
  nodes: Record<NodeKey, Pt>;
  van: Pt;
};

/** Tiny service van, drawn around (0,0) so it can ride the path. */
function VanShape() {
  return (
    <g aria-hidden="true">
      <rect x={-12} y={-8} width={14} height={8.5} rx={2} fill="currentColor" />
      <path
        d="M2 -6.5 h5.2 c0.62 0 1.2 0.29 1.58 0.78 L11.2 -2.6 c0.28 0.36 0.43 0.8 0.43 1.25 V0.5 h-9.6 Z"
        fill="currentColor"
        opacity={0.85}
      />
      <rect x={-9.5} y={-6.2} width={4} height={2.6} rx={0.7} fill="var(--surface)" opacity={0.9} />
      <circle cx={-6.5} cy={1.5} r={2.3} fill="var(--ink)" stroke="var(--surface)" strokeWidth={1} />
      <circle cx={6.5} cy={1.5} r={2.3} fill="var(--ink)" stroke="var(--surface)" strokeWidth={1} />
    </g>
  );
}

export default function ConsoleRouteLayer({
  visible,
  phase,
}: {
  /** Section visibility from the shell — the pulse pauses offscreen. */
  visible: boolean;
  /** Current sample-lead phase — pings the matching route node. */
  phase: SampleLeadPhase;
}) {
  const { motionOn } = useMotion();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const pulseRef = useRef<SVGGElement | null>(null);
  const vanTravelRef = useRef<SVGGElement | null>(null);
  const nodeRefs = useRef<Partial<Record<NodeKey, SVGGElement | null>>>({});
  const pingTimers = useRef(new Map<NodeKey, number>());
  const lastPulseFrac = useRef(0);

  const [geom, setGeom] = useState<Geometry | null>(null);
  const [points, setPoints] = useState<RoutePoints | null>(null);
  const [driving, setDriving] = useState(false);
  const [checkOn, setCheckOn] = useState(false);
  const driveUnsubRef = useRef<(() => void) | null>(null);
  const checkTimerRef = useRef<number | null>(null);

  // ── Measure the reserved layer and (re)build the route path ────────
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 80 || h < 80) return;
      setGeom((g) =>
        g && g.w === w && g.h === h ? g : { w, h, d: roundedRectPath(w, h) },
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Resolve node / van anchor points from the real path geometry ───
  useEffect(() => {
    const p = pathRef.current;
    if (!p || !geom) return;
    const total = p.getTotalLength();
    if (!total) return;
    const at = (f: number): Pt => {
      const pt = p.getPointAtLength(f * total);
      return { x: pt.x, y: pt.y };
    };
    setPoints({
      total,
      nodes: {
        website: at(NODE_FRACS.website),
        call: at(NODE_FRACS.call),
        booked: at(NODE_FRACS.booked),
        maps: at(NODE_FRACS.maps),
      },
      van: at(VAN_HOME_FRAC),
    });
  }, [geom]);

  // ── Node micro-response: add .node-hot for ~750ms ───────────────────
  const pingNode = useCallback((key: NodeKey) => {
    const g = nodeRefs.current[key];
    if (!g) return;
    g.classList.remove("node-hot");
    // restart the one-shot ring animation
    void g.getBoundingClientRect();
    g.classList.add("node-hot");
    const prev = pingTimers.current.get(key);
    if (prev) window.clearTimeout(prev);
    pingTimers.current.set(
      key,
      window.setTimeout(() => g.classList.remove("node-hot"), 750),
    );
  }, []);

  useEffect(() => {
    const timers = pingTimers.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, []);

  // ── Sample-lead phases ping the matching node ───────────────────────
  useEffect(() => {
    if (phase === "ringing") pingNode("call");
    else if (phase === "answered") pingNode("website");
    else if (phase === "booking") pingNode("booked");
    else if (phase === "reward") pingNode("maps");
  }, [phase, pingNode]);

  // ── The ONE traveling pulse (shared frame loop; visible + motionOn) ─
  useEffect(() => {
    if (!points || !motionOn || !visible) return;
    const p = pathRef.current;
    const dot = pulseRef.current;
    if (!p || !dot) return;
    const startAt = performance.now() + PULSE_FIRST_DELAY_MS;
    lastPulseFrac.current = 0;
    dot.style.opacity = "0";
    const unsubscribe = frameLoop.subscribe((now) => {
      const t = now - startAt;
      if (t < 0) return;
      const ph = t % PULSE_PERIOD_MS;
      if (ph >= PULSE_TRAVEL_MS) {
        dot.style.opacity = "0";
        lastPulseFrac.current = 0;
        return;
      }
      const frac = easeInOutSine(ph / PULSE_TRAVEL_MS);
      const pt = p.getPointAtLength(clamp01(frac) * points.total);
      dot.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      const edge = Math.min(frac, 1 - frac);
      dot.style.opacity = String(Math.min(1, edge * 10) * 0.9);
      for (const key of NODE_KEYS) {
        const nf = NODE_FRACS[key];
        if (lastPulseFrac.current < nf && frac >= nf) pingNode(key);
      }
      lastPulseFrac.current = frac;
    });
    return () => {
      unsubscribe();
      dot.style.opacity = "0";
    };
  }, [points, motionOn, visible, pingNode]);

  // ── ServiceVanReward ────────────────────────────────────────────────
  const activateVan = useCallback(() => {
    if (driving || !points) return;
    track("hero_service_van_activated");
    if (checkTimerRef.current) window.clearTimeout(checkTimerRef.current);

    if (!motionOn) {
      // Reduced motion: the outcome, opacity-only.
      setCheckOn(true);
      checkTimerRef.current = window.setTimeout(() => setCheckOn(false), 1100);
      return;
    }

    const p = pathRef.current;
    const g = vanTravelRef.current;
    if (!p || !g) return;
    setDriving(true);
    const start = performance.now();
    const home = VAN_HOME_FRAC;
    const dest = NODE_FRACS.booked;
    const unsubscribe = frameLoop.subscribe((now) => {
      const t = now - start;
      let frac: number;
      if (t < VAN_GO_MS) {
        frac = home + (dest - home) * easeOutBackSoft(t / VAN_GO_MS);
      } else if (t < VAN_GO_MS + VAN_PAUSE_MS) {
        frac = dest;
        setCheckOn(true); // drop the check (no-op re-set after first frame)
      } else if (t < VAN_GO_MS + VAN_PAUSE_MS + VAN_BACK_MS) {
        frac =
          dest +
          (home - dest) * easeOutBackSoft((t - VAN_GO_MS - VAN_PAUSE_MS) / VAN_BACK_MS);
      } else {
        unsubscribe();
        driveUnsubRef.current = null;
        g.style.opacity = "0";
        setDriving(false);
        checkTimerRef.current = window.setTimeout(() => setCheckOn(false), 700);
        return;
      }
      // dest sits earlier on the path (to the van's right along the bottom
      // edge, which runs right→left) — face the travel direction.
      const facing = t < VAN_GO_MS + VAN_PAUSE_MS ? 1 : -1;
      const pt = p.getPointAtLength(clamp01(frac) * points.total);
      g.style.opacity = "1";
      g.setAttribute(
        "transform",
        `translate(${pt.x} ${pt.y - 3}) scale(${facing} 1)`,
      );
    });
    driveUnsubRef.current = unsubscribe;
  }, [driving, points, motionOn]);

  // Full cleanup on unmount (route change included).
  useEffect(
    () => () => {
      driveUnsubRef.current?.();
      if (checkTimerRef.current) window.clearTimeout(checkTimerRef.current);
    },
    [],
  );

  const labelSide = (pt: Pt): number => (geom && pt.y < geom.h / 2 ? -19 : 26);

  return (
    <div
      ref={hostRef}
      className="hero-console-route pointer-events-none absolute -inset-4 sm:-inset-7"
    >
      {geom && (
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox={`0 0 ${geom.w} ${geom.h}`}
          aria-hidden="true"
          focusable="false"
        >
          {/* Route */}
          <path
            ref={pathRef}
            d={geom.d}
            fill="none"
            stroke="var(--card-border)"
            strokeWidth={1.5}
            strokeDasharray="3 7"
            strokeLinecap="round"
          />

          {points && (
            <>
              {/* Calm LIVE indicator — opacity breathing only, sample-labeled */}
              <g
                transform={`translate(${geom.w - EDGE - 96} ${EDGE})`}
                className="route-live"
              >
                <circle r={3.2} fill="var(--color-accent)" className="route-live-dot" />
                <text
                  x={9}
                  y={3}
                  className="route-text"
                  fill="var(--ink-2)"
                >
                  LIVE · SAMPLE
                </text>
              </g>

              {/* Semantic nodes */}
              {NODE_KEYS.map((key) => {
                const pt = points.nodes[key];
                const tone = key === "website" || key === "call" ? "var(--color-primary)" : "var(--color-accent)";
                return (
                  <g
                    key={key}
                    ref={(el) => {
                      nodeRefs.current[key] = el;
                    }}
                    className="route-node"
                    transform={`translate(${pt.x} ${pt.y})`}
                    style={{ color: tone }}
                  >
                    <circle className="node-ring" r={11} fill="none" stroke="currentColor" strokeWidth={1.5} />
                    <circle className="node-badge" r={11} fill="var(--glass)" stroke="var(--card-border)" strokeWidth={1.5} />
                    <g className="node-icon">
                      {key === "website" && <Globe size={12} x={-6} y={-6} strokeWidth={1.8} />}
                      {key === "call" && <Phone size={11} x={-5.5} y={-5.5} strokeWidth={1.8} />}
                      {key === "booked" && <CalendarCheck2 size={12} x={-6} y={-6} strokeWidth={1.8} />}
                      {key === "maps" && <MapPin size={12} x={-6} y={-6.5} strokeWidth={1.8} className="node-pin" />}
                    </g>
                    {/* micro-response details */}
                    {key === "website" && (
                      <rect className="node-detail" x={4} y={-10} width={6} height={4} rx={1} fill="currentColor" />
                    )}
                    {key === "call" && (
                      <circle className="node-detail" cx={8} cy={-8} r={2} fill="currentColor" />
                    )}
                    {key === "booked" && (
                      <g className="node-detail" transform="translate(7 -8)">
                        <circle r={4.5} fill="var(--color-accent)" />
                        <Check size={6} x={-3} y={-3} strokeWidth={3} color="#fff" />
                      </g>
                    )}
                    {key === "maps" && (
                      <path className="node-detail" d="M6.5 -7 l2.5 -4 2.5 4 Z" fill="currentColor" />
                    )}
                    <text
                      x={0}
                      y={labelSide(pt)}
                      textAnchor="middle"
                      className="route-text hidden sm:inline"
                      fill="var(--ink-2)"
                    >
                      {NODE_LABELS[key]}
                    </text>
                  </g>
                );
              })}

              {/* Van check-drop at the Booked Job node */}
              <g
                className={`van-check ${checkOn ? "van-check-on" : ""}`}
                transform={`translate(${points.nodes.booked.x} ${points.nodes.booked.y - 22})`}
              >
                <circle r={6.5} fill="var(--color-accent)" />
                <Check size={8} x={-4} y={-4} strokeWidth={3} color="#fff" />
              </g>

              {/* Traveling pulse */}
              <g ref={pulseRef} style={{ opacity: 0 }}>
                <circle r={7} fill="var(--color-primary)" opacity={0.22} />
                <circle r={3.2} fill="var(--color-primary)" />
              </g>

              {/* Van while driving (the button's glyph hides meanwhile) */}
              <g
                ref={vanTravelRef}
                style={{ opacity: 0, color: "var(--color-primary)" }}
              >
                <VanShape />
              </g>
            </>
          )}
        </svg>
      )}

      {/* ServiceVanReward — the one toy. Real button, 44×44, keyboardable. */}
      {points && (
        <button
          type="button"
          onClick={activateVan}
          disabled={driving}
          aria-label="Send the sample service van to a booked job"
          title="Send the sample service van to a booked job"
          className="van-btn"
          style={{ left: points.van.x - 22, top: points.van.y - 22 }}
        >
          <svg
            className={`van-glyph ${driving ? "opacity-0" : ""}`}
            width={28}
            height={20}
            viewBox="-14 -10 28 20"
            aria-hidden="true"
            focusable="false"
          >
            <VanShape />
          </svg>
        </button>
      )}
    </div>
  );
}
