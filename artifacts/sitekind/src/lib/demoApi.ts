// Client SDK for the /demo research pipeline.

export type DemoFlow = "has-site" | "no-site";

export type DemoIntake = {
  flow: DemoFlow;
  domain?: string;
  businessName?: string;
  description?: string;
  city: string;
  state: string;
  radiusMiles?: number;
  phone?: string;
  turnstileToken?: string | null;
};

export type StepEvent = {
  type: "step";
  id: "captcha" | "google" | "site" | "synth" | "schema" | "photos" | "logo" | "store";
  // "warn" = degraded but continuing (e.g. copy drafting fell back) — the
  // server already emits it; without it here the frame rendered iconless.
  status: "start" | "ok" | "skip" | "fail" | "warn";
  detail: string;
};

// Rich, agent-authored design plan. Grounded in evidence — see
// supabase/functions/demo-research/design-schema-agent.ts. Optional because
// the pipeline falls back gracefully to the heuristic composeDesign() when
// the agent fails.
export type DesignSchemaSectionKey =
  | "hero" | "trust-bar" | "services" | "story" | "gallery"
  | "reviews" | "hours-map" | "cta-band" | "social" | "footer"
  // Phase 2 — signature sections the schema agent can compose.
  | "menu-board" | "process-timeline" | "before-after" | "owner-letter"
  | "neighborhood-map" | "press-strip" | "pricing-teaser"
  | "faq-conversation" | "hours-marquee" | "credential-wall";

