/**
 * CapabilityDemo — the ONE reusable Level-B "compact product window" shell
 * for the four capability cards (Stage 3, homepage FeatureGrid) and, later,
 * the /features pages (Stage 4).
 *
 * Four vignettes, all clearly non-live demo material (the host renders a
 * DEMO tag on the frame):
 *   website — three page blocks assemble
 *   voice   — one small waveform animates while active
 *   seo     — draft → judged → published pipeline lights up in sequence
 *   maps    — a pin slides into a top-3 list
 *
 * Purely decorative (aria-hidden). All transitions are CSS
 * (transform/opacity only, motion-slow band); `active` toggles the
 * `.cap-demo-active` class. Under html.motion-off every element rests at
 * its static END state (assembled page, ranked list…) — see styles.css.
 * The waveform additionally pauses when the card leaves the viewport.
 */
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  MapPin,
  PenLine,
  PhoneCall,
  Scale,
  TrendingUp,
} from "lucide-react";
import { useSectionVisibility } from "@/lib/motion/useSectionVisibility";

export type CapabilityDemoKind = "website" | "voice" | "seo" | "maps";

/** Feature slug → demo vignette (homepage cards + /features pages). */
export const CAPABILITY_DEMO_KIND_BY_SLUG: Record<string, CapabilityDemoKind> =
  {
    "ai-websites": "website",
    "voice-agent": "voice",
    "automated-seo": "seo",
    "google-maps": "maps",
  };

export function CapabilityDemo({
  kind,
  active,
  className = "",
}: {
  kind: CapabilityDemoKind;
  active: boolean;
  className?: string;
}) {
  const { ref, isVisible } = useSectionVisibility<HTMLDivElement>({
    threshold: 0.2,
  });
  // First client frame: observers haven't fired yet — don't animate.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const on = active && (!mounted || isVisible);

  return (
    <div
      ref={ref}
      className={`cap-demo-stage absolute inset-0 ${on ? "cap-demo-active" : ""} ${className}`}
      aria-hidden="true"
    >
      {kind === "website" ? (
        <WebsiteDemo />
      ) : kind === "voice" ? (
        <VoiceDemo />
      ) : kind === "seo" ? (
        <SeoDemo />
      ) : (
        <MapsDemo />
      )}
    </div>
  );
}

export default CapabilityDemo;

/* ── website: three page blocks assemble ─────────────────────────── */
function WebsiteDemo() {
  return (
    <div className="absolute inset-0 flex flex-col gap-1.5 p-3.5">
      <span className="cap-block h-2.5 w-1/2 rounded bg-[rgb(194_65_12_/0.35)]" />
      <span
        className="cap-block h-8 w-full rounded-md bg-[rgb(15_118_110_/0.16)]"
        style={{ transitionDelay: "120ms" }}
      />
      <span
        className="cap-block h-2 w-5/6 rounded bg-[var(--card-border)]"
        style={{ transitionDelay: "240ms" }}
      />
      <span
        className="cap-block h-2 w-2/3 rounded bg-[var(--card-border)]"
        style={{ transitionDelay: "320ms" }}
      />
    </div>
  );
}

/* ── voice: incoming call + one small waveform ───────────────────── */
function VoiceDemo() {
  return (
    <div className="absolute inset-0 flex items-center justify-between gap-3 px-3.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgb(15_118_110_/0.14)] text-[var(--color-accent)]">
          <PhoneCall size={14} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[11px] font-semibold text-ink">
            Incoming call
          </div>
          <div className="truncate text-[10px] text-ink-2">
            Ava · answered in 2 rings
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-end gap-[3px]">
        {[0.5, 0.9, 0.6, 1, 0.7, 0.85, 0.5].map((h, i) => (
          <span
            key={i}
            className="cap-wave-bar w-[3px] rounded-full bg-[var(--color-accent)]"
            style={{ height: `${h * 22}px`, animationDelay: `${i * 0.09}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── seo: draft → judged → published pipeline ────────────────────── */
function SeoDemo() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-1.5 px-3">
      <span className="cap-chip">
        <PenLine size={10} /> Draft
      </span>
      <span className="cap-arrow">
        <ArrowRight size={11} />
      </span>
      <span className="cap-chip" style={{ transitionDelay: "260ms" }}>
        <Scale size={10} /> Judged
      </span>
      <span className="cap-arrow" style={{ transitionDelay: "420ms" }}>
        <ArrowRight size={11} />
      </span>
      <span className="cap-chip cap-chip-final" style={{ transitionDelay: "520ms" }}>
        <Check size={10} strokeWidth={3} /> Published
      </span>
    </div>
  );
}

/* ── maps: your pin slides into the top-3 list ───────────────────── */
function MapsDemo() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-1 px-3.5">
      <MapsRow rank="#1" name="Peak Air Co." />
      <MapsRow rank="#2" name="Comfort Pros" />
      <div className="cap-pin-row flex items-center gap-1.5 rounded-md bg-[rgb(15_118_110_/0.12)] px-2 py-1">
        <span className="font-code text-[9px] text-[var(--color-accent)]">
          #3
        </span>
        <MapPin size={11} className="shrink-0 text-[var(--color-primary)]" />
        <span className="truncate text-[10px] font-semibold text-ink">
          Joe's HVAC &amp; Air
        </span>
        <TrendingUp
          size={10}
          className="ml-auto shrink-0 text-[var(--color-accent)]"
        />
      </div>
    </div>
  );
}

function MapsRow({ rank, name }: { rank: string; name: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md px-2 py-1 opacity-60">
      <span className="font-code text-[9px] text-ink-2">{rank}</span>
      <MapPin size={11} className="shrink-0 text-ink-2" />
      <span className="truncate text-[10px] text-ink-2">{name}</span>
    </div>
  );
}
