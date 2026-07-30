// design.ts — the composition brain for /demo previews.
//
// Pure + dependency-free (no React, no Deno APIs) so bun can unit-test it
// directly (scripts/eval-design-diversity.mjs). Given a BusinessProfile it
// deterministically composes a DesignSpec: family, art-direction pack
// (palette + font pair + ornament bundled together, never independently
// random), hero variant, section order, service/review layouts, density.
//
// Deterministic: the seed is a hash of (businessName + serviceAreaLine +
// address), so the same business always renders the identical design while
// two different businesses — even in the same vertical — diverge.
//
// Evidence-led, seeded tiebreaks: the designBrief (personality /
// pricePosition / conversionGoal synthesized server-side from real research)
// and the evidence booleans drive every axis first; the seeded RNG only
// breaks ties inside the allowed option set.

import type { BusinessProfile, DesignBrief } from "@/lib/demoApi";
import { deriveEvidence, type Evidence } from "./evidence";
import { DEFAULT_LAYOUT_DNA, type LayoutDNA } from "./layout";
// Stage 2 — generative engines (byte-identical mirrors of the canonical
// copies in supabase/functions/demo-research/, sync-enforced by
// scripts/test-design-engines.mjs).
import { generatePalette, hueOfHex, PALETTE_TOPOLOGIES, type ColorFingerprint } from "./palette-engine";
import { selectFontPairing, cssStack, fontLoadSpecs, type FontLoadSpec } from "./font-library";

// ── Deterministic seed → RNG ─────────────────────────────────────────

/** xmur3 string hash — produces a 32-bit seed from an arbitrary string. */
export function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

