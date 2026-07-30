// ComposedPreview — renders a BusinessProfile through a DesignSpec.
// The section stack comes from spec.sectionOrder (hero always first, footer
// always last, middle sections permuted by composeDesign under coherence
// rules). All palette/font/radius values flow from spec.pack via inline
// style — Tailwind class literals stay static (v4 constraint).
//
// A motif layer (see motifs.tsx) runs orthogonally: it injects a signature
// band right after the hero and/or applies scoped CSS to the whole preview.
// This is the single biggest lever for structural diversity between two
// same-vertical previews.
import type { BusinessProfile } from "@/lib/demoApi";
import { BrowserChrome } from "./BrowserChrome";
import { Grain } from "./Grain";
import { SocialSection } from "./SocialSection";
import type { DesignSpec, SectionId } from "./design";
import { deriveEvidence } from "./evidence";
import { HeroSection } from "./heroes";
import { SectionShell, dividerShowsLabels } from "./layout";
import { MotifBand, MotifStyles, motifRootStyle, type MotifId } from "./motifs";
import {
  CtaBand,
  GallerySection,
  ReviewProofStrip,
  ReviewsSection,
  ServicesSection,
  TaglineBand,
  type SectionCtx,
} from "./sections";
import { PreviewFooter, PreviewNav } from "./siteChrome";
import {
  BeforeAfterSection,
  CredentialWallSection,
  FaqConversationSection,
  HoursMarqueeSection,
  MenuBoardSection,
  NeighborhoodMapSection,
  OwnerLetterSection,
  PressStripSection,
  PricingTeaserSection,
  ProcessTimelineSection,
  pressBadges,
} from "./sections-extra";

const VALID_MOTIFS: ReadonlySet<MotifId> = new Set<MotifId>([
  "none", "ticker-marquee", "editorial-quote-slab", "sticky-side-label",
  "botanical-margin", "halftone-photo-grid", "full-bleed-color-band",
  "neon-underline", "diagonal-splice",
]);

function resolveMotif(profile: BusinessProfile): MotifId {
  const m = profile.designSchema?.visual?.motif;
  return m && VALID_MOTIFS.has(m as MotifId) ? (m as MotifId) : "none";
}

/** R7 root fix (design-sweep round 6): sections whose renderer will return
 * null (thin data) must be dropped from the order BEFORE the shell/divider
 * layer runs. Previously the SectionShell still rendered its divider around
 * an empty section — a "Gallery" chapter label with no gallery under it,
 * two divider labels back-to-back, and 120–330px dead zones. This predicate
 * mirrors each renderer's own null-guard exactly (renderers keep theirs as
 * the source of truth; this is the composition-level echo). */
function sectionHasContent(id: SectionId, ctx: SectionCtx): boolean {
  const { p, spec, photos, socialPhotos } = ctx;
  switch (id) {
    case "services":
    case "menu-board":
      return (p.services?.length ?? 0) > 0;
    case "gallery": {
      const start = spec.hero.variant === "collage" ? 3 : 1;
      return photos.slice(start, start + 6).length >= 2;
    }
    case "reviews":
      return (p.reviews?.length ?? 0) > 0;
    case "tagline":
      return Boolean(p.tagline?.trim());
    case "social":
      return socialPhotos.length > 0;
    case "process-timeline":
      return (p.services ?? []).slice(0, 4).length >= 3;
    case "before-after":
      return photos.length >= 2;
    case "owner-letter": {
      const text = p.about?.trim() || p.tagline?.trim();
      return Boolean(text && text.length >= 40);
    }
    case "neighborhood-map":
      return Boolean(p.address || p.serviceAreaLine);
    case "pricing-teaser":
      return (p.services ?? []).slice(0, 3).length >= 2;
    case "hours-marquee":
      return Boolean(p.hoursLine?.trim());
    case "press-strip":
      // R8: badges are evidence-derived now — with <2 real ones the
      // renderer returns null, so the divider layer must skip it too.
      return pressBadges(ctx).length >= 2;
    case "credential-wall": {
      const blob = `${p.about ?? ""} ${p.heroSub ?? ""} ${(p.services ?? [])
        .map((s) => `${s.name} ${s.blurb}`)
        .join(" ")}`;
      let tiles = 0;
      if (p.rating && p.reviewCount) tiles++;
      if (/licensed|insured/i.test(blob)) tiles++;
      if (/family[- ](owned|run)/i.test(blob)) tiles++;
      if (p.serviceAreaLine) tiles++;
      if (p.hoursLine) tiles++;
      return tiles >= 2;
    }
    default:
      // hero / cta / faq-conversation / footer always render.
      return true;
  }
}

