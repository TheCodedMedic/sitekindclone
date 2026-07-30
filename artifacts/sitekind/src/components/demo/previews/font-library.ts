// font-library.ts — curated Google-Fonts pairing library for the /demo design compiler.
//
// CANONICAL: supabase/functions/demo-research/font-library.ts
// MIRROR:    src/components/demo/previews/font-library.ts
// The two copies MUST stay byte-identical — scripts/test-design-engines.mjs
// enforces the sync (same convention as entity-match.ts / demo-report).
//
// Pure + dependency-free (no React, no Deno, no DOM APIs).
//
// 36 display+body pairings with structured metadata (archetype, personality
// traits, x-height / stroke-contrast classes, variable axes, recommended
// roles, pairing key), a deterministic selection scorer (brand fit, vertical
// fit, distinctiveness vs a recent-corpus input, readability floor: a
// display-only face is NEVER assigned the body role), and typographic
// fingerprint generation.

// ── Faces ────────────────────────────────────────────────────────────

export type XHeightClass = "low" | "medium" | "high";
export type StrokeContrastClass = "low" | "medium" | "high";
export type FontCategory = "serif" | "sans" | "mono" | "display";

export type FontFace = {
  /** Google Fonts family name, exactly as the css2 API expects. */
  family: string;
  category: FontCategory;
  /** CSS fallback stack appended after the family. */
  fallback: string;
  /** Weights worth loading for this face. */
  weights: number[];
  /** Whether the italic axis is worth loading. */
  italics: boolean;
  /** Registered variable axes (empty = static family). */
  variableAxes: string[];
  xHeightClass: XHeightClass;
  /** Stroke (thick/thin) contrast of the face. */
  contrastClass: StrokeContrastClass;
  /** Display-only faces must never carry the body role (readability floor). */
  displayOnly: boolean;
};

function face(
  family: string,
  category: FontCategory,
  fallback: string,
  weights: number[],
  italics: boolean,
  variableAxes: string[],
  xHeightClass: XHeightClass,
  contrastClass: StrokeContrastClass,
  displayOnly: boolean,
): FontFace {
  return { family, category, fallback, weights, italics, variableAxes, xHeightClass, contrastClass, displayOnly };
}

const SANS = "system-ui, sans-serif";
const SERIF = "Georgia, serif";
const MONO = "'Courier New', monospace";