export type DesignSchema = {
  positioning: {
    audience: string;
    valueProp: string;
    localContext: string;
    competitors: { name: string; url?: string; takeaway: string }[];
    differentiators: string[];
    reviewThemes: { theme: string; sentiment: "pos" | "neg"; quote: string }[];
    pricePosition: "budget" | "mid" | "premium" | "luxury";
    personality: string[];
    voice: "warm" | "authoritative" | "playful" | "quiet-luxury" | "rugged" | "clinical";
  };
  visual: {
    palette: {
      bg: string; surface: string; ink: string; muted: string;
      accent: string; accentInk: string; border: string;
      source: "extracted-from-site" | "extracted-from-logo" | "vertical-default" | "agent-chosen";
      rationale: string;
    };
    typography: {
      display: string; body: string;
      displayTreatment: "normal" | "italic" | "uppercase" | "smallcaps";
      rationale: string;
    };
    ornament: "grain" | "halftone" | "grid" | "botanical" | "topo" | "none";
    density: "airy" | "regular" | "dense";
    mood: "editorial" | "catalog" | "poster" | "documentary" | "boutique";
    /** Signature visual gesture — the "wow" move that makes THIS site memorable. */
    motif?:
      | "none"
      | "ticker-marquee"
      | "editorial-quote-slab"
      | "sticky-side-label"
      | "botanical-margin"
      | "halftone-photo-grid"
      | "full-bleed-color-band"
      | "neon-underline"
      | "diagonal-splice";
    /** One-sentence "signature move" prose — surfaced in rationale panel. */
    signatureMove?: string;
    /** Phase 3 — layout DNA. Structural grid/rhythm choices per site. */
    layoutDNA?: {
      grid: "symmetric" | "asymmetric-left" | "asymmetric-right" | "off-center";
      rhythm: "even" | "syncopated" | "staggered";
      edgeTreatment: "contained" | "bleed-left" | "bleed-right" | "full-bleed";
      verticalTypography: "none" | "left-rail" | "right-rail";
      sectionDividers: "none" | "hairline" | "numbered" | "chapter";
      headerAlign: "left" | "center" | "right" | "justified";
    };
    /**
     * DNA v2 — typographic fingerprint. All fields optional and additive so
     * old stored schemas (and old leads with no schema at all) keep rendering
     * through the seeded fallback in composeDesign(). Stage 3 teaches the
     * server agent to emit these.
     */
    typeDNA?: {
      scaleRatio?: 1.2 | 1.333 | 1.414 | 1.5;
      heroSizeClass?: "compact" | "standard" | "oversized" | "poster";
      eyebrowTreatment?: "uppercase-tracked" | "numbered" | "rule-line" | "side-tab" | "none";
      headingCase?: "mixed" | "sentence" | "uppercase";
      displayWeight?: "light" | "regular" | "semibold" | "black";
      displayTracking?: "tight" | "normal" | "wide";
      bodyMeasure?: "narrow" | "regular" | "wide";
    };
    /** DNA v2 — page composition family (per-section width/column/overlap behavior). */
    gridFamily?:
      | "centered-column" | "split-6-6" | "split-5-7" | "side-rail"
      | "bento" | "banded-full-bleed" | "magazine-offset";
    /** DNA v2 — in-preview site chrome (fake nav bar + footer families). */
    chrome?: {
      nav?: "slim" | "inline" | "center-stack" | "cta-bar";
      footer?: "slim-bar" | "stacked-center" | "mega-grid" | "colophon";
    };
  };
  logo: {
    treatment: "as-provided" | "monochrome-on-accent" | "in-chip" | "wordmark-only" | "hidden";
    placement: "top-left" | "centered" | "over-hero" | "in-footer-only";
    size: "sm" | "md" | "lg";
    rationale: string;
  };
  homepage: {
    hero: {
      variant:
        | "overlay" | "split" | "poster" | "collage" | "editorial-quote"
        // DNA v2 — anatomy-distinct variants (additive; stage 3 server emit).
        // typographic-poster/split-stage are aliases the renderer maps onto
        // the poster/split anatomies with the oversized type treatment.
        | "typographic-poster" | "split-stage" | "minimal-statement" | "data-led";
      photoIntent: string;
      headline: string;
      sub: string;
      trustChip: "rating" | "years" | "local" | "none";
    };
    cta: {
      primary: { label: string; action: "call" | "book" | "order" | "quote" | "visit" };
      secondary?: { label: string; action: string };
      placement: "hero" | "sticky" | "both";
    };
    sections: DesignSchemaSectionKey[];
  };
  content: {
    servicesFraming: "menu" | "experiences" | "packages" | "process" | "capabilities";
    // Deep designer — AI-owned section-layout axes (optional, back-compat).
    serviceLayout?: "dotted" | "cards" | "numbered" | "chips" | "split";
    reviewLayout?: "cards" | "spotlight" | "strip";
    socialVariant?: "wall" | "strip";
    servicesCount: number;
    reviewsCount: number;
    galleryIntent: string[];
    aboutAngle: string;
  };
  citations: { field: string; source: string; excerpt: string }[];
  /** Phase 4 — competitive landscape summary (what the crowd looks like). */
  landscape?: {
    dominantPalette: string[];
    dominantFonts: string[];
    dominantHero: string;
    crowdedSectionTypes: string[];
    toneCluster: string[];
    whitespace: string;
    /** Phase 7 — motif ids the local set is already using. */
    crowdedMotifs?: string[];
    /** Phase 7 — "grid|rhythm|dividers" DNA buckets the local set is using. */
    crowdedDNA?: string[];
    /** Phase 7 — how many competitors were summarized. */
    competitorCount?: number;
  };
  /** Phase 4 — 0..1 score of how far this schema sits from the landscape. */
  distinctnessScore?: number;
  /** Phase 5 — distinctness gate metadata (whether we re-prompted the agent). */
  revision?: {
    attempted: boolean;
    reasons: string[];
    hardFails: string[];
    firstScore?: number;
    finalScore?: number;
  };
  /** Phase 7 — per-lead diversity telemetry, landscape-vs-chosen snapshot. */
  telemetry?: {
    landscape: {
      dominantColors: string[];
      dominantFonts: string[];
      dominantHero: string;
      crowdedSections: string[];
      crowdedMotifs: string[];
      crowdedDNA: string[];
      competitorCount: number;
    };
    chosen: {
      palette: string[];
      fonts: { display: string; body: string };
      motif: string;
      dna: string;
      hero: string;
      sections: string[];
    };
    scores: {
      firstDistinctness?: number;
      finalDistinctness?: number;
      firstHardFails: number;
      finalHardFails: number;
      retried: boolean;
      /** Phase 8 — adaptive threshold used for the retry gate. */
      thresholdUsed?: number;
      /** Phase 8 — sparse | normal | crowded | unknown */
      density?: "sparse" | "normal" | "crowded" | "unknown";
      /** Phase 8 — how many recent same-vertical combos were checked. */
      recentCombosChecked?: number;
      /** Phase 8 — true if the chosen motif+DNA combo repeated a recent one. */
      combosClashed?: boolean;
      /** Phase 9 — true when a third-pass lockout retry produced the winner. */
      lockoutPass?: boolean;
    };
  };
};

