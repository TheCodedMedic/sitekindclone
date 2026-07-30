// Client SDK for the Stage 2 vision judge (design-judge edge function).
//
// Flow: capture the rendered v1 preview to a JPEG data URL (html2canvas,
// lazy-loaded — it's the only reliable DOM→canvas capture and this is a
// demo-only path), POST it via /api/demo/design-judge, then apply the
// returned ENUM-VALID directives onto a copy of the design schema and
// recompose — "Draft v2 — refined by the design judge".
//
// The directive vocabulary below is a client-side port of DIRECTIVE_ENUMS /
// SECTION_VOCAB from supabase/functions/demo-research/design-schema-agent.ts
// (same source of truth the sol-judge and sanitizer enforce). Invalid
// directives are skipped, never guessed at — drift between the copies can
// only make the client MORE conservative.
//
// Framework-free on purpose (no React imports): scripts/test-design-judge.mjs
// imports this module directly under bun.

import type { BusinessProfile, DesignCandidate, DesignSchema } from "./demoApi";
import { PALETTE_TOPOLOGIES } from "../components/demo/previews/palette-engine";

// ── Types (mirror design-judge/core.ts) ──────────────────────────────

export type RenderProblem = { what: string; where: string; severity: "blocker" | "major" | "minor" };
export type RenderDirective = { axis: string; value: unknown; reason: string };
export type RenderCopyNote = { field: "heroHeadline" | "heroSub" | "tagline"; problem: string; suggestion: string };

export type RenderJudgeReview = {
  renderScore: number;
  topProblems: RenderProblem[];
  directives: RenderDirective[];
  copyNotes: RenderCopyNote[];
  verdict: "ship" | "refine";
  model?: string;
};

export type JudgeCallResult =
  | { ok: true; review: RenderJudgeReview }
  | { ok: false; status: number; error: string; code?: string };

// ── Directive vocabulary (client port) ───────────────────────────────

const setOf = (...vals: (string | number)[]) => new Set<unknown>(vals);

export const CLIENT_DIRECTIVE_ENUMS: Readonly<Record<string, ReadonlySet<unknown>>> = {
  "visual.paletteTopology": new Set<unknown>(PALETTE_TOPOLOGIES),
  "visual.motif": setOf("none", "ticker-marquee", "editorial-quote-slab", "sticky-side-label", "botanical-margin", "halftone-photo-grid", "full-bleed-color-band", "neon-underline", "diagonal-splice"),
  "visual.ornament": setOf("grain", "halftone", "grid", "botanical", "topo", "none"),
  "visual.density": setOf("airy", "regular", "dense"),
  "visual.mood": setOf("editorial", "catalog", "poster", "documentary", "boutique"),
  "visual.gridFamily": setOf("centered-column", "split-6-6", "split-5-7", "side-rail", "bento", "banded-full-bleed", "magazine-offset"),
  "visual.chrome.nav": setOf("slim", "inline", "center-stack", "cta-bar"),
  "visual.chrome.footer": setOf("slim-bar", "stacked-center", "mega-grid", "colophon"),
  "visual.typeDNA.scaleRatio": setOf(1.2, 1.333, 1.414, 1.5),
  "visual.typeDNA.heroSizeClass": setOf("compact", "standard", "oversized", "poster"),
  "visual.typeDNA.eyebrowTreatment": setOf("uppercase-tracked", "numbered", "rule-line", "side-tab", "none"),
  "visual.typeDNA.headingCase": setOf("mixed", "sentence", "uppercase"),
  "visual.typeDNA.displayWeight": setOf("light", "regular", "semibold", "black"),
  "visual.typeDNA.displayTracking": setOf("tight", "normal", "wide"),
  "visual.typeDNA.bodyMeasure": setOf("narrow", "regular", "wide"),
  "visual.layoutDNA.grid": setOf("symmetric", "asymmetric-left", "asymmetric-right", "off-center"),
  "visual.layoutDNA.rhythm": setOf("even", "syncopated", "staggered"),
  "visual.layoutDNA.edgeTreatment": setOf("contained", "bleed-left", "bleed-right", "full-bleed"),
  "visual.layoutDNA.verticalTypography": setOf("none", "left-rail", "right-rail"),
  "visual.layoutDNA.sectionDividers": setOf("none", "hairline", "numbered", "chapter"),
  "visual.layoutDNA.headerAlign": setOf("left", "center", "right", "justified"),
  "homepage.hero.variant": setOf("overlay", "split", "poster", "collage", "editorial-quote", "typographic-poster", "split-stage", "minimal-statement", "data-led"),
  "homepage.hero.trustChip": setOf("rating", "years", "local", "none"),
  "homepage.cta.placement": setOf("hero", "sticky", "both"),
  "content.servicesFraming": setOf("menu", "experiences", "packages", "process", "capabilities"),
  "content.serviceLayout": setOf("dotted", "cards", "numbered", "chips", "split"),
  "content.reviewLayout": setOf("cards", "spotlight", "strip"),
  "content.socialVariant": setOf("wall", "strip"),
};

