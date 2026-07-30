// siteChrome.tsx — DNA v2 fake in-page site chrome for the composed previews.
// The preview's in-page header (nav bar) and footer stop being identical:
// spec.chrome.nav / spec.chrome.footer pick one of several families, chosen
// by the schema agent (visual.chrome) or a seeded fallback in composeDesign.
//
// All colors/fonts/sizes flow from the DesignSpec via inline style (Tailwind
// v4 constraint: class literals stay static).
import { MapPin, Phone } from "lucide-react";
import { LogoMark } from "./LogoMark";
import type { SectionCtx } from "./sections";
import { displayStyle, displayText } from "./sections";
import { accentRuleAllowed } from "./layout";
import { pickPrimaryCta } from "./evidence";

/** Fake nav links derived from the sections that actually render below. */
function navLinks(ctx: SectionCtx): string[] {
  const { spec } = ctx;
  const links: string[] = [];
  if (spec.sectionOrder.includes("services")) links.push(spec.labels.services);
  if (spec.sectionOrder.includes("gallery")) links.push("Gallery");
  if (spec.sectionOrder.includes("reviews")) links.push(spec.labels.reviews);
  links.push("Contact");
  return links.slice(0, 4);
}

// ── Nav families ─────────────────────────────────────────────────────
//
// SOL round-5: the nav adapts to the PREVIEW CONTAINER's width, not the
// viewport (the old `sm:` variants were the source of every pane-width bug —
// a narrow /demo pane on a desktop viewport kept everything visible and the
// phone number CLIPPED mid-digit). ComposedPreview's root is a @container;
// as the pane narrows the nav drops links first (@[520px]) and then shortens
// the phone to an icon-only pill (@[440px]) — nothing ever clips.

/** Phone rendering that can NEVER clip mid-digit: full icon+number when the
 * container is >=440px wide, an icon-only pill below that. */
function NavPhone({ ctx, variant }: { ctx: SectionCtx; variant: "text" | "pill" }) {
  const { p, spec, evidence } = ctx;
  const { pack } = spec;
  if (!evidence.phoneCta || !p.phone) return null;
  const r = spec.radius >= 14 ? 999 : spec.radius;
  if (variant === "pill") {
    const pillStyle = { borderColor: pack.accent, color: pack.ink, borderRadius: r };
    return (
      <>
        <span className="hidden items-center gap-1.5 whitespace-nowrap border px-3 py-1.5 text-[10px] font-bold @[440px]:inline-flex" style={pillStyle}>
          <Phone size={10} style={{ color: pack.accent }} /> {p.phone}
        </span>
        <span className="inline-flex items-center border p-1.5 @[440px]:hidden" style={pillStyle} aria-label={p.phone}>
          <Phone size={11} style={{ color: pack.accent }} />
        </span>
      </>
    );
  }
  return (
    <>
      <span className="hidden items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold @[440px]:inline-flex" style={{ color: pack.ink }}>
        <Phone size={10} style={{ color: pack.accent }} /> {p.phone}
      </span>
      <span className="inline-flex items-center rounded-full border p-1.5 @[440px]:hidden" style={{ borderColor: pack.border }} aria-label={p.phone}>
        <Phone size={11} style={{ color: pack.accent }} />
      </span>
    </>
  );
}

export function PreviewNav({ ctx }: { ctx: SectionCtx }) {
  switch (ctx.spec.chrome.nav) {
    case "inline":
      return <InlineNav ctx={ctx} />;
    case "center-stack":
      return <CenterStackNav ctx={ctx} />;
    case "cta-bar":
      return <CtaBarNav ctx={ctx} />;
    default:
      return <SlimNav ctx={ctx} />;
  }
}

/** slim — minimal strip; the hero keeps its own logo treatment.
 * SOL screenshot critique: the strip shows the CLEAN business name (never
 * the raw uppercase domain slug — that string read as "the technical
 * domain"), and the fake hamburger is gone: a desktop-presented layout gets
 * two real destinations + the phone when space allows. */