export const FONT_FACES: Record<string, FontFace> = {
  "Instrument Sans": face("Instrument Sans", "sans", SANS, [400, 500, 600, 700], false, ["wght", "wdth"], "high", "low", false),
  "Source Serif 4": face("Source Serif 4", "serif", SERIF, [400, 600, 700], true, ["wght", "opsz"], "medium", "medium", false),
  Inter: face("Inter", "sans", SANS, [400, 500, 600, 700], false, ["wght", "opsz"], "high", "low", false),
  "IBM Plex Mono": face("IBM Plex Mono", "mono", MONO, [400, 500, 600], false, [], "medium", "low", false),
  "Space Grotesk": face("Space Grotesk", "sans", SANS, [400, 500, 600, 700], false, ["wght"], "medium", "low", false),
  "DM Sans": face("DM Sans", "sans", SANS, [400, 500, 600, 700], false, ["wght", "opsz"], "medium", "low", false),
  "Public Sans": face("Public Sans", "sans", SANS, [400, 500, 600, 700], false, ["wght"], "high", "low", false),
  "IBM Plex Sans": face("IBM Plex Sans", "sans", SANS, [400, 500, 600, 700], false, ["wght", "wdth"], "high", "low", false),
  "Instrument Serif": face("Instrument Serif", "serif", SERIF, [400], true, [], "low", "medium", true),
  Newsreader: face("Newsreader", "serif", SERIF, [400, 500, 600, 700], true, ["wght", "opsz"], "medium", "medium", false),
  "Cormorant Garamond": face("Cormorant Garamond", "serif", SERIF, [400, 500, 600, 700], true, ["wght"], "low", "high", true),
  Manrope: face("Manrope", "sans", SANS, [400, 500, 600, 700, 800], false, ["wght"], "high", "low", false),
  "Bodoni Moda": face("Bodoni Moda", "serif", SERIF, [400, 500, 600, 700, 900], true, ["wght", "opsz"], "low", "high", true),
  Urbanist: face("Urbanist", "sans", SANS, [400, 500, 600, 700], false, ["wght"], "medium", "low", false),
  Literata: face("Literata", "serif", SERIF, [400, 500, 600, 700], true, ["wght", "opsz"], "medium", "medium", false),
  "Source Sans 3": face("Source Sans 3", "sans", SANS, [400, 600, 700], false, ["wght"], "high", "low", false),
  "Libre Baskerville": face("Libre Baskerville", "serif", SERIF, [400, 700], true, [], "medium", "high", false),
  "Libre Franklin": face("Libre Franklin", "sans", SANS, [400, 500, 600, 700], false, ["wght"], "high", "low", false),
  "Playfair Display": face("Playfair Display", "serif", SERIF, [400, 500, 600, 700, 900], true, ["wght"], "medium", "high", true),
  Karla: face("Karla", "sans", SANS, [400, 500, 600, 700], false, ["wght"], "high", "low", false),
  "Archivo Black": face("Archivo Black", "display", "'Impact', sans-serif", [400], false, [], "high", "low", true),
  Syne: face("Syne", "display", SANS, [400, 500, 600, 700, 800], false, ["wght"], "medium", "low", true),
  Unbounded: face("Unbounded", "display", SANS, [400, 500, 600, 700, 900], false, ["wght"], "medium", "low", true),
  Oxanium: face("Oxanium", "display", SANS, [400, 500, 600, 700, 800], false, ["wght"], "medium", "low", true),
  "Azeret Mono": face("Azeret Mono", "mono", MONO, [400, 500], false, ["wght"], "high", "low", false),
  "Bebas Neue": face("Bebas Neue", "display", "'Impact', sans-serif", [400], false, [], "high", "low", true),
  "Space Mono": face("Space Mono", "mono", MONO, [400, 700], true, [], "medium", "low", false),
  Marcellus: face("Marcellus", "serif", SERIF, [400], false, [], "medium", "medium", true),
  Montserrat: face("Montserrat", "sans", SANS, [400, 500, 600, 700], false, ["wght"], "high", "low", false),
  "Bricolage Grotesque": face("Bricolage Grotesque", "sans", SANS, [400, 500, 600, 700, 800], false, ["wght", "opsz", "wdth"], "high", "low", false),
  "Fragment Mono": face("Fragment Mono", "mono", MONO, [400], true, [], "medium", "low", false),
  Fraunces: face("Fraunces", "serif", SERIF, [400, 500, 600, 700, 900], true, ["wght", "opsz", "SOFT", "WONK"], "medium", "high", false),
  Lora: face("Lora", "serif", SERIF, [400, 500, 600, 700], true, ["wght"], "medium", "medium", false),
  "Nunito Sans": face("Nunito Sans", "sans", SANS, [400, 600, 700], false, ["wght", "opsz", "wdth", "YTLC"], "high", "low", false),
  "Young Serif": face("Young Serif", "serif", SERIF, [400], false, [], "medium", "medium", true),
  "Work Sans": face("Work Sans", "sans", SANS, [400, 500, 600, 700], false, ["wght"], "high", "low", false),
  Bitter: face("Bitter", "serif", SERIF, [400, 500, 600, 700], true, ["wght"], "high", "low", false),
  Fredoka: face("Fredoka", "display", SANS, [400, 500, 600, 700], false, ["wght", "wdth"], "high", "low", true),
  Figtree: face("Figtree", "sans", SANS, [400, 500, 600, 700], false, ["wght"], "high", "low", false),
  "Barlow Condensed": face("Barlow Condensed", "display", SANS, [400, 500, 600, 700], false, [], "medium", "low", true),
  Barlow: face("Barlow", "sans", SANS, [400, 500, 600, 700], false, [], "medium", "low", false),
  Anton: face("Anton", "display", "'Impact', sans-serif", [400], false, [], "high", "low", true),
  "Roboto Condensed": face("Roboto Condensed", "sans", SANS, [400, 500, 600, 700], false, ["wght"], "high", "low", false),
  "Roboto Serif": face("Roboto Serif", "serif", SERIF, [400, 500, 600, 700], true, ["wght", "opsz", "wdth"], "high", "medium", false),
  "DM Serif Display": face("DM Serif Display", "serif", SERIF, [400], true, [], "medium", "high", true),
  Sora: face("Sora", "sans", SANS, [400, 500, 600, 700], false, ["wght"], "medium", "low", false),
  "Crimson Pro": face("Crimson Pro", "serif", SERIF, [400, 500, 600, 700], true, ["wght"], "low", "medium", false),
  Outfit: face("Outfit", "sans", SANS, [400, 500, 600, 700], false, ["wght"], "medium", "low", false),
  "Zilla Slab": face("Zilla Slab", "serif", SERIF, [400, 500, 600, 700], true, ["wght"], "medium", "low", false),
  Spectral: face("Spectral", "serif", SERIF, [400, 500, 600, 700], true, ["wght"], "medium", "medium", false),
  "League Spartan": face("League Spartan", "display", SANS, [400, 500, 600, 700, 800], false, ["wght"], "high", "low", true),
};

