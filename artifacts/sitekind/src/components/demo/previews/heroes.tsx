// Hero variants for the composed demo previews. DNA v2 — seven variants with
// genuinely different ANATOMY (not one skeleton recolored):
//   overlay          photo + gradient, logo/rating-led
//   split            text panel | photo, badge-led
//   poster           typographic poster — eyebrow → display headline → rule →
//                    sub → rating + CTA (heroSizeClass "poster" reaches 64-76px)
//   collage          photo grid first, headline after
//   editorial-quote  pull-quote-led (top review IS the hero)
//   minimal-statement whitespace + giant statement, no rating pill
//   data-led         stat row (rating/reviews/services) leads, headline follows
// The agent's homepage.hero.variant is finally rendered (see composeDesign);
// photo-poor businesses get >=3 different anatomies via textLedHeroPool.
// Family signatures survive as `spec.hero.flourish`.
import { Phone, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Halftone } from "./Grain";
import { LogoMark } from "./LogoMark";
import type { CSSProperties } from "react";
import { accentRuleAllowed } from "./layout";
import { accentTextShade } from "./palette-engine";
import type { SectionCtx } from "./sections";
import { bodyMuted, displayStyle, displayText } from "./sections";
import { pickPrimaryCta } from "./evidence";
import { crashIn, fadeUp, kenBurns, revealRight, staggerParent } from "./motion";

export function HeroSection({ ctx }: { ctx: SectionCtx }) {
  switch (ctx.spec.hero.variant) {
    case "split":
      return <SplitHero ctx={ctx} />;
    case "poster":
      return <PosterHero ctx={ctx} />;
    case "collage":
      return <CollageHero ctx={ctx} />;
    case "editorial-quote":
      return <EditorialQuoteHero ctx={ctx} />;
    case "minimal-statement":
      return <MinimalStatementHero ctx={ctx} />;
    case "data-led":
      return <DataLedHero ctx={ctx} />;
    default:
      return <OverlayHero ctx={ctx} />;
  }
}

// The hero repeats the identity only when the in-page nav is the "slim"
// strip AND a REAL logo mark exists. The slim nav now carries the clean
// business name itself (SOL critique), so the old wordmark fallback here
// would just print the name a second time inches below the nav.
function showHeroLogo(ctx: SectionCtx): boolean {
  return ctx.spec.chrome.nav === "slim" && Boolean(ctx.logoUrl);
}

// Headline fit (vineyard critique): long headlines step DOWN in size so
// they never wrap into an awkward 3+-line wall at poster scale. The
// thresholds approximate 2 comfortable lines in the preview column.
function heroHeadlineSize(
  ctx: SectionCtx,
  mult: number,
  columnFactor = 1,
  maxLines = 3,
  glyphEm = 0.57,
): number {
  const base = ctx.spec.type.heroSize * mult;
  const len = (ctx.p.heroHeadline ?? "").length || 1;
  // Width-derived clamp: the FULL preview text column is ~340px; split-panel
  // heroes only get a fraction of that (columnFactor). Display glyphs
  // average ~0.57em wide, so N characters at size S span len*glyphEm*S px.
  // Capping at maxLines: S <= colWidth*maxLines / (glyphEm*len). The vineyard
  // draft's 6-line "Sip world-/class/wine..." wall came from clamping against
  // the full width inside a half-width panel. Photo (overlay) heroes clamp to
  // TWO lines with a conservative 0.6em glyph width (SOL round-5: the 4-line
  // wall over the photo was the core of the overcrowding).
  const colWidth = 340 * columnFactor;
  const maxForLines = Math.floor((colWidth * maxLines) / (glyphEm * len));
  return Math.max(16, Math.min(Math.round(base), maxForLines));
}

/** Shared style for hero headline elements: balanced wrapping so the last
 * line never strands one word ("...ALL / AROUND"). */
export const HEADLINE_WRAP: CSSProperties = { textWrap: "balance" as never };

/** R7 root fix (design-sweep round 7): fixed hero block paddings (pt-9,
 * pb-12, …) blew the 1.6×padY dead-zone cap whenever the density token was
 * tighter than the hard-coded class (padY=16 → cap 25.6px vs a 36-48px pad).
 * Hero top/bottom padding now scales with spec.padY, capped at each
 * anatomy's designed maximum, so nav→hero and hero→next-content gaps stay
 * inside the budget at every density while airy layouts keep their air. */