function SlimNav({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, evidence } = ctx;
  const { pack } = spec;
  const cta = pickPrimaryCta(p, evidence);
  return (
    <div
      className="flex items-center justify-between gap-3 border-b px-6 py-3"
      style={{ borderColor: pack.border, background: pack.bg }}
    >
      <span className="min-w-0 truncate" style={displayStyle(spec, { fontSize: 13, color: pack.ink })}>
        {displayText(p.businessName)}
      </span>
      <div className="flex shrink-0 items-center gap-3.5">
        <div className="hidden items-center gap-3.5 @[520px]:flex">
          {navLinks(ctx).slice(0, 2).map((l) => (
            <span key={l} className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: pack.muted }}>
              {l}
            </span>
          ))}
        </div>
        <NavPhone ctx={ctx} variant="text" />
        {/* Booking CTA in the header when the pane affords it (SOL round-5:
            "no booking button in header"). */}
        <span
          className="hidden whitespace-nowrap px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] @[640px]:inline-flex"
          style={{ background: pack.accent, color: pack.accentInk, borderRadius: spec.radius >= 14 ? 999 : spec.radius }}
        >
          {cta.label}
        </span>
      </div>
    </div>
  );
}

/** CTA dedup (vineyard critique): the hero owns the primary CTA label, so
 * the nav shows the PHONE when one exists — a second conversion path
 * instead of a duplicate "Book Online" inches above the first. */
function navCtaText(ctx: SectionCtx): string {
  const { p, evidence } = ctx;
  if (evidence.phoneCta && p.phone) return p.phone;
  return pickPrimaryCta(p, evidence).label;
}

/** inline — logo left, links right, small accent CTA chip. */
function InlineNav({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, logoUrl } = ctx;
  const { pack } = spec;
  return (
    <div
      className="flex items-center justify-between gap-3 border-b px-6 py-3"
      style={{ borderColor: pack.border, background: pack.bg }}
    >
      <LogoMark
        logoUrl={logoUrl}
        businessName={p.businessName}
        className={logoUrl ? "h-8 w-auto" : "h-7 w-auto"}
        dark={pack.isDark}
        wordmarkFont={spec.fonts.display}
        style={{ color: pack.ink }}
      />
      <div className="flex shrink-0 items-center gap-4">
        <div className="hidden items-center gap-4 @[560px]:flex">
          {navLinks(ctx).map((l) => (
            <span key={l} className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: pack.muted }}>
              {l}
            </span>
          ))}
        </div>
        <span
          className="whitespace-nowrap px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ background: pack.accent, color: pack.accentInk, borderRadius: spec.radius >= 14 ? 999 : spec.radius }}
        >
          {navCtaText(ctx)}
        </span>
      </div>
    </div>
  );
}

/** center-stack — centered logo between hairlines, links row underneath.
 * SOL round-5 follow-up: this family used to be the only nav WITHOUT a phone
 * conversion path — the links row now ends with the shared NavPhone (full
 * icon+number >=440cqw, icon-only pill below), same never-clips contract as
 * every other family. */
function CenterStackNav({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, logoUrl } = ctx;
  const { pack } = spec;
  return (
    <div className="border-b" style={{ borderColor: pack.border, background: pack.bg }}>
      <div className="flex justify-center px-6 pb-2.5 pt-3.5">
        <LogoMark
          logoUrl={logoUrl}
          businessName={p.businessName}
          className={logoUrl ? "h-8 w-auto" : "h-7 w-auto"}
          dark={pack.isDark}
          wordmarkFont={spec.fonts.display}
          style={{ color: pack.ink }}
        />
      </div>
      <div
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t px-6 py-2"
        style={{ borderColor: pack.border }}
      >
        {navLinks(ctx).map((l) => (
          <span key={l} className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: pack.muted }}>
            {l}
          </span>
        ))}
        <NavPhone ctx={ctx} variant="text" />
      </div>
    </div>
  );
}