export const CLIENT_SECTION_VOCAB: ReadonlySet<string> = new Set([
  "hero", "trust-bar", "services", "story", "gallery", "reviews", "hours-map", "cta-band", "social", "footer",
  "menu-board", "process-timeline", "before-after", "owner-letter", "neighborhood-map", "press-strip",
  "pricing-teaser", "faq-conversation", "hours-marquee", "credential-wall",
]);

// ── Directive validation + application (port of sol-judge's) ─────────

export function validateRenderDirective(d: RenderDirective): { ok: boolean; why?: string } {
  if (!d || typeof d.axis !== "string") return { ok: false, why: "malformed directive" };
  if (d.axis === "homepage.sections") {
    const v = d.value;
    if (!Array.isArray(v) || v.length < 3 || v.length > 12) return { ok: false, why: "sections must be an array of 3-12 ids" };
    if (v.some((s) => typeof s !== "string" || !CLIENT_SECTION_VOCAB.has(s))) return { ok: false, why: "sections contains an unknown id" };
    if (v[0] !== "hero" || v[v.length - 1] !== "footer") return { ok: false, why: "sections must start with hero and end with footer" };
    if (new Set(v).size !== v.length) return { ok: false, why: "sections contains duplicates" };
    return { ok: true };
  }
  const set = CLIENT_DIRECTIVE_ENUMS[d.axis];
  if (!set) return { ok: false, why: `unknown axis "${d.axis}"` };
  if (set.has(d.value)) return { ok: true };
  // Strict structured outputs stringify numeric enum values ("1.333") —
  // accept the numeric coercion when THAT is in the vocabulary.
  if (typeof d.value === "string" && d.value.trim() !== "" && set.has(Number(d.value))) return { ok: true };
  return { ok: false, why: `value ${JSON.stringify(d.value)} not in the ${d.axis} vocabulary` };
}

function setAxis(schema: Record<string, unknown>, axis: string, value: unknown): void {
  const parts = axis.split(".");
  let obj: Record<string, unknown> = schema;
  for (let i = 0; i < parts.length - 1; i++) {
    const cur = obj[parts[i]];
    if (cur == null || typeof cur !== "object" || Array.isArray(cur)) obj[parts[i]] = {};
    obj = obj[parts[i]] as Record<string, unknown>;
  }
  obj[parts[parts.length - 1]] = value;
}

/**
 * Apply enum-valid directives onto a CLONE of the schema (never mutates the
 * input). Invalid directives are skipped with a reason. Numeric-vocabulary
 * values arriving as strings are coerced before application.
 */