function heroPadBlock(ctx: SectionCtx, desired: number): number {
  return Math.min(desired, Math.round(ctx.spec.padY * 0.6));
}

/** D2-D6 (round-3 audit): the CTA row is the LAST child of every hero, so
 * the frame's bottom padding IS the CTA's clearance to whatever follows.
 * padY*0.6 alone bottomed out at 10-17px at dense densities (rule >=24px:
 * Tony's editorial-quote 10px, SudsUp data-led 10px, RapidFlow minimal 17px,
 * Ironworks collage 17px, Precision poster 17px). ONE shared floor for ALL
 * hero anatomies: never below 24px, still scaling up with airy rhythm. */
function heroBottomPad(ctx: SectionCtx): number {
  return Math.max(24, Math.round(ctx.spec.padY * 0.6));
}

/** displayText moved to sections.tsx (shared with every display-type render
 * site: bands, taglines, section titles); re-exported here for back-compat. */
export { displayText } from "./sections";

function RatingPill({ ctx, onPhoto }: { ctx: SectionCtx; onPhoto?: boolean }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  if (p.rating == null) return null;
  return (
    <motion.div
      variants={fadeUp}
      className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px]"
      style={
        onPhoto
          ? { background: "rgba(255,255,255,0.92)", color: "#171717" }
          : { background: pack.surface, color: pack.ink, border: `1px solid ${pack.border}` }
      }
    >
      <Star size={11} className="fill-current" style={{ color: pack.accent }} /> {p.rating} · {p.reviewCount ?? 0} reviews
    </motion.div>
  );
}

/** Primary CTA row — the HERO CTA INVARIANT (SOL screenshot critique): every
 * hero anatomy renders this, photo-led ones included. A hero without a next
 * step (only a review badge) is the single worst conversion defect.
 *
 * SOL round-5 hierarchy: PRIMARY = the only solid accent button; SECONDARY
 * "Plan your visit" = a real outlined button (no more underlined text link
 * "inside the image"); TERTIARY phone = a compact icon+number pill visually
 * lighter than both (it must never rival the primary). Consistent heights.
 * On photo heroes the whole cluster sits on a subtle darkening plate so the
 * buttons never fight photo content (embedded sign text etc.) — we cannot
 * detect photo text client-side, so the band is unconditional. */
function HeroCtaRow({
  ctx,
  center,
  onPhoto,
  withRating,
}: {
  ctx: SectionCtx;
  center?: boolean;
  onPhoto?: boolean;
  withRating?: boolean;
}) {
  const { p, spec, evidence } = ctx;
  const { pack } = spec;
  const cta = pickPrimaryCta(p, evidence);
  const r = spec.radius >= 14 ? 999 : spec.radius;
  // Vineyard critique: "VISIT US" + "Plan your visit" side by side are
  // semantic duplicates. Skip the hardcoded secondary whenever the primary
  // is already a visit-synonym — the phone pill/rating still fill the row.
  const primaryIsVisit = /\b(visit|stop by|come see|plan your)\b/i.test(cta.label);
  const row = (
    <div className={`flex flex-wrap items-center gap-2.5 ${center ? "justify-center" : ""}`}>
      {/* Transparent border matches the outlined secondary's box exactly —
          without it the solid primary rendered 2px shorter (31 vs 33px). */}
      <span
        className="inline-flex items-center whitespace-nowrap border border-transparent px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ background: pack.accent, color: pack.accentInk, borderRadius: r }}
      >
        {cta.label}
      </span>
      {p.hoursLine && !primaryIsVisit && (
        <span
          className="inline-flex items-center whitespace-nowrap border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.1em]"
          style={
            onPhoto
              ? { borderColor: "rgba(255,255,255,0.75)", color: "#ffffff", borderRadius: r }
              : { borderColor: pack.ink, color: pack.ink, borderRadius: r }
          }
        >
          Plan your visit
        </span>
      )}
      {evidence.phoneCta && p.phone && (
        <span
          className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-[10px] font-semibold"
          style={
            onPhoto
              ? { background: "rgba(255,255,255,0.16)", color: "#ffffff", border: "1px solid transparent", borderRadius: r }
              : { background: pack.surface, color: pack.ink, border: `1px solid ${pack.border}`, borderRadius: r }
          }
        >
          <Phone size={10} /> {p.phone}
        </span>
      )}
      {/* Rating joins the CTA cluster on photo heroes — one cluster, not
          proof scattered across the hero (SOL round-5). */}
      {withRating && <RatingPill ctx={ctx} onPhoto={onPhoto} />}
    </div>
  );
  if (!onPhoto) return <motion.div variants={fadeUp}>{row}</motion.div>;
  return (
    <motion.div variants={fadeUp} className={center ? "flex justify-center" : "flex"}>
      <span
        className="inline-block max-w-full"
        style={{
          background: "rgba(0,0,0,0.35)",
          borderRadius: Math.max(Math.min(spec.radius, 14), 10),
          padding: "10px 12px",
          backdropFilter: "blur(2px)",
        }}
      >
        {row}
      </span>
    </motion.div>
  );
}

