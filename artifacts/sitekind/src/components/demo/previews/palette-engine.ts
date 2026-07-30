// palette-engine.ts — generative palette topologies for the /demo design compiler.
//
// CANONICAL: supabase/functions/demo-research/palette-engine.ts
// MIRROR:    src/components/demo/previews/palette-engine.ts
// The two copies MUST stay byte-identical — scripts/test-design-engines.mjs
// enforces the sync (same convention as entity-match.ts / demo-report).
//
// Pure + dependency-free (no React, no Deno, no DOM APIs) so the exact same
// module runs in the edge function, in the Vite client bundle, and under bun
// test scripts.
//
// generatePalette(topology, seeds) deterministically expands a dominant brand
// hue (logo / site css / vertical pack accent) into a full role token set for
// one of 8 palette topologies × light/dark dominant modes. Every generated
// palette is programmatically validated — WCAG AA on the same relative-
// luminance math as design.ts — and iteratively repaired (lightness walks
// until every ratio passes). A failing palette is never emitted: if repair
// somehow leaves a failure, a known-AA fail-safe neutral scheme is returned.

// ── Public types ─────────────────────────────────────────────────────

export type PaletteTopology =
  | "monochrome-plus-accent"
  | "neutral-plus-signal"
  | "tonal-single-hue"
  | "analogous-warm"
  | "analogous-cool"
  | "earth-plus-signal"
  | "black-white-material"
  | "multi-surface-editorial";

export const PALETTE_TOPOLOGIES: readonly PaletteTopology[] = [
  "monochrome-plus-accent",
  "neutral-plus-signal",
  "tonal-single-hue",
  "analogous-warm",
  "analogous-cool",
  "earth-plus-signal",
  "black-white-material",
  "multi-surface-editorial",
];

export type PaletteMode = "light" | "dark";

export type PaletteRoles = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  /** Hover state of the accent — derived AND validated against accentInk. */
  accentHover: string;
  /** Active/pressed state of the accent — derived AND validated. */
  accentActive: string;
  border: string;
  /** Ink guaranteed readable over a dark photo scrim (HERO_SCRIM). */
  heroOverlayInk: string;
};

export type AccentCoverage = "minimal" | "moderate" | "saturated";

export type ColorFingerprint = {
  topology: PaletteTopology;
  /** Dominant (neutral-field) hue, 0-359 rounded. */
  dominantHue: number;
  /** Accent hue, 0-359 rounded. */
  accentHue: number;
  /** HSL lightness ramp bg>surface>surfaceAlt, e.g. "96>92>89". */
  surfaceLightnessCurve: string;
  accentCoverage: AccentCoverage;
};

export type GeneratedPalette = PaletteRoles & {
  mode: PaletteMode;
  topology: PaletteTopology;
  fingerprint: ColorFingerprint;
};

export type PaletteSeeds = {
  /** Dominant hue 0-359 from brand evidence. */
  hue: number;
  /** Optional second hue; topologies derive their own when omitted. */
  accentHue?: number;
  /** Dominant mode; defaults to light. */
  mode?: PaletteMode;
  /** 32-bit nonce for within-topology jitter (seeded, deterministic). */
  nonce?: number;
};

/** The dark photo scrim heroOverlayInk is validated against. */
export const HERO_SCRIM = "#23272e";

// ── Color math (HSL <-> hex) ─────────────────────────────────────────

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function wrapHue(h: number): number {
  const w = h % 360;
  return w < 0 ? w + 360 : w;
}

type Hsl = { h: number; s: number; l: number };

