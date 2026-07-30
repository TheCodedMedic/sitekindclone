// Phase 3 — Layout DNA shell.
// Wraps each rendered section with structural decoration derived from
// spec.layoutDNA: rhythm (extra spacing), dividers (hairline / numbered /
// chapter), vertical rails (rotated section labels), edge treatment
// (contained vs bleeding), header alignment (via CSS var + text-align).
// Grid axis is exposed as a CSS custom property for sections that want to
// consume it; existing sections are unaffected unless they opt in.
import type { CSSProperties, ReactNode } from "react";
import type { DesignSpec, SectionId } from "./design";
import { accentTextShade } from "./palette-engine";

export type LayoutDNA = {
  grid: "symmetric" | "asymmetric-left" | "asymmetric-right" | "off-center";
  rhythm: "even" | "syncopated" | "staggered";
  edgeTreatment: "contained" | "bleed-left" | "bleed-right" | "full-bleed";
  verticalTypography: "none" | "left-rail" | "right-rail";
  sectionDividers: "none" | "hairline" | "numbered" | "chapter";
  headerAlign: "left" | "center" | "right" | "justified";
};

/** SOL round-5 grid consistency: ONE content-width token. Every width-
 * constrained frame (centered column, magazine offset) clamps to this same
 * measure so the content width never jumps between sections. Heroes, the
 * review proof card, and stacked sections share the px-6 gutter instead. */
export const CONTENT_MAX = 620;

/** Decorative accent rules (the "thin orange divider line") render ONLY when
 * the layout's dividers axis is "chapter" — numbered/hairline layouts lose
 * the orange stub (SOL round-5: it read as unearned decoration). */
export function accentRuleAllowed(spec: DesignSpec): boolean {
  return spec.layoutDNA.sectionDividers === "chapter";
}

export const DEFAULT_LAYOUT_DNA: LayoutDNA = {
  grid: "symmetric",
  rhythm: "even",
  edgeTreatment: "contained",
  verticalTypography: "none",
  sectionDividers: "hairline",
  headerAlign: "left",
};

// Grid split ratios used by hero/services if they opt in.
export function gridColumns(dna: LayoutDNA): string {
  switch (dna.grid) {
    case "asymmetric-left":  return "62fr 38fr";
    case "asymmetric-right": return "38fr 62fr";
    case "off-center":       return "30fr 70fr";
    default:                 return "1fr 1fr";
  }
}

// DNA v2 — rhythm moves real distances: syncopated swings padding 1.5x/0.6x,
// staggered pushes sections ±22px sideways.
// SOL critique: the FIRST section after the hero never gets an amplified
// swing — the hero→content gap is capped (no dead zone after the hero).
function rhythmOffset(dna: LayoutDNA, index: number): { padScale: number; xOffset: number } {
  if (dna.rhythm === "syncopated") {
    return { padScale: index === 1 ? 1 : index % 2 === 0 ? 1.5 : 0.6, xOffset: 0 };
  }
  if (dna.rhythm === "staggered") {
    const cycle = index % 3;
    const xOffset = cycle === 0 ? 0 : cycle === 1 ? 22 : -22;
    return { padScale: 1, xOffset };
  }
  return { padScale: 1, xOffset: 0 };
}

// DNA v2 — edges actually bleed: negative margins pull the section's content
// past its own px-6 gutter toward the preview edge (the root's
// overflow-hidden rounded frame clips cleanly), while the opposite side gets
// extra inset so the asymmetry reads.
function edgeInset(dna: LayoutDNA): { pl: number; pr: number; ml: number; mr: number } {
  switch (dna.edgeTreatment) {
    case "bleed-left":  return { pl: 0,  pr: 24, ml: -14, mr: 0 };
    case "bleed-right": return { pl: 24, pr: 0,  ml: 0,   mr: -14 };
    case "full-bleed":  return { pl: 0,  pr: 0,  ml: -10, mr: -10 };
    default:            return { pl: 0,  pr: 0,  ml: 0,   mr: 0 };
  }
}