// Design metadata synthesized server-side from real research (reviews, site
// copy, price signals). Consumed by composeDesign() to pick the art
// direction. Optional — old stored leads predate it and composeDesign
// falls back to a deterministic heuristic when absent.
export type DesignBrief = {
  /** Exactly 3 lowercase adjectives grounded in the evidence. */
  personality: string[];
  /** Short phrase describing who the business serves. */
  audience: string;
  pricePosition: "budget" | "mid" | "premium";
  conversionGoal: "call" | "book" | "order" | "visit" | "quote";
};

export type BusinessProfile = {
  vertical:
    | "restaurant-hospitality"
    | "trades"
    | "beauty-wellness"
    | "fitness"
    | "auto-carwash"
    | "generic";
  businessName: string;
  businessNameSource: "google_places" | "intake" | "site_title" | "domain_root" | "model" | "model_corrected";
  businessNameNote?: string;
  tagline: string;
  heroHeadline: string;
  heroSub: string;
  ctaLabel: string;
  services: { name: string; blurb: string }[];
  about: string;
  hoursLine: string | null;
  serviceAreaLine: string;
  reviews: { quote: string; author: string; rating: number }[];
  phone: string | null;
  address: string | null;
  photoUrls: string[];
  socialPhotos?: string[];
  heroPhotoReason?: string;
  rating: number | null;
  reviewCount: number | null;
  logoUrl?: string | null;
  logoSource?: "site" | "clearbit" | null;
  logoReason?: string | null;
  designBrief?: DesignBrief;
  designSchema?: DesignSchema;
};

/**
 * Stage A1 — compact rival design candidate from the tournament (result
 * frame `designCandidates`). The winner is `profile.designSchema` with the
 * implicit label "A"; extras carry only the render-relevant axes
 * (visual + homepage + content) — citations/landscape/telemetry stay
 * winner-only.
 */
export type DesignCandidate = {
  label: "B" | "C" | "D";
  axis: string;
  thesis: string;
  criticTotal: number | null;
  schema: Pick<DesignSchema, "visual" | "homepage" | "content">;
};

export type ResultEvent = {
  type: "result";
  leadId: string | null;
  profile: BusinessProfile;
  beforeScreenshot: string | null;
  /**
   * Stage 2 vision judge: true when the design-judge edge function has an
   * OpenAI key configured. Absent on older backend deploys — the client
   * treats undefined as "show the button and handle 503 gracefully".
   */
  judgeAvailable?: boolean;
  /**
   * Stage A1 — true when the design-judge arena (multi-image ranking) can
   * run (same OpenAI-key condition as judgeAvailable). Absent on older
   * backend deploys — the client treats undefined as unavailable and keeps
   * the one-shot judge path.
   */
  arenaAvailable?: boolean;
  /**
   * Stage A1 — up to 3 judge-clean tournament runners-up (labels B/C/D,
   * critic order). Omitted when the run had no runners-up (fast path,
   * fallback, ladder).
   */
  designCandidates?: DesignCandidate[];
};