/** cta-bar — logo left, nav links + phone pill + primary CTA button right
 * (conversion-forward). Critique round 3: visitors need destinations, not
 * just a button — the compact links row (same derivation as inline nav)
 * rides between the logo and the conversion controls, and the phone reads
 * as a clickable bordered pill rather than quiet text. */
function CtaBarNav({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, evidence, logoUrl } = ctx;
  const { pack } = spec;
  const cta = pickPrimaryCta(p, evidence);
  return (
    <div
      className="flex items-center justify-between gap-3 border-b px-6 py-3.5"
      style={{ borderColor: pack.border, background: pack.surface }}
    >
      <LogoMark
        logoUrl={logoUrl}
        businessName={p.businessName}
        className={logoUrl ? "h-8 w-auto" : "h-7 w-auto"}
        dark={pack.isDark}
        wordmarkFont={spec.fonts.display}
        style={{ color: pack.ink }}
      />
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden items-center gap-3.5 @[640px]:flex">
          {navLinks(ctx).slice(0, 2).map((l) => (
            <span key={l} className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: pack.muted }}>
              {l}
            </span>
          ))}
        </div>
        <NavPhone ctx={ctx} variant="pill" />
        <span
          className="whitespace-nowrap px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ background: pack.accent, color: pack.accentInk, borderRadius: spec.radius >= 14 ? 999 : spec.radius }}
        >
          {cta.label}
        </span>
      </div>
    </div>
  );
}

// ── Footer families ──────────────────────────────────────────────────

export function PreviewFooter({ ctx }: { ctx: SectionCtx }) {
  switch (ctx.spec.chrome.footer) {
    case "stacked-center":
      return <StackedCenterFooter ctx={ctx} />;
    case "mega-grid":
      return <MegaGridFooter ctx={ctx} />;
    case "colophon":
      return <ColophonFooter ctx={ctx} />;
    default:
      return <SlimBarFooter ctx={ctx} />;
  }
}

/** slim-bar — the original single-strip footer. R12 (design-sweep round 6):
 * the practical footer trio is serviceArea + hours + PHONE — the phone was
 * absent from this variant entirely while every other family carried it. */
function SlimBarFooter({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, evidence } = ctx;
  const { pack } = spec;
  const padBlock = Math.min(14, Math.max(8, Math.round(spec.padY * 0.5)));
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t px-6 text-[10px] uppercase tracking-[0.18em]"
      style={{ borderColor: pack.border, color: pack.muted, background: pack.surface, paddingTop: padBlock, paddingBottom: padBlock }}
    >
      <span className="inline-flex items-center gap-1.5">
        <MapPin size={11} style={{ color: pack.accent }} /> {p.serviceAreaLine}
      </span>
      {evidence.hours && p.hoursLine && <span>{p.hoursLine}</span>}
      {p.phone && (
        <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: pack.ink }}>
          <Phone size={11} style={{ color: pack.accent }} /> {p.phone}
        </span>
      )}
    </div>
  );
}

/** stacked-center — centered wordmark, meta lines, hairline rules. */
function StackedCenterFooter({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, evidence, logoUrl } = ctx;
  const { pack } = spec;
  return (
    <div
      className="border-t px-6 pb-5 text-center"
      // R7: footer top padding scales with the page rhythm token.
      style={{ borderColor: pack.border, background: pack.surface, paddingTop: Math.min(20, Math.round(spec.padY * 0.5)) }}
    >
      <div className="flex justify-center">
        <LogoMark
          logoUrl={logoUrl}
          businessName={p.businessName}
          className="h-7 w-auto"
          dark={pack.isDark}
          wordmarkFont={spec.fonts.display}
          style={{ color: pack.ink }}
        />
      </div>
      {/* R10 (design-sweep round 7): accent rule stubs render ONLY under the
          chapter dividers axis — this one was unconditional, so numbered/
          hairline layouts drew unearned decoration in the footer. */}
      {accentRuleAllowed(spec) && (
        <div className="mx-auto mt-3 h-px w-10" style={{ background: pack.accent }} />
      )}
      <div className="mt-3 text-[10px] uppercase tracking-[0.2em]" style={{ color: pack.muted }}>
        {p.serviceAreaLine}
      </div>
      {evidence.hours && p.hoursLine && (
        <div className="mt-1 text-[10px] uppercase tracking-[0.2em]" style={{ color: pack.muted }}>
          {p.hoursLine}
        </div>
      )}
      {p.phone && (
        <div className="mt-2 text-[11px] font-semibold" style={{ color: pack.ink }}>
          {p.phone}
        </div>
      )}
    </div>
  );
}