export function applyRenderDirectives(
  schema: DesignSchema,
  directives: RenderDirective[],
): { schema: DesignSchema; applied: string[]; skipped: string[] } {
  const applied: string[] = [];
  const skipped: string[] = [];
  const out = structuredClone(schema) as unknown as Record<string, unknown>;
  for (const d of (directives ?? []).slice(0, 6)) {
    const label = `${d?.axis}=${Array.isArray(d?.value) ? d.value.join(">") : String(d?.value)}`;
    const v = validateRenderDirective(d);
    if (!v.ok) {
      skipped.push(`${label} (${v.why})`);
      continue;
    }
    let value = d.value;
    if (d.axis !== "homepage.sections") {
      const set = CLIENT_DIRECTIVE_ENUMS[d.axis];
      if (set && !set.has(value) && typeof value === "string" && set.has(Number(value))) value = Number(value);
    }
    setAxis(out, d.axis, value);
    applied.push(label);
  }
  return { schema: out as unknown as DesignSchema, applied, skipped };
}

// ── Evidence summary (compact, client-side) ──────────────────────────
// The server-side judge grounds claims against this. The full evidence
// block lives server-side in demo-research; the client rebuilds a compact
// equivalent from the profile it already holds.

export function buildEvidenceSummary(profile: BusinessProfile): string {
  const lines: string[] = [
    `BUSINESS: ${profile.businessName} (${profile.vertical})`,
    `AREA: ${profile.serviceAreaLine || "unknown"}`,
  ];
  if (profile.rating != null) lines.push(`RATING: ${profile.rating}${profile.reviewCount != null ? ` (${profile.reviewCount} reviews)` : ""}`);
  if (profile.phone) lines.push(`PHONE: ${profile.phone}`);
  if (profile.address) lines.push(`ADDRESS: ${profile.address}`);
  if (profile.hoursLine) lines.push(`HOURS: ${profile.hoursLine}`);
  if (profile.services.length) {
    lines.push(`SERVICES: ${profile.services.map((s) => s.name).join("; ")}`);
  }
  for (const r of profile.reviews.slice(0, 3)) {
    lines.push(`REVIEW (${r.rating}/5, ${r.author}): "${r.quote}"`);
  }
  if (profile.about) lines.push(`ABOUT: ${profile.about.slice(0, 400)}`);
  return lines.join("\n").slice(0, 6000);
}

// ── Screenshot capture ───────────────────────────────────────────────
// html2canvas is lazy-imported so the demo bundle only pays for it when the
// user actually clicks "Refine". The capture takes the FULL node, then
// downscales/re-encodes until the JPEG data URL fits under the transport
// budget (proxy caps design-judge bodies at 2MB; edge fn rejects >1.5MB
// decoded — 1.2MB of data URL keeps comfortable margin under both).

export const MAX_CAPTURE_DATA_URL_CHARS = 1_200_000;
const CAPTURE_MAX_WIDTH = 1200;

// Stage A2 — arena captures run at a REDUCED budget: up to 4 images ride
// one request, so each stays ≤420KB of data URL (≈315KB decoded) at 900px
// wide. 4 × 420KB + schemas + evidence keeps the body comfortably under
// the 2MB /api/demo proxy cap AND the server's 1.6MB total decoded cap.
export const MAX_ARENA_CAPTURE_DATA_URL_CHARS = 420_000;
export const ARENA_CAPTURE_MAX_WIDTH = 900;

// A degenerate canvas (zero-size node, canvas area limit) makes toDataURL
// return "data:," — 6 chars, comfortably "under budget". Shipping that
// poisons the request: the server's data-URL regex rejects it and, on the
// arena path, 400s ALL candidates. Mirror the server's "implausibly small"
// floor (1KB decoded) client-side and treat such captures as failures.
export const MIN_CAPTURE_DATA_URL_CHARS = 2_000;

async function captureNodeToJpeg(node: HTMLElement, maxWidth: number, maxChars: number): Promise<string> {
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(node, {
    useCORS: true,
    scale: 1,
    logging: false,
    backgroundColor: "#ffffff",
  });

  let width = Math.min(canvas.width, maxWidth);
  for (let pass = 0; pass < 5; pass++) {
    const scaled = scaleCanvas(canvas, width);
    // Iterate quality first (cheap), then shrink dimensions.
    for (const quality of [0.82, 0.7, 0.58, 0.45]) {
      const dataUrl = scaled.toDataURL("image/jpeg", quality);
      if (
        dataUrl.length <= maxChars &&
        dataUrl.length >= MIN_CAPTURE_DATA_URL_CHARS &&
        dataUrl.startsWith("data:image/jpeg;base64,")
      ) return dataUrl;
    }
    width = Math.round(width * 0.75);
    if (width < 320) break;
  }
  throw new Error("Couldn't compress the draft screenshot enough to send");
}