export type ErrorEvent = {
  type: "error";
  error: string;
  code?: string;
  traceId?: string;
  detail?: string;
};
export type DemoEvent = StepEvent | ResultEvent | ErrorEvent;

export class DemoApiError extends Error {
  status: number;
  code?: string;
  traceId?: string;
  detail?: string;
  constructor(message: string, init: { status: number; code?: string; traceId?: string; detail?: string }) {
    super(message);
    this.name = "DemoApiError";
    this.status = init.status;
    this.code = init.code;
    this.traceId = init.traceId;
    this.detail = init.detail;
  }
}

export type DomainSuggestion = { domain: string; available: boolean | null; price?: string };

// Cloudflare Turnstile sitekey (public, safe to embed). Prefer the build-time
// env var, but keep the known public key as a fallback because preview builds do
// not receive backend runtime secrets. The matching secret key remains
// server-side as TURNSTILE_SECRET_KEY.
const FALLBACK_TURNSTILE_SITE_KEY = "0x4AAAAAADywrgA4w0bOMy7-";
export const TURNSTILE_SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined)?.trim() || FALLBACK_TURNSTILE_SITE_KEY;


export function backendReady() {
  return true;
}

function headers(): Record<string, string> {
  return { "content-type": "application/json" };
}

function fnUrl(name: string) {
  return `/api/demo/${name}`;
}

// ── Retry helpers ───────────────────────────────────────────────────
export type RetryInfo = { attempt: number; delayMs: number; reason: string };
export type RetryHook = (info: RetryInfo) => void;
export type StallInfo = { sinceMs: number; willFailInMs: number };
export type StallHook = (info: StallInfo | null) => void;

const RETRY_ATTEMPTS = 3;
const RETRY_BASE_MS = 800;

// SSE stream watchdogs: warn the UI after WARN_MS of silence, hard-fail
// after FAIL_MS. Tuned generously — research steps can take ~10s each.
const STREAM_WARN_MS = 15000;
const STREAM_FAIL_MS = 60000;

function jitter(ms: number): number {
  const j = 1 + (Math.random() * 0.4 - 0.2); // ±20%
  return Math.round(ms * j);
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (signal) {
      const onAbort = () => {
        clearTimeout(t);
        reject(new DOMException("aborted", "AbortError"));
      };
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

// Fetch a URL with retries on transient failures (network, 502/503/504,
// or non-JSON 5xx). Never retries on 4xx or on stream mid-flight — the
// caller owns stream lifecycle.
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  opts: { onRetry?: RetryHook; signal?: AbortSignal } = {},
): Promise<Response> {
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    if (opts.signal?.aborted) throw new DOMException("aborted", "AbortError");
    try {
      const res = await fetch(url, { ...init, signal: opts.signal ?? init.signal });
      // Retry only clearly transient upstream failures.
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        lastErr = new Error(`upstream ${res.status}`);
      } else {
        return res;
      }
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") throw err;
      lastErr = err;
    }
    if (attempt < RETRY_ATTEMPTS) {
      const delayMs = jitter(RETRY_BASE_MS * Math.pow(3, attempt - 1));
      const reason = lastErr instanceof Error ? lastErr.message : "network error";
      opts.onRetry?.({ attempt: attempt + 1, delayMs, reason });
      await sleep(delayMs, opts.signal);
    }
  }
  // Exhausted — throw a structured error.
  const detail = lastErr instanceof Error ? lastErr.message : String(lastErr ?? "");
  throw new DemoApiError(friendlyNetworkMessage(lastErr), {
    status: 0,
    code: "network",
    detail,
  });
}

function friendlyNetworkMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (/^upstream 5\d\d/.test(msg)) {
    return "Demo backend is having a hiccup. Please try again in a moment.";
  }
  if (/Failed to fetch|NetworkError|network/i.test(msg)) {
    return "Can't reach the demo backend. Check your connection and try again.";
  }
  return msg || "Demo backend is unavailable right now.";
}