// ── Pairings ─────────────────────────────────────────────────────────

export type PairingTone = "premium" | "budget" | "neutral";
export type PairingTreatment = "normal" | "italic" | "uppercase";

export type FontPairing = {
  id: string;
  /** Stable identity key: "Display+Body". */
  pairingKey: string;
  /** Design archetype per the playbook §8 vocabulary. */
  archetype: string;
  display: FontFace;
  body: FontFace;
  tone: PairingTone;
  /** Lowercase adjectives — matched against designBrief.personality. */
  personalityTraits: string[];
  /** Verticals this pairing has natural affinity with. */
  verticalAffinity: string[];
  recommendedRoles: { display: string[]; body: string[] };
  /** Default display treatment the pairing wants (caps faces → uppercase). */
  displayTreatment: PairingTreatment;
};

function pairing(
  id: string,
  archetype: string,
  displayFam: string,
  bodyFam: string,
  tone: PairingTone,
  personalityTraits: string[],
  verticalAffinity: string[],
  displayTreatment: PairingTreatment = "normal",
): FontPairing {
  const display = FONT_FACES[displayFam];
  const body = FONT_FACES[bodyFam];
  if (!display || !body) throw new Error(`font-library: unknown face in pairing ${id}`);
  if (body.displayOnly) throw new Error(`font-library: display-only face "${bodyFam}" assigned body role in ${id}`);
  return {
    id,
    pairingKey: `${display.family}+${body.family}`,
    archetype,
    display,
    body,
    tone,
    personalityTraits,
    verticalAffinity,
    recommendedRoles: {
      display: ["hero", "section-title", "pull-quote"],
      body: ["body", "ui", "caption"],
    },
    displayTreatment,
  };
}