export function captureNodeToJpegDataUrl(node: HTMLElement): Promise<string> {
  return captureNodeToJpeg(node, CAPTURE_MAX_WIDTH, MAX_CAPTURE_DATA_URL_CHARS);
}

/** Reduced-budget capture for the multi-image arena request. */
export function captureNodeToArenaJpegDataUrl(node: HTMLElement): Promise<string> {
  return captureNodeToJpeg(node, ARENA_CAPTURE_MAX_WIDTH, MAX_ARENA_CAPTURE_DATA_URL_CHARS);
}

function scaleCanvas(src: HTMLCanvasElement, targetWidth: number): HTMLCanvasElement {
  if (src.width <= targetWidth) return src;
  const ratio = targetWidth / src.width;
  const out = document.createElement("canvas");
  out.width = targetWidth;
  out.height = Math.max(1, Math.round(src.height * ratio));
  const ctx = out.getContext("2d");
  if (!ctx) return src;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, out.width, out.height);
  return out;
}

// ── The judge request ────────────────────────────────────────────────
// Never throws on judge/API failure — returns { ok: false } so the caller
// keeps v1 with a friendly note (failure continuity, same invariant as the
// server-side sol-judge loop).

const SEVERITIES = new Set(["blocker", "major", "minor"]);
const COPY_FIELDS = new Set(["heroHeadline", "heroSub", "tagline"]);

export function parseJudgePayload(j: unknown): RenderJudgeReview | null {
  if (!j || typeof j !== "object" || Array.isArray(j)) return null;
  const p = j as Record<string, unknown>;
  const n = typeof p.renderScore === "number" ? p.renderScore : Number(p.renderScore);
  if (!Number.isFinite(n)) return null;
  const renderScore = Math.max(0, Math.min(100, Math.round(n)));
  const topProblems: RenderProblem[] = Array.isArray(p.topProblems)
    ? (p.topProblems as Record<string, unknown>[])
        .filter((x) => x && typeof x === "object" && typeof x.what === "string")
        .slice(0, 8)
        .map((x) => ({
          what: String(x.what).slice(0, 300),
          where: typeof x.where === "string" ? x.where.slice(0, 120) : "",
          severity: (SEVERITIES.has(x.severity as string) ? x.severity : "minor") as RenderProblem["severity"],
        }))
    : [];
  const directives: RenderDirective[] = Array.isArray(p.directives)
    ? (p.directives as Record<string, unknown>[])
        .filter((d) => d && typeof d === "object" && typeof d.axis === "string")
        .slice(0, 6)
        .map((d) => ({ axis: String(d.axis).slice(0, 60), value: d.value, reason: typeof d.reason === "string" ? d.reason.slice(0, 200) : "" }))
    : [];
  const copyNotes: RenderCopyNote[] = Array.isArray(p.copyNotes)
    ? (p.copyNotes as Record<string, unknown>[])
        .filter((c) => c && typeof c === "object" && COPY_FIELDS.has(c.field as string))
        .slice(0, 3)
        .map((c) => ({
          field: c.field as RenderCopyNote["field"],
          problem: typeof c.problem === "string" ? c.problem.slice(0, 240) : "",
          suggestion: typeof c.suggestion === "string" ? c.suggestion.slice(0, 240) : "",
        }))
    : [];
  const verdict: "ship" | "refine" = p.verdict === "ship" ? "ship" : "refine";
  const model = typeof p.model === "string" ? p.model : undefined;
  return { renderScore, topProblems, directives, copyNotes, verdict, model };
}

