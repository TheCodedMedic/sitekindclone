// motifs.tsx — the "signature move" layer. Each motif is a container-level
// decoration or an injected band that runs orthogonally to the section stack,
// so we can add or remove motifs without touching individual section
// components. This is the single biggest lever for making two same-vertical
// previews feel structurally different.
//
// The motif is chosen by the design-schema-agent (see supabase/functions/
// demo-research/design-schema-agent.ts) or falls back to a vertical heuristic.

import type { CSSProperties, ReactNode } from "react";
import type { BusinessProfile } from "@/lib/demoApi";
import type { DesignSpec } from "./design";
import { displayText } from "./sections";

export type MotifId =
  | "none"
  | "ticker-marquee"
  | "editorial-quote-slab"
  | "sticky-side-label"
  | "botanical-margin"
  | "halftone-photo-grid"
  | "full-bleed-color-band"
  | "neon-underline"
  | "diagonal-splice";

const MOTIF_LABELS: Record<MotifId, string> = {
  "none": "None",
  "ticker-marquee": "Ticker Marquee",
  "editorial-quote-slab": "Editorial Quote Slab",
  "sticky-side-label": "Sticky Side Label",
  "botanical-margin": "Botanical Margin",
  "halftone-photo-grid": "Halftone Photo Grid",
  "full-bleed-color-band": "Full-Bleed Color Band",
  "neon-underline": "Neon Underline",
  "diagonal-splice": "Diagonal Splice",
};

export function motifLabel(id: MotifId | undefined): string {
  return id ? MOTIF_LABELS[id] ?? "None" : "None";
}

/**
 * Emits a scoped <style> block that targets `[data-motif="<id>"]` on the
 * preview wrapper. Keeps Tailwind v4 class literals static and gives motifs
 * cascading power without touching every section component.
 */
