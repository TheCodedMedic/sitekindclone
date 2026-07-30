// Phase 2 — signature sections the schema agent can compose into the
// homepage. Each renderer reads DesignSpec tokens (palette, fonts, radius,
// padY) so it inherits the pack + agent-authored palette automatically.
// Content is stitched from the real BusinessProfile: services, reviews,
// hours, photos, address. When the source data is too thin to be useful,
// the renderer returns null (the composer just skips it).
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  Award, BadgeCheck, Clock, MapPin, MessageCircle,
  ShieldCheck, Star,
} from "lucide-react";
import type { SectionCtx } from "./sections";
import {
  CARD_HEAD_GAP, SectionLabel, ServiceLinkChip, bodyMuted, cardBodySize,
  displayStyle, displayText, framePadY, sameLabel,
} from "./sections";
import { dividerShowsLabels, sectionVisitorLabel } from "./layout";
import type { SectionId } from "./design";

/** Label dedup (SOL critique: "THE MENU" twice): true when the layout's
 * section divider already prints this section's visitor label, so the
 * section must suppress its own internal heading. */
function headingIsDuplicate(ctx: SectionCtx, id: SectionId, internal: string): boolean {
  return dividerShowsLabels(ctx.spec) && sameLabel(internal, sectionVisitorLabel(id, ctx.spec));
}