/**
 * DNA v2 — per-section frame derived from spec.gridFamily: width bands
 * (narrow / wide / full), alternating background bands, card insets, offsets
 * and adjacent-section overlap. This is where the composition family becomes
 * visible without touching each section renderer.
 */
function gridFrame(
  spec: DesignSpec,
  index: number,
): CSSProperties {
  const { pack } = spec;
  switch (spec.gridFamily) {
    case "centered-column":
      // One narrow centered measure — the whole page reads as a column.
      return { maxWidth: CONTENT_MAX, marginLeft: "auto", marginRight: "auto", width: "100%" };
    case "banded-full-bleed":
      // Alternating full-width color bands.
      return index % 2 === 1 ? { background: pack.surface } : {};
    case "bento":
      // Sections float as cards; adjacent cards slightly overlap.
      return index > 1 ? { marginTop: -8, position: "relative", zIndex: index } : {};
    case "magazine-offset": {
      // Alternating asymmetric column: narrow measures pushed left/right,
      // with a slight overlap between adjacent sections.
      const side = index % 2 === 0;
      return {
        maxWidth: CONTENT_MAX,
        width: "100%",
        marginLeft: side ? 0 : "auto",
        marginRight: side ? "auto" : 0,
        ...(index > 1 ? { marginTop: -6, position: "relative", zIndex: index } : {}),
      };
    }
    default:
      return {};
  }
}

// Divider wayfinding speaks VISITOR language (critique round 3): the label a
// visitor scans for ("The Menu", "Find Us"), never an internal section id
// ("MENU BOARD") or editorial jargon ("CHAPTER 01"). Spec-driven labels win;
// the rest match the label each section renders for itself.
export function sectionVisitorLabel(id: SectionId, spec: DesignSpec): string {
  switch (id) {
    case "services":
    case "menu-board":
      return spec.labels.services;
    case "reviews":
      return spec.labels.reviews;
    case "social":
      return spec.labels.social;
    case "hero": return "Welcome";
    case "cta": return "Get in Touch";
    case "gallery": return "Gallery";
    case "tagline": return "Our Promise";
    case "footer": return "Visit Us";
    case "process-timeline": return "How It Works";
    case "before-after": return "Before & After";
    case "owner-letter": return "A Note From Us";
    case "neighborhood-map": return "Find Us";
    case "press-strip": return "Recognition";
    case "pricing-teaser": return "Pricing";
    case "faq-conversation": return "Common Questions";
    case "hours-marquee": return "Hours";
    case "credential-wall": return "At a Glance";
    default: return (id as string).replace(/-/g, " ");
  }
}

/** True when the layout's dividers render a visible visitor label (numbered /
 * chapter) — hairline and none draw no text. Sections whose own heading would
 * repeat that label suppress it (SOL critique: "THE MENU" twice). */
export function dividerShowsLabels(spec: DesignSpec): boolean {
  const d = spec.layoutDNA.sectionDividers;
  return d === "numbered" || d === "chapter";
}