// R10 (design-sweep round 7): ZERO rotated text is rubric law — the -6deg
// ribbon was the last rotated text node in the renderer. The flourish axis
// survives as a straight corner tab (same accent slab, same placement).
function DiagonalBadge({ ctx }: { ctx: SectionCtx }) {
  const { spec } = ctx;
  if (spec.hero.flourish !== "diagonal-badge" || !spec.labels.badge) return null;
  return (
    <div
      className="absolute right-0 top-6 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
      style={{ background: spec.pack.accent, color: spec.pack.accentInk }}
    >
      {spec.labels.badge}
    </div>
  );
}

function ShineSweep({ ctx }: { ctx: SectionCtx }) {
  if (ctx.spec.hero.flourish !== "sweep") return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -inset-y-8 w-32 skew-x-[-18deg]"
      style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)" }}
      animate={{ left: ["-20%", "120%"] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
    />
  );
}

// ── Variant: photo with gradient overlay ─────────────────────────────
// Anatomy: [logo] → rating → headline → sub (media-led, copy at the bottom).

function OverlayHero({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, heroPhoto, logoUrl } = ctx;
  const { pack } = spec;
  const center = spec.hero.alignment === "center";
  const measure = spec.type.bodyMeasure;
  const onPhoto = Boolean(heroPhoto);
  return (
    <div className="relative overflow-hidden">
      {heroPhoto && (
        <div className="relative h-64 w-full overflow-hidden sm:h-80">
          <motion.img
            src={heroPhoto}
            alt=""
            className="h-full w-full object-cover"
            variants={kenBurns}
            initial="hidden"
            animate="show"
          />
          {/* SOL critique: one SMOOTH, even scrim — never an outline/text-
              shadow treatment on the type, never a crushed bottom band under
              a blown-out sky. Round-5: bottom stop strengthened to .68 —
              legibility comes from the scrim alone. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.68) 100%)",
            }}
          />
          <ShineSweep ctx={ctx} />
          <DiagonalBadge ctx={ctx} />
        </div>
      )}
      <motion.div
        // On photo: >=28px of breathing room between the CTA row and the
        // photo's bottom edge stays FIXED (R3 floor — SOL round-5: CTAs were
        // nearly bottom-flush; the copy overlays the photo so it opens no
        // dead zone). Off photo the padding scales with padY (R7).
        className={`${heroPhoto ? "absolute bottom-0" : "relative"} w-full px-6 ${center ? "text-center" : ""}`}
        style={heroPhoto ? { paddingTop: 28, paddingBottom: 28 } : { paddingTop: heroPadBlock(ctx, 28), paddingBottom: heroBottomPad(ctx) }}
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        {/* Identity (SOL critique): on a photo hero, no floating white chip.
            A real logo renders INLINE at proper size; otherwise the nav
            carries the business name and the hero stays clean. */}
        {showHeroLogo(ctx) && onPhoto && logoUrl && (
          <motion.div variants={fadeUp} className={`mb-3 ${center ? "flex justify-center" : ""}`}>
            <img
              src={logoUrl}
              alt={`${p.businessName} logo`}
              className="inline-block h-10 w-auto max-w-[10rem] object-contain"
            />
          </motion.div>
        )}
        {showHeroLogo(ctx) && !onPhoto && (
          <motion.div variants={fadeUp} className={`mb-3 ${center ? "flex justify-center" : ""}`}>
            <LogoMark
              logoUrl={logoUrl}
              businessName={p.businessName}
              className="h-9 w-auto"
              dark={pack.isDark}
              wordmarkFont={spec.fonts.display}
              style={{ color: pack.ink }}
            />
          </motion.div>
        )}
        {/* Rating pill: on photo it joins the CTA cluster below (one cluster,
            not scattered); off photo it stays a compact badge up here. */}
        {!onPhoto && <RatingPill ctx={ctx} />}
        <motion.h3
          variants={fadeUp}
          // Two-line max on photo heroes with open 1.12 leading (SOL round-5:
          // the tight 4-line wall over the bottles read overcrowded).
          className={`mt-3 leading-[1.12] ${center ? "mx-auto max-w-lg" : "max-w-lg"}`}
          style={{
            ...displayStyle(spec, {
              fontSize: onPhoto
                ? heroHeadlineSize(ctx, 0.85, 0.85, 2, 0.6)
                : heroHeadlineSize(ctx, 0.85),
              color: onPhoto ? "#ffffff" : pack.ink,
            }),
            ...HEADLINE_WRAP,
          }}
        >
          {displayText(p.heroHeadline)}
        </motion.h3>
        <motion.p
          variants={fadeUp}
          className={`mt-3 leading-relaxed ${center ? "mx-auto" : ""}`}
          style={{
            // Legibility floor on photo: full-opacity white, never below 12.5px.
            // Off photo the sub is BODY copy — bodyMuted() 4.5 guard (R6).
            color: onPhoto ? "#ffffff" : bodyMuted(spec),
            fontSize: onPhoto ? Math.max(spec.type.bodySize, 12.5) : spec.type.bodySize,
            maxWidth: measure,
          }}
        >
          {p.heroSub}
        </motion.p>
        <div className="mt-4">
          <HeroCtaRow ctx={ctx} center={center} onPhoto={onPhoto} withRating={onPhoto} />
        </div>
      </motion.div>
    </div>
  );
}

// ── Variant: split photo | text panel ────────────────────────────────
// Anatomy: [logo] → badge → headline → rating → sub (badge-led text panel).

function SplitHero({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, heroPhoto, logoUrl } = ctx;
  const { pack } = spec;
  const blob = spec.hero.flourish === "blob";
  return (
    <div className="grid gap-0 sm:grid-cols-[1.35fr_1fr]">
      <motion.div
        className="flex flex-col justify-center px-6"
        // R7: panel padding scales with the page rhythm token.
        style={{ background: pack.bg, paddingTop: heroPadBlock(ctx, 32), paddingBottom: heroBottomPad(ctx) }}
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        {showHeroLogo(ctx) && (
          <motion.div variants={fadeUp} className="mb-3">
            <LogoMark
              logoUrl={logoUrl}
              businessName={p.businessName}
              className="h-8 w-auto"
              dark={pack.isDark}
              wordmarkFont={spec.fonts.display}
              style={{ color: pack.ink }}
            />
          </motion.div>
        )}
        {spec.labels.badge && (
          <motion.div
            variants={fadeUp}
            className="mb-3 inline-block w-fit px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ background: pack.accent, color: pack.accentInk }}
          >
            {spec.labels.badge}
          </motion.div>
        )}
        <motion.h3
          variants={fadeUp}
          className="leading-[1.02]"
          style={{ ...displayStyle(spec, { fontSize: heroHeadlineSize(ctx, 0.75, 0.55) }), ...HEADLINE_WRAP }}
        >
          {displayText(p.heroHeadline)}
        </motion.h3>
        <div className="mt-3">
          <RatingPill ctx={ctx} />
        </div>
        <motion.p
          variants={fadeUp}
          className="mt-3 leading-relaxed"
          // Split-panel readability (critique round 3): the narrow text
          // column can't afford muted low-contrast sub copy — ink at 80%
          // and a 12.5px floor keep it legible beside the photo.
          style={{ color: pack.ink, opacity: 0.8, fontSize: Math.max(spec.type.bodySize, 12.5), maxWidth: spec.type.bodyMeasure }}
        >
          {p.heroSub}
        </motion.p>
        {/* HERO CTA INVARIANT — the split anatomy converts too. */}
        <div className="mt-4">
          <HeroCtaRow ctx={ctx} />
        </div>
      </motion.div>
      <motion.div
        className={`relative m-4 overflow-hidden sm:m-0 ${blob ? "sm:my-6 sm:mr-6" : ""}`}
        style={blob ? { borderRadius: "120px 120px 20px 120px" } : { borderRadius: 0 }}
        variants={revealRight}
        initial="hidden"
        animate="show"
      >
        {heroPhoto ? (
          <img
            src={heroPhoto}
            alt=""
            className="h-56 w-full object-cover sm:h-full sm:min-h-[280px]"
            style={spec.hero.flourish === "halftone" ? { filter: "contrast(1.12) saturate(0.88)" } : undefined}
          />
        ) : (
          <div
            className="h-56 w-full sm:h-full sm:min-h-[280px]"
            style={{ background: `linear-gradient(135deg, ${pack.accent}, ${pack.surface})` }}
          />
        )}
        {spec.hero.flourish === "halftone" && <Halftone color="#000" size={2} opacity={0.22} />}
        <ShineSweep ctx={ctx} />
      </motion.div>
    </div>
  );
}

// ── Variant: typographic poster (photo-poor friendly) ────────────────
// Anatomy: eyebrow/badge → DISPLAY headline → rule → sub → rating + CTA.
// With heroSizeClass "poster" the headline reaches 64-76px in-preview.

function PosterHero({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, logoUrl } = ctx;
  const { pack } = spec;
  const center = spec.hero.alignment === "center";
  return (
    <div className="relative overflow-hidden" style={{ background: pack.bg }}>
      <DiagonalBadge ctx={ctx} />
      <motion.div
        className={`px-6 ${center ? "text-center" : ""}`}
        style={{ paddingTop: heroPadBlock(ctx, 36), paddingBottom: heroBottomPad(ctx) }}
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        {showHeroLogo(ctx) && (
          <motion.div variants={fadeUp} className={`mb-4 ${center ? "flex justify-center" : ""}`}>
            <LogoMark
              logoUrl={logoUrl}
              businessName={p.businessName}
              className="h-8 w-auto"
              dark={pack.isDark}
              wordmarkFont={spec.fonts.display}
              style={{ color: pack.ink }}
            />
          </motion.div>
        )}
        {/* Eyebrow tracking capped at 0.18em (design-sweep round 6: >0.2em
            reads as dated decoration at label sizes). */}
        <motion.div
          variants={fadeUp}
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: pack.accent }}
        >
          {p.serviceAreaLine}
        </motion.div>
        <motion.h3
          className={`mt-3 leading-[0.96] ${center ? "mx-auto max-w-xl" : "max-w-xl"}`}
          style={{ ...displayStyle(spec, { fontSize: heroHeadlineSize(ctx, 1) }), ...HEADLINE_WRAP }}
          variants={crashIn}
        >
          {displayText(p.heroHeadline)}
        </motion.h3>
        {/* Accent rule only under the chapter dividers axis (SOL round-5:
            the thin orange line read as unearned decoration elsewhere). */}
        {accentRuleAllowed(spec) && (
          <motion.div
            variants={fadeUp}
            className={`mt-5 h-[3px] w-14 ${center ? "mx-auto" : ""}`}
            style={{ background: pack.accent }}
          />
        )}
        <motion.p
          variants={fadeUp}
          className={`mt-4 leading-relaxed ${center ? "mx-auto" : ""}`}
          // Hero sub is multi-sentence BODY copy — bodyMuted() carries the
          // 4.5 bar (R6: raw pack.muted measured 4.12 on light packs).
          style={{ color: bodyMuted(spec), fontSize: spec.type.bodySize, maxWidth: spec.type.bodyMeasure }}
        >
          {p.heroSub}
        </motion.p>
        <div className={`mt-5 flex flex-wrap items-center gap-3 ${center ? "justify-center" : ""}`}>
          <RatingPill ctx={ctx} />
          <HeroCtaRow ctx={ctx} />
        </div>
      </motion.div>
    </div>
  );
}