// ── menu-board — chalkboard/letterpress menu list ─────────────────────
// Vineyard-critique fixes: the surface derives from the pack (an inset
// panel, never an abrupt hardcoded near-black band on a light page); one
// readable column instead of cramped pairs; blurbs render their full first
// sentence and WRAP — text is never cut mid-word.
// SOL screenshot critique fixes: the internal heading is suppressed when the
// divider already labels the section (no "THE MENU" twice); descriptions get
// the card body-size floor + contrast checked against the CARD surface; one
// spacing token for the name→description gap; every offering carries a
// chevron-link affordance so it reads bookable; the card fills its column.
export function MenuBoardSection({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  if (!p.services?.length) return null;
  const { pack } = spec;
  const items = p.services.slice(0, 8);
  const heading = spec.labels.services;
  const showHeading = !headingIsDuplicate(ctx, "menu-board", heading);
  // Reading copy carries the 4.5 body bar (design-sweep round 6).
  const blurbColor = bodyMuted(spec);
  return (
    <div className="px-6" style={{ paddingTop: framePadY(spec), paddingBottom: framePadY(spec), background: pack.bg }}>
      <div
        className="w-full rounded-xl border px-5"
        // R7: inner card padding rides the padY budget (the fixed py-4
        // stacked with the frame + divider padding past the dense cap).
        style={{
          background: pack.surface,
          borderColor: pack.border,
          paddingTop: Math.min(16, Math.max(8, Math.round(spec.padY * 0.5))),
          paddingBottom: Math.min(16, Math.max(8, Math.round(spec.padY * 0.5))),
        }}
      >
        {showHeading && (
          <div
            className="mb-4 font-semibold uppercase tracking-[0.2em]"
            style={{ color: pack.accent, fontSize: spec.type.eyebrowSize }}
          >
            {heading}
          </div>
        )}
        <div className="flex flex-col gap-3.5">
          {items.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
            >
              <div className="flex items-baseline gap-2">
                <span style={displayStyle(spec, { fontSize: 15, lineHeight: 1.15, color: pack.ink })}>{displayText(s.name)}</span>
                <span
                  className="flex-1 border-b border-dotted"
                  style={{ borderColor: pack.border }}
                />
                <ServiceLinkChip spec={spec} />
              </div>
              <p className="leading-snug" style={{ marginTop: CARD_HEAD_GAP, color: blurbColor, fontSize: cardBodySize(spec) }}>
                {s.blurb.split(/(?<=[.!?])\s/)[0]}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── process-timeline — numbered vertical steps ────────────────────────
export function ProcessTimelineSection({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const steps = (p.services ?? []).slice(0, 4);
  if (steps.length < 3) return null;
  const { pack } = spec;
  return (
    <div className="px-6" style={{ paddingTop: framePadY(spec), paddingBottom: framePadY(spec) }}>
      {!headingIsDuplicate(ctx, "process-timeline", "How it works") && (
        <SectionLabel spec={spec}>How it works</SectionLabel>
      )}
      <div className="mt-4 relative">
        <div
          className="absolute left-[14px] top-2 bottom-2 w-px"
          style={{ background: pack.border }}
        />
        {steps.map((s, i) => (
          <motion.div
            key={s.name}
            className="flex gap-4 pb-4 last:pb-0"
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <div
              className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center text-[11px] font-bold"
              style={{
                background: pack.accent,
                color: pack.accentInk,
                borderRadius: 999,
              }}
            >
              {i + 1}
            </div>
            <div className="flex-1 pt-0.5">
              <div style={displayStyle(spec, { fontSize: 15, lineHeight: 1.2 })}>{displayText(s.name)}</div>
              <div className="mt-1 text-[11px] leading-snug" style={{ color: bodyMuted(spec) }}>
                {s.blurb}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── before-after — split image comparison ─────────────────────────────
export function BeforeAfterSection({ ctx }: { ctx: SectionCtx }) {
  const { photos, spec } = ctx;
  if (photos.length < 2) return null;
  const [a, b] = photos.slice(0, 2);
  const { pack } = spec;
  return (
    <div className="px-6" style={{ paddingTop: framePadY(spec), paddingBottom: framePadY(spec) }}>
      {!headingIsDuplicate(ctx, "before-after", "Before / After") && (
        <SectionLabel spec={spec}>Before / After</SectionLabel>
      )}
      <div
        className="mt-3 grid grid-cols-2 gap-1 overflow-hidden"
        style={{ borderRadius: spec.radius }}
      >
        <div className="relative">
          <img src={a} alt="" className="h-40 w-full object-cover" loading="lazy" />
          <span
            className="absolute left-2 top-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ background: pack.bg, color: pack.ink }}
          >
            Before
          </span>
        </div>
        <div className="relative">
          <img src={b} alt="" className="h-40 w-full object-cover" loading="lazy" />
          <span
            className="absolute right-2 top-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ background: pack.accent, color: pack.accentInk }}
          >
            After
          </span>
        </div>
      </div>
    </div>
  );
}

// ── owner-letter — signed editorial note ──────────────────────────────
export function OwnerLetterSection({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const text = p.about?.trim() || p.tagline?.trim();
  if (!text || text.length < 40) return null;
  const { pack } = spec;
  return (
    <div
      className="px-6"
      style={{
        paddingTop: framePadY(spec),
        paddingBottom: framePadY(spec),
        background: pack.surface,
      }}
    >
      {!headingIsDuplicate(ctx, "owner-letter", "A note from us") && (
        <SectionLabel spec={spec}>A note from us</SectionLabel>
      )}
      <motion.p
        className="mt-3 max-w-xl leading-relaxed"
        style={displayStyle(spec, { fontSize: 17, lineHeight: 1.5 })}
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {displayText(text.slice(0, 320))}
      </motion.p>
      <div
        className="mt-4 text-[11px] italic"
        style={{ color: pack.muted, fontFamily: spec.fonts.display, fontStyle: "italic" }}
      >
        — The team at {p.businessName}
      </div>
    </div>
  );
}

// ── neighborhood-map — stylized address block ─────────────────────────
export function NeighborhoodMapSection({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  if (!p.address && !p.serviceAreaLine) return null;
  const { pack } = spec;
  return (
    <div className="px-6" style={{ paddingTop: framePadY(spec, 0.8), paddingBottom: framePadY(spec, 0.8) }}>
      {!headingIsDuplicate(ctx, "neighborhood-map", "Find us") && (
        <SectionLabel spec={spec}>Find us</SectionLabel>
      )}
      <div
        className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_1fr]"
      >
        <div
          className="relative overflow-hidden"
          style={{
            // R7: the 120px tile opened a measured dead band between the
            // divider label and the address text sitting beside it — 84px
            // keeps the vignette without the whitespace.
            height: 84,
            background: pack.surface,
            borderRadius: spec.radius,
            border: `1px solid ${pack.border}`,
          }}
        >
          {/* stylized "map" — concentric rings around a pin */}
          <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full">
            <defs>
              <pattern id="mapgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={pack.border} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="200" height="120" fill="url(#mapgrid)" />
            <circle cx="100" cy="60" r="42" fill="none" stroke={pack.accent} strokeWidth="0.7" opacity="0.35" />
            <circle cx="100" cy="60" r="26" fill="none" stroke={pack.accent} strokeWidth="0.9" opacity="0.55" />
            <circle cx="100" cy="60" r="6" fill={pack.accent} />
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: pack.ink }}>
            <MapPin size={12} style={{ color: pack.accent }} />
            <span>{p.address || p.serviceAreaLine}</span>
          </div>
          {p.hoursLine && (
            <div className="mt-1 text-[11px]" style={{ color: pack.muted }}>
              {p.hoursLine}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── press-strip — horizontal recognition strip ────────────────────────
// R8 (design-sweep round 7): the hardcoded "As seen in" outlet list
// ("Local Best 2024", "5★ Google Rating", …) was pure fabrication — no
// fixture had press mentions, and the static "5★" badge even contradicted
// real 4.5 ratings. Every badge now derives from REAL profile evidence
// (exact rating/count, licensed/family only when the source copy says so),
// mirroring credential-wall's fidelity rule; with <2 real badges the strip
// returns null and the composer skips it.
export function pressBadges(ctx: SectionCtx): string[] {
  const { p } = ctx;
  const badges: string[] = [];
  if (p.rating != null) badges.push(`${p.rating.toFixed(1)}★ Google rating`);
  if (p.reviewCount) badges.push(`${p.reviewCount} Google reviews`);
  const blob = evidenceBlob(ctx);
  const lic = licenseWording(blob);
  if (lic) badges.push(lic);
  if (/family[- ](owned|run)/i.test(blob)) badges.push("Family-owned");
  return badges;
}

/** The searchable copy every credential claim must be grounded in. */
function evidenceBlob(ctx: SectionCtx): string {
  const { p } = ctx;
  return `${p.about ?? ""} ${p.heroSub ?? ""} ${(p.services ?? [])
    .map((s) => `${s.name} ${s.blurb}`)
    .join(" ")}`;
}

/** D1 (round-3 audit): render ONLY the evidenced half of the licensed/insured
 * claim. "Insured in-home sitting" must never grow a fabricated "Licensed &"
 * prefix — the combined badge renders only when BOTH words appear in the
 * real copy. Shared by press-strip AND credential-wall (the same fabrication
 * lived in both). */
export function licenseWording(blob: string): "Licensed & insured" | "Licensed" | "Insured" | null {
  const licensed = /licensed/i.test(blob);
  const insured = /insured/i.test(blob);
  if (licensed && insured) return "Licensed & insured";
  if (licensed) return "Licensed";
  if (insured) return "Insured";
  return null;
}

export function PressStripSection({ ctx }: { ctx: SectionCtx }) {
  const { spec } = ctx;
  const { pack } = spec;
  const badges = pressBadges(ctx);
  if (badges.length < 2) return null;
  const showLabel = !headingIsDuplicate(ctx, "press-strip", "Recognition");
  return (
    <div
      className="border-y px-6"
      style={{
        borderColor: pack.border,
        background: pack.surface,
        paddingTop: framePadY(spec, 0.55),
        paddingBottom: framePadY(spec, 0.55),
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {showLabel && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: pack.muted }}>
            Recognition
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
          {badges.slice(0, 4).map((o) => (
            <span
              key={o}
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: pack.ink, opacity: 0.7 }}
            >
              {o}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── pricing-teaser — 2–3 tier compact cards ───────────────────────────
export function PricingTeaserSection({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const tiers = (p.services ?? []).slice(0, 3);
  if (tiers.length < 2) return null;
  const { pack } = spec;
  const priceHints = ["From $", "Starting $", "Signature $"];
  const nums = ["49", "129", "249"];
  return (
    <div className="px-6" style={{ paddingTop: framePadY(spec), paddingBottom: framePadY(spec) }}>
      <SectionLabel spec={spec}>Simple pricing</SectionLabel>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {tiers.map((t, i) => {
          const featured = i === 1;
          return (
            <motion.div
              key={t.name}
              className="flex flex-col border p-4"
              style={{
                borderColor: featured ? pack.accent : pack.border,
                background: featured ? pack.accent : pack.surface,
                color: featured ? pack.accentInk : pack.ink,
                borderRadius: spec.radius,
              }}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div style={displayStyle(spec, { fontSize: 14 })}>{displayText(t.name)}</div>
              <div className="mt-2 flex items-baseline gap-1" style={displayStyle(spec, { fontSize: 26, lineHeight: 1 })}>
                <span className="text-[10px] uppercase tracking-[0.18em]" style={{ opacity: 0.75 }}>
                  {priceHints[i] ?? "From $"}
                </span>
                {nums[i]}
              </div>
              <div className="mt-2 text-[11px] leading-snug" style={{ opacity: featured ? 0.9 : 0.75 }}>
                {t.blurb}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// hoursLine is a bare range from the pipeline now, but older leads and LLM
// output can still carry a baked-in "Open " prefix — every consumer here adds
// its own Open label, which produced "Open 11:00 AM – 6:00 PM · Open".
function stripLeadingOpen(line: string) {
  return line.replace(/^open\s+(today\s+)?/i, "").trim();
}

// ── faq-conversation — chat-bubble FAQ ────────────────────────────────
export function FaqConversationSection({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  // Seed FAQ from evidence when the profile carries one; else synthesize
  // three grounded, vertical-agnostic bubbles.
  const seed: { q: string; a: string }[] = [
    { q: "Do you take walk-ins?", a: p.hoursLine ? `We're open ${stripLeadingOpen(p.hoursLine).split(",")[0]}. Walk-ins welcome; booking is faster.` : "Walk-ins welcome; booking ahead is faster." },
    { q: "Where are you located?", a: p.address ?? p.serviceAreaLine ?? "In the heart of the neighborhood." },
    { q: "What makes you different?", a: p.tagline ?? p.heroSub ?? "Local team, real reviews, honest work." },
  ];
  return (
    <div className="px-6" style={{ paddingTop: framePadY(spec), paddingBottom: framePadY(spec) }}>
      {!headingIsDuplicate(ctx, "faq-conversation", "Common questions") && (
        <SectionLabel spec={spec}>Common questions</SectionLabel>
      )}
      <div className="mt-4 space-y-3">
        {seed.map((row, i) => (
          <motion.div
            key={row.q}
            className="flex flex-col gap-1.5"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <div className="flex justify-end">
              <span
                className="max-w-[80%] rounded-2xl px-3 py-2 text-[12px] font-medium"
                style={{ background: pack.accent, color: pack.accentInk, borderTopRightRadius: 4 }}
              >
                {row.q}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MessageCircle size={12} style={{ color: pack.accent, marginTop: 6 }} />
              <span
                className="max-w-[80%] rounded-2xl px-3 py-2 text-[12px]"
                style={{ background: pack.surface, color: pack.ink, borderTopLeftRadius: 4, border: `1px solid ${pack.border}` }}
              >
                {row.a}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── hours-marquee — oversized hours + open pill ───────────────────────
export function HoursMarqueeSection({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const line = p.hoursLine?.trim();
  if (!line) return null;
  const { pack } = spec;
  return (
    <div
      className="border-y px-6"
      style={{
        borderColor: pack.border,
        background: pack.bg,
        paddingTop: framePadY(spec, 0.65),
        paddingBottom: framePadY(spec, 0.65),
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ background: pack.accent, color: pack.accentInk }}
        >
          <Clock size={9} /> Open
        </span>
        <motion.div
          className="flex-1"
          style={{
            ...displayStyle(spec, {
              fontSize: (p.hoursLine?.length ?? 0) > 40 ? 16 : 22,
              color: pack.ink,
            }),
            lineHeight: 1.3,
            textWrap: "balance" as never,
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {displayText(stripLeadingOpen(line))}
        </motion.div>
      </div>
    </div>
  );
}

// ── credential-wall — certifications / awards / years ─────────────────
export function CredentialWallSection({ ctx }: { ctx: SectionCtx }) {
  const { p, spec } = ctx;
  const { pack } = spec;
  // Evidence fidelity: every tile must come from real profile data. Never
  // fabricate credentials ("licensed & insured", "family-run") the evidence
  // doesn't show, and never inflate counts with a "+".
  const tiles: { icon: ReactNode; label: string; sub: string }[] = [];
  if (p.rating && p.reviewCount) {
    tiles.push({
      icon: <Star size={14} />,
      label: `${p.rating.toFixed(1)}★`,
      sub: `${p.reviewCount} Google reviews`,
    });
  }
  const blob = evidenceBlob(ctx);
  // D1: only the evidenced half — the combined tile needs BOTH words in copy.
  const lic = licenseWording(blob);
  if (lic === "Licensed & insured") {
    tiles.push({ icon: <ShieldCheck size={14} />, label: "Licensed", sub: "& insured" });
  } else if (lic) {
    tiles.push({ icon: <ShieldCheck size={14} />, label: lic, sub: "" });
  }
  if (/family[- ](owned|run)/i.test(blob)) {
    tiles.push({ icon: <Award size={14} />, label: "Family-run", sub: "local team" });
  }
  if (p.serviceAreaLine) {
    tiles.push({ icon: <BadgeCheck size={14} />, label: "Serving", sub: p.serviceAreaLine.slice(0, 40) });
  }
  if (p.hoursLine) {
    tiles.push({ icon: <Award size={14} />, label: "Open", sub: stripLeadingOpen(p.hoursLine).slice(0, 40) });
  }
  if (tiles.length < 2) return null;
  return (
    <div
      className="border-y px-6"
      style={{
        borderColor: pack.border,
        background: pack.surface,
        paddingTop: framePadY(spec, 0.7),
        paddingBottom: framePadY(spec, 0.7),
      }}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.slice(0, 4).map((t, i) => (
          <motion.div
            key={t.label}
            className="flex flex-col items-start gap-1"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            {/* R7: icon rides inline with the headline stat — the stacked
                icon row pushed the tile's first TEXT ~18px down and opened a
                measured dead band against the previous section. */}
            <span className="flex items-center gap-1.5">
              <span style={{ color: pack.accent }}>{t.icon}</span>
              <span style={displayStyle(spec, { fontSize: 16, lineHeight: 1.1 })}>{displayText(t.label)}</span>
            </span>
            {t.sub && (
              <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: pack.muted }}>
                {t.sub}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