export function SectionDivider({
  dna, index, id, spec,
}: { dna: LayoutDNA; index: number; id: SectionId; spec: DesignSpec }) {
  if (dna.sectionDividers === "none" || index === 0) return null;
  const { pack } = spec;
  const label = sectionVisitorLabel(id, spec);
  // Hero spacing rhythm (SOL critique): the divider right under the hero is
  // tight so hero→first-section never opens a dead zone (gap <= padY-ish).
  // R7 (design-sweep round 6): divider padding scales WITH padY — the fixed
  // pt-6/pt-8 blocks blew the 1.6×padY dead-zone cap at every density.
  // D10 (round-3 audit): at dense rhythm (padY<=16) the numbered divider's
  // padding + the next frame's padding measured 28px vs the 25.6 dead-zone
  // cap ('02'→reviews) — trim ~4px (2 top / 2 bottom) at padY<=16 only, so
  // airy layouts keep their air.
  const dense = spec.padY <= 16;
  const topPad = index === 1
    ? 8
    : Math.max(0, Math.min(Math.round(spec.padY * 0.35), 16) - (dense ? 2 : 0));
  const botPad = dense ? 2 : 4;
  if (dna.sectionDividers === "hairline") {
    return <div data-divider="hairline" className="mx-6 h-px" style={{ background: pack.border }} />;
  }
  if (dna.sectionDividers === "numbered") {
    return (
      <div
        data-divider="numbered"
        className="flex items-center gap-3 px-6 text-[10px] uppercase tracking-[0.14em]"
        style={{ color: pack.accent, paddingTop: topPad, paddingBottom: botPad }}
      >
        <span
          style={{
            fontFamily: spec.fonts.display,
            fontSize: 26,
            lineHeight: 1,
            // Display-scale accent numerals carry the 4.5 body bar (design-
            // sweep round 6) — and they render at full opacity so the shade
            // actually measured is the shade validated.
            color: accentTextShade(pack.accent, pack.bg),
          }}
        >
          {String(index).padStart(2, "0")}
        </span>
        <span className="h-px flex-1" style={{ background: pack.border }} />
        <span style={{ color: pack.muted }}>{label}</span>
      </div>
    );
  }
  // "chapter" — no editorial jargon: just the visitor label on a short
  // accent rule (readable size, tracking <=0.2em, breathing room below).
  return (
    <div
      data-divider="chapter"
      className="flex items-center gap-3 px-6 text-[10px] font-semibold uppercase tracking-[0.14em]"
      style={{ color: pack.muted, paddingTop: topPad, paddingBottom: botPad }}
    >
      <span className="h-px w-8" style={{ background: pack.accent }} />
      <span>{label}</span>
    </div>
  );
}

/** Vertical rotated rail — RETIRED (SOL screenshot critique). The rotated
 * label was distracting and unreadable in every render; the decoration-budget
 * verdict is final: it never earned its place. The export survives for
 * compat (older imports / stored specs), but it renders nothing. */
export function SectionRail(_props: { dna: LayoutDNA; id: SectionId; spec: DesignSpec }) {
  return null;
}

/** Wraps a single rendered section with the DNA-derived shell. */
export function SectionShell({
  dna, index, id, spec, children,
}: {
  dna: LayoutDNA;
  index: number;
  id: SectionId;
  spec: DesignSpec;
  children: ReactNode;
}) {
  const { padScale, xOffset } = rhythmOffset(dna, index);
  const { pl, pr, ml, mr } = edgeInset(dna);
  const frame = gridFrame(spec, index);
  const shellStyle: CSSProperties = {
    // rhythm pushes each section sideways for a "staggered" cadence;
    // padScale multiplies inner vertical breathing room. Edge margins bleed.
    marginLeft: xOffset + ml,
    marginRight: -xOffset + mr,
    paddingLeft: pl,
    paddingRight: pr,
    paddingTop: padScale === 1 ? 0 : Math.round(spec.padY * (padScale - 1) * 0.5),
    paddingBottom: padScale === 1 ? 0 : Math.round(spec.padY * (padScale - 1) * 0.5),
    // Expose DNA choices as CSS vars — sections can opt in without an API change.
    // @ts-expect-error CSS custom properties
    "--dna-header-align": dna.headerAlign === "justified" ? "left" : dna.headerAlign,
    "--dna-grid": gridColumns(dna),
    // For "justified" the shell also enforces text-justify on any inheriting
    // paragraph. Only text-align: <keyword> is inherited; align-first attrs
    // live at the paragraph level so this stays a soft hint.
    textAlign: dna.headerAlign === "justified" ? "justify" : (dna.headerAlign as CSSProperties["textAlign"]),
    // DNA v2 — grid-family frame (width bands / color bands / card overlap)
    // merges last so composition wins over the generic offsets.
    ...frame,
  };
  return (
    <>
      <SectionDivider dna={dna} index={index} id={id} spec={spec} />
      <div className="relative" style={shellStyle} data-section={id} data-section-index={index}>
        <SectionRail dna={dna} id={id} spec={spec} />
        {children}
      </div>
    </>
  );
}