export const FONT_PAIRINGS: readonly FontPairing[] = [
  pairing("instrument-sourceserif", "modern-editorial", "Instrument Sans", "Source Serif 4", "neutral",
    ["clean", "contemporary", "credible", "polished", "professional"], ["generic", "beauty-wellness"]),
  pairing("inter-plexmono", "systematic-technical", "Inter", "IBM Plex Mono", "neutral",
    ["precise", "technical", "modern", "efficient", "responsive"], ["trades", "auto-carwash", "generic"]),
  pairing("grotesk-dmsans", "geometric-contemporary", "Space Grotesk", "DM Sans", "neutral",
    ["modern", "friendly", "sleek", "quick", "clean"], ["auto-carwash", "fitness", "generic"]),
  pairing("sourceserif-public", "civic-editorial", "Source Serif 4", "Public Sans", "neutral",
    ["trustworthy", "established", "clear", "professional", "local"], ["generic", "trades"]),
  pairing("plex-duo", "engineered-utilitarian", "IBM Plex Sans", "IBM Plex Mono", "neutral",
    ["precise", "industrial", "dependable", "methodical", "thorough"], ["trades", "auto-carwash"]),
  pairing("instrumentserif-sans", "contemporary-serif-display", "Instrument Serif", "Instrument Sans", "premium",
    ["elegant", "warm", "refined", "boutique", "welcoming"], ["restaurant-hospitality", "beauty-wellness"]),
  pairing("newsreader-inter", "news-editorial", "Newsreader", "Inter", "neutral",
    ["literary", "thoughtful", "credible", "calm", "professional"], ["generic", "restaurant-hospitality"]),
  pairing("cormorant-manrope", "romantic-classical", "Cormorant Garamond", "Manrope", "premium",
    ["elegant", "graceful", "luxurious", "serene", "calming"], ["beauty-wellness", "restaurant-hospitality"]),
  pairing("bodoni-urbanist", "didone-fashion", "Bodoni Moda", "Urbanist", "premium",
    ["dramatic", "fashionable", "upscale", "bold", "polished"], ["beauty-wellness", "fitness"]),
  pairing("literata-sourcesans", "bookish-humanist", "Literata", "Source Sans 3", "neutral",
    ["warm", "literary", "honest", "approachable", "personal"], ["generic", "restaurant-hospitality"]),
  pairing("baskerville-franklin", "traditional-trustworthy", "Libre Baskerville", "Libre Franklin", "premium",
    ["established", "classic", "trustworthy", "formal", "reliable"], ["generic", "trades"]),
  pairing("playfair-karla", "classical-contrast", "Playfair Display", "Karla", "premium",
    ["elegant", "timeless", "refined", "welcoming", "graceful"], ["restaurant-hospitality", "beauty-wellness"]),
  pairing("archivoblack-plexmono", "industrial-poster", "Archivo Black", "IBM Plex Mono", "budget",
    ["bold", "rugged", "loud", "industrial", "tough"], ["trades", "fitness"], "uppercase"),
  pairing("syne-grotesk", "avant-garde", "Syne", "Space Grotesk", "neutral",
    ["creative", "unconventional", "artistic", "striking", "modern"], ["beauty-wellness", "generic"]),
  pairing("unbounded-inter", "expanded-futurist", "Unbounded", "Inter", "neutral",
    ["futuristic", "bold", "confident", "energetic", "intense"], ["fitness", "auto-carwash"]),
  pairing("oxanium-azeret", "techno-angular", "Oxanium", "Azeret Mono", "budget",
    ["technical", "sharp", "modern", "quick", "efficient"], ["auto-carwash", "fitness"]),
  pairing("bebas-spacemono", "condensed-athletic", "Bebas Neue", "Space Mono", "budget",
    ["energetic", "athletic", "intense", "direct", "driven"], ["fitness", "trades"], "uppercase"),
  pairing("marcellus-montserrat", "inscriptional-classic", "Marcellus", "Montserrat", "premium",
    ["timeless", "dignified", "serene", "upscale", "refined"], ["beauty-wellness", "restaurant-hospitality"]),
  pairing("bricolage-fragment", "characterful-grotesque", "Bricolage Grotesque", "Fragment Mono", "neutral",
    ["plainspoken", "characterful", "friendly", "contemporary", "practical"], ["generic", "trades"]),
  pairing("fraunces-dmsans", "soft-serif-warm", "Fraunces", "DM Sans", "neutral",
    ["warm", "artisanal", "inviting", "editorial", "cozy"], ["restaurant-hospitality", "beauty-wellness", "generic"]),
  pairing("lora-nunito", "humane-serif", "Lora", "Nunito Sans", "neutral",
    ["gentle", "caring", "trustworthy", "calm", "calming"], ["beauty-wellness", "generic"]),
  pairing("youngserif-worksans", "chunky-retro-serif", "Young Serif", "Work Sans", "neutral",
    ["hearty", "nostalgic", "friendly", "crafted", "casual"], ["restaurant-hospitality", "generic"]),
  pairing("bitter-sourcesans", "slab-sturdy", "Bitter", "Source Sans 3", "budget",
    ["sturdy", "dependable", "practical", "grounded", "honest"], ["trades", "auto-carwash"]),
  pairing("fredoka-figtree", "rounded-playful", "Fredoka", "Figtree", "budget",
    ["playful", "cheerful", "upbeat", "friendly", "welcoming"], ["auto-carwash", "fitness", "generic"]),
  pairing("barlowcond-barlow", "condensed-workshop", "Barlow Condensed", "Barlow", "budget",
    ["practical", "hardworking", "direct", "honest", "dependable"], ["trades", "auto-carwash"], "uppercase"),
  pairing("anton-robotocond", "impact-block", "Anton", "Roboto Condensed", "budget",
    ["loud", "strong", "athletic", "urgent", "energetic"], ["fitness", "trades"], "uppercase"),
  pairing("robotoserif-plexsans", "pragmatic-serif", "Roboto Serif", "IBM Plex Sans", "neutral",
    ["balanced", "credible", "modern", "practical", "professional"], ["generic", "trades"]),
  pairing("literata-public", "editorial-civic", "Literata", "Public Sans", "neutral",
    ["informed", "credible", "calm", "local", "clear"], ["generic"]),
  pairing("dmserif-dmsans", "warm-didone-lite", "DM Serif Display", "DM Sans", "premium",
    ["charming", "polished", "welcoming", "classic", "warm"], ["restaurant-hospitality", "beauty-wellness"]),
  pairing("sora-inter", "geometric-tech", "Sora", "Inter", "neutral",
    ["sleek", "precise", "contemporary", "minimal", "quick"], ["auto-carwash", "generic"]),
  pairing("crimson-worksans", "literary-humanist", "Crimson Pro", "Work Sans", "premium",
    ["scholarly", "warm", "refined", "sincere", "personal"], ["generic", "beauty-wellness"]),
  pairing("outfit-sourcesans", "rounded-geometric", "Outfit", "Source Sans 3", "neutral",
    ["modern", "approachable", "clean", "optimistic", "supportive"], ["fitness", "generic"]),
  pairing("zilla-inter", "slab-contemporary", "Zilla Slab", "Inter", "neutral",
    ["confident", "sturdy", "open", "modern", "reliable"], ["trades", "generic"]),
  pairing("spectral-karla", "screen-serif", "Spectral", "Karla", "premium",
    ["editorial", "considered", "elegant", "quiet", "polished"], ["beauty-wellness", "generic"]),
  pairing("leaguespartan-franklin", "geometric-poster", "League Spartan", "Libre Franklin", "neutral",
    ["bold", "geometric", "assertive", "strong", "focused"], ["fitness", "trades", "generic"], "uppercase"),
  pairing("manrope-lora", "sans-forward-literary", "Manrope", "Lora", "neutral",
    ["modern", "warm", "thoughtful", "balanced", "personal"], ["generic", "beauty-wellness"]),
];