export function MotifStyles({ motif, spec }: { motif: MotifId; spec: DesignSpec }) {
  const accent = spec.pack.accent;
  const accentInk = spec.pack.accentInk;
  const surface = spec.pack.surface;
  const border = spec.pack.border;

  const css = (() => {
    switch (motif) {
      case "neon-underline":
        return `
          [data-motif="neon-underline"] h1, [data-motif="neon-underline"] h2, [data-motif="neon-underline"] h3 {
            display: inline-block;
            padding-bottom: 4px;
            background-image: linear-gradient(${accent}, ${accent});
            background-repeat: no-repeat;
            background-position: 0 100%;
            background-size: 100% 3px;
          }
        `;
      case "halftone-photo-grid":
        return `
          [data-motif="halftone-photo-grid"] img {
            filter: grayscale(1) contrast(1.15) brightness(0.98);
            transition: filter .3s ease;
          }
          [data-motif="halftone-photo-grid"] img:hover {
            filter: none;
          }
        `;
      case "diagonal-splice":
        // Angle every OTHER non-hero, non-footer section — creates a
        // rhythmic zig-zag edge.
        return `
          [data-motif="diagonal-splice"] > div:nth-child(3n+2) {
            clip-path: polygon(0 0, 100% 2%, 100% 98%, 0 100%);
          }
        `;
      case "sticky-side-label":
        // RETIRED (SOL screenshot critique): the rotated vertical business
        // name was distracting and unreadable — the decoration budget verdict
        // is final. The motif id stays valid (schemas may still emit it) but
        // it renders nothing.
        return "";
      case "botanical-margin":
        return `
          [data-motif="botanical-margin"]::before, [data-motif="botanical-margin"]::after {
            content: "";
            position: absolute;
            top: 60px;
            width: 60px;
            height: calc(100% - 120px);
            pointer-events: none;
            z-index: 2;
            opacity: 0.35;
            background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='400' viewBox='0 0 60 400'><path d='M30 0 Q10 60 30 120 T30 240 T30 400' stroke='${encodeURIComponent(accent)}' stroke-width='1.2' fill='none'/><ellipse cx='18' cy='60' rx='10' ry='4' fill='${encodeURIComponent(accent)}' transform='rotate(-30 18 60)'/><ellipse cx='42' cy='150' rx='10' ry='4' fill='${encodeURIComponent(accent)}' transform='rotate(30 42 150)'/><ellipse cx='18' cy='240' rx='10' ry='4' fill='${encodeURIComponent(accent)}' transform='rotate(-30 18 240)'/><ellipse cx='42' cy='330' rx='10' ry='4' fill='${encodeURIComponent(accent)}' transform='rotate(30 42 330)'/></svg>");
            background-repeat: repeat-y;
          }
          [data-motif="botanical-margin"]::before { left: 0; }
          [data-motif="botanical-margin"]::after { right: 0; transform: scaleX(-1); }
        `;
      default:
        return "";
    }
  })();

  if (!css.trim()) return null;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

// ── Injected bands (rendered as an extra section right after the hero) ──

function TickerMarqueeBand({ spec, businessName }: { spec: DesignSpec; businessName: string }) {
  const { pack } = spec;
  const parts = [
    "OPEN NOW",
    businessName.toUpperCase(),
    "LOCALLY OWNED",
    "BOOK ONLINE",
    "★ ★ ★ ★ ★",
    businessName.toUpperCase(),
  ];
  const line = parts.join("  ·  ") + "  ·  ";
  return (
    <div
      style={{
        background: pack.accent,
        color: pack.accentInk,
        borderTop: `1px solid ${pack.border}`,
        borderBottom: `1px solid ${pack.border}`,
        overflow: "hidden",
        padding: "10px 0",
        fontFamily: spec.fonts.display,
        letterSpacing: "0.12em",
        fontSize: 14,
        fontWeight: 700,
        textTransform: "uppercase",
      }}
    >
      <div
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          animation: "sk-marquee 22s linear infinite",
          paddingLeft: "100%",
        }}
      >
        {line.repeat(3)}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes sk-marquee { from { transform: translateX(0); } to { transform: translateX(-100%); } }` }} />
    </div>
  );
}

function EditorialQuoteSlab({ spec, profile }: { spec: DesignSpec; profile: BusinessProfile }) {
  const raw = profile.reviews?.[0]?.quote?.slice(0, 220);
  const author = profile.reviews?.[0]?.author;
  if (!raw) return null;
  // One quote treatment only: typographic quotes around the text, no
  // decorative glyph (the two together read as clutter), no bold+italic
  // stacking, and a measure narrow enough for centered text to scan.
  const quote = raw.replace(/^["“”']+|["“”']+$/g, "");
  const { pack } = spec;
  return (
    <div
      style={{
        background: pack.surface,
        borderTop: `1px solid ${pack.border}`,
        borderBottom: `1px solid ${pack.border}`,
        padding: "40px 32px 36px",
      }}
    >
      <p
        style={{
          fontFamily: spec.fonts.display,
          fontStyle: "italic",
          fontSize: 21,
          fontWeight: 400,
          lineHeight: 1.45,
          color: pack.ink,
          maxWidth: 440,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        “{displayText(quote)}”
      </p>
      {author && (
        <p
          style={{
            marginTop: 10,
            textAlign: "center",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: pack.muted,
          }}
        >
          — {author}
        </p>
      )}
    </div>
  );
}

/** Share of `a`'s tokens that also appear in `b` (0..1). Used to detect a
 * tagline that just restates the hero headline. */
function tokenOverlap(a: string, b: string): number {
  const tok = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").split(/\s+/).filter(Boolean);
  const at = tok(a);
  if (!at.length) return 0;
  const bt = new Set(tok(b));
  return at.filter((t) => bt.has(t)).length / at.length;
}

// Critique round 3: the band is a SUPPORTING beat, never a second competing
// headline inches below the hero — quiet type (<=20px, normal weight, open
// leading, sentence case), modest padding, and content that ADDS information:
// the tagline when it says something the headline didn't, else the service
// area line, else no band at all.
function FullBleedColorBand({ spec, profile }: { spec: DesignSpec; profile: BusinessProfile }) {
  const { pack } = spec;
  const tagline = profile.tagline?.trim() ?? "";
  const headline = profile.heroHeadline ?? "";
  const line = tagline && tokenOverlap(tagline, headline) <= 0.7
    ? tagline
    : (profile.serviceAreaLine?.trim() || null);
  if (!line) return null;
  return (
    <div
      style={{
        background: pack.accent,
        color: pack.accentInk,
        padding: "30px 32px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: spec.fonts.display,
          fontSize: 19,
          lineHeight: 1.4,
          fontWeight: 400,
          maxWidth: 560,
          margin: "0 auto",
          letterSpacing: "0.01em",
        }}
      >
        {displayText(line)}
      </p>
    </div>
  );
}

/**
 * A motif-band renders right after the hero (before other sections) when the
 * motif calls for one. Returns null when the motif is purely decorative
 * (styles-only) — those cases render through <MotifStyles/>.
 */
export function MotifBand({ motif, spec, profile }: { motif: MotifId; spec: DesignSpec; profile: BusinessProfile }) {
  switch (motif) {
    case "ticker-marquee":
      return <TickerMarqueeBand spec={spec} businessName={profile.businessName} />;
    case "editorial-quote-slab":
      return <EditorialQuoteSlab spec={spec} profile={profile} />;
    case "full-bleed-color-band":
      return <FullBleedColorBand spec={spec} profile={profile} />;
    default:
      return null;
  }
}

/** Root element style overrides driven by the motif (e.g. side padding for
 * margin art). sticky-side-label no longer reserves a gutter — its vertical
 * business-name rail is retired (SOL screenshot critique). */
export function motifRootStyle(motif: MotifId): CSSProperties {
  if (motif === "botanical-margin") return { paddingLeft: 68, paddingRight: 68 };
  return {};
}

/** Sugar wrapper — data attributes so MotifStyles CSS can select. */
export function withMotif({
  motif,
  label,
  children,
}: {
  motif: MotifId;
  label?: string;
  children: ReactNode;
}) {
  return (
    <div data-motif={motif} data-motif-label={label ?? "signature"}>
      {children}
    </div>
  );
}