async function parseApiError(res: Response, fallback: string): Promise<DemoApiError> {
  const traceId = res.headers.get("x-demo-trace") ?? undefined;
  let raw = "";
  let code: string | undefined;
  let detail: string | undefined;
  let bodyTraceId: string | undefined;
  const text = await res.text().catch(() => "");
  if (text) {
    try {
      const j = JSON.parse(text) as { error?: unknown; code?: unknown; traceId?: unknown; detail?: unknown };
      if (typeof j?.error === "string") raw = j.error;
      if (typeof j?.code === "string") code = j.code;
      if (typeof j?.detail === "string") detail = j.detail;
      if (typeof j?.traceId === "string") bodyTraceId = j.traceId;
    } catch {
      // Not JSON — keep body as detail snippet.
      detail = text.slice(0, 500);
    }
  }

  let message = raw;
  if (/turnstile|captcha|bot check/i.test(raw)) {
    message = "Bot check failed. Try again.";
  } else if (!message) {
    if (res.status === 429) message = "Too many requests — wait a moment and try again.";
    else if (res.status >= 500) message = "Demo backend is having a hiccup. Please try again in a moment.";
    else message = `${fallback} (${res.status})`;
  }

  return new DemoApiError(message, {
    status: res.status,
    code,
    traceId: bodyTraceId ?? traceId,
    detail,
  });
}


// ── Full report (post-gate) ─────────────────────────────────────────
export type ReportStepEvent = {
  type: "step";
  id: "contact" | "maps" | "speed" | "onpage" | "synth";
  status: "start" | "ok" | "skip" | "fail";
  detail: string;
};

export type Report = {
  headline: string;
  summary: string;
  mapsFindings: { title: string; detail: string; severity: "good" | "warn" | "bad" }[];
  seoFindings: { title: string; detail: string; severity: "good" | "warn" | "bad" }[];
  growth: { opportunities: { title: string; detail: string }[]; estimate: string | null };
  recommendations: { package: "starter" | "core" | "ai-voice" | "mega"; title: string; why: string; impact: string }[];
};

export type ReportRaw = {
  scores?: { performance: number | null; seo: number | null; accessibility: number | null; bestPractices: number | null; lcp: string | null; cls: string | null; tbt: string | null };
  maps?: { found: boolean; rating?: number | null; reviews?: number; photosCount?: number; hoursListed?: boolean; websiteLinked?: boolean; phoneListed?: boolean };
  competitors?: { name: string; rating: number | null; reviews: number }[];
  onpage?: { https: boolean; title: string | null; metaDescription: string | null; hasH1: boolean } | null;
};

export type ReportEvent =
  | ReportStepEvent
  | { type: "result"; report: Report; raw: ReportRaw }
  | ErrorEvent;

export type ReportInput = {
  leadId: string | null;
  contact: { name: string; email: string; phone?: string; notes?: string };
  businessName: string;
  domain?: string;
  city: string;
  state: string;
  vertical?: string;
  turnstileToken?: string | null;
};

export async function runReport(
  input: ReportInput,
  onEvent: (e: ReportEvent) => void,
  opts: { onRetry?: RetryHook; onStall?: StallHook; signal?: AbortSignal } = {},
): Promise<void> {
  const res = await fetchWithRetry(fnUrl("demo-report"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(input),
  }, opts);
  if (!res.ok || !res.body) {
    throw await parseApiError(res, "Report failed");
  }
  await consumeSse<ReportEvent>(res.body, onEvent, opts);
}

// POST the intake and consume the SSE stream, invoking onEvent per event.
export async function runResearch(
  intake: DemoIntake,
  onEvent: (e: DemoEvent) => void,
  opts: { onRetry?: RetryHook; onStall?: StallHook; signal?: AbortSignal } = {},
): Promise<void> {
  const res = await fetchWithRetry(fnUrl("demo-research"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(intake),
  }, opts);
  if (!res.ok || !res.body) {
    throw await parseApiError(res, "Research failed");
  }
  await consumeSse<DemoEvent>(res.body, onEvent, opts);
}