/** mega-grid — 3-column footer: brand blurb, services list, contact block. */
function MegaGridFooter({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, evidence } = ctx;
  const { pack } = spec;
  return (
    <div className="border-t" style={{ borderColor: pack.border, background: pack.surface }}>
      <div className="grid gap-6 px-6 pb-5 sm:grid-cols-3" style={{ paddingTop: Math.min(20, Math.round(spec.padY * 0.5)) }}>
        <div>
          <div style={displayStyle(spec, { fontSize: spec.type.itemTitleSize, color: pack.ink })}>
            {displayText(p.businessName)}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed" style={{ color: pack.muted }}>
            {(p.tagline || p.about || "").slice(0, 90)}
          </p>
        </div>
        <div>
          {/* Label floors (design-sweep round 6): >=10px, tracking <=0.2em. */}
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: pack.accent }}>
            {spec.labels.services}
          </div>
          <div className="mt-2 space-y-1">
            {p.services.slice(0, 4).map((s) => (
              <div key={s.name} className="text-[10px]" style={{ color: pack.muted }}>
                {s.name}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: pack.accent }}>
            Visit
          </div>
          <div className="mt-2 space-y-1 text-[10px]" style={{ color: pack.muted }}>
            <div className="inline-flex items-center gap-1.5">
              <MapPin size={10} style={{ color: pack.accent }} /> {p.address || p.serviceAreaLine}
            </div>
            {/* R12 (design-sweep round 6): a street address must not DROP the
                service-area line — visitors scan the footer for "who do you
                serve", not just "where do you sit". */}
            {p.address && p.serviceAreaLine && <div>{p.serviceAreaLine}</div>}
            {evidence.hours && p.hoursLine && <div>{p.hoursLine}</div>}
            {p.phone && (
              <div className="inline-flex items-center gap-1.5" style={{ color: pack.ink }}>
                <Phone size={10} style={{ color: pack.accent }} /> {p.phone}
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className="border-t px-6 py-2.5 text-[10px] uppercase tracking-[0.2em]"
        style={{ borderColor: pack.border, color: pack.muted }}
      >
        © {new Date().getFullYear()} {p.businessName}
      </div>
    </div>
  );
}

/** colophon — editorial: oversized display wordmark over a tiny meta row. */
function ColophonFooter({ ctx }: { ctx: SectionCtx }) {
  const { p, spec, evidence } = ctx;
  const { pack } = spec;
  return (
    <div
      className="border-t px-6 pb-4"
      style={{ borderColor: pack.border, background: pack.bg, paddingTop: Math.min(24, Math.max(12, Math.round(spec.padY * 0.55))) }}
    >
      <div
        className="leading-none"
        style={displayStyle(spec, {
          fontSize: Math.min(spec.type.heroSize, 44),
          color: pack.ink,
          letterSpacing: "-0.02em",
        })}
      >
        {displayText(p.businessName)}
      </div>
      <div
        className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[10px] uppercase tracking-[0.18em]"
        style={{ borderColor: pack.border, color: pack.muted }}
      >
        <span>{p.serviceAreaLine}</span>
        {evidence.hours && p.hoursLine && <span>{p.hoursLine}</span>}
        {p.phone && <span style={{ color: pack.accent }}>{p.phone}</span>}
      </div>
    </div>
  );
}
