// Shared, pack-driven sections for the composed demo previews.
// Every color / font / radius / padding value comes from the DesignSpec via
// inline style (Tailwind v4 constraint: class literals must stay static).
import { ChevronRight, Phone, Sparkles, Star, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import type { BusinessProfile } from "@/lib/demoApi";
import { contrastRatio, type DesignSpec } from "./design";
import { accentTextShade } from "./palette-engine";
import type { Evidence } from "./evidence";
import { pickPrimaryCta } from "./evidence";
import { accentRuleAllowed, dividerShowsLabels } from "./layout";
import { fadeUp, staggerParent } from "./motion";

export type SectionCtx = {
  p: BusinessProfile;
  spec: DesignSpec;
  evidence: Evidence;
  heroPhoto?: string;
  photos: string[];
  socialPhotos: string[];
  logoUrl: string | null;
};

/** Compound words never break at their hyphen in display type ("world-
 * class" must not split into "world-" / "class"): swap word-internal
 * hyphens for non-breaking hyphens (U+2011). Lives here (not heroes.tsx)
 * so every display-type render site can import it without an import cycle. */
export function displayText(s: string | null | undefined): string {
  return (s ?? "").replace(/(\w)-(\w)/g, "$1‑$2");
}

/** Loose label equality for divider-vs-heading dedup: "Before / After" ==
 * "Before & After", "Find us" == "Find Us". */
export function sameLabel(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return norm(a) === norm(b);
}

// ── SOL critique floors (shared by every card-style section) ─────────

/** Card description size floor: >= spec.type.bodySize and never below 12px —
 * "descriptions too small" was a direct render-level complaint. */
export function cardBodySize(spec: DesignSpec): number {
  return Math.max(spec.type.bodySize, 12);
}

const HEX_RX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Muted text on a CARD surface must pass 3.5:1 against pack.surface (the
 * actual card background — packs are only pre-validated against bg). Falls
 * back to full ink when the muted role can't carry it. */
export function mutedOnCard(spec: DesignSpec): string {
  const { muted, surface, ink } = spec.pack;
  if (!HEX_RX.test(muted) || !HEX_RX.test(surface)) return muted;
  return contrastRatio(muted, surface) >= 3.5 ? muted : ink;
}

/** Multi-sentence READING copy (service blurbs, step descriptions) is body
 * text, not meta — it carries the 4.5 body bar, not muted's 3.5 label floor
 * (design-sweep round 6: 13px blurbs in pack.muted measured 3.8–4.1). The
 * blurb can render on the page bg OR a card surface depending on layout /
 * grid family, so muted must clear 4.5 against BOTH before it's allowed;
 * otherwise the blurb falls back to full ink. */
export function bodyMuted(spec: DesignSpec): string {
  const { muted, surface, bg, ink } = spec.pack;
  if (!HEX_RX.test(muted) || !HEX_RX.test(surface) || !HEX_RX.test(bg)) return ink;
  return contrastRatio(muted, surface) >= 4.5 && contrastRatio(muted, bg) >= 4.5 ? muted : ink;
}

/** One spacing token for the heading→description gap inside cards (px). */
export const CARD_HEAD_GAP = 6;

/** R7 (design-sweep round 6): the dead-zone cap is 1.6×padY between ADJACENT
 * CONTENT — and divider labels, card padding, and section-label headroom all
 * spend the same budget. Sections therefore take HALF of padY per side (the
 * divider + card interiors supply the rest of the rhythm); spec.padY stays
 * the design token the cap is measured against, so density still moves the
 * page — every gap just scales inside the budget now. */
export function framePadY(spec: DesignSpec, scale = 1): number {
  return Math.round(spec.padY * 0.5 * scale);
}

/** Card horizontal padding floor (px) — no cramped narrow cards. */
export function cardPadX(spec: DesignSpec): number {
  return Math.max(spec.cardPad, 20);
}

/** D10 (round-3 audit): at dense rhythm (padY<=16) the inter-card band —
 * cardPad + border + grid gap + border + cardPad — measured 29px between
 * stacked service cards vs the 1.6×padY dead-zone cap (25.6). Clamp the grid
 * gap so the whole band fits the cap; regular/airy layouts keep their
 * designed gap untouched (do NOT crush airy layouts). */
export function cardGridGap(spec: DesignSpec): number {
  if (spec.padY > 16) return spec.gap;
  const cap = Math.round(spec.padY * 1.6);
  return Math.max(2, Math.min(spec.gap, cap - 2 * spec.cardPad - 2));
}

/** Per-item affordance (SOL critique: offerings must read clickable /
 * bookable): a small chevron-link chip. Visual only — no real link in the
 * preview. */
export function ServiceLinkChip({ spec, label = "Details" }: { spec: DesignSpec; label?: string }) {
  return (
    <span
      className="inline-flex w-fit items-center gap-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
      style={{ color: spec.pack.accent }}
    >
      {label} <ChevronRight size={10} strokeWidth={2.5} />
    </span>
  );
}

export function displayStyle(spec: DesignSpec, extra?: CSSProperties): CSSProperties {
  const t = spec.fonts.displayTreatment;
  const upper = t === "uppercase" || spec.type.headingCase === "uppercase";
  return {
    fontFamily: spec.fonts.display,
    // DNA v2 — the typographic fingerprint applies everywhere display type
    // renders: weight + tracking axes replace the frozen defaults.
    fontWeight: spec.type.displayWeight,
    letterSpacing: upper ? "0.02em" : spec.type.displayTracking,
    ...(t === "italic" ? { fontStyle: "italic" as const } : {}),
    ...(upper ? { textTransform: "uppercase" as const } : {}),
    ...extra,
  };
}

// DNA v2 — the universal 10px tracked-uppercase eyebrow is dead. SectionLabel
// switches on spec.type.eyebrowTreatment: uppercase-tracked | numbered (CSS
// counter, style emitted by ComposedPreview) | rule-line | side-tab | none.
export function SectionLabel({ spec, children }: { spec: DesignSpec; children: ReactNode }) {
  const t = spec.type.eyebrowTreatment;
  if (t === "none") return null;
  const size = spec.type.eyebrowSize;
  const { pack } = spec;
  // SOL round-5: section-label letter-spacing is capped at 0.14em everywhere —
  // the wide-tracked microtype read as dated decoration.
  if (t === "numbered") {
    return (
      <div
        className="dna-eyebrow-num flex items-baseline gap-2 font-semibold uppercase"
        style={{ color: pack.accent, fontSize: size, letterSpacing: "0.14em" }}
      >
        {children}
      </div>
    );
  }
  if (t === "rule-line") {
    // The accent stub survives only under the chapter dividers axis
    // (SOL round-5: the orange rule was decorative elsewhere).
    const stub = accentRuleAllowed(spec) ? pack.accent : pack.border;
    return (
      <div className="flex items-center gap-3" style={{ color: pack.accent, fontSize: size }}>
        <span className="h-px w-8 shrink-0" style={{ background: stub }} />
        <span className="font-semibold uppercase" style={{ letterSpacing: "0.14em" }}>{children}</span>
        <span className="h-px flex-1" style={{ background: pack.border }} />
      </div>
    );
  }
  if (t === "side-tab") {
    return (
      <div className="flex">
        <span
          className="inline-block font-bold uppercase"
          style={{
            background: pack.accent,
            color: pack.accentInk,
            // 9.5px label floor (design-sweep round 6): the -1 step took the
            // regular-density 10px eyebrow to 9px.
            fontSize: Math.max(size - 1, 10),
            letterSpacing: "0.14em",
            padding: "3px 8px",
            marginLeft: -8,
          }}
        >
          {children}
        </span>
      </div>
    );
  }
  return (
    <div
      className="font-semibold uppercase tracking-[0.14em]"
      style={{ color: pack.accent, fontSize: size }}
    >
      {children}
    </div>
  );
}

// ── DNA v2 SectionFrame — grid-family-aware section composition ──────
// Wraps a labeled section's content: split families put the label (plus a
// display-type heading) in its own column, side-rail rotates it into a rail,
// centered-column centers a narrow measure, bento renders a card surface.
// Sections that adopt it stop sharing one identical stacked shell.
export function SectionFrame({
  ctx,
  label,
  children,
  padScale = 1,
  borderTop = false,
}: {
  ctx: SectionCtx;
  label: ReactNode;
  children: ReactNode;
  padScale?: number;
  borderTop?: boolean;
}) {
  const { spec } = ctx;
  const { pack } = spec;
  const gf = spec.gridFamily;
  // Label dedup (SOL critique: "THE MENU" twice): when the layout's section
  // dividers already print this section's visitor label (numbered/chapter),
  // the section suppresses its own repeat of it. The divider IS the label.
  const suppressLabel = typeof label === "string" && dividerShowsLabels(spec);
  // R7 (design-sweep round 6): eyebrowTreatment "none" renders NO label at
  // all — the empty label slot + its mt-4 opened a dead 16px band at the top
  // of every section. Content flows from the frame padding directly.
  const labelless = suppressLabel || spec.type.eyebrowTreatment === "none";
  const pad: CSSProperties = {
    paddingTop: framePadY(spec, padScale),
    paddingBottom: framePadY(spec, padScale),
    ...(borderTop ? { borderTop: `1px solid ${pack.border}` } : {}),
  };

  if (gf === "split-6-6" || gf === "split-5-7") {
    // When the divider already labels this section, the whole heading column
    // is a duplicate — the content flows full width under the divider.
    if (suppressLabel) {
      return (
        <div className="px-6" style={pad}>
          {children}
        </div>
      );
    }
    return (
      <div className="px-6" style={pad}>
        <div
          className="grid gap-4 sm:gap-6"
          style={{ gridTemplateColumns: gf === "split-5-7" ? "5fr 7fr" : "1fr 1fr" }}
        >
          <div>
            {/* Label dedup, intra-section flavor: the display heading below
                IS the label — a small-caps eyebrow of the same string right
                above it printed every section title twice. */}
            <div
              className="leading-tight"
              style={displayStyle(spec, { fontSize: spec.type.sectionTitleSize, color: pack.ink })}
            >
              {typeof label === "string" ? displayText(label) : label}
            </div>
          </div>
          <div>{children}</div>
        </div>
      </div>
    );
  }
  if (gf === "side-rail") {
    // SOL critique: the rotated vertical label is retired everywhere. The
    // side-rail family keeps its indent, the label reads horizontally.
    return (
      <div className="pr-6" style={{ ...pad, paddingLeft: 24 }}>
        {!labelless && <SectionLabel spec={spec}>{label}</SectionLabel>}
        <div className={labelless ? "" : "mt-4"}>{children}</div>
      </div>
    );
  }
  if (gf === "centered-column") {
    return (
      <div className="px-6 text-center" style={pad}>
        <div className="mx-auto" style={{ maxWidth: 560 }}>
          {!labelless && (
            <div className="flex justify-center">
              <SectionLabel spec={spec}>{label}</SectionLabel>
            </div>
          )}
          <div className={`text-left ${labelless ? "" : "mt-4"}`}>{children}</div>
        </div>
      </div>
    );
  }
  if (gf === "bento") {
    return (
      <div className="px-4" style={{ paddingTop: framePadY(spec, padScale * 0.5), paddingBottom: framePadY(spec, padScale * 0.5) }}>
        <div
          className="border"
          style={{
            borderColor: pack.border,
            background: pack.surface,
            borderRadius: Math.max(spec.radius, 12),
            // R7 (design-sweep round 7): the raw cardPad+6 bypassed the card
            // padX floor (dense cardPad=10 → 16px < 18px). Horizontal keeps
            // the shared cardPadX() 20px floor; vertical spends the same
            // 1.6×padY dead-zone budget as every frame.
            padding: `${Math.min(spec.cardPad + 6, Math.round(spec.padY * 0.5))}px ${cardPadX(spec)}px`,
          }}
        >
          {!labelless && <SectionLabel spec={spec}>{label}</SectionLabel>}
          <div className={labelless ? "" : "mt-4"}>{children}</div>
        </div>
      </div>
    );
  }
  // magazine-offset / banded-full-bleed / default — stacked, but the shell
  // (layout.tsx) adds offsets, bands, and overlap around this.
  return (
    <div className="px-6" style={pad}>
      {!labelless && <SectionLabel spec={spec}>{label}</SectionLabel>}
      <div className={labelless ? "" : "mt-4"}>{children}</div>
    </div>
  );
}

// ── CTA band ─────────────────────────────────────────────────────────
// conversionGoal "call" → phone-forward full-width accent band; otherwise a
// button row with the phone inline.
export function CtaBand({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, evidence } = ctx;
  const { pack } = spec;
  const cta = pickPrimaryCta(p, evidence);
  const goal = p.designBrief?.conversionGoal;

  if (goal === "call" && evidence.phoneCta && p.phone) {
    return (
      <motion.div
        className="flex items-center justify-between px-6 py-4"
        style={{ background: pack.accent, color: pack.accentInk }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{cta.label}</span>
        <span className="flex items-center gap-2 text-lg font-black" style={displayStyle(spec)}>
          <Phone size={16} /> {displayText(p.phone)}
        </span>
      </motion.div>
    );
  }

  return (
    <div
      className="flex flex-wrap items-center gap-3 border-b px-6"
      style={{ borderColor: pack.border, paddingTop: framePadY(spec, 0.5), paddingBottom: framePadY(spec, 0.5) }}
    >
      <button
        className="px-5 py-2.5 text-xs font-semibold"
        style={{ background: pack.accent, color: pack.accentInk, borderRadius: spec.radius >= 14 ? 999 : spec.radius }}
      >
        {cta.label}
      </button>
      {evidence.phoneCta && p.phone && (
        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: pack.ink }}>
          <Phone size={12} /> {p.phone}
        </span>
      )}
    </div>
  );
}