// Shared SSE frame reader. Once the first byte arrives we're committed —
// we do NOT retry mid-stream (that would replay side effects like leads).
// A watchdog fires `onStall` after STREAM_WARN_MS of silence and throws a
// structured error after STREAM_FAIL_MS so the UI is never stuck spinning.
async function consumeSse<E>(
  body: ReadableStream<Uint8Array>,
  onEvent: (e: E) => void,
  opts: { onStall?: StallHook; signal?: AbortSignal } = {},
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let lastActivity = Date.now();
  let stalledNotified = false;
  let sawTerminal = false;

  const watchdog = setInterval(() => {
    const silent = Date.now() - lastActivity;
    if (silent >= STREAM_FAIL_MS) {
      // Cancel the reader — the `read()` below rejects and we throw stream_stalled.
      reader.cancel(new DOMException("stream stalled", "AbortError")).catch(() => {});
      return;
    }
    if (silent >= STREAM_WARN_MS && !stalledNotified) {
      stalledNotified = true;
      opts.onStall?.({ sinceMs: silent, willFailInMs: Math.max(0, STREAM_FAIL_MS - silent) });
    }
  }, 2000);

  const onAbort = () => {
    reader.cancel(new DOMException("aborted", "AbortError")).catch(() => {});
  };
  opts.signal?.addEventListener("abort", onAbort);

  const markActivity = () => {
    lastActivity = Date.now();
    if (stalledNotified) {
      stalledNotified = false;
      opts.onStall?.(null);
    }
  };


  try {
    for (;;) {
      let chunk: ReadableStreamReadResult<Uint8Array>;
      try {
        chunk = await reader.read();
      } catch (err) {
        if (opts.signal?.aborted) throw new DOMException("aborted", "AbortError");
        // Watchdog cancelled us, or the network died mid-stream.
        throw new DemoApiError(
          "Backend went quiet mid-run. Try again — nothing was charged and no data was lost.",
          { status: 0, code: "stream_stalled", detail: err instanceof Error ? err.message : String(err) },
        );
      }
      const { done, value } = chunk;
      if (done) break;
      markActivity();
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const part of parts) {
        const line = part.split("\n").find((l) => l.startsWith("data: "));
        if (!line) continue;
        try {
          const evt = JSON.parse(line.slice(6)) as E;
          const t = (evt as { type?: string })?.type;
          if (t === "result" || t === "error") sawTerminal = true;
          onEvent(evt);
        } catch { /* skip malformed frame */ }
      }
    }
    if (!sawTerminal) {
      throw new DemoApiError(
        "Backend closed the connection before finishing. Try again.",
        { status: 0, code: "stream_incomplete" },
      );
    }
  } finally {
    clearInterval(watchdog);
    opts.signal?.removeEventListener("abort", onAbort);
    opts.onStall?.(null);
  }
}

export async function suggestDomains(input: {
  businessName: string;
  city: string;
  state: string;
  vertical?: string;
}, opts: { onRetry?: RetryHook; signal?: AbortSignal } = {}): Promise<{ available: DomainSuggestion[]; unverified: DomainSuggestion[]; checkerOnline: boolean }> {
  const res = await fetchWithRetry(fnUrl("demo-domains"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(input),
  }, opts);
  if (!res.ok) throw await parseApiError(res, "Domain check failed");
  return res.json();
}

export async function claimLead(
  leadId: string | null,
  contact: { name: string; email: string; phone?: string; notes?: string },
  opts: { onRetry?: RetryHook; signal?: AbortSignal } = {},
): Promise<void> {
  // Lead was never persisted (storage offline) — silently returning here made
  // the UI show "we'll reach out" while the contact info went nowhere. Throw
  // so the form can degrade honestly instead of faking success.
  if (!leadId) {
    throw new DemoApiError("We couldn't save your draft earlier, so this form can't reach us right now — email hello@sitekind.ai and we'll pick it up from there.", {
      status: 0,
      code: "lead_not_persisted",
    });
  }
  const res = await fetchWithRetry(fnUrl("demo-research"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ action: "claim", leadId, contact, flow: "has-site", city: "-", state: "-" }),
  }, opts);
  if (!res.ok) throw await parseApiError(res, "Claim failed");
}