// ── CSS stacks + load specs ──────────────────────────────────────────

export type FontLoadSpec = { family: string; weights: number[]; italics?: boolean };

/** Full CSS font-family stack for a face (family + fallback). */
export function cssStack(f: FontFace): string {
  return `'${f.family}', ${f.fallback}`;
}

/** The Google-Fonts load requests a pairing needs (display + body, deduped). */
export function fontLoadSpecs(p: FontPairing): FontLoadSpec[] {
  const specs: FontLoadSpec[] = [{ family: p.display.family, weights: p.display.weights, italics: p.display.italics }];
  if (p.body.family !== p.display.family) {
    specs.push({ family: p.body.family, weights: p.body.weights, italics: p.body.italics });
  }
  return specs;
}

// ── Selection scorer ─────────────────────────────────────────────────

export type FontSelectionContext = {
  /** Lowercase brand adjectives (designBrief.personality). */
  personality?: string[];
  vertical?: string;
  pricePosition?: "budget" | "mid" | "premium" | "luxury";
  /** Family names used recently in the corpus — distinctiveness penalty. */
  recentFonts?: string[];
  /** Seeded 32-bit nonce — deterministic tiebreak jitter. */
  nonce?: number;
};

/**
 * Brand fit (personality trait overlap) + vertical fit + price-tone match,
 * minus a distinctiveness penalty for families already seen in the recent
 * corpus. Pure and deterministic.
 */