export async function requestDesignJudge(input: {
  leadId: string;
  imageDataUrl: string;
  schema: DesignSchema;
  evidence: string;
  /** Optional caller-owned cancellation (Stage A2 pre-reveal flow). When
   * absent, a 90s default timeout keeps the UI from spinning forever. */
  signal?: AbortSignal;
}): Promise<JudgeCallResult> {
  const { signal, ...body } = input;
  try {
    const res = await fetch("/api/demo/design-judge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      // The judge reviews a high-detail image with reasoning — 15-45s is
      // normal. Cap at 90s so the UI never spins forever.
      signal: signal ?? AbortSignal.timeout(90_000),
    });
    let payload: unknown = null;
    try { payload = await res.json(); } catch { /* non-JSON error body */ }
    if (!res.ok) {
      const p = (payload ?? {}) as { error?: unknown; code?: unknown };
      return {
        ok: false,
        status: res.status,
        error: typeof p.error === "string" ? p.error : `Judge request failed (${res.status})`,
        code: typeof p.code === "string" ? p.code : undefined,
      };
    }
    const review = parseJudgePayload(payload);
    if (!review) return { ok: false, status: res.status, error: "Judge returned an unreadable response" };
    return { ok: true, review };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, error: /timeout|abort/i.test(msg) ? "The judge took too long — try again" : msg };
  }
}

// ═════════════════════════════════════════════════════════════════════
// Stage A2 — the client ARENA call: 2-4 rival renders of the SAME
// business POSTed to the same endpoint ({ leadId, images, schemas,
// evidence }); GPT-5.6-SOL ranks them in ONE multi-image call and returns
// { rankings, winnerLabel, directives, copyNotes, confidence }. Same
// failure-continuity invariant: never throws, { ok: false } means the
// caller reveals the tournament winner untouched.
// ═════════════════════════════════════════════════════════════════════

export type ArenaRanking = { label: string; renderScore: number; oneLineVerdict: string };

export type ArenaJudgeReview = {
  rankings: ArenaRanking[];
  winnerLabel: string;
  directives: RenderDirective[];
  copyNotes: RenderCopyNote[];
  confidence: number;
  model?: string;
};

export type ArenaCallResult =
  | { ok: true; review: ArenaJudgeReview }
  | { ok: false; status: number; error: string; code?: string };

/**
 * Belt-and-braces parse of the arena response (mirrors the server's
 * parseArenaJudgeResponse): rankings filtered to the REQUEST labels
 * (dupes dropped, first wins), scores clamped 0-100, sorted best-first;
 * a winnerLabel outside the label set coerces to the top-ranked
 * candidate. Null when no ranking survives — a verdict about nobody is
 * unusable.
 */