// ── Invisible Turnstile ─────────────────────────────────────────────
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      execute: (id: string) => void;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

let scriptLoading: Promise<void> | null = null;
let turnstileContainer: HTMLElement | null = null;
let turnstileWidgetId: string | null = null;
let turnstileExecution: Promise<string | null> | null = null;
let lastTurnstileFailure: { message: string; code?: string; retryable: boolean } | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptLoading) {
    scriptLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("turnstile script failed"));
      document.head.appendChild(s);
    });
  }
  return scriptLoading;
}

export function getTurnstileFailure() {
  return lastTurnstileFailure;
}

export function turnstileFailureToError(failure: { message: string; code?: string; retryable: boolean }): DemoApiError {
  return new DemoApiError(failure.retryable ? "Bot check failed. Try again." : failure.message, {
    status: 0,
    code: failure.code ? `turnstile_${failure.code}` : "turnstile_client",
    detail: failure.message,
  });
}

function getTurnstileContainer(): HTMLElement {
  if (turnstileContainer?.isConnected) return turnstileContainer;
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.right = "16px";
  el.style.bottom = "16px";
  el.style.width = "300px";
  el.style.minHeight = "65px";
  el.style.zIndex = "2147483647";
  document.body.appendChild(el);
  turnstileContainer = el;
  turnstileWidgetId = null;
  return el;
}

function describeTurnstileFailure(code?: unknown): { message: string; code?: string; retryable: boolean } {
  const value = typeof code === "string" ? code : undefined;
  if (value === "400020" || value === "110100" || value === "110110") {
    return { message: "Bot check is misconfigured: the Turnstile site key is invalid.", code: value, retryable: false };
  }
  if (value === "110200") {
    return { message: "Bot check is misconfigured: this domain is not allowed for the Turnstile site key.", code: value, retryable: false };
  }
  if (value === "400070") {
    return { message: "Bot check is misconfigured: the Turnstile site key is disabled.", code: value, retryable: false };
  }
  return {
    message: value ? `Bot check failed with Turnstile code ${value}.` : "Bot check failed before a token was issued.",
    code: value,
    retryable: true,
  };
}

// Resolve a token, or null if Turnstile can't run here (blocked script,
// hostname not allowed, timeout). The server treats null as unverified.
export async function getTurnstileToken(timeoutMs = 45000): Promise<string | null> {
  if (!TURNSTILE_SITE_KEY) {
    lastTurnstileFailure = {
      message: "Bot check is misconfigured: no Turnstile site key is configured for this build.",
      retryable: false,
    };
    console.error(`[demo] ${lastTurnstileFailure.message}`);
    return null;
  }
  if (turnstileExecution) return turnstileExecution;

  turnstileExecution = (async () => {
    lastTurnstileFailure = null;
    try {
      await loadTurnstileScript();
      if (!window.turnstile) {
        lastTurnstileFailure = { message: "Bot check could not load.", retryable: true };
        return null;
      }

      // Cloudflare's 600xxx codes are transient challenge failures and its
      // guidance is to retry — one bad score/extension hiccup shouldn't
      // block the run. Config errors (bad key, wrong domain) never retry.
      const MAX_ATTEMPTS = 3;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const result = await runTurnstileOnce(timeoutMs);
        if (result.token) return result.token;
        if (!result.failure?.retryable || attempt === MAX_ATTEMPTS) return null;
        console.warn(
          `[demo] Turnstile attempt ${attempt} failed (${result.failure.code ?? result.failure.message}) — retrying`,
        );
        await new Promise((r) => setTimeout(r, 1200 * attempt));
      }
      return null;
    } catch {
      lastTurnstileFailure = { message: "Bot check could not load.", retryable: true };
      return null;
    }
  })().finally(() => {
    turnstileExecution = null;
  });

  return turnstileExecution;
}