export function hslToHex(h: number, s: number, l: number): string {
  const hh = wrapHue(h);
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  let r = 0, g = 0, b = 0;
  if (hh < 60) { r = c; g = x; }
  else if (hh < 120) { r = x; g = c; }
  else if (hh < 180) { g = c; b = x; }
  else if (hh < 240) { g = x; b = c; }
  else if (hh < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function hexToHsl(hex: string): Hsl {
  const t = String(hex ?? "").replace("#", "").trim();
  const full = t.length === 3 ? t.split("").map((c) => c + c).join("") : t;
  if (!/^[0-9a-f]{6}$/i.test(full)) return { h: 0, s: 0, l: 50 };
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

/** Extract the hue of a hex color — used to seed the engine from a brand accent. */
export function hueOfHex(hex: string): number {
  return Math.round(wrapHue(hexToHsl(hex).h));
}

// ── WCAG contrast (mirrors design.ts / design-schema-agent.ts math) ─

function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function paletteLuminance(hex: string): number {
  const t = String(hex ?? "").replace("#", "");
  const full = t.length === 3 ? t.split("").map((c) => c + c).join("") : t;
  if (!/^[0-9a-f]{6}$/i.test(full)) return 0.5;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

export function paletteContrast(a: string, b: string): number {
  const la = paletteLuminance(a);
  const lb = paletteLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// ── Validation ───────────────────────────────────────────────────────

/**
 * Returns the list of AA failures for a role set (empty = valid).
 * ink/bg, ink/surface, ink/surfaceAlt, accentInk/accent (+hover/active),
 * heroOverlayInk/scrim >= 4.5; muted/bg, muted/surface >= 3.5 (raised
 * from 3.0 after the vineyard critique: muted labels read as low-contrast);
 * accent/bg, accent/surface, accent/surfaceAlt >= 3.5 (design-sweep round 6:
 * the accent renders as TEXT everywhere — eyebrows, section labels, link
 * chips, footer phone — so it carries the same floor as muted against every
 * surface it can sit on, not just against its own accentInk);
 * border/bg >= 1.3 (visible).
 */
export function validatePalette(p: PaletteRoles): string[] {
  const fails: string[] = [];
  const need = (label: string, a: string, b: string, min: number) => {
    const r = paletteContrast(a, b);
    if (r < min) fails.push(`${label} ${r.toFixed(2)} < ${min}`);
  };
  need("ink/bg", p.ink, p.bg, 4.5);
  need("ink/surface", p.ink, p.surface, 4.5);
  need("ink/surfaceAlt", p.ink, p.surfaceAlt, 4.5);
  need("accentInk/accent", p.accentInk, p.accent, 4.5);
  need("accentInk/accentHover", p.accentInk, p.accentHover, 4.5);
  need("accentInk/accentActive", p.accentInk, p.accentActive, 4.5);
  need("muted/bg", p.muted, p.bg, 3.5);
  need("muted/surface", p.muted, p.surface, 3.5);
  need("accent/bg", p.accent, p.bg, 3.5);
  need("accent/surface", p.accent, p.surface, 3.5);
  need("accent/surfaceAlt", p.accent, p.surfaceAlt, 3.5);
  need("border/bg", p.border, p.bg, 1.3);
  need("heroOverlayInk/scrim", p.heroOverlayInk, HERO_SCRIM, 4.5);
  return fails;
}

// ── Iterative repair (adjust L until pass — never emit a failure) ────

function bits(nonce: number, shift: number, n: number): number {
  return n <= 1 ? 0 : (nonce >>> shift) % n;
}

/** Walk a foreground's lightness away from the mode's surfaces until every target ratio passes. */
function repairFg(fg: Hsl, targets: string[], min: number, mode: PaletteMode): Hsl {
  const dir = mode === "light" ? -1 : 1;
  let cur = { ...fg };
  for (let i = 0; i < 90; i++) {
    const hex = hslToHex(cur.h, cur.s, cur.l);
    if (targets.every((t) => paletteContrast(hex, t) >= min)) return cur;
    cur = { ...cur, l: clamp(cur.l + dir * 1.5, 0, 100) };
    if (cur.l <= 1 || cur.l >= 99) cur = { ...cur, s: Math.max(0, cur.s - 8) };
  }
  return cur;
}

/** Resolve an accent + its ink together: nudge accent L until an AA ink
 * exists AND the accent itself carries as text on every page surface
 * (design-sweep round 6: accents validated only against accentInk shipped
 * 2.0–2.3 eyebrows/labels on light surfaces). `surfaces` are the bg /
 * surface / surfaceAlt hexes the accent must hit >= 3.5 against. */
function resolveAccent(
  accent: Hsl,
  mode: PaletteMode,
  surfaces: string[],
): { accent: Hsl; accentInk: string } {
  let a = { ...accent };
  for (let i = 0; i < 90; i++) {
    const hex = hslToHex(a.h, a.s, a.l);
    if (surfaces.every((s) => paletteContrast(hex, s) >= 3.5)) {
      if (paletteContrast("#ffffff", hex) >= 4.5) return { accent: a, accentInk: "#ffffff" };
      if (paletteContrast("#101014", hex) >= 4.5) return { accent: a, accentInk: "#101014" };
    }
    // Mid-tone accent: darken in light mode (punchy on paper), lighten in dark.
    a = { ...a, l: clamp(a.l + (mode === "light" ? -1.5 : 1.5), 0, 100) };
  }
  return { accent: a, accentInk: mode === "light" ? "#ffffff" : "#101014" };
}

/** Accent as DISPLAY TEXT (hero stat numerals, divider numerals): walk the
 * accent's lightness toward the readable side of `surface` until it clears
 * `min` (default the 4.5 body bar — large numerals in a brand color read as
 * content, not decoration). Pure + deterministic; renderers call this at
 * paint time so it also repairs palettes stored before the floor existed. */
export function accentTextShade(accentHex: string, surfaceHex: string, min = 4.5): string {
  if (paletteContrast(accentHex, surfaceHex) >= min) return accentHex;
  const dir = paletteLuminance(surfaceHex) >= 0.5 ? -1.5 : 1.5;
  let a = hexToHsl(accentHex);
  for (let i = 0; i < 66; i++) {
    a = { ...a, l: clamp(a.l + dir, 0, 100) };
    const hex = hslToHex(a.h, a.s, a.l);
    if (paletteContrast(hex, surfaceHex) >= min) return hex;
  }
  return hslToHex(a.h, a.s, a.l);
}

/** Hover/active accent states — shifted toward MORE contrast with the ink, then validated. */
function accentState(accent: Hsl, accentInk: string, delta: number): string {
  const dir = accentInk === "#ffffff" ? -1 : 1;
  let s = { ...accent, l: clamp(accent.l + dir * delta, 0, 100) };
  for (let i = 0; i < 40; i++) {
    if (paletteContrast(accentInk, hslToHex(s.h, s.s, s.l)) >= 4.5) break;
    s = { ...s, l: clamp(s.l + dir * 2, 0, 100) };
  }
  return hslToHex(s.h, s.s, s.l);
}

function borderFor(bg: Hsl, mode: PaletteMode): string {
  const dir = mode === "light" ? -1 : 1;
  let b: Hsl = { h: bg.h, s: Math.min(bg.s + 4, 40), l: clamp(bg.l + dir * 9, 0, 100) };
  const bgHex = hslToHex(bg.h, bg.s, bg.l);
  for (let i = 0; i < 40; i++) {
    if (paletteContrast(hslToHex(b.h, b.s, b.l), bgHex) >= 1.3) break;
    b = { ...b, l: clamp(b.l + dir * 2, 0, 100) };
  }
  return hslToHex(b.h, b.s, b.l);
}

// ── Topology recipes ─────────────────────────────────────────────────

type RawRoles = {
  bg: Hsl;
  surface: Hsl;
  surfaceAlt: Hsl;
  ink: Hsl;
  muted: Hsl;
  accent: Hsl;
  dominantHue: number;
  accentHue: number;
};

const COVERAGE: Record<PaletteTopology, AccentCoverage> = {
  "monochrome-plus-accent": "minimal",
  "neutral-plus-signal": "minimal",
  "black-white-material": "minimal",
  "tonal-single-hue": "moderate",
  "analogous-warm": "moderate",
  "analogous-cool": "moderate",
  "earth-plus-signal": "moderate",
  "multi-surface-editorial": "saturated",
};

/** Map any hue into [lo..hi] deterministically (identity when already inside). */
function intoRange(h: number, lo: number, hi: number): number {
  const w = Math.round(wrapHue(h));
  if (w >= lo && w <= hi) return w;
  return lo + (w % (hi - lo + 1));
}

/** Rotate a hue by `by` degrees, wrapping WITHIN [lo..hi]. */
function rotInRange(h: number, lo: number, hi: number, by: number): number {
  const span = hi - lo + 1;
  return lo + ((((Math.round(h) - lo + by) % span) + span) % span);
}

function recipe(
  topology: PaletteTopology,
  mode: PaletteMode,
  H: number,
  accentHueSeed: number | undefined,
  nonce: number,
): RawRoles {
  const light = mode === "light";
  const hj = bits(nonce, 0, 13) - 6; // ±6 neutral-field hue drift
  const sj = bits(nonce, 4, 9) - 4; // ±4 saturation drift
  const lj = bits(nonce, 8, 5) - 2; // ±2 bg lightness drift
  const aj = bits(nonce, 12, 11) - 5; // ±5 accent hue drift
  const alj = bits(nonce, 16, 7) - 3; // ±3 accent lightness drift

  const baseL = light ? clamp(96 + lj, 94, 98) : clamp(10 + Math.abs(lj), 9, 14);
  const accL = light ? 42 + alj : 58 + alj;

  const trio = (h: number, s: number): Pick<RawRoles, "bg" | "surface" | "surfaceAlt"> =>
    light
      ? {
          bg: { h, s, l: baseL },
          surface: { h, s: s + 2, l: baseL - 4 },
          surfaceAlt: { h, s: s + 4, l: baseL - 7 },
        }
      : {
          bg: { h, s: s + 2, l: baseL },
          surface: { h, s: s + 2, l: baseL + 4 },
          surfaceAlt: { h, s: s + 2, l: baseL + 8 },
        };
  const ink = (h: number, s: number): Hsl => (light ? { h, s, l: 13 } : { h, s: Math.min(s, 22), l: 93 });
  const muted = (h: number, s: number): Hsl => (light ? { h, s, l: 42 } : { h, s, l: 68 });

  switch (topology) {
    case "monochrome-plus-accent": {
      const nh = wrapHue(H + hj);
      const A = wrapHue(accentHueSeed ?? H + aj);
      return {
        ...trio(nh, clamp(7 + sj, 3, 12)),
        ink: ink(nh, 16),
        muted: muted(nh, 12),
        accent: { h: A, s: clamp(74 + sj, 60, 85), l: accL },
        dominantHue: nh,
        accentHue: A,
      };
    }
    case "neutral-plus-signal": {
      const nh = wrapHue(H + hj);
      const A = wrapHue(accentHueSeed ?? H + aj);
      return {
        ...trio(nh, 3),
        ink: ink(nh, 4),
        muted: muted(nh, 5),
        accent: { h: A, s: clamp(88 + sj, 78, 95), l: accL },
        dominantHue: nh,
        accentHue: A,
      };
    }
    case "tonal-single-hue": {
      const nh = wrapHue(H + hj);
      return {
        ...trio(nh, clamp(18 + sj, 10, 26)),
        ink: ink(nh, 38),
        muted: muted(nh, 26),
        accent: { h: nh, s: clamp(62 + sj, 50, 75), l: accL - 2 },
        dominantHue: nh,
        accentHue: nh,
      };
    }
    case "analogous-warm": {
      const nh = intoRange(H + hj, 15, 75);
      const A = accentHueSeed != null ? intoRange(accentHueSeed, 5, 85) : rotInRange(nh, 15, 75, 24 + aj);
      return {
        ...trio(nh, clamp(22 + sj, 14, 30)),
        ink: ink(nh, 26),
        muted: muted(nh, 20),
        accent: { h: A, s: clamp(76 + sj, 64, 86), l: accL },
        dominantHue: nh,
        accentHue: A,
      };
    }
    case "analogous-cool": {
      const nh = intoRange(H + hj, 175, 275);
      const A = accentHueSeed != null ? intoRange(accentHueSeed, 160, 290) : rotInRange(nh, 175, 275, 30 + aj);
      return {
        ...trio(nh, clamp(14 + sj, 8, 22)),
        ink: ink(nh, 22),
        muted: muted(nh, 16),
        accent: { h: A, s: clamp(70 + sj, 58, 82), l: accL },
        dominantHue: nh,
        accentHue: A,
      };
    }
    case "earth-plus-signal": {
      const nh = clamp(36 + hj, 28, 44);
      const A = wrapHue(accentHueSeed ?? H + aj);
      return {
        ...trio(nh, clamp(20 + sj, 12, 26)),
        ink: ink(28, 26),
        muted: muted(30, 18),
        accent: { h: A, s: clamp(82 + sj, 70, 90), l: accL },
        dominantHue: nh,
        accentHue: A,
      };
    }
    case "black-white-material": {
      const nh = 45;
      const base = trio(nh, light ? 4 : 3);
      return {
        ...base,
        // The "material" — one warm paper-tinted surface in an otherwise
        // achromatic scheme.
        surfaceAlt: { h: 42, s: 10, l: base.surfaceAlt.l },
        ink: light ? { h: 0, s: 0, l: 8 } : { h: 0, s: 0, l: 95 },
        muted: muted(nh, 4),
        // Accent stays material-monochrome: near-black chip (light) / near-white (dark).
        accent: light ? { h: nh, s: 8, l: 16 } : { h: nh, s: 6, l: 90 },
        dominantHue: nh,
        accentHue: wrapHue(H),
      };
    }
    case "multi-surface-editorial":
    default: {
      const nh = wrapHue(H + hj);
      const A = wrapHue(accentHueSeed ?? H + 160 + aj);
      const base = trio(nh, 7);
      return {
        bg: base.bg,
        surface: { h: nh, s: light ? 15 : 12, l: base.surface.l },
        surfaceAlt: { h: A, s: light ? 17 : 14, l: base.surfaceAlt.l },
        ink: ink(nh, 20),
        muted: muted(nh, 14),
        accent: { h: A, s: clamp(78 + sj, 66, 88), l: accL },
        dominantHue: nh,
        accentHue: A,
      };
    }
  }
}

// ── Fail-safe (known-AA) — only reachable if repair somehow fell short ─

function failSafePalette(topology: PaletteTopology, mode: PaletteMode, H: number): GeneratedPalette {
  const light = mode === "light";
  const failSafeSurfaces = light
    ? ["#ffffff", "#f4f4f2", "#ebebe8"]
    : ["#101214", "#17191c", "#1e2125"];
  const { accent, accentInk } = resolveAccent({ h: H, s: 70, l: light ? 36 : 58 }, mode, failSafeSurfaces);
  const roles: PaletteRoles = light
    ? {
        bg: "#ffffff", surface: "#f4f4f2", surfaceAlt: "#ebebe8",
        ink: "#16181a", muted: "#50555b",
        accent: hslToHex(accent.h, accent.s, accent.l), accentInk,
        accentHover: accentState(accent, accentInk, 6),
        accentActive: accentState(accent, accentInk, 11),
        border: "#d9d9d4", heroOverlayInk: "#fafaf9",
      }
    : {
        bg: "#101214", surface: "#17191c", surfaceAlt: "#1e2125",
        ink: "#f2f3f4", muted: "#a6adb8",
        accent: hslToHex(accent.h, accent.s, accent.l), accentInk,
        accentHover: accentState(accent, accentInk, 6),
        accentActive: accentState(accent, accentInk, 11),
        border: "#33383e", heroOverlayInk: "#f8f8f7",
      };
  return {
    ...roles,
    mode,
    topology,
    fingerprint: {
      topology,
      dominantHue: wrapHue(H),
      accentHue: Math.round(accent.h),
      surfaceLightnessCurve: light ? "100>96>92" : "7>10>13",
      accentCoverage: COVERAGE[topology],
    },
  };
}

// ── The generator ────────────────────────────────────────────────────

export function generatePalette(topology: PaletteTopology, seeds: PaletteSeeds): GeneratedPalette {
  const topo: PaletteTopology = (PALETTE_TOPOLOGIES as readonly string[]).includes(topology)
    ? topology
    : "neutral-plus-signal";
  const mode: PaletteMode = seeds.mode === "dark" ? "dark" : "light";
  const nonce = (seeds.nonce ?? 0) >>> 0;
  const H = wrapHue(Math.round(Number.isFinite(seeds.hue) ? seeds.hue : 0));

  const raw = recipe(topo, mode, H, seeds.accentHue, nonce);
  const surfaces = [raw.bg, raw.surface, raw.surfaceAlt].map((c) => hslToHex(c.h, c.s, c.l));

  const ink = repairFg(raw.ink, surfaces, 4.5, mode);
  const muted = repairFg(raw.muted, surfaces.slice(0, 2), 3.5, mode);
  const { accent, accentInk } = resolveAccent(raw.accent, mode, surfaces);

  const roles: PaletteRoles = {
    bg: surfaces[0],
    surface: surfaces[1],
    surfaceAlt: surfaces[2],
    ink: hslToHex(ink.h, ink.s, ink.l),
    muted: hslToHex(muted.h, muted.s, muted.l),
    accent: hslToHex(accent.h, accent.s, accent.l),
    accentInk,
    accentHover: accentState(accent, accentInk, 6),
    accentActive: accentState(accent, accentInk, 11),
    border: borderFor(raw.bg, mode),
    heroOverlayInk: hslToHex(raw.bg.h, Math.min(raw.bg.s, 14), 97),
  };

  if (validatePalette(roles).length > 0) {
    // Never emit a failing palette — snap to the known-AA fail-safe.
    return failSafePalette(topo, mode, H);
  }

  return {
    ...roles,
    mode,
    topology: topo,
    fingerprint: {
      topology: topo,
      dominantHue: Math.round(wrapHue(raw.dominantHue)),
      accentHue: Math.round(wrapHue(raw.accentHue)),
      surfaceLightnessCurve: `${Math.round(raw.bg.l)}>${Math.round(raw.surface.l)}>${Math.round(raw.surfaceAlt.l)}`,
      accentCoverage: COVERAGE[topo],
    },
  };
}