export function scoreFontPairing(p: FontPairing, ctx: FontSelectionContext): number {
  let score = 0;
  const traits = new Set(p.personalityTraits);
  for (const adj of ctx.personality ?? []) {
    if (typeof adj === "string" && traits.has(adj.trim().toLowerCase())) score += 1;
  }
  if (ctx.vertical && p.verticalAffinity.includes(ctx.vertical)) score += 1.5;
  if (ctx.pricePosition && p.tone !== "neutral") {
    const wanted = ctx.pricePosition === "luxury" ? "premium" : ctx.pricePosition;
    score += p.tone === wanted ? 0.75 : -0.5;
  }
  const recent = new Set((ctx.recentFonts ?? []).map((f) => String(f).trim().toLowerCase()).filter(Boolean));
  if (recent.has(p.display.family.toLowerCase())) score -= 2;
  if (recent.has(p.body.family.toLowerCase())) score -= 1;
  return score;
}

/**
 * Deterministic pairing selection: highest score wins; a seeded jitter
 * (< 0.7, below one personality-trait hit) breaks ties so evidence-similar
 * businesses spread across the eligible pairings. Readability floor: any
 * pairing whose body face is display-only is skipped outright (none exist
 * in the library — the guard is a hard invariant, tested).
 */
export function selectFontPairing(ctx: FontSelectionContext): FontPairing {
  const nonce = (ctx.nonce ?? 0) >>> 0;
  let best: FontPairing | null = null;
  let bestScore = -Infinity;
  for (let i = 0; i < FONT_PAIRINGS.length; i++) {
    const p = FONT_PAIRINGS[i];
    if (p.body.displayOnly) continue; // readability floor
    const h = (Math.imul(nonce ^ (i + 1), 2654435761) >>> 0) % 1000;
    const s = scoreFontPairing(p, ctx) + (h / 1000) * 0.7;
    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }
  return best ?? FONT_PAIRINGS[0];
}

// ── Typographic fingerprint ──────────────────────────────────────────

export type TypographicFingerprintOpts = {
  displayWeight?: number;
  headingCase?: string;
  displayTracking?: string;
  scaleRatio?: number;
  bodyMeasure?: number | string;
};

/**
 * Stable fingerprint of a resolved typographic identity: family pairing +
 * weight/width axes + case + tracking + scale ratio + measure. Used by the
 * memory layer to track which typographic identities repeat.
 */
export function typographicFingerprint(p: FontPairing, opts: TypographicFingerprintOpts = {}): string {
  return [
    p.pairingKey,
    `w${opts.displayWeight ?? 400}`,
    `ax:${p.display.variableAxes.join(",") || "static"}`,
    `case:${opts.headingCase ?? "mixed"}`,
    `trk:${opts.displayTracking ?? "normal"}`,
    `sr:${opts.scaleRatio ?? 1.333}`,
    `m:${opts.bodyMeasure ?? "regular"}`,
  ].join("|");
}