// The widget's callbacks are registered ONCE at first render and survive
// every later reset(), so they must dispatch to whichever attempt is
// currently waiting — closing over a single attempt's resolver would leave
// every retry hanging until its timeout (latent bug in the previous shape).
type TurnstileFailure = { message: string; code?: string; retryable: boolean };
type TurnstileFinish = (token: string | null, failure?: TurnstileFailure) => void;
let turnstileDispatch: TurnstileFinish | null = null;
let lastLoggedTurnstileCode: string | undefined;

function runTurnstileOnce(
  timeoutMs: number,
): Promise<{ token: string | null; failure: TurnstileFailure | null }> {
  return new Promise((resolve) => {
    const container = getTurnstileContainer();
    let settled = false;
    let timer: ReturnType<typeof setTimeout>;
    const finish: TurnstileFinish = (token, failure) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (turnstileDispatch === finish) turnstileDispatch = null;
      if (failure) lastTurnstileFailure = failure;
      resolve({ token, failure: failure ?? null });
    };
    turnstileDispatch = finish;
    timer = setTimeout(() => {
      try {
        if (turnstileWidgetId && window.turnstile) window.turnstile.reset(turnstileWidgetId);
      } catch {
        /* widget may already be gone */
      }
      finish(null, { message: "Bot check timed out before a token was issued.", retryable: true });
    }, timeoutMs);

    try {
      if (!turnstileWidgetId) {
        turnstileWidgetId = window.turnstile!.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          size: "normal",
          appearance: "always",
          callback: (token: string) => turnstileDispatch?.(token),
          "error-callback": (code?: unknown) => {
            const failure = describeTurnstileFailure(code);
            // The widget retries internally on persistent failures and fires
            // this callback each time — log once per distinct code, not a
            // console flood.
            if (failure.code !== lastLoggedTurnstileCode) {
              lastLoggedTurnstileCode = failure.code;
              console.error("[demo] Turnstile error", failure);
            }
            turnstileDispatch?.(null, failure);
          },
          "expired-callback": () => {
            turnstileDispatch?.(null, { message: "Bot check expired before a token was issued.", retryable: true });
          },
          "timeout-callback": () => {
            turnstileDispatch?.(null, { message: "Bot check timed out before a token was issued.", retryable: true });
          },
          "unsupported-callback": () => {
            turnstileDispatch?.(null, { message: "Bot check is not supported in this browser.", retryable: false });
          },
        });
      } else {
        window.turnstile!.reset(turnstileWidgetId);
      }
    } catch {
      finish(null, { message: "Bot check could not start.", retryable: true });
    }
  });
}

// ── Backend health ──────────────────────────────────────────────────
export type BackendHealth =
  | { status: "ok"; ms: number; traceId?: string }
  | { status: "degraded"; code?: string; traceId?: string; detail?: string; ms?: number; httpStatus?: number }
  | { status: "offline"; detail?: string };

export async function checkBackendHealth(signal?: AbortSignal): Promise<BackendHealth> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener("abort", onAbort);
  try {
    const res = await fetch("/api/demo/health", { method: "GET", signal: ctrl.signal });
    let body: {
      ok?: boolean;
      ms?: number;
      code?: string;
      traceId?: string;
      detail?: string;
    } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      // fall through — body stays empty
    }
    const traceId = body.traceId ?? res.headers.get("x-demo-trace") ?? undefined;
    if (res.ok && body.ok) {
      return { status: "ok", ms: body.ms ?? 0, traceId };
    }
    return {
      status: "degraded",
      code: body.code,
      traceId,
      detail: body.detail,
      ms: body.ms,
      httpStatus: res.status,
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { status: "offline", detail };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}