export function parseArenaPayload(j: unknown, labels: readonly string[]): ArenaJudgeReview | null {
  if (!j || typeof j !== "object" || Array.isArray(j)) return null;
  const p = j as Record<string, unknown>;
  const known = new Set(labels);
  const seen = new Set<string>();
  const rankings: ArenaRanking[] = Array.isArray(p.rankings)
    ? (p.rankings as Record<string, unknown>[])
        .filter((r) => {
          if (!r || typeof r !== "object" || typeof r.label !== "string") return false;
          const label = r.label.trim();
          if (!known.has(label) || seen.has(label)) return false;
          const n = typeof r.renderScore === "number" ? r.renderScore : Number(r.renderScore);
          if (!Number.isFinite(n)) return false;
          seen.add(label);
          return true;
        })
        .map((r) => ({
          label: String(r.label).trim(),
          renderScore: Math.max(0, Math.min(100, Math.round(Number(r.renderScore)))),
          oneLineVerdict: typeof r.oneLineVerdict === "string" ? r.oneLineVerdict.slice(0, 240) : "",
        }))
        .sort((a, b) => b.renderScore - a.renderScore)
    : [];
  if (rankings.length === 0) return null;
  const rawWinner = typeof p.winnerLabel === "string" ? p.winnerLabel.trim() : "";
  const winnerLabel = known.has(rawWinner) ? rawWinner : rankings[0].label;
  const directives: RenderDirective[] = Array.isArray(p.directives)
    ? (p.directives as Record<string, unknown>[])
        .filter((d) => d && typeof d === "object" && typeof d.axis === "string")
        .slice(0, 6)
        .map((d) => ({ axis: String(d.axis).slice(0, 60), value: d.value, reason: typeof d.reason === "string" ? d.reason.slice(0, 200) : "" }))
    : [];
  const copyNotes: RenderCopyNote[] = Array.isArray(p.copyNotes)
    ? (p.copyNotes as Record<string, unknown>[])
        .filter((c) => c && typeof c === "object" && COPY_FIELDS.has(c.field as string))
        .slice(0, 3)
        .map((c) => ({
          field: c.field as RenderCopyNote["field"],
          problem: typeof c.problem === "string" ? c.problem.slice(0, 240) : "",
          suggestion: typeof c.suggestion === "string" ? c.suggestion.slice(0, 240) : "",
        }))
    : [];
  const rawConfidence = typeof p.confidence === "number" ? p.confidence : Number(p.confidence);
  const confidence = Number.isFinite(rawConfidence) ? Math.max(0, Math.min(1, rawConfidence)) : 0;
  const model = typeof p.model === "string" ? p.model : undefined;
  return { rankings, winnerLabel, directives, copyNotes, confidence, model };
}

// Result-frame candidates are typed but network-borne — treat them as
// untrusted. Anything that survives is safe to render hidden and safe to
// send: labels are the server's own B/C/D vocabulary (unique, so the arena
// request can't 400 on duplicates) and every render axis the preview and
// the arena endpoint need is a real object (so a truncated candidate can't
// crash the hidden render or ship an empty schema).
const ARENA_RIVAL_LABELS: ReadonlySet<string> = new Set(["B", "C", "D"]);
const MAX_ARENA_RIVALS = 3;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

export function sanitizeArenaCandidates(candidates: readonly DesignCandidate[] | null | undefined): DesignCandidate[] {
  const out: DesignCandidate[] = [];
  const seen = new Set<string>();
  for (const c of candidates ?? []) {
    if (out.length >= MAX_ARENA_RIVALS) break;
    if (!isPlainObject(c)) continue;
    const label = typeof c.label === "string" ? c.label : "";
    if (!ARENA_RIVAL_LABELS.has(label) || seen.has(label)) continue;
    const s = c.schema as unknown;
    if (!isPlainObject(s) || !isPlainObject(s.visual) || !isPlainObject(s.homepage) || !isPlainObject(s.content)) continue;
    seen.add(label);
    out.push(c);
  }
  return out;
}

export async function requestArenaJudge(input: {
  leadId: string;
  images: { imageDataUrl: string; label: string }[];
  schemas: Record<string, unknown>[];
  evidence: string;
  /** Caller-owned cancellation — the Stage A2 flow aborts on "Start over"
   * and on the hard reveal ceiling. Default 90s timeout when absent. */
  signal?: AbortSignal;
}): Promise<ArenaCallResult> {
  const { signal, ...body } = input;
  try {
    const res = await fetch("/api/demo/design-judge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: signal ?? AbortSignal.timeout(90_000),
    });
    let payload: unknown = null;
    try { payload = await res.json(); } catch { /* non-JSON error body */ }
    if (!res.ok) {
      const p = (payload ?? {}) as { error?: unknown; code?: unknown };
      return {
        ok: false,
        status: res.status,
        error: typeof p.error === "string" ? p.error : `Arena request failed (${res.status})`,
        code: typeof p.code === "string" ? p.code : undefined,
      };
    }
    const review = parseArenaPayload(payload, input.images.map((im) => im.label));
    if (!review) return { ok: false, status: res.status, error: "Arena judge returned an unreadable response" };
    return { ok: true, review };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, error: /timeout|abort/i.test(msg) ? "The arena judge took too long" : msg };
  }
}