// ── Services (5 shapes shared across families) ───────────────────────

export function ServicesSection({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  if (!p.services?.length) return null;
  const { pack } = spec;
  return (
    <SectionFrame ctx={ctx} label={spec.labels.services} padScale={0.85}>
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {spec.serviceLayout === "dotted" && <DottedServices ctx={ctx} />}
        {spec.serviceLayout === "cards" && <CardServices ctx={ctx} />}
        {spec.serviceLayout === "numbered" && <NumberedServices ctx={ctx} />}
        {spec.serviceLayout === "chips" && <ChipServices ctx={ctx} />}
        {spec.serviceLayout === "split" && <SplitServices ctx={ctx} />}
      </motion.div>
      {spec.serviceLayout === "cards" && ctx.evidence.pricingTiers && (
        <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ color: pack.muted }}>
          <Sparkles size={10} style={{ color: pack.accent }} /> Packages from the real service list
        </div>
      )}
    </SectionFrame>
  );
}

function DottedServices({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  return (
    <div className="space-y-3.5">
      {p.services.slice(0, 5).map((s) => (
        <motion.div key={s.name} variants={fadeUp}>
          <div className="flex items-baseline gap-3">
            <span style={displayStyle(spec, { fontSize: spec.type.itemTitleSize + 2, lineHeight: 1 })}>{displayText(s.name)}</span>
            <span
              className="flex-1 self-end border-b border-dotted"
              style={{ borderColor: pack.muted, opacity: 0.6, marginBottom: 4 }}
            />
            <ServiceLinkChip spec={spec} />
          </div>
          <div style={{ marginTop: CARD_HEAD_GAP, color: bodyMuted(spec), fontSize: cardBodySize(spec), maxWidth: spec.type.bodyMeasure }} className="leading-snug">
            {s.blurb}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CardServices({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, evidence } = ctx;
  const { pack } = spec;
  const featuredIdx = evidence.pricingTiers ? 1 : -1;
  const twoCol = spec.gridFamily === "split-6-6" || spec.gridFamily === "split-5-7";
  return (
    <div className={twoCol ? "grid sm:grid-cols-2" : "grid sm:grid-cols-3"} style={{ gap: cardGridGap(spec) }}>
      {p.services.slice(0, 6).map((s, i) => (
        <motion.div
          key={s.name}
          variants={fadeUp}
          className="flex flex-col border"
          style={{
            borderColor: i === featuredIdx ? pack.accent : pack.border,
            background: pack.surface,
            borderRadius: spec.radius,
            // Contrast/spacing floors (SOL critique): horizontal card padding
            // never below 20px.
            padding: `${spec.cardPad}px ${cardPadX(spec)}px`,
          }}
        >
          <div className="font-semibold leading-tight" style={displayStyle(spec, { fontSize: spec.type.itemTitleSize - 1 })}>
            {displayText(s.name)}
          </div>
          <div className="leading-snug" style={{ marginTop: CARD_HEAD_GAP, color: bodyMuted(spec), fontSize: cardBodySize(spec) }}>
            {s.blurb}
          </div>
          <div className="mt-auto pt-2">
            <ServiceLinkChip spec={spec} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function NumberedServices({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  return (
    <div>
      {p.services.slice(0, 6).map((s, i) => (
        <motion.div
          key={s.name}
          variants={fadeUp}
          className="flex items-center gap-4 py-3 first:pt-1"
          style={{ borderTop: i === 0 ? "none" : `1px solid ${pack.border}` }}
        >
          <span
            className="w-10 text-right"
            // Display-scale accent numerals carry the 4.5 body bar
            // (design-sweep round 6) — same rule as the divider numerals.
            style={displayStyle(spec, { fontSize: spec.type.sectionTitleSize, color: accentTextShade(pack.accent, pack.bg), lineHeight: 1 })}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="flex-1">
            <div style={displayStyle(spec, { fontSize: spec.type.itemTitleSize })}>{displayText(s.name)}</div>
            <div className="leading-snug" style={{ marginTop: 2, color: bodyMuted(spec), fontSize: cardBodySize(spec) }}>
              {s.blurb}
            </div>
            <div className="mt-1.5">
              <ServiceLinkChip spec={spec} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ChipServices({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  return (
    <div className="flex flex-wrap gap-2">
      {p.services.slice(0, 6).map((s) => (
        <motion.div
          key={s.name}
          variants={fadeUp}
          className="flex flex-col border"
          style={{
            borderColor: pack.border,
            background: pack.surface,
            minWidth: 150,
            maxWidth: 210,
            borderRadius: Math.max(spec.radius, 12),
            padding: `${Math.round(spec.cardPad * 0.75)}px ${cardPadX(spec)}px`,
          }}
        >
          <span style={displayStyle(spec, { fontSize: spec.type.itemTitleSize, lineHeight: 1.15 })}>{displayText(s.name)}</span>
          <span className="leading-snug" style={{ marginTop: CARD_HEAD_GAP, color: bodyMuted(spec), fontSize: cardBodySize(spec) }}>
            {s.blurb}
          </span>
          <span className="mt-auto pt-1.5">
            <ServiceLinkChip spec={spec} />
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function SplitServices({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  const [first, ...rest] = p.services.slice(0, 6);
  if (!first) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]">
      <motion.div
        variants={fadeUp}
        className="flex flex-col justify-center border"
        style={{
          borderColor: pack.accent,
          background: pack.surface,
          borderRadius: spec.radius,
          padding: `${spec.cardPad + 6}px ${Math.max(spec.cardPad + 6, 20)}px`,
        }}
      >
        <div style={displayStyle(spec, { fontSize: spec.type.sectionTitleSize, lineHeight: 1.1 })}>{displayText(first.name)}</div>
        <div className="leading-relaxed" style={{ marginTop: CARD_HEAD_GAP, color: bodyMuted(spec), fontSize: cardBodySize(spec) }}>
          {first.blurb}
        </div>
        <div className="mt-2.5">
          <ServiceLinkChip spec={spec} />
        </div>
      </motion.div>
      <div>
        {rest.map((s, i) => (
          <motion.div
            key={s.name}
            variants={fadeUp}
            className="flex items-start gap-3 py-2.5"
            style={{ borderTop: i === 0 ? "none" : `1px solid ${pack.border}` }}
          >
            <div
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center"
              style={{ background: pack.accent, color: pack.accentInk, borderRadius: Math.min(spec.radius, 8) }}
            >
              <Wrench size={12} />
            </div>
            <div>
              <div className="text-[12px] font-semibold" style={displayStyle(spec, { fontSize: 13 })}>
                {displayText(s.name)}
              </div>
              <div className="leading-snug" style={{ marginTop: 2, color: bodyMuted(spec), fontSize: cardBodySize(spec) }}>
                {s.blurb}
              </div>
              <div className="mt-1">
                <ServiceLinkChip spec={spec} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Reviews (3 shapes) ───────────────────────────────────────────────

/** Compact star row — replaces the jumbo "5.0 / 5.0" numeral treatment
 * (SOL round-5: the number overweighted a single review). */
function Stars({ spec, rating }: { spec: DesignSpec; rating: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: Math.max(1, Math.min(5, Math.round(rating))) }).map((_, i) => (
        <Star key={i} size={10} className="fill-current" style={{ color: spec.pack.accent }} />
      ))}
    </span>
  );
}

export function ReviewsSection({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  if (!p.reviews?.length) return null;
  return (
    <SectionFrame ctx={ctx} label={spec.labels.reviews} padScale={0.6} borderTop>
      {spec.reviewLayout === "cards" && <ReviewCards ctx={ctx} />}
      {spec.reviewLayout === "spotlight" && <ReviewSpotlight ctx={ctx} />}
      {spec.reviewLayout === "strip" && <ReviewStrip ctx={ctx} />}
    </SectionFrame>
  );
}

function ReviewCards({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  return (
    <div className="grid sm:grid-cols-2" style={{ gap: spec.gap }}>
      {p.reviews.slice(0, 2).map((r, i) => (
        <motion.div
          key={r.author}
          className="border"
          style={{
            borderColor: pack.border,
            background: pack.surface,
            borderRadius: spec.radius,
            // R7 dead-zone budget: card padding spends the same 1.6×padY gap
            // budget as the section frames — vertical stays compact, while
            // horizontal keeps the 18px card padX floor.
            padding: `${Math.max(spec.cardPad - 2, 8)}px ${Math.max(spec.cardPad + 4, 18)}px`,
          }}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          {/* Quote leads (R7: the stars-first stack pushed the first line of
              TEXT ~35px below the card edge — a measured dead zone between
              adjacent sections). Stars join the attribution row. */}
          <p className="text-[12px] leading-snug">{r.quote}</p>
          {/* Attribution in normal case — uppercase tracking read as
              machine-generated ("K MC3", SOL round-5). */}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <div className="flex gap-0.5">
              {Array.from({ length: Math.round(r.rating) }).map((_, j) => (
                <Star key={j} size={11} className="fill-current" style={{ color: pack.accent }} />
              ))}
            </div>
            <div className="text-[10.5px]" style={{ color: mutedOnCard(spec) }}>
              {r.author} · Verified Google review
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ReviewSpotlight({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  const r = p.reviews[0];
  if (!r) return null;
  return (
    <motion.blockquote
      className="max-w-xl"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <p style={{ ...displayStyle(spec, { fontSize: Math.min(spec.type.sectionTitleSize, 24) }), lineHeight: 1.4, maxWidth: 460 }}>
        “{displayText(r.quote.replace(/^["“”']+|["“”']+$/g, ""))}”
      </p>
      <footer className="mt-2 flex items-center gap-2 text-[11px] tracking-[0.06em]" style={{ color: pack.muted }}>
        — {r.author}
        <span className="inline-flex items-center gap-1" style={{ color: pack.accent }}>
          <Star size={10} className="fill-current" /> {r.rating.toFixed(1)}
        </span>
      </footer>
    </motion.blockquote>
  );
}

/** Exported (SOL critique fix 8): the hero's rating pill must never sit
 * unsupported — ComposedPreview reuses this strip right after the hero. */
export function ReviewStrip({ ctx, limit = 3 }: { ctx: SectionCtx; limit?: number }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  return (
    <div className="flex gap-3 overflow-x-auto">
      {p.reviews.slice(0, limit).map((r) => (
        <div
          key={r.author}
          className="min-w-[210px] max-w-[240px] shrink-0 border"
          // R7: vertical card padding rides the padY budget (dense bento
          // stacks card+frame+divider padding into one measured gap).
          style={{ borderColor: pack.border, background: pack.surface, borderRadius: spec.radius, padding: `${Math.min(10, Math.max(6, Math.round(spec.padY * 0.35)))}px 18px` }}
        >
          {/* SOL round-5: compact star row + verified microlabel — the jumbo
              "5.0 / 5.0" overweighted one review. */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Stars spec={spec} rating={r.rating} />
            {/* 9.5px label floor (design-sweep round 6) — microcopy never dips below 10px. */}
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: mutedOnCard(spec) }}>
              Verified Google review
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug">{r.quote}</p>
          <div className="mt-1 text-[10.5px]" style={{ color: mutedOnCard(spec) }}>
            {r.author}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Review proof near the rating (SOL critique): when the hero flashes a
 * rating pill, at least one real quote renders directly after the hero so
 * the number is never unsupported. Rendered by ComposedPreview when the
 * section order didn't already put reviews first. */
export function ReviewProofStrip({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  if (!p.reviews?.length) return null;
  const { pack } = spec;
  const quotes = p.reviews.slice(0, 2);
  // SOL round-5 card polish: full content-grid width (no dead right space),
  // two-up when 2 quotes fit the pane (container query), compact star row +
  // "Verified Google review" microlabel + total-count context, normal-case
  // attribution, proportional padding, and a tight (<=16px) gap to the hero.
  // R7 (design-sweep round 7): the fixed 12/16px strip padding + 12px card
  // padding stacked with the hero's bottom padding into a measured dead zone
  // at dense densities — all three now scale with padY inside the budget.
  const stripPadT = Math.min(12, Math.max(4, Math.round(spec.padY * 0.25)));
  const stripPadB = Math.min(16, Math.max(6, Math.round(spec.padY * 0.4)));
  const cardPadV = Math.min(12, Math.max(8, Math.round(spec.padY * 0.5)));
  return (
    <div
      className="border-b px-6"
      style={{ borderColor: pack.border, paddingTop: stripPadT, paddingBottom: stripPadB }}
    >
      <div className={quotes.length === 2 ? "grid gap-3 @[560px]:grid-cols-2" : "grid gap-3"}>
        {quotes.map((r) => (
          <div
            key={r.author}
            className="border"
            style={{ borderColor: pack.border, background: pack.surface, borderRadius: spec.radius, padding: `${cardPadV}px 18px` }}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Stars spec={spec} rating={r.rating} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: mutedOnCard(spec) }}>
                Verified Google review{p.reviewCount ? ` · ${p.reviewCount} total` : ""}
              </span>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-snug">{r.quote}</p>
            <div className="mt-1 text-[10.5px]" style={{ color: mutedOnCard(spec) }}>
              {r.author}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Gallery ──────────────────────────────────────────────────────────

export function GallerySection({ ctx }: { ctx: SectionCtx }) {
  const { spec, photos } = ctx;
  // Skip the photos the hero already displayed: a collage hero consumes
  // photos[0..2], the photo heroes consume photos[0]. Without the offset the
  // gallery repeats the exact tiles shown one section above.
  const start = spec.hero.variant === "collage" ? 3 : 1;
  const pool = photos.slice(start, start + 6);
  if (pool.length < 2) return null;
  return (
    <div className="grid grid-cols-3 gap-1 px-6" style={{ paddingBottom: framePadY(spec, 0.5) }}>
      {pool.slice(0, 3).map((url, i) => (
        <motion.img
          key={url}
          src={url}
          alt=""
          className="h-24 w-full object-cover"
          style={{ borderRadius: Math.min(spec.radius, 8) }}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          loading="lazy"
        />
      ))}
    </div>
  );
}

// ── Tagline band (renders profile.tagline — previously never shown) ──

export function TaglineBand({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  if (!p.tagline?.trim()) return null;
  const { pack } = spec;
  return (
    <div
      className="border-t px-6 text-center"
      style={{ borderColor: pack.border, background: pack.surface, paddingTop: framePadY(spec, 0.8), paddingBottom: framePadY(spec, 0.8) }}
    >
      <motion.p
        className="mx-auto leading-snug"
        style={displayStyle(spec, { fontSize: spec.type.sectionTitleSize, color: pack.ink, maxWidth: spec.type.bodyMeasure })}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {displayText(p.tagline)}
      </motion.p>
      {/* Accent rule only under the chapter dividers axis (SOL round-5). */}
      {accentRuleAllowed(spec) && <div className="mx-auto mt-3 h-px w-10" style={{ background: pack.accent }} />}
    </div>
  );
}

// ── Footer bar ───────────────────────────────────────────────────────
// DNA v2 — the footer grew into a family of variants (slim-bar,
// stacked-center, mega-grid, colophon) driven by spec.chrome.footer.
// See siteChrome.tsx (PreviewFooter); the old identical slim bar lives on
// as the "slim-bar" variant.