// ── Variant: edge-to-edge photo collage (photo-rich only) ────────────
// Anatomy: photo grid FIRST → headline → rating → sub.

function CollageHero({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, photos, logoUrl } = ctx;
  const { pack } = spec;
  // 3 tiles: the 3×2 grid has 6 cells and tile 0 spans 4 of them (2×2),
  // leaving exactly 2 cells for the stacked side tiles. A 4th tile would
  // overflow into an implicit squashed row.
  const tiles = photos.slice(0, 3);
  return (
    <div className="relative">
      <div className="grid h-64 grid-cols-3 grid-rows-2 gap-1 sm:h-72">
        {tiles.map((url, i) => (
          <motion.img
            key={url}
            src={url}
            alt=""
            className={`h-full w-full object-cover ${i === 0 ? "col-span-2 row-span-2" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          />
        ))}
      </div>
      <DiagonalBadge ctx={ctx} />
      <motion.div
        className="px-6"
        style={{ paddingTop: heroPadBlock(ctx, 24), paddingBottom: heroBottomPad(ctx) }}
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        {showHeroLogo(ctx) && (
          <motion.div variants={fadeUp} className="mb-3">
            <LogoMark
              logoUrl={logoUrl}
              businessName={p.businessName}
              className="h-9 w-auto"
              dark={pack.isDark}
              wordmarkFont={spec.fonts.display}
              style={{ color: pack.ink }}
            />
          </motion.div>
        )}
        <motion.h3
          variants={fadeUp}
          className="max-w-lg leading-[1.03]"
          style={{ ...displayStyle(spec, { fontSize: heroHeadlineSize(ctx, 0.8) }), ...HEADLINE_WRAP }}
        >
          {displayText(p.heroHeadline)}
        </motion.h3>
        <div className="mt-2">
          <RatingPill ctx={ctx} />
        </div>
        <motion.p
          variants={fadeUp}
          className="mt-2 leading-relaxed"
          // Hero sub is multi-sentence BODY copy — bodyMuted() carries the
          // 4.5 bar (R6: raw pack.muted measured 4.12 on light packs).
          style={{ color: bodyMuted(spec), fontSize: spec.type.bodySize, maxWidth: spec.type.bodyMeasure }}
        >
          {p.heroSub}
        </motion.p>
        {/* HERO CTA INVARIANT — collage copy block sits on the page bg, so
            the standard row reads fine without a photo plate. */}
        <div className="mt-3">
          <HeroCtaRow ctx={ctx} />
        </div>
      </motion.div>
    </div>
  );
}

// ── Variant: editorial-quote (pull-quote-led, photo-independent) ─────
// Anatomy: giant review quote IS the hero → attribution → headline as a
// kicker line → CTA. Renders the schema agent's long-dead pick.

function EditorialQuoteHero({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  const review = p.reviews?.[0];
  if (!review) return <PosterHero ctx={ctx} />;
  return (
    <div className="relative overflow-hidden" style={{ background: pack.bg }}>
      <motion.div
        className="px-6"
        style={{ paddingTop: heroPadBlock(ctx, 36), paddingBottom: heroBottomPad(ctx) }}
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={fadeUp}
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: pack.accent }}
        >
          {p.businessName} · {p.rating != null ? `${p.rating}★` : "reviews"}
        </motion.div>
        <motion.blockquote
          variants={fadeUp}
          className="mt-4 leading-[1.12]"
          style={{ ...displayStyle(spec, { fontSize: heroHeadlineSize(ctx, 0.72), color: pack.ink }), ...HEADLINE_WRAP }}
        >
          <span aria-hidden style={{ color: pack.accent }}>“</span>
          {displayText(review.quote.slice(0, 140))}
          <span aria-hidden style={{ color: pack.accent }}>”</span>
        </motion.blockquote>
        {/* Attribution in normal case (SOL round-5: uppercase tracking read
            as machine-generated). */}
        <motion.div
          variants={fadeUp}
          className="mt-3 text-[10.5px]"
          style={{ color: pack.muted }}
        >
          — {review.author} · Verified Google review
        </motion.div>
        <motion.div variants={fadeUp} className="mt-6 border-t pt-4" style={{ borderColor: pack.border }}>
          <p
            className="leading-relaxed"
            style={{ color: pack.ink, fontSize: spec.type.bodySize + 1, maxWidth: spec.type.bodyMeasure, fontWeight: 600 }}
          >
            {displayText(p.heroHeadline)}
          </p>
        </motion.div>
        <div className="mt-4">
          <HeroCtaRow ctx={ctx} />
        </div>
      </motion.div>
    </div>
  );
}

// ── Variant: minimal-statement (whitespace + giant statement) ────────
// Anatomy: tiny eyebrow → oversized statement → one thin rule → single CTA.
// No rating pill, no logo block — the quietest anatomy in the pool.

function MinimalStatementHero({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  const center = spec.hero.alignment === "center";
  return (
    <div className="relative overflow-hidden" style={{ background: pack.bg }}>
      <motion.div
        className={`px-6 ${center ? "text-center" : ""}`}
        // R7: even the whitespace-led anatomy respects the dead-zone budget —
        // its air comes from the internal mt-5/mt-7 rhythm, not the frame.
        style={{ paddingTop: heroPadBlock(ctx, 48), paddingBottom: heroBottomPad(ctx) }}
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={fadeUp}
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: pack.muted }}
        >
          {p.businessName}
        </motion.div>
        <motion.h3
          variants={fadeUp}
          className={`mt-5 leading-[1.0] ${center ? "mx-auto max-w-xl" : "max-w-xl"}`}
          style={{ ...displayStyle(spec, { fontSize: heroHeadlineSize(ctx, 1.02), color: pack.ink }), ...HEADLINE_WRAP }}
        >
          {displayText(p.heroHeadline)}
        </motion.h3>
        <motion.div
          variants={fadeUp}
          className={`mt-7 h-px w-16 ${center ? "mx-auto" : ""}`}
          style={{ background: pack.ink, opacity: 0.4 }}
        />
        <motion.p
          variants={fadeUp}
          className={`mt-5 leading-relaxed ${center ? "mx-auto" : ""}`}
          // Hero sub is multi-sentence BODY copy — bodyMuted() carries the
          // 4.5 bar (R6: raw pack.muted measured 4.12 on light packs).
          style={{ color: bodyMuted(spec), fontSize: spec.type.bodySize, maxWidth: spec.type.bodyMeasure }}
        >
          {p.heroSub}
        </motion.p>
        <div className="mt-7">
          <HeroCtaRow ctx={ctx} center={center} />
        </div>
      </motion.div>
    </div>
  );
}

// ── Variant: data-led (stats-forward, photo-independent) ─────────────
// Anatomy: stat blocks lead (rating / review count / services) → headline →
// sub → CTA. For businesses whose proof IS the numbers.

function DataLedHero({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  // Evidence fidelity: counts render EXACTLY (never a fabricated "+"), and
  // no generic filler stats — "6 services" tells a visitor nothing. Only
  // real, meaningful proof goes in the row.
  const stats: { big: string; small: string }[] = [];
  if (p.rating != null) stats.push({ big: p.rating.toFixed(1), small: "Google rating" });
  if (p.reviewCount) stats.push({ big: String(p.reviewCount), small: "Google reviews" });
  if (stats.length < 2 && p.serviceAreaLine) {
    stats.push({ big: "Local", small: p.serviceAreaLine.slice(0, 40) });
  }
  return (
    <div className="relative overflow-hidden" style={{ background: pack.bg }}>
      <motion.div
        className="px-6"
        style={{ paddingTop: heroPadBlock(ctx, 32), paddingBottom: heroBottomPad(ctx) }}
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="flex flex-wrap gap-6 border-b pb-5" style={{ borderColor: pack.border }}>
          {stats.slice(0, 3).map((s) => (
            <div key={s.small}>
              {/* Display-scale numerals in the brand accent read as content —
                  they carry the 4.5 body bar, not the large-text floor
                  (design-sweep round 6). accentTextShade deterministically
                  darkens/lightens the accent until it clears it. */}
              <div style={displayStyle(spec, { fontSize: spec.type.sectionTitleSize + 8, color: accentTextShade(pack.accent, pack.bg), lineHeight: 1 })}>
                {s.big}
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: pack.muted }}>
                {s.small}
              </div>
            </div>
          ))}
        </motion.div>
        <motion.h3
          variants={fadeUp}
          className="mt-5 max-w-xl leading-[1.02]"
          style={{ ...displayStyle(spec, { fontSize: heroHeadlineSize(ctx, 0.85), color: pack.ink }), ...HEADLINE_WRAP }}
        >
          {displayText(p.heroHeadline)}
        </motion.h3>
        <motion.p
          variants={fadeUp}
          className="mt-3 leading-relaxed"
          // Hero sub is multi-sentence BODY copy — bodyMuted() carries the
          // 4.5 bar (R6: raw pack.muted measured 4.12 on light packs).
          style={{ color: bodyMuted(spec), fontSize: spec.type.bodySize, maxWidth: spec.type.bodyMeasure }}
        >
          {p.heroSub}
        </motion.p>
        <div className="mt-5">
          <HeroCtaRow ctx={ctx} />
        </div>
      </motion.div>
    </div>
  );
}