/** mulberry32 PRNG — small, fast, deterministic. */
export function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── WCAG contrast (used by packs' pre-validation + the eval) ─────────

function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// ── Spec types ───────────────────────────────────────────────────────

export type PackTone = "premium" | "budget" | "neutral";
export type Ornament = "grain" | "halftone" | "grid" | "none";
export type DisplayTreatment = "normal" | "italic" | "uppercase";
export type HeroVariant =
  | "overlay" | "split" | "poster" | "collage"
  // DNA v2 — anatomy-distinct, photo-independent hero variants.
  | "editorial-quote" | "minimal-statement" | "data-led";
export type HeroFlourish = "none" | "halftone" | "diagonal-badge" | "sweep" | "blob";
export type ServiceLayout = "dotted" | "cards" | "numbered" | "chips" | "split";
export type ReviewLayout = "cards" | "spotlight" | "strip";
export type SocialVariant = "wall" | "strip";
export type SectionId =
  | "hero" | "cta" | "services" | "gallery" | "reviews" | "social" | "tagline" | "footer"
  // Phase 2 — signature sections composable by the schema agent.
  | "menu-board" | "process-timeline" | "before-after" | "owner-letter"
  | "neighborhood-map" | "press-strip" | "pricing-teaser"
  | "faq-conversation" | "hours-marquee" | "credential-wall";
export type Density = "airy" | "regular" | "dense";

// ── DNA v2 axes ──────────────────────────────────────────────────────

export type EyebrowTreatment = "uppercase-tracked" | "numbered" | "rule-line" | "side-tab" | "none";
export type HeroSizeClass = "compact" | "standard" | "oversized" | "poster";
export type HeadingCase = "mixed" | "sentence" | "uppercase";
export type GridFamily =
  | "centered-column" | "split-6-6" | "split-5-7" | "side-rail"
  | "bento" | "banded-full-bleed" | "magazine-offset";
export type NavFamily = "slim" | "inline" | "center-stack" | "cta-bar";
export type FooterFamily = "slim-bar" | "stacked-center" | "mega-grid" | "colophon";

/**
 * Resolved typographic fingerprint. All numeric values are final px values so
 * renderers apply them via inline style — the single frozen client type scale
 * (hero 30-46, body 11-13, 10px eyebrow everywhere) is dead.
 */
export type TypeSystem = {
  scaleRatio: number;
  heroSizeClass: HeroSizeClass;
  /** Hero display size in px (poster class reaches ~64-76). */
  heroSize: number;
  /** Section-level headline (spotlight quotes, tagline, split-frame headings). */
  sectionTitleSize: number;
  /** Item-level titles (service names, review scores). */
  itemTitleSize: number;
  /** Base body copy size. */
  bodySize: number;
  eyebrowSize: number;
  eyebrowTreatment: EyebrowTreatment;
  headingCase: HeadingCase;
  displayWeight: number;
  /** letter-spacing for display type, em string. */
  displayTracking: string;
  /** Max width (px) for running copy — the body measure. */
  bodyMeasure: number;
};

export type Pack = {
  id: string;
  tone: PackTone;
  isDark: boolean;
  bg: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  border: string;
  fonts: { display: string; body: string; displayTreatment: DisplayTreatment };
  ornament: Ornament;
};

export type FamilyId =
  | "tableseven"
  | "estate"
  | "fieldnotes"
  | "blueprint"
  | "studiobloom"
  | "editorial"
  | "movement"
  | "pulse"
  | "shine"
  | "garage"
  | "signal";

export type FamilyDef = {
  id: FamilyId;
  /** Price-position affinity used in evidence-scored family selection. */
  tone: PackTone;
  /** Brief personality adjectives that pull toward this family. */
  personalityHints: string[];
  packs: Pack[];
  heroVariants: HeroVariant[];
  serviceLayouts: ServiceLayout[];
  flourish: HeroFlourish;
  radius: number;
  wantsTagline: boolean;
};

export type DesignSpec = {
  family: FamilyId;
  packId: string;
  pack: Pack;
  fonts: Pack["fonts"];
  hero: { variant: HeroVariant; alignment: "left" | "center"; flourish: HeroFlourish };
  sectionOrder: SectionId[];
  serviceLayout: ServiceLayout;
  reviewLayout: ReviewLayout;
  socialVariant: SocialVariant;
  density: Density;
  /** Vertical section padding in px, derived from density. */
  padY: number;
  /** Grid/flex gap in px, derived from density (DNA v2 — density now moves more than padY). */
  gap: number;
  /** Card inner padding in px, derived from density. */
  cardPad: number;
  radius: number;
  ornament: Ornament;
  labels: { services: string; reviews: string; social: string; badge: string | null };
  showTagline: boolean;
  /** Phase 3 — structural grid/rhythm DNA applied by the SectionShell wrapper. */
  layoutDNA: LayoutDNA;
  /** DNA v2 — typographic fingerprint (resolved px values, inline-style ready). */
  type: TypeSystem;
  /** DNA v2 — page composition family (widths / columns / overlap per section). */
  gridFamily: GridFamily;
  /** DNA v2 — in-preview fake site chrome families. */
  chrome: { nav: NavFamily; footer: FooterFamily };
  /** Stage 2 — Google-Fonts payload to lazy-load for this spec (generative pairings). */
  fontLoad?: FontLoadSpec[];
  /** Stage 2 — palette fingerprint when the generative engine authored the colors. */
  colorFingerprint?: ColorFingerprint;
};

// ── Font stacks (families MUST exist in loadPreviewFonts.ts) ─────────

const F = {
  instrument: "'Instrument Serif', 'Cormorant Garamond', Georgia, serif",
  cormorant: "'Cormorant Garamond', 'Instrument Serif', Georgia, serif",
  fraunces: "'Fraunces', 'Instrument Serif', Georgia, serif",
  archivo: "'Archivo Black', 'Impact', sans-serif",
  plex: "'IBM Plex Sans', system-ui, sans-serif",
  bebas: "'Bebas Neue', 'Impact', sans-serif",
  barlow: "'Barlow', system-ui, sans-serif",
  grotesk: "'Space Grotesk', 'Inter', sans-serif",
  dmsans: "'DM Sans', system-ui, sans-serif",
  karla: "'Karla', system-ui, sans-serif",
  inter: "'Inter', system-ui, sans-serif",
} as const;

// ── Art-direction packs ──────────────────────────────────────────────
// Each pack bundles palette + font pair + ornament as ONE coherent choice.
// All packs are pre-validated for WCAG AA body contrast (ink/bg, ink/surface,
// accentInk/accent ≥ 4.5; muted/bg ≥ 3.0) — the eval re-checks every pack.

function pk(
  id: string,
  tone: PackTone,
  isDark: boolean,
  colors: { bg: string; surface: string; ink: string; muted: string; accent: string; accentInk: string; border: string },
  fonts: Pack["fonts"],
  ornament: Ornament,
): Pack {
  return { id, tone, isDark, ...colors, fonts, ornament };
}

const TABLESEVEN_PACKS: Pack[] = [
  pk("paper-ember", "neutral", false,
    { bg: "#f5f0e6", surface: "#ede6d8", ink: "#1a1613", muted: "#655a4e", accent: "#a8321f", accentInk: "#ffffff", border: "rgba(26,22,19,0.14)" },
    { display: F.instrument, body: F.inter, displayTreatment: "normal" }, "grain"),
  pk("charcoal-brass", "premium", true,
    { bg: "#171412", surface: "#211d19", ink: "#f2ece1", muted: "#b0a695", accent: "#d4a24e", accentInk: "#171412", border: "rgba(242,236,225,0.12)" },
    { display: F.cormorant, body: F.karla, displayTreatment: "normal" }, "grain"),
  pk("olive-cream", "budget", false,
    { bg: "#f7f5ee", surface: "#edeadf", ink: "#20241c", muted: "#5b6153", accent: "#4a5d23", accentInk: "#ffffff", border: "rgba(32,36,28,0.14)" },
    { display: F.instrument, body: F.karla, displayTreatment: "normal" }, "none"),
];

const ESTATE_PACKS: Pack[] = [
  pk("linen", "premium", false,
    { bg: "#faf7f2", surface: "#f1ece2", ink: "#2b2620", muted: "#66594c", accent: "#6e2f2f", accentInk: "#ffffff", border: "rgba(43,38,32,0.13)" },
    { display: F.fraunces, body: F.karla, displayTreatment: "normal" }, "grain"),
  pk("sage-estate", "premium", false,
    { bg: "#f4f4ef", surface: "#e9eae2", ink: "#222a24", muted: "#54635a", accent: "#3f5c48", accentInk: "#ffffff", border: "rgba(34,42,36,0.13)" },
    { display: F.fraunces, body: F.dmsans, displayTreatment: "normal" }, "none"),
  pk("dusk-cellar", "neutral", true,
    { bg: "#1d1a1f", surface: "#262229", ink: "#efeae4", muted: "#aca39a", accent: "#c9a86a", accentInk: "#1d1a1f", border: "rgba(239,234,228,0.12)" },
    { display: F.cormorant, body: F.karla, displayTreatment: "normal" }, "grain"),
];

const FIELDNOTES_PACKS: Pack[] = [
  pk("safety", "neutral", true,
    { bg: "#141414", surface: "#1c1c1c", ink: "#f5f5f0", muted: "#a8a79f", accent: "#ff6b1a", accentInk: "#141414", border: "rgba(255,255,255,0.08)" },
    { display: F.archivo, body: F.plex, displayTreatment: "uppercase" }, "halftone"),
  pk("night-shift", "budget", true,
    { bg: "#10161d", surface: "#18202a", ink: "#eef2f6", muted: "#9aa7b5", accent: "#ffd166", accentInk: "#10161d", border: "rgba(238,242,246,0.09)" },
    { display: F.archivo, body: F.barlow, displayTreatment: "uppercase" }, "halftone"),
  pk("iron-red", "neutral", true,
    { bg: "#181212", surface: "#221a1a", ink: "#f4efec", muted: "#b3a49d", accent: "#f05a3a", accentInk: "#1a0f0c", border: "rgba(244,239,236,0.1)" },
    { display: F.archivo, body: F.plex, displayTreatment: "uppercase" }, "none"),
];

const BLUEPRINT_PACKS: Pack[] = [
  pk("drafting", "premium", false,
    { bg: "#f6f8f9", surface: "#ebeff2", ink: "#14232e", muted: "#48606f", accent: "#145e94", accentInk: "#ffffff", border: "rgba(20,35,46,0.12)" },
    { display: F.grotesk, body: F.plex, displayTreatment: "normal" }, "grid"),
  pk("graphite", "neutral", false,
    { bg: "#f4f4f2", surface: "#e9e9e6", ink: "#1c1e1f", muted: "#54595d", accent: "#9a3412", accentInk: "#ffffff", border: "rgba(28,30,31,0.12)" },
    { display: F.grotesk, body: F.barlow, displayTreatment: "normal" }, "grid"),
  pk("site-survey", "budget", false,
    { bg: "#ffffff", surface: "#f3f4f0", ink: "#171a14", muted: "#54584d", accent: "#3f6212", accentInk: "#ffffff", border: "rgba(23,26,20,0.11)" },
    { display: F.barlow, body: F.plex, displayTreatment: "uppercase" }, "grid"),
];

const STUDIOBLOOM_PACKS: Pack[] = [
  pk("blush", "neutral", false,
    { bg: "#fdf4f0", surface: "#f5e6dd", ink: "#2b1e1a", muted: "#755a50", accent: "#a34a2a", accentInk: "#ffffff", border: "rgba(43,30,26,0.12)" },
    { display: F.cormorant, body: F.karla, displayTreatment: "italic" }, "grain"),
  pk("lavender", "premium", false,
    { bg: "#f7f4fa", surface: "#ece6f4", ink: "#292332", muted: "#615a70", accent: "#5e4392", accentInk: "#ffffff", border: "rgba(41,35,50,0.12)" },
    { display: F.fraunces, body: F.dmsans, displayTreatment: "italic" }, "none"),
  pk("porcelain", "premium", false,
    { bg: "#fbfaf8", surface: "#f0eeea", ink: "#26221f", muted: "#635b53", accent: "#2f6f62", accentInk: "#ffffff", border: "rgba(38,34,31,0.11)" },
    { display: F.instrument, body: F.karla, displayTreatment: "normal" }, "grain"),
];

const EDITORIAL_PACKS: Pack[] = [
  pk("gallery-white", "premium", false,
    { bg: "#ffffff", surface: "#f5f5f4", ink: "#191919", muted: "#585855", accent: "#111111", accentInk: "#ffffff", border: "rgba(25,25,25,0.1)" },
    { display: F.fraunces, body: F.inter, displayTreatment: "normal" }, "none"),
  pk("bone", "premium", false,
    { bg: "#f8f7f4", surface: "#efede8", ink: "#1f1d1a", muted: "#5c584f", accent: "#8a3324", accentInk: "#ffffff", border: "rgba(31,29,26,0.11)" },
    { display: F.instrument, body: F.karla, displayTreatment: "normal" }, "grain"),
  pk("ink-wash", "neutral", true,
    { bg: "#15161a", surface: "#1e2026", ink: "#edeef0", muted: "#a2a7af", accent: "#d8c7a7", accentInk: "#15161a", border: "rgba(237,238,240,0.1)" },
    { display: F.fraunces, body: F.inter, displayTreatment: "normal" }, "none"),
];

const MOVEMENT_PACKS: Pack[] = [
  pk("volt", "neutral", true,
    { bg: "#0a0a0a", surface: "#141414", ink: "#f5f5f5", muted: "#a3a3a3", accent: "#c8fa4d", accentInk: "#0a0a0a", border: "rgba(255,255,255,0.08)" },
    { display: F.bebas, body: F.barlow, displayTreatment: "uppercase" }, "none"),
  pk("crimson-court", "budget", true,
    { bg: "#120b0d", surface: "#1c1114", ink: "#f7f2f3", muted: "#b3a3a7", accent: "#ff5c68", accentInk: "#120b0d", border: "rgba(247,242,243,0.09)" },
    { display: F.bebas, body: F.barlow, displayTreatment: "uppercase" }, "none"),
  pk("cobalt-rush", "neutral", true,
    { bg: "#0b1220", surface: "#131c2e", ink: "#eef2fa", muted: "#97a4bd", accent: "#5cadff", accentInk: "#0b1220", border: "rgba(238,242,250,0.09)" },
    { display: F.bebas, body: F.grotesk, displayTreatment: "uppercase" }, "none"),
];

const PULSE_PACKS: Pack[] = [
  pk("daylight", "premium", false,
    { bg: "#fafafa", surface: "#efefef", ink: "#131313", muted: "#545454", accent: "#be123c", accentInk: "#ffffff", border: "rgba(19,19,19,0.1)" },
    { display: F.grotesk, body: F.barlow, displayTreatment: "uppercase" }, "none"),
  pk("citrus-track", "neutral", false,
    { bg: "#fffdf5", surface: "#f5f1e3", ink: "#1c1a12", muted: "#585440", accent: "#92400e", accentInk: "#ffffff", border: "rgba(28,26,18,0.11)" },
    { display: F.bebas, body: F.barlow, displayTreatment: "uppercase" }, "none"),
  pk("mint-condition", "neutral", false,
    { bg: "#f4faf7", surface: "#e6f2ec", ink: "#12211a", muted: "#486054", accent: "#047857", accentInk: "#ffffff", border: "rgba(18,33,26,0.11)" },
    { display: F.grotesk, body: F.dmsans, displayTreatment: "normal" }, "none"),
];

const SHINE_PACKS: Pack[] = [
  pk("midnight-detail", "neutral", true,
    { bg: "#0a1428", surface: "#0f1c36", ink: "#e6ecf5", muted: "#96a7c3", accent: "#3ee0f0", accentInk: "#0a1428", border: "rgba(230,236,245,0.08)" },
    { display: F.grotesk, body: F.dmsans, displayTreatment: "normal" }, "none"),
  pk("royal-gloss", "premium", true,
    { bg: "#101026", surface: "#181838", ink: "#ececf6", muted: "#a4a4c4", accent: "#8ab4ff", accentInk: "#101026", border: "rgba(236,236,246,0.09)" },
    { display: F.grotesk, body: F.inter, displayTreatment: "normal" }, "none"),
  pk("onyx-gold", "premium", true,
    { bg: "#101010", surface: "#1a1a1a", ink: "#f2efe9", muted: "#a8a39a", accent: "#e3b341", accentInk: "#101010", border: "rgba(242,239,233,0.09)" },
    { display: F.grotesk, body: F.dmsans, displayTreatment: "normal" }, "none"),
];

const GARAGE_PACKS: Pack[] = [
  pk("workshop-warm", "budget", false,
    { bg: "#f6f1e9", surface: "#ece4d6", ink: "#241d14", muted: "#63594a", accent: "#92400e", accentInk: "#ffffff", border: "rgba(36,29,20,0.13)" },
    { display: F.archivo, body: F.barlow, displayTreatment: "uppercase" }, "halftone"),
  pk("rust-rag", "neutral", false,
    { bg: "#fbf6ef", surface: "#f1e8dc", ink: "#271c15", muted: "#665748", accent: "#9a3412", accentInk: "#ffffff", border: "rgba(39,28,21,0.13)" },
    { display: F.grotesk, body: F.barlow, displayTreatment: "normal" }, "grain"),
  pk("steel-sun", "neutral", false,
    { bg: "#f2f4f5", surface: "#e6e9eb", ink: "#171c1f", muted: "#4d565c", accent: "#0e7490", accentInk: "#ffffff", border: "rgba(23,28,31,0.12)" },
    { display: F.grotesk, body: F.plex, displayTreatment: "normal" }, "none"),
];

const SIGNAL_PACKS: Pack[] = [
  pk("cloud", "neutral", false,
    { bg: "#ffffff", surface: "#f7f8fa", ink: "#0f172a", muted: "#525c70", accent: "#1d4ed8", accentInk: "#ffffff", border: "rgba(15,23,42,0.08)" },
    { display: F.grotesk, body: F.inter, displayTreatment: "normal" }, "grid"),
  pk("slate-night", "neutral", true,
    { bg: "#0f1420", surface: "#171e2e", ink: "#e8edf5", muted: "#9caabf", accent: "#7dd3fc", accentInk: "#0f1420", border: "rgba(232,237,245,0.09)" },
    { display: F.grotesk, body: F.inter, displayTreatment: "normal" }, "none"),
  pk("warm-neutral", "budget", false,
    { bg: "#faf9f7", surface: "#f0efec", ink: "#21201d", muted: "#5c5952", accent: "#0f766e", accentInk: "#ffffff", border: "rgba(33,32,29,0.1)" },
    { display: F.dmsans, body: F.inter, displayTreatment: "normal" }, "none"),
];

// ── Families ─────────────────────────────────────────────────────────

export const FAMILIES: Record<FamilyId, FamilyDef> = {
  tableseven: {
    id: "tableseven", tone: "neutral",
    personalityHints: ["cozy", "warm", "rustic", "casual", "hearty", "friendly", "lively", "welcoming"],
    packs: TABLESEVEN_PACKS,
    heroVariants: ["overlay", "poster", "collage"],
    serviceLayouts: ["dotted", "numbered", "split"],
    flourish: "none", radius: 14, wantsTagline: true,
  },
  estate: {
    id: "estate", tone: "premium",
    personalityHints: ["elegant", "refined", "scenic", "timeless", "relaxed", "upscale", "graceful", "serene"],
    packs: ESTATE_PACKS,
    heroVariants: ["overlay", "split", "poster", "collage"],
    serviceLayouts: ["numbered", "dotted", "split"],
    flourish: "none", radius: 4, wantsTagline: true,
  },
  fieldnotes: {
    id: "fieldnotes", tone: "neutral",
    personalityHints: ["rugged", "fast", "responsive", "tough", "dependable", "honest", "urgent", "reliable"],
    packs: FIELDNOTES_PACKS,
    heroVariants: ["split", "overlay", "poster"],
    serviceLayouts: ["cards", "numbered", "split"],
    flourish: "halftone", radius: 2, wantsTagline: false,
  },
  blueprint: {
    id: "blueprint", tone: "premium",
    personalityHints: ["precise", "detailed", "clean", "professional", "meticulous", "modern", "thorough", "polished"],
    packs: BLUEPRINT_PACKS,
    heroVariants: ["split", "poster", "collage"],
    serviceLayouts: ["numbered", "cards", "chips"],
    flourish: "none", radius: 8, wantsTagline: true,
  },
  studiobloom: {
    id: "studiobloom", tone: "neutral",
    personalityHints: ["calming", "gentle", "personal", "soothing", "warm", "intimate", "nurturing", "cozy"],
    packs: STUDIOBLOOM_PACKS,
    heroVariants: ["split", "overlay", "poster"],
    serviceLayouts: ["chips", "cards", "dotted"],
    flourish: "blob", radius: 22, wantsTagline: true,
  },
  editorial: {
    id: "editorial", tone: "premium",
    personalityHints: ["minimal", "refined", "modern", "polished", "understated", "elegant", "curated", "sophisticated"],
    packs: EDITORIAL_PACKS,
    heroVariants: ["poster", "split", "collage"],
    serviceLayouts: ["numbered", "dotted", "split"],
    flourish: "none", radius: 6, wantsTagline: true,
  },
  movement: {
    id: "movement", tone: "neutral",
    personalityHints: ["energetic", "intense", "bold", "strong", "gritty", "motivating", "loud", "driven"],
    packs: MOVEMENT_PACKS,
    heroVariants: ["overlay", "poster", "collage"],
    serviceLayouts: ["numbered", "cards", "chips"],
    flourish: "diagonal-badge", radius: 8, wantsTagline: false,
  },
  pulse: {
    id: "pulse", tone: "premium",
    personalityHints: ["fresh", "supportive", "focused", "bright", "balanced", "encouraging", "clean", "positive"],
    packs: PULSE_PACKS,
    heroVariants: ["split", "poster", "overlay"],
    serviceLayouts: ["cards", "numbered", "chips"],
    flourish: "diagonal-badge", radius: 12, wantsTagline: true,
  },
  shine: {
    id: "shine", tone: "neutral",
    personalityHints: ["sleek", "quick", "polished", "modern", "spotless", "efficient", "premium", "detailed"],
    packs: SHINE_PACKS,
    heroVariants: ["overlay", "poster", "split"],
    serviceLayouts: ["cards", "chips", "numbered"],
    flourish: "sweep", radius: 10, wantsTagline: false,
  },
  garage: {
    id: "garage", tone: "budget",
    personalityHints: ["honest", "quick", "thorough", "friendly", "practical", "trusted", "local", "dependable"],
    packs: GARAGE_PACKS,
    heroVariants: ["split", "poster", "collage"],
    serviceLayouts: ["numbered", "cards", "split"],
    flourish: "halftone", radius: 6, wantsTagline: true,
  },
  signal: {
    id: "signal", tone: "neutral",
    personalityHints: ["professional", "clear", "helpful", "responsive", "simple", "trustworthy", "friendly", "practical"],
    packs: SIGNAL_PACKS,
    heroVariants: ["overlay", "poster", "split"],
    serviceLayouts: ["cards", "numbered", "chips"],
    flourish: "none", radius: 10, wantsTagline: false,
  },
};

/** Every vertical maps to ≥2 candidate families (evidence-scored + seeded tiebreak). */
export const VERTICAL_FAMILIES: Record<BusinessProfile["vertical"], FamilyId[]> = {
  "restaurant-hospitality": ["tableseven", "estate"],
  trades: ["fieldnotes", "blueprint"],
  "beauty-wellness": ["studiobloom", "editorial"],
  fitness: ["movement", "pulse"],
  "auto-carwash": ["shine", "garage"],
  generic: ["signal", "editorial"],
};

// ── Brief normalization (old stored leads have no designBrief) ───────

const PRICE_POSITIONS = new Set(["budget", "mid", "premium"]);
const CONVERSION_GOALS = new Set(["call", "book", "order", "visit", "quote"]);

const PREMIUM_RX = /\b(luxur\w*|premium|fine[- ]dining|upscale|estate|winery|vineyard|bespoke|artisan\w*|boutique|curated|tasting)\b/i;
const BUDGET_RX = /\b(cheap|budget|affordab\w*|deals?|value|express|no[- ]frills|discount)\b/i;

export function heuristicBrief(profile: BusinessProfile, evidence: Evidence): DesignBrief {
  const text = `${profile.about ?? ""} ${profile.tagline ?? ""} ${profile.heroSub ?? ""} ${profile.heroHeadline ?? ""}`;
  const pricePosition = PREMIUM_RX.test(text) ? "premium" : BUDGET_RX.test(text) ? "budget" : "mid";
  let conversionGoal: DesignBrief["conversionGoal"];
  switch (profile.vertical) {
    case "restaurant-hospitality":
      conversionGoal = evidence.reservations ? "book" : evidence.onlineOrder ? "order" : "visit";
      break;
    case "trades":
      conversionGoal = evidence.emergencyService && evidence.phoneCta ? "call" : "quote";
      break;
    case "beauty-wellness":
    case "fitness":
      conversionGoal = "book";
      break;
    case "auto-carwash":
      conversionGoal = evidence.phoneCta ? "call" : "visit";
      break;
    default:
      conversionGoal = evidence.phoneCta ? "call" : "quote";
  }
  const personalityByVertical: Record<BusinessProfile["vertical"], string[]> = {
    "restaurant-hospitality": ["welcoming", "casual", "local"],
    trades: ["reliable", "responsive", "practical"],
    "beauty-wellness": ["calming", "polished", "personal"],
    fitness: ["energetic", "supportive", "focused"],
    "auto-carwash": ["quick", "thorough", "dependable"],
    generic: ["friendly", "professional", "local"],
  };
  return {
    personality: personalityByVertical[profile.vertical] ?? personalityByVertical.generic,
    audience: "local customers",
    pricePosition,
    conversionGoal,
  };
}

export function normalizeBrief(
  raw: DesignBrief | undefined | null,
  profile: BusinessProfile,
  evidence: Evidence,
): DesignBrief {
  const fallback = heuristicBrief(profile, evidence);
  if (!raw || typeof raw !== "object") return fallback;
  const personality = Array.isArray(raw.personality)
    ? raw.personality
        .filter((a): a is string => typeof a === "string")
        .map((a) => a.trim().toLowerCase())
        .filter((a) => /^[a-z][a-z-]{2,24}$/.test(a))
        .slice(0, 3)
    : [];
  while (personality.length < 3) {
    const next = fallback.personality[personality.length];
    if (!next || personality.includes(next)) break;
    personality.push(next);
  }
  return {
    personality: personality.length ? personality : fallback.personality,
    audience: typeof raw.audience === "string" && raw.audience.trim() ? raw.audience.trim().slice(0, 80) : fallback.audience,
    pricePosition: PRICE_POSITIONS.has(raw.pricePosition as string) ? raw.pricePosition : fallback.pricePosition,
    conversionGoal: CONVERSION_GOALS.has(raw.conversionGoal as string) ? raw.conversionGoal : fallback.conversionGoal,
  };
}

// ── Axis pickers (evidence first, seeded tiebreaks) ──────────────────

function pickIndex(rng: () => number, len: number): number {
  return Math.min(len - 1, Math.floor(rng() * len));
}

function pickFamily(vertical: BusinessProfile["vertical"], brief: DesignBrief, rng: () => number): FamilyDef {
  const candidates = (VERTICAL_FAMILIES[vertical] ?? VERTICAL_FAMILIES.generic).map((id) => FAMILIES[id]);
  let best = candidates[0];
  let bestScore = -Infinity;
  for (const fam of candidates) {
    // Price-position affinity dominates; the seeded jitter (max 0.35) only
    // breaks ties, never overrides a tone match or a personality hint (0.4).
    let score = 0;
    if (fam.tone === brief.pricePosition) score += 2;
    else if (fam.tone === "neutral" || brief.pricePosition === "mid") score += 1;
    for (const adj of brief.personality) {
      if (fam.personalityHints.includes(adj)) score += 0.4;
    }
    score += rng() * 0.35;
    if (score > bestScore) {
      bestScore = score;
      best = fam;
    }
  }
  return best;
}

function pickPack(family: FamilyDef, brief: DesignBrief, rng: () => number): Pack {
  const matching = family.packs.filter((p) => p.tone === brief.pricePosition);
  const pool = matching.length > 0 ? matching : family.packs;
  return pool[pickIndex(rng, pool.length)];
}

// Axis picks read distinct bit-fields of a per-business nonce instead of
// sequential RNG draws: evidence-similar businesses (same eligible pools)
// still land on different options unless several independent hash fields
// coincide at once — chance collisions on the full structural tuple
// (hero, order, serviceLayout, reviewLayout) become vanishingly rare.
type AxisPick = (bitShift: number, n: number) => number;

function makeAxisPick(styleNonce: number): AxisPick {
  return (bitShift, n) => (n <= 1 ? 0 : (styleNonce >>> bitShift) % n);
}

/**
 * Hero variants that never need a photo. DNA v2 — photo-poor businesses get
 * >=3 genuinely different anatomies instead of always collapsing to poster.
 */
function textLedHeroPool(reviewsCount: number, hasRating: boolean): HeroVariant[] {
  const pool: HeroVariant[] = ["poster", "minimal-statement"];
  if (reviewsCount >= 1) pool.push("editorial-quote");
  if (hasRating) pool.push("data-led");
  return pool;
}

function pickHero(
  family: FamilyDef,
  photoCount: number,
  reviewsCount: number,
  hasRating: boolean,
  rng: () => number,
  pick: AxisPick,
): { variant: HeroVariant; alignment: "left" | "center" } {
  const textLed = textLedHeroPool(reviewsCount, hasRating);
  const available = family.heroVariants.filter((v) => {
    if (v === "collage") return photoCount >= 4;
    if (v === "overlay" || v === "split") return photoCount >= 1;
    return true; // poster works with zero photos
  });
  let pool: HeroVariant[];
  if (photoCount === 0) {
    pool = textLed;
  } else if (photoCount >= 4) {
    // Photo-rich → media-forward hero variants.
    const mediaForward = available.filter((v) => v !== "poster");
    pool = mediaForward.length > 0 ? mediaForward : available;
  } else {
    // Photo-thin (1-3) → mix the family's photo variants with the text-led
    // anatomies so the pool never collapses to a single shape.
    pool = [...new Set<HeroVariant>([...available, ...textLed])];
  }
  if (pool.length === 0) pool = ["poster"];
  const variant = pool[pick(0, pool.length)];
  const alignment: "left" | "center" =
    variant === "poster" || variant === "overlay" || variant === "minimal-statement"
      ? (rng() < 0.4 ? "center" : "left")
      : "left";
  return { variant, alignment };
}

// DNA v2 — schema hero vocabulary → renderer variants. typographic-poster
// and split-stage alias onto poster/split anatomies (the oversized type
// treatment comes from typeDNA.heroSizeClass).
const SCHEMA_HERO_MAP: Record<string, HeroVariant> = {
  overlay: "overlay",
  split: "split",
  poster: "poster",
  collage: "collage",
  "editorial-quote": "editorial-quote",
  "typographic-poster": "poster",
  "split-stage": "split",
  "minimal-statement": "minimal-statement",
  "data-led": "data-led",
};

/** Evidence guard: a schema-authored hero variant must be renderable with the photos/reviews we actually have. */
function heroGuardOk(v: HeroVariant, photoCount: number, reviewsCount: number, hasRating: boolean): boolean {
  if (v === "collage") return photoCount >= 3;
  if (v === "overlay" || v === "split") return photoCount >= 1;
  if (v === "editorial-quote") return reviewsCount >= 1;
  if (v === "data-led") return hasRating;
  return true; // poster / minimal-statement
}

function pickServiceLayout(
  family: FamilyDef,
  vertical: BusinessProfile["vertical"],
  evidence: Evidence,
  pick: AxisPick,
): ServiceLayout {
  const allowed = family.serviceLayouts;
  const preferFrom = (prefs: ServiceLayout[]): ServiceLayout | null => {
    const hits = prefs.filter((p) => allowed.includes(p));
    return hits.length ? hits[pick(5, hits.length)] : null;
  };
  if (vertical === "restaurant-hospitality" && evidence.menu) {
    return preferFrom(["dotted", "numbered"]) ?? allowed[pick(5, allowed.length)];
  }
  if (vertical === "fitness" && evidence.classSchedule) {
    // Wires evidence.classSchedule (previously dead): schedule-style list.
    return preferFrom(["numbered"]) ?? allowed[pick(5, allowed.length)];
  }
  if (evidence.pricingTiers) {
    return preferFrom(["cards"]) ?? allowed[pick(5, allowed.length)];
  }
  if (vertical === "trades" && evidence.emergencyService) {
    return preferFrom(["cards", "split"]) ?? allowed[pick(5, allowed.length)];
  }
  return allowed[pick(5, allowed.length)];
}

function pickReviewLayout(reviewsCount: number, strongReviews: boolean, pick: AxisPick): ReviewLayout {
  if (reviewsCount === 1) return "spotlight";
  if (strongReviews) return pick(10, 2) === 0 ? "cards" : "strip";
  const all: ReviewLayout[] = ["cards", "spotlight", "strip"];
  return all[pick(10, all.length)];
}

function composeSectionOrder(args: {
  rng: () => number;
  pick: AxisPick;
  vertical: BusinessProfile["vertical"];
  evidence: Evidence;
  brief: DesignBrief;
  photoCount: number;
  reviewsCount: number;
  rating: number | null;
  reviewTotal: number | null;
  servicesCount: number;
  showTagline: boolean;
}): SectionId[] {
  const { pick, evidence, brief, photoCount, reviewsCount, rating, reviewTotal, servicesCount, showTagline } = args;
  const strongReviews = reviewsCount > 0 && (rating ?? 0) >= 4.5 && (reviewTotal ?? 0) >= 20;
  const weakReviews = reviewsCount > 0 && rating != null && rating < 4.0;
  const hasReviews = reviewsCount > 0 && !weakReviews; // weak/no reviews → dropped
  const hasGallery = evidence.gallery && photoCount >= 3;
  const hasSocial = photoCount >= 1;
  const ctaFirst = brief.conversionGoal === "call" || brief.conversionGoal === "book";

  const order: SectionId[] = ["hero"];

  // Hero-adjacent block: conversion goal + strong social proof lead.
  if (ctaFirst) order.push("cta");
  if (hasReviews && strongReviews) order.push("reviews");
  if (!ctaFirst) order.push("cta");

  // Core block: services + (optionally early) gallery + tagline band.
  const mid: SectionId[] = [];
  if (servicesCount > 0) mid.push("services");
  if (hasGallery) {
    if (photoCount >= 4 && pick(20, 5) < 3) {
      // Photo-rich → gallery earlier (before or right after services).
      mid.splice(pick(22, 5) < 2 ? 0 : mid.length, 0, "gallery");
    } else {
      mid.push("gallery");
    }
  }
  if (showTagline) {
    if (pick(24, 2) === 0) mid.unshift("tagline");
    else mid.push("tagline");
  }
  order.push(...mid);

  // Tail: late reviews (not strong), social feed. Social never renders
  // before services (enforced structurally — it only ever joins the tail).
  const tail: SectionId[] = [];
  if (hasReviews && !strongReviews) tail.push("reviews");
  if (hasSocial) tail.push("social");
  if (tail.length === 2 && pick(26, 3) === 0) tail.reverse();
  order.push(...tail, "footer");

  return order;
}

// Wayfinding labels are LITERAL (vineyard critique: "In Their Words" is
// vague — visitors scan for "Reviews"). Family personality lives in
// typography, palette, and copy — never in navigation vocabulary. Badges
// render only when the evidence supports the claim; families never
// fabricate "Licensed · Insured" or "Now Open".
function sectionLabels(family: FamilyDef, vertical: BusinessProfile["vertical"], evidence: Evidence): DesignSpec["labels"] {
  const menu = vertical === "restaurant-hospitality" && evidence.menu;
  // SOL critique vocab: experience-led hospitality (vineyards, tours) never
  // borrows menu language. When tasting/tour words are in evidence the label
  // is the literal "Tastings & Tours" (same vocabulary as the agent-framing
  // override path — the vineyard fixture must land there with or without an
  // agent schema); otherwise "Choose Your Experience" tells a visitor what
  // to do. "Experiences" was vague and "The Menu" was wrong.
  const services = menu
    ? "The Menu"
    : vertical === "restaurant-hospitality"
      ? evidence.tastingTour
        ? "Tastings & Tours"
        : "Choose Your Experience"
      : evidence.classSchedule
        ? "Weekly Schedule"
        : evidence.pricingTiers
          ? "Packages"
          : "Services";
  return { services, reviews: "Guest Reviews", social: "Follow Along", badge: null };
}

// ── DNA v2: type system / grid family / chrome resolution ───────────
// Schema-first: a valid agent-authored value is adopted verbatim; otherwise
// a seeded pick from a second axis-nonce (`seed|dna2`) chooses — independent
// bit-fields per axis, same collision-proof pattern as the structural nonce.

type SchemaVisual = NonNullable<NonNullable<BusinessProfile["designSchema"]>["visual"]>;

const SCALE_RATIOS = [1.2, 1.333, 1.414, 1.5] as const;
const EYEBROWS: EyebrowTreatment[] = ["uppercase-tracked", "numbered", "rule-line", "side-tab", "none"];
const HEADING_CASES: HeadingCase[] = ["mixed", "sentence", "uppercase"];
const HERO_SIZE_CLASSES: HeroSizeClass[] = ["compact", "standard", "oversized", "poster"];
const GRID_FAMILIES: GridFamily[] = [
  "centered-column", "split-6-6", "split-5-7", "side-rail",
  "bento", "banded-full-bleed", "magazine-offset",
];
const NAV_FAMILIES: NavFamily[] = ["slim", "inline", "center-stack", "cta-bar"];
const FOOTER_FAMILIES: FooterFamily[] = ["slim-bar", "stacked-center", "mega-grid", "colophon"];

const EYEBROW_SET = new Set(EYEBROWS);
const HEADING_CASE_SET = new Set(HEADING_CASES);
const HERO_SIZE_SET = new Set(HERO_SIZE_CLASSES);
const GRID_FAMILY_SET = new Set(GRID_FAMILIES);
const NAV_SET = new Set(NAV_FAMILIES);
const FOOTER_SET = new Set(FOOTER_FAMILIES);

const DISPLAY_WEIGHTS: Record<string, number> = { light: 300, regular: 400, semibold: 600, black: 900 };
const TRACKINGS: Record<string, string> = { tight: "-0.03em", normal: "-0.01em", wide: "0.05em" };
const MEASURES: Record<string, number> = { narrow: 340, regular: 420, wide: 500 };

/** Hero display px per size class (base before seeded jitter). */
const HERO_BASE: Record<HeroSizeClass, [number, number, number]> = {
  // [base, min, max]
  compact: [30, 28, 34],
  standard: [40, 36, 44],
  oversized: [54, 48, 58],
  poster: [70, 64, 76],
};

function resolveTypeSystem(
  visual: SchemaVisual | undefined,
  density: Density,
  heroVariant: HeroVariant,
  pack: Pack,
  pick2: AxisPick,
): TypeSystem {
  const td = visual?.typeDNA;
  const scaleRatio =
    td?.scaleRatio && (SCALE_RATIOS as readonly number[]).includes(td.scaleRatio)
      ? td.scaleRatio
      : SCALE_RATIOS[pick2(0, SCALE_RATIOS.length)];

  // Hero size class: pool constrained by anatomy (poster/minimal thrive at
  // display sizes; photo heroes cap lower) then by density.
  let sizePool: HeroSizeClass[];
  if (heroVariant === "poster" || heroVariant === "minimal-statement") {
    sizePool = ["oversized", "poster"];
  } else if (heroVariant === "editorial-quote" || heroVariant === "data-led") {
    sizePool = ["standard", "oversized"];
  } else {
    sizePool =
      density === "airy" ? ["standard", "oversized"]
      : density === "dense" ? ["compact", "standard"]
      : ["compact", "standard", "oversized"];
  }
  const heroSizeClass: HeroSizeClass =
    td?.heroSizeClass && HERO_SIZE_SET.has(td.heroSizeClass) ? td.heroSizeClass : sizePool[pick2(3, sizePool.length)];
  const [base, min, max] = HERO_BASE[heroSizeClass];
  const jitter = pick2(30, 4) * 2 - 3; // -3 | -1 | +1 | +3
  const heroSize = Math.max(min, Math.min(max, base + jitter));

  const bodySize = density === "dense" ? 11.5 : density === "airy" ? 13 : 12.5;
  const itemTitleSize = Math.round(bodySize * scaleRatio);
  const sectionTitleSize = Math.round(bodySize * scaleRatio * scaleRatio);

  const eyebrowTreatment: EyebrowTreatment =
    td?.eyebrowTreatment && EYEBROW_SET.has(td.eyebrowTreatment)
      ? td.eyebrowTreatment
      : EYEBROWS[pick2(6, EYEBROWS.length)];

  // Uppercase display packs (Bebas/Archivo families) stay uppercase; others
  // pick with "mixed" weighted heavier so uppercase stays a statement.
  const casePool: HeadingCase[] =
    pack.fonts.displayTreatment === "uppercase"
      ? ["uppercase"]
      : ["mixed", "sentence", "mixed", "uppercase"];
  const headingCase: HeadingCase =
    td?.headingCase && HEADING_CASE_SET.has(td.headingCase) ? td.headingCase : casePool[pick2(9, casePool.length)];

  const weightPool = [400, 600, 800];
  const displayWeight =
    td?.displayWeight && DISPLAY_WEIGHTS[td.displayWeight] !== undefined
      ? DISPLAY_WEIGHTS[td.displayWeight]
      : weightPool[pick2(12, weightPool.length)];

  const trackPool = ["-0.03em", "-0.01em", "0.05em"];
  const displayTracking =
    td?.displayTracking && TRACKINGS[td.displayTracking] !== undefined
      ? TRACKINGS[td.displayTracking]
      : trackPool[pick2(15, trackPool.length)];

  const measurePool = [340, 420, 500];
  const bodyMeasure =
    td?.bodyMeasure && MEASURES[td.bodyMeasure] !== undefined
      ? MEASURES[td.bodyMeasure]
      : measurePool[pick2(18, measurePool.length)];

  // ── Readability invariants (applied AFTER selection so schema-driven and
  // seeded picks both obey them; from the vineyard-draft critique) ──
  // 1. Serif display faces at oversized/poster sizes never render uppercase —
  //    all-caps serif walls are unscannable. Serif stacks end in bare "serif".
  const isSerifDisplay = /,\s*serif\s*$/i.test(pack.fonts.display);
  let finalHeadingCase = headingCase;
  if (isSerifDisplay && (heroSizeClass === "oversized" || heroSizeClass === "poster") && finalHeadingCase === "uppercase") {
    finalHeadingCase = "sentence";
  }
  // 2. Uppercase budget: one uppercase tier per page. Uppercase headings
  //    demote uppercase-tracked eyebrows to a quieter treatment.
  let finalEyebrow = eyebrowTreatment;
  if (finalHeadingCase === "uppercase" && finalEyebrow === "uppercase-tracked") {
    finalEyebrow = "rule-line";
  }

  return {
    scaleRatio,
    heroSizeClass,
    heroSize,
    sectionTitleSize,
    itemTitleSize,
    bodySize,
    // 3. Label floor: never below 10px — tiny letterspaced labels were a
    //    direct legibility complaint.
    eyebrowSize: density === "airy" ? 11 : 10,
    eyebrowTreatment: finalEyebrow,
    headingCase: finalHeadingCase,
    displayWeight,
    displayTracking,
    bodyMeasure,
  };
}

function resolveGridFamily(
  visual: SchemaVisual | undefined,
  dnaGrid: LayoutDNA["grid"],
  pick2: AxisPick,
): GridFamily {
  const fromSchema = visual?.gridFamily;
  if (fromSchema && GRID_FAMILY_SET.has(fromSchema)) return fromSchema;
  // Seeded pool flavored by the layoutDNA grid so the two axes cohere.
  const pools: Record<LayoutDNA["grid"], GridFamily[]> = {
    symmetric: ["centered-column", "split-6-6", "banded-full-bleed"],
    "asymmetric-left": ["split-5-7", "side-rail", "magazine-offset"],
    "asymmetric-right": ["split-6-6", "magazine-offset", "bento"],
    "off-center": ["magazine-offset", "side-rail", "bento"],
  };
  const pool = pools[dnaGrid] ?? GRID_FAMILIES;
  return pool[pick2(21, pool.length)];
}

function resolveChrome(visual: SchemaVisual | undefined, pick2: AxisPick): DesignSpec["chrome"] {
  const nav =
    visual?.chrome?.nav && NAV_SET.has(visual.chrome.nav)
      ? visual.chrome.nav
      : NAV_FAMILIES[pick2(24, NAV_FAMILIES.length)];
  const footer =
    visual?.chrome?.footer && FOOTER_SET.has(visual.chrome.footer)
      ? visual.chrome.footer
      : FOOTER_FAMILIES[pick2(27, FOOTER_FAMILIES.length)];
  return { nav, footer };
}

// ── DNA v2: signature sections reachable without the agent ──────────
// The 10 signature sections were only renderable when the schema agent
// authored a section list. Seed 1-2 evidence-eligible ones into heuristic
// orders too, so fallback specs stop looking like the same six-section stack.

function injectSignatureSections(
  order: SectionId[],
  args: {
    profile: BusinessProfile;
    evidence: Evidence;
    photoCount: number;
    servicesCount: number;
    pick: AxisPick;
  },
): SectionId[] {
  const { profile, evidence, photoCount, servicesCount, pick } = args;
  const vertical = profile.vertical;
  const eligible: SectionId[] = [];
  if (evidence.menu && servicesCount >= 4) eligible.push("menu-board");
  if (evidence.pricingTiers) eligible.push("pricing-teaser");
  if (photoCount >= 2 && (vertical === "trades" || vertical === "auto-carwash" || vertical === "beauty-wellness")) {
    eligible.push("before-after");
  }
  if (servicesCount >= 3 && (vertical === "trades" || vertical === "generic")) eligible.push("process-timeline");
  if ((profile.about?.trim().length ?? 0) >= 60) eligible.push("owner-letter");
  if (profile.address) eligible.push("neighborhood-map");
  if ((profile.rating ?? 0) >= 4.5 && (profile.reviewCount ?? 0) >= 50) eligible.push("press-strip");
  if (profile.hoursLine?.trim()) eligible.push("hours-marquee");
  if (vertical === "trades" || (profile.rating ?? 0) >= 4.0) eligible.push("credential-wall");
  eligible.push("faq-conversation");

  const pool = eligible.filter((s) => !order.includes(s));
  if (pool.length === 0) return order;

  const count = Math.min(pool.length, 1 + pick(19, 2)); // 1 or 2 signature sections
  const first = pool[pick(12, pool.length)];
  const rest = pool.filter((s) => s !== first);
  const second = count === 2 && rest.length > 0 ? rest[pick(17, rest.length)] : null;

  const out = [...order];
  // First insert lands mid-page (right after services, else after hero block).
  const servicesIdx = out.indexOf("services");
  const midAt = servicesIdx >= 0 ? servicesIdx + 1 : Math.min(2, out.length - 1);
  out.splice(midAt, 0, first);
  if (second) {
    // Second insert lands late (before social/footer tail).
    const socialIdx = out.indexOf("social");
    const lateAt = socialIdx >= 0 ? socialIdx : out.length - 1;
    out.splice(lateAt, 0, second);
  }
  return out;
}

// DNA v2 — wire content.servicesFraming into the section label vocabulary.
const FRAMING_LABELS: Record<string, string> = {
  menu: "The Menu",
  // SOL critique vocab: experience framing speaks in visitor actions.
  experiences: "Choose Your Experience",
  packages: "Packages",
  process: "How We Work",
  capabilities: "What We Do",
};

// ── The composer ─────────────────────────────────────────────────────

// Ornament map from the schema vocabulary (which includes "botanical"/"topo")
// down to the four the render layer supports today.
const ORNAMENT_MAP: Record<string, Ornament> = {
  grain: "grain", halftone: "halftone", grid: "grid", none: "none",
  botanical: "grain", topo: "grid",
};

// Phase 2 — map the schema agent's SectionKey vocabulary to the renderer's
// SectionId union. Legacy keys map to their nearest signature equivalent so
// old schemas keep rendering.
const SCHEMA_SECTION_MAP: Record<string, SectionId> = {
  hero: "hero",
  services: "services",
  gallery: "gallery",
  reviews: "reviews",
  social: "social",
  footer: "footer",
  "cta-band": "cta",
  "trust-bar": "credential-wall",
  story: "owner-letter",
  "hours-map": "neighborhood-map",
  "menu-board": "menu-board",
  "process-timeline": "process-timeline",
  "before-after": "before-after",
  "owner-letter": "owner-letter",
  "neighborhood-map": "neighborhood-map",
  "press-strip": "press-strip",
  "pricing-teaser": "pricing-teaser",
  "faq-conversation": "faq-conversation",
  "hours-marquee": "hours-marquee",
  "credential-wall": "credential-wall",
};

function orderFromSchema(keys: readonly string[] | undefined, tagline: SectionId | null): SectionId[] | null {
  if (!keys || keys.length < 3) return null;
  const seen = new Set<SectionId>();
  const out: SectionId[] = [];
  for (const k of keys) {
    const id = SCHEMA_SECTION_MAP[k];
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  if (out.length < 3) return null;
  // Structural invariants: hero first, footer last.
  const withoutBookends = out.filter((s) => s !== "hero" && s !== "footer");
  const finalOrder: SectionId[] = ["hero", ...withoutBookends, "footer"];
  if (tagline && !finalOrder.includes(tagline)) {
    finalOrder.splice(finalOrder.length - 1, 0, tagline);
  }
  return finalOrder;
}

export function composeDesign(profile: BusinessProfile): DesignSpec {
  const evidence = deriveEvidence(profile);
  const brief = normalizeBrief(profile.designBrief, profile, evidence);
  const seedStr = `${profile.businessName}|${profile.serviceAreaLine ?? ""}|${profile.address ?? ""}`;
  const rng = mulberry32(xmur3(seedStr)());
  const pick = makeAxisPick(xmur3(`${seedStr}|style`)());

  const photoCount = profile.photoUrls?.length ?? 0;
  const reviewsCount = profile.reviews?.length ?? 0;

  // Second axis-nonce for the DNA v2 axes — independent bit-fields, so new
  // axes never perturb (or collide with) the original structural picks.
  const pick2 = makeAxisPick(xmur3(`${seedStr}|dna2`)());
  const reviewsForHero = reviewsCount;
  const hasRating = profile.rating != null;

  const family = pickFamily(profile.vertical, brief, rng);
  let pack = pickPack(family, brief, rng);
  const hero = pickHero(family, photoCount, reviewsForHero, hasRating, rng, pick);
  // Deep designer — the AI owns the section-layout axes when it set them
  // (schema.content.*); seeds fill only what the schema left blank.
  const schemaContent = profile.designSchema?.content;
  const SERVICE_SET = new Set<ServiceLayout>(["dotted", "cards", "numbered", "chips", "split"]);
  const REVIEW_SET = new Set<ReviewLayout>(["cards", "spotlight", "strip"]);
  const serviceLayout =
    schemaContent?.serviceLayout && SERVICE_SET.has(schemaContent.serviceLayout as ServiceLayout)
      ? (schemaContent.serviceLayout as ServiceLayout)
      : pickServiceLayout(family, profile.vertical, evidence, pick);
  const strongReviews = reviewsCount > 0 && (profile.rating ?? 0) >= 4.5 && (profile.reviewCount ?? 0) >= 20;
  const reviewLayout =
    schemaContent?.reviewLayout && REVIEW_SET.has(schemaContent.reviewLayout as ReviewLayout)
      ? (schemaContent.reviewLayout as ReviewLayout)
      : pickReviewLayout(reviewsCount, strongReviews, pick);
  const socialVariant: SocialVariant =
    schemaContent?.socialVariant === "wall" || schemaContent?.socialVariant === "strip"
      ? schemaContent.socialVariant
      : pick(15, 2) === 0 ? "wall" : "strip";
  let density: Density =
    brief.pricePosition === "premium" ? "airy" : brief.pricePosition === "budget" ? "dense" : "regular";

  // Schema override: when the agent produced a DesignSchema, adopt its
  // palette + typography + ornament + density verbatim on top of the
  // structural picks (hero variant / section order / layouts) still owned
  // by the deterministic composer in v1. Later phases move more axes over.
  const schema = profile.designSchema;
  let fontLoad: FontLoadSpec[] | undefined;
  let colorFingerprint: ColorFingerprint | undefined;
  if (schema?.visual) {
    const sp = schema.visual.palette;
    pack = {
      ...pack,
      id: `agent-${pack.id}`,
      bg: sp.bg, surface: sp.surface, ink: sp.ink, muted: sp.muted,
      accent: sp.accent, accentInk: sp.accentInk, border: sp.border,
      // Recompute isDark from the actual bg luminance rather than trust the
      // pack tag — an agent may pick a light palette from a "dark" family.
      isDark: relativeLuminance(sp.bg) < 0.35,
      fonts: {
        display: schema.visual.typography.display || pack.fonts.display,
        body: schema.visual.typography.body || pack.fonts.body,
        displayTreatment: schema.visual.typography.displayTreatment as DisplayTreatment,
      },
      ornament: ORNAMENT_MAP[schema.visual.ornament] ?? pack.ornament,
    };
    density = schema.visual.density;
  } else {
    // Stage 2 — generative palette + typography engines drive the fallback
    // path (no agent schema): a seeded topology expands the pack's brand hue
    // into a full AA-validated role set, and a scored library pairing
    // replaces the pack's font pair. The static art-direction packs remain
    // the emergency skin only (kept verbatim if the engines ever throw), so
    // old stored leads with no designSchema still always render.
    try {
      const pickGen = makeAxisPick(xmur3(`${seedStr}|gen`)());
      const topology = PALETTE_TOPOLOGIES[pickGen(0, PALETTE_TOPOLOGIES.length)];
      const gen = generatePalette(topology, {
        hue: hueOfHex(pack.accent),
        mode: pack.isDark ? "dark" : "light",
        nonce: xmur3(`${seedStr}|palette`)(),
      });
      const fontPairing = selectFontPairing({
        personality: brief.personality,
        vertical: profile.vertical,
        pricePosition: brief.pricePosition,
        nonce: xmur3(`${seedStr}|fonts`)(),
      });
      pack = {
        ...pack,
        id: `gen-${topology}--${fontPairing.id}`,
        bg: gen.bg, surface: gen.surface, ink: gen.ink, muted: gen.muted,
        accent: gen.accent, accentInk: gen.accentInk, border: gen.border,
        isDark: gen.mode === "dark",
        fonts: {
          display: cssStack(fontPairing.display),
          body: cssStack(fontPairing.body),
          displayTreatment: fontPairing.displayTreatment,
        },
      };
      fontLoad = fontLoadSpecs(fontPairing);
      colorFingerprint = gen.fingerprint;
    } catch {
      // Emergency-only: keep the pre-validated static pack untouched.
    }
  }
  // DNA v2 — density moves meaningfully: padY, gaps, and card padding all scale.
  const padY = density === "airy" ? 46 : density === "dense" ? 16 : 28;
  const gap = density === "airy" ? 14 : density === "dense" ? 6 : 10;
  const cardPad = density === "airy" ? 20 : density === "dense" ? 10 : 14;
  const showTagline = family.wantsTagline && Boolean(profile.tagline && profile.tagline.trim());

  const heuristicOrder = composeSectionOrder({
    rng,
    pick,
    vertical: profile.vertical,
    evidence,
    brief,
    photoCount,
    reviewsCount,
    rating: profile.rating ?? null,
    reviewTotal: profile.reviewCount ?? null,
    servicesCount: profile.services?.length ?? 0,
    showTagline,
  });
  // Phase 2 — if the schema agent authored a section list, adopt it verbatim
  // (mapped to renderer ids). This is the crucial wire between the agent's
  // vocabulary and what actually renders on screen.
  const schemaOrder = orderFromSchema(schema?.homepage?.sections, showTagline ? "tagline" : null);
  // DNA v2 — fallback orders reach the signature sections too (seeded,
  // evidence-eligible), not only agent-authored ones.
  const sectionOrder =
    schemaOrder ??
    injectSignatureSections(heuristicOrder, {
      profile,
      evidence,
      photoCount,
      servicesCount: profile.services?.length ?? 0,
      pick,
    });

  // Dedup (verifier-flagged, confirmed in production): the full-bleed
  // color band motif SPEAKS the tagline — when both the band and the
  // tagline section would render, the same sentence appears twice. The
  // motif wins; the tagline section drops.
  if (schema?.visual?.motif === "full-bleed-color-band") {
    const ti = sectionOrder.indexOf("tagline");
    if (ti !== -1) sectionOrder.splice(ti, 1);
  }

  // INVARIANT (vineyard critique): real review quotes are the trust core —
  // when the profile HAS reviews, a quotes section always renders, whatever
  // the agent or seeded order decided. Insert before the tail (social/footer).
  if (reviewsCount > 0 && !sectionOrder.includes("reviews")) {
    const tailIdx = sectionOrder.findIndex((s) => s === "social" || s === "footer");
    sectionOrder.splice(tailIdx === -1 ? sectionOrder.length : tailIdx, 0, "reviews");
  }

  // Phase 3 — layout DNA: agent choice → per-vertical fallback → seeded pick.
  const layoutDNA = resolveLayoutDNA(schema?.visual?.layoutDNA, profile.vertical, brief, pick);

  // DNA v2 — finally RENDER the agent's homepage.hero.variant (incl the
  // previously-dead editorial-quote), guarded by real evidence.
  let heroVariant = hero.variant;
  const schemaHeroRaw = schema?.homepage?.hero?.variant;
  if (schemaHeroRaw) {
    const mapped = SCHEMA_HERO_MAP[schemaHeroRaw];
    // Vineyard-critique mirror of the server's evidence-fit rule: a
    // photo-rich scenery-led business never adopts a text-led schema hero —
    // the seeded media-forward pick stands. (Also protects leads stored
    // before the server rule shipped.)
    const textLed =
      mapped === "poster" || mapped === "minimal-statement" ||
      mapped === "editorial-quote" || mapped === "data-led";
    const mediaFirst =
      photoCount >= 4 &&
      (profile.vertical === "restaurant-hospitality" ||
        profile.vertical === "beauty-wellness" ||
        profile.vertical === "fitness");
    if (mapped && heroGuardOk(mapped, photoCount, reviewsCount, hasRating) && !(textLed && mediaFirst)) {
      heroVariant = mapped;
    }
  }

  // DNA v2 — type system / grid family / chrome (schema-first, seeded fallback).
  const type = resolveTypeSystem(schema?.visual, density, heroVariant, pack, pick2);
  const gridFamily = resolveGridFamily(schema?.visual, layoutDNA.grid, pick2);
  const chrome = resolveChrome(schema?.visual, pick2);

  // DNA v2 — servicesFraming drives the services label when the agent set it.
  const labels = sectionLabels(family, profile.vertical, evidence);
  const framing = schema?.content?.servicesFraming;
  if (framing && FRAMING_LABELS[framing]) {
    // SOL round-5: "The Menu" requires real food evidence. An agent-set
    // "menu" framing over a tasting-room profile (evidence.menu false —
    // no food keywords) must not print menu vocabulary; experience-led
    // hospitality gets "Tastings & Tours" when the words are in evidence,
    // else the plain "Experiences".
    labels.services =
      framing === "menu" && !evidence.menu
        ? evidence.tastingTour
          ? "Tastings & Tours"
          : "Experiences"
        : FRAMING_LABELS[framing];
  }

  return {
    family: family.id,
    packId: pack.id,
    pack,
    fonts: pack.fonts,
    hero: { variant: heroVariant, alignment: hero.alignment, flourish: family.flourish },
    sectionOrder,
    serviceLayout,
    reviewLayout,
    socialVariant,
    density,
    padY,
    gap,
    cardPad,
    radius: family.radius,
    ornament: pack.ornament,
    labels,
    showTagline,
    layoutDNA,
    type,
    gridFamily,
    chrome,
    fontLoad,
    colorFingerprint,
  };
}

// ── Phase 3: Layout DNA resolution ───────────────────────────────────

const FALLBACK_LAYOUT_DNA: Record<BusinessProfile["vertical"], LayoutDNA> = {
  "restaurant-hospitality": { grid: "asymmetric-left", rhythm: "syncopated", edgeTreatment: "bleed-right", verticalTypography: "right-rail", sectionDividers: "chapter", headerAlign: "left" },
  trades:                   { grid: "symmetric",       rhythm: "even",       edgeTreatment: "contained",   verticalTypography: "none",       sectionDividers: "numbered", headerAlign: "left" },
  "beauty-wellness":        { grid: "asymmetric-right",rhythm: "even",       edgeTreatment: "bleed-left",  verticalTypography: "left-rail",  sectionDividers: "hairline", headerAlign: "center" },
  fitness:                  { grid: "off-center",      rhythm: "staggered",  edgeTreatment: "full-bleed",  verticalTypography: "none",       sectionDividers: "numbered", headerAlign: "left" },
  "auto-carwash":           { grid: "asymmetric-left", rhythm: "even",       edgeTreatment: "bleed-right", verticalTypography: "none",       sectionDividers: "numbered", headerAlign: "left" },
  generic:                  { grid: "symmetric",       rhythm: "even",       edgeTreatment: "contained",   verticalTypography: "none",       sectionDividers: "hairline", headerAlign: "left" },
};

const GRIDS: LayoutDNA["grid"][] = ["symmetric", "asymmetric-left", "asymmetric-right", "off-center"];
const RHYTHMS: LayoutDNA["rhythm"][] = ["even", "syncopated", "staggered"];
const EDGES: LayoutDNA["edgeTreatment"][] = ["contained", "bleed-left", "bleed-right", "full-bleed"];
const RAILS: LayoutDNA["verticalTypography"][] = ["none", "left-rail", "right-rail"];
const DIVIDERS: LayoutDNA["sectionDividers"][] = ["none", "hairline", "numbered", "chapter"];
const ALIGNS: LayoutDNA["headerAlign"][] = ["left", "center", "right", "justified"];

const GRID_SET = new Set(GRIDS);
const RHYTHM_SET = new Set(RHYTHMS);
const EDGE_SET = new Set(EDGES);
const RAIL_SET = new Set(RAILS);
const DIV_SET = new Set(DIVIDERS);
const ALIGN_SET = new Set(ALIGNS);

function resolveLayoutDNA(
  agent: LayoutDNA | undefined,
  vertical: BusinessProfile["vertical"],
  _brief: DesignBrief,
  pick: AxisPick,
): LayoutDNA {
  const base = FALLBACK_LAYOUT_DNA[vertical] ?? DEFAULT_LAYOUT_DNA;
  // Seeded jitter picks a different combination for two same-vertical
  // businesses when the agent didn't author a DNA.
  const seeded: LayoutDNA = {
    grid: GRIDS[pick(28, GRIDS.length)],
    rhythm: RHYTHMS[pick(30, RHYTHMS.length)],
    edgeTreatment: EDGES[pick(1, EDGES.length)],
    verticalTypography: RAILS[pick(3, RAILS.length)],
    sectionDividers: DIVIDERS[pick(7, DIVIDERS.length)],
    headerAlign: ALIGNS[pick(9, ALIGNS.length)],
  };
  const merged: LayoutDNA = { ...base, ...seeded };
  if (!agent) return merged;
  return {
    grid: GRID_SET.has(agent.grid) ? agent.grid : merged.grid,
    rhythm: RHYTHM_SET.has(agent.rhythm) ? agent.rhythm : merged.rhythm,
    edgeTreatment: EDGE_SET.has(agent.edgeTreatment) ? agent.edgeTreatment : merged.edgeTreatment,
    verticalTypography: RAIL_SET.has(agent.verticalTypography) ? agent.verticalTypography : merged.verticalTypography,
    sectionDividers: DIV_SET.has(agent.sectionDividers) ? agent.sectionDividers : merged.sectionDividers,
    headerAlign: ALIGN_SET.has(agent.headerAlign) ? agent.headerAlign : merged.headerAlign,
  };
}