export function ComposedPreview({
  profile,
  spec,
  logoUrl,
}: {
  profile: BusinessProfile;
  spec: DesignSpec;
  logoUrl?: string | null;
}) {
  const evidence = deriveEvidence(profile);
  const photos = profile.photoUrls ?? [];
  const socialPhotos = profile.socialPhotos ?? photos;
  const resolvedLogo = logoUrl !== undefined ? logoUrl : (profile.logoUrl ?? null);
  const { pack } = spec;
  const motif = resolveMotif(profile);

  const ctx: SectionCtx = {
    p: profile,
    spec,
    evidence,
    heroPhoto: photos[0],
    photos,
    socialPhotos,
    logoUrl: resolvedLogo,
  };

  const renderSection = (id: SectionId) => {
    switch (id) {
      case "hero":
        return <HeroSection key={id} ctx={ctx} />;
      case "cta":
        return <CtaBand key={id} ctx={ctx} />;
      case "services":
        return <ServicesSection key={id} ctx={ctx} />;
      case "gallery":
        return <GallerySection key={id} ctx={ctx} />;
      case "reviews":
        return <ReviewsSection key={id} ctx={ctx} />;
      case "tagline":
        return <TaglineBand key={id} ctx={ctx} />;
      case "social":
        return (
          <SocialSection
            key={id}
            photos={socialPhotos}
            businessName={profile.businessName}
            // R5 label dedup (design-sweep round 7): when the layout's section
            // dividers already print the visitor label (numbered/chapter), the
            // divider IS the label — SocialSection must not repeat "FOLLOW
            // ALONG" 30-50px below it. Same gate every SectionFrame section
            // gets; SocialSection was the one section composed without it.
            heading={dividerShowsLabels(spec) ? null : spec.labels.social}
            variant={spec.socialVariant}
            padY={spec.padY}
            theme={{
              surface: pack.surface,
              ink: pack.ink,
              muted: pack.muted,
              accent: pack.accent,
              border: pack.border,
              headingFont: spec.fonts.display,
            }}
          />
        );
      case "footer":
        return <PreviewFooter key={id} ctx={ctx} />;
      case "menu-board":
        return <MenuBoardSection key={id} ctx={ctx} />;
      case "process-timeline":
        return <ProcessTimelineSection key={id} ctx={ctx} />;
      case "before-after":
        return <BeforeAfterSection key={id} ctx={ctx} />;
      case "owner-letter":
        return <OwnerLetterSection key={id} ctx={ctx} />;
      case "neighborhood-map":
        return <NeighborhoodMapSection key={id} ctx={ctx} />;
      case "press-strip":
        return <PressStripSection key={id} ctx={ctx} />;
      case "pricing-teaser":
        return <PricingTeaserSection key={id} ctx={ctx} />;
      case "faq-conversation":
        return <FaqConversationSection key={id} ctx={ctx} />;
      case "hours-marquee":
        return <HoursMarqueeSection key={id} ctx={ctx} />;
      case "credential-wall":
        return <CredentialWallSection key={id} ctx={ctx} />;
      default:
        return null;
    }
  };

  // R7 (design-sweep round 6): drop sections that would render empty BEFORE
  // the shell/divider layer — no divider labels over nothing, no dead zones,
  // and numbered dividers count 01..N with no gaps.
  const liveOrder = spec.sectionOrder.filter((id) => sectionHasContent(id, ctx));

  // Motif band is injected right after the hero (before any other section).
  const heroIdx = liveOrder.indexOf("hero");
  const pre = liveOrder.slice(0, heroIdx + 1);
  const post = liveOrder.slice(heroIdx + 1);

  // Review proof near the rating (SOL critique): when the hero flashes a
  // rating and real reviews exist, a quote strip renders directly after the
  // hero — the number is never left unsupported. Skipped when the quote is
  // already adjacent: reviews as the first section, an editorial-quote hero
  // (the quote IS the hero), or the editorial-quote-slab motif band.
  const heroShowsRating =
    profile.rating != null &&
    spec.hero.variant !== "minimal-statement" &&
    spec.hero.variant !== "editorial-quote";
  const showReviewProof =
    (profile.reviews?.length ?? 0) > 0 &&
    heroShowsRating &&
    post[0] !== "reviews" &&
    motif !== "editorial-quote-slab";

  // @container — the preview root is a CONTAINER QUERY root (Tailwind v4
  // container-type: inline-size): nav families, the review proof grid, etc.
  // adapt to the PANE width, not the viewport. This is THE fix for every
  // pane-width bug (clipped phone digits in a narrow /demo pane).
  return (
    <div
      data-motif={motif}
      data-motif-label={profile.businessName || "signature"}
      data-dna-eyebrow={spec.type.eyebrowTreatment}
      data-pad-y={spec.padY}
      className="@container relative overflow-hidden rounded-2xl shadow-2xl"
      style={{
        background: pack.bg,
        color: pack.ink,
        fontFamily: spec.fonts.body,
        fontSize: spec.type.bodySize,
        // DNA v2 — numbered eyebrows count via a CSS counter (no index plumbing).
        counterReset: "dna-eyebrow",
        ...motifRootStyle(motif),
        ...(spec.ornament === "grid"
          ? {
              backgroundImage:
                `linear-gradient(${pack.border} 1px, transparent 1px), linear-gradient(90deg, ${pack.border} 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }
          : {}),
      }}
    >
      <MotifStyles motif={motif} spec={spec} />
      {spec.type.eyebrowTreatment === "numbered" && (
        <style
          dangerouslySetInnerHTML={{
            __html: `.dna-eyebrow-num::before { counter-increment: dna-eyebrow; content: counter(dna-eyebrow, decimal-leading-zero); font-family: ${spec.fonts.display}; font-size: 1.9em; letter-spacing: 0; line-height: 1; opacity: 0.9; }`,
          }}
        />
      )}
      <BrowserChrome businessName={profile.businessName} bg={pack.surface} border={pack.border} text={pack.muted} />
      <PreviewNav ctx={ctx} />
      {pre.map((id, i) => wrapWithShell(id, i, renderSection(id), spec))}
      {showReviewProof && <ReviewProofStrip ctx={ctx} />}
      <MotifBand motif={motif} spec={spec} profile={profile} />
      {post.map((id, i) => wrapWithShell(id, pre.length + i, renderSection(id), spec))}
      {spec.ornament === "grain" && <Grain opacity={pack.isDark ? 0.1 : 0.16} />}
    </div>
  );
}

// Hero and footer own their own framing (chrome, full-bleed background);
// the shell wraps every middle section so the Layout DNA is visible without
// touching each renderer.
function wrapWithShell(
  id: SectionId,
  index: number,
  node: React.ReactNode,
  spec: DesignSpec,
): React.ReactNode {
  if (!node) return null;
  if (id === "hero" || id === "footer") return node;
  return (
    <SectionShell key={`shell-${id}-${index}`} dna={spec.layoutDNA} index={index} id={id} spec={spec}>
      {node}
    </SectionShell>
  );
}
