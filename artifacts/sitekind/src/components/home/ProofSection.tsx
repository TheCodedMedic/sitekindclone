import { Quote, Rocket, PhoneCall, PenLine } from "lucide-react";
import { Section, SectionHeading, Stat, Badge } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { testimonials } from "@/lib/data/marketing";
import { useSectionVisibility } from "@/lib/motion/useSectionVisibility";
import { CountUpValue } from "@/components/home/motion/CountUpValue";

// Every quote, name, and number here comes from the existing data layer
// (src/lib/data/marketing.ts) or the product spec's launch timeline —
// nothing is invented in this component.

// Launch timeline — the product promise (spec §"go live"): site in 24 hours
// (pre-built during the preview phase), voice agent within 48, content
// engine's first weekly post on day seven.
const launchSteps = [
  {
    icon: Rocket,
    when: "24 hours",
    what: "Website live",
    detail: "Already pre-built during the preview phase — going live is a switch-flip.",
  },
  {
    icon: PhoneCall,
    when: "48 hours",
    what: "Voice agent activated",
    detail: "Answering every call, booking jobs, and texting back the ones it misses.",
  },
  {
    icon: PenLine,
    when: "Day 7",
    what: "Content engine starts",
    detail: "Weekly SEO blog posts begin publishing — quality-judged before they ship.",
  },
] as const;

// Outcome stats lifted verbatim from the pilot testimonials' result lines.
const outcomes = [
  { value: "+41", label: "after-hours jobs booked in a quarter", accent: true },
  { value: "14 wks", label: "from page 3 to the Google Maps 3-pack", accent: false },
  { value: "$62k", label: "project closed in week 5 of the new site", accent: false },
] as const;

const shownTestimonials = testimonials.slice(0, 3);

export function ProofSection() {
  // Timeline progress line fills once, on first entry (Stage 3, item 6).
  const { ref: lineRef, isVisible: lineOn } =
    useSectionVisibility<HTMLDivElement>({ threshold: 0.3, once: true });

  return (
    <Section className="py-20" id="proof">
      <SectionHeading
        center
        eyebrow="Proof"
        title={
          <>
            Live in 24 hours.{" "}
            <span className="font-accent font-semibold text-[var(--color-primary)]">
              Booked jobs by week one.
            </span>
          </>
        }
        intro="Composite results from our pilot program and portfolio-brand campaign data."
      />

      {/* Launch timeline — the 24h/48h/day-7 product promise */}
      <div
        ref={lineRef}
        className={`relative mt-12 ${lineOn ? "proof-line-on" : ""}`}
      >
        {/* Progress line — decorative, fills once on entry (lg only). */}
        <div
          className="proof-line pointer-events-none absolute -top-5 left-[4%] right-[4%] hidden lg:block"
          aria-hidden="true"
        >
          <div className="proof-line-track">
            <div className="proof-line-fill" />
          </div>
          <span className="proof-line-dot" style={{ left: "16.66%" }} />
          <span className="proof-line-dot" style={{ left: "50%" }} />
          <span className="proof-line-dot" style={{ left: "83.33%" }} />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
        {launchSteps.map((s, i) => (
          <Reveal key={s.what} delay={i * 100}>
            <div className="glass-card proof-step flex h-full items-start gap-4 p-6">
              <span className="proof-step-icon grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[rgb(194_65_12_/0.12)] text-[var(--color-primary)] dark:text-[#fdba74]">
                <s.icon size={20} />
              </span>
              <div>
                <div className="font-code text-xs text-[var(--color-accent)]">
                  {s.when}
                </div>
                <div className="mt-1 font-display text-lg font-semibold text-ink">
                  {s.what}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
                  {s.detail}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
        </div>
      </div>

      {/* Outcome stats — pilot-program results */}
      <Reveal className="mt-6">
        <div className="glass-card relative overflow-hidden px-8 py-10">
          <div className="mesh !inset-[-50%] opacity-20" aria-hidden />
          <div className="relative grid gap-8 text-center sm:grid-cols-3 sm:text-left">
            {outcomes.map((o) => (
              <Stat
                key={o.label}
                value={<CountUpValue value={o.value} />}
                label={o.label}
                accent={o.accent}
              />
            ))}
          </div>
        </div>
      </Reveal>

      {/* Testimonial cards */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {shownTestimonials.map((t, i) => (
          <Reveal key={t.author} delay={i * 100} variant="fade">
            <figure className="glass-card testimonial-lift flex h-full flex-col p-7">
              <Quote
                size={28}
                className="text-[var(--color-primary)] opacity-30"
              />
              <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-[var(--card-border)] pt-4">
                <div className="text-sm font-semibold text-ink">{t.author}</div>
                <div className="mt-0.5 text-xs text-ink-2">{t.role}</div>
                <div className="mt-3 inline-flex rounded-full border border-[rgb(15_118_110_/0.28)] bg-[rgb(15_118_110_/0.1)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)] dark:text-[#2dd4bf]">
                  {t.result}
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      {/* Pilot-program callout */}
      <Reveal className="mt-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <Badge tone="accent">Pilot program</Badge>
          <p className="text-sm leading-relaxed text-ink-2">
            These numbers come from our pilot program and portfolio-brand
            campaign data — real bookings, real rankings, presented as
            composites. We don't fabricate reviews or testimonials, for our
            clients or for ourselves.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
