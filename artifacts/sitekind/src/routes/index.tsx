import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { ArrowRight, Check, Play } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { PromoVideo } from "@/components/home/PromoVideo";
import { ValueComparison } from "@/components/home/ValueComparison";
import { ProofSection } from "@/components/home/ProofSection";
import { BookCallCta } from "@/components/home/BookCallCta";
import { Section, SectionHeading, CtaBand, Badge } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { FeatureIcon } from "@/components/FeatureIcon";
import {
  proofPoints,
  howItWorks,
  featureCards,
} from "@/lib/data/marketing";
import { industries } from "@/lib/data/industries";
import { useMotion } from "@/lib/motion/MotionProvider";
import { useSectionVisibility } from "@/lib/motion/useSectionVisibility";
import { track } from "@/lib/motionAnalytics";
import { CountUpValue } from "@/components/home/motion/CountUpValue";
import {
  CAPABILITY_DEMO_KIND_BY_SLUG,
  type CapabilityDemoKind,
} from "@/components/home/motion/CapabilityDemo";

// Below-fold Level-B motion — lazy: if these chunks never load, the page is
// simply the current static page (motion is always progressive enhancement).
const CapabilityDemo = lazy(() =>
  import("@/components/home/motion/CapabilityDemo").then((m) => ({
    default: m.CapabilityDemo,
  })),
);
const IndustryStage = lazy(() =>
  import("@/components/home/motion/IndustryStage").then((m) => ({
    default: m.IndustryStage,
  })),
);

function HomePage() {
  return (
    <>
      <Hero />
      <PromoVideo />
      <SocialProofBar />
      <HowItWorks />
      <FeatureGrid />
      <ValueComparison />
      <IndustryShowcase />
      <ProofSection />
      <BookCallCta />
      <CtaBand
        title="Ready to stop losing leads?"
        subtitle="Get started for $150/month, or explore our $5,000 Core Package. Your preview site is already built."
        primary={{ href: "/pricing", label: "Get Started for $150/mo" }}
        secondary={{ href: "/demo", label: "Preview My Website" }}
        convergence
      />
    </>
  );
}

function SocialProofBar() {
  return (
    <Section className="pb-4 pt-8">
      <div className="glass-card grid grid-cols-2 gap-6 px-6 py-8 sm:px-10 lg:grid-cols-4">
        {proofPoints.map((p, i) => (
          <Reveal key={p.label} delay={i * 80} className="text-center">
            <div className="stat-emph">
              <div className="stat-emph-value font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                <CountUpValue value={p.value} />
              </div>
              <div className="mt-1.5 text-xs leading-snug text-ink-2">
                {p.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function HowItWorks() {
  // Route line draws step 1 → step 3 once, on first section entry.
  const { ref: routeRef, isVisible: routeDrawn } =
    useSectionVisibility<HTMLDivElement>({ threshold: 0.3, once: true });

  return (
    <Section className="py-20" id="how-it-works">
      <SectionHeading
        center
        eyebrow="How It Works"
        title="Three steps. Zero busywork."
        intro="From cold prospect to booked calendar — automated end to end."
      />
      <div ref={routeRef} className="relative mt-14">
        {/* Decorative route line — reserved absolute space in the existing gap. */}
        <svg
          className={`hiw-route pointer-events-none absolute -top-8 left-[10%] hidden h-7 w-[80%] lg:block ${
            routeDrawn ? "hiw-route-drawn" : ""
          }`}
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 7 C 18 2, 34 3, 50 6 S 82 9, 100 3"
            pathLength={1}
            fill="none"
            stroke="var(--color-accent)"
            strokeOpacity="0.4"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="grid gap-6 lg:grid-cols-3">
          {howItWorks.map((s, i) => (
            <Reveal key={s.step} delay={i * 120}>
              <div className="glass-card hiw-card group relative h-full overflow-hidden p-8">
                <div className="flex items-center justify-between">
                  <span className="hiw-icon inline-flex">
                    <FeatureIcon name={s.icon} className="h-12 w-12" size={24} />
                  </span>
                  <span className="font-display text-5xl font-extrabold text-[var(--card-border)] transition-colors group-hover:text-[rgb(194_65_12_/0.25)]">
                    {s.step}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-ink">
                  {s.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

function FeatureGrid() {
  return (
    <Section className="py-20">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything your business needs. Nothing it doesn't."
          intro="Four AI systems working together, so you don't hire four people."
        />
        <Link
          to="/features"
          className="btn-secondary shrink-0"
        >
          Explore all features <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {featureCards.map((f, i) => (
          <Reveal key={f.slug} delay={i * 90}>
            <CapabilityCard feature={f} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// Capability card + compact product window (Level B). Hover/focus activates
// the demo on fine pointers; coarse pointers get a tap-to-preview button
// (a sibling of the Link — never a button inside a link).
function CapabilityCard({
  feature: f,
}: {
  feature: (typeof featureCards)[number];
}) {
  const { finePointer } = useMotion();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const firedRef = useRef(false);
  useEffect(() => setMounted(true), []);

  const kind: CapabilityDemoKind =
    CAPABILITY_DEMO_KIND_BY_SLUG[f.slug] ?? "website";

  const activate = () => {
    setActive(true);
    if (!firedRef.current) {
      firedRef.current = true;
      track("capability_demo_activated", { demo: kind });
    }
  };
  const deactivate = () => setActive(false);

  return (
    <div className="relative h-full">
      <Link
        to="/features/$slug"
        params={{ slug: f.slug }}
        className="glass-card group flex h-full flex-col p-8 transition-transform hover:-translate-y-1"
        onMouseEnter={activate}
        onMouseLeave={deactivate}
        onFocus={activate}
        onBlur={deactivate}
      >
        <FeatureIcon name={f.icon} className="h-14 w-14" size={26} />
        <h3 className="mt-6 font-display text-xl font-semibold text-ink">
          {f.title}
        </h3>
        <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-2">
          {f.body}
        </p>
        {/* Compact product window — fixed height (zero CLS), decorative. */}
        <div className="cap-demo mt-6" aria-hidden="true">
          <span className="sample-tag font-code absolute bottom-2 right-2 z-[2]">
            DEMO
          </span>
          {mounted && (
            <Suspense fallback={null}>
              <CapabilityDemo kind={kind} active={active} />
            </Suspense>
          )}
        </div>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] transition-transform group-hover:gap-2.5 dark:text-[#fdba74]">
          Learn more <ArrowRight size={15} />
        </span>
      </Link>
      {/* Coarse pointers: visible tap-to-preview (no hover required). */}
      {mounted && !finePointer && (
        <button
          type="button"
          className="cap-demo-tap"
          aria-pressed={active}
          aria-label={`Preview the ${f.title} demo`}
          onClick={() => (active ? deactivate() : activate())}
        >
          <Play size={11} /> Preview
        </button>
      )}
    </div>
  );
}

function IndustryShowcase() {
  const shown = industries.slice(0, 6);
  const [mounted, setMounted] = useState(false);
  const [activeInd, setActiveInd] = useState(shown[0]?.slug ?? "hvac");
  useEffect(() => setMounted(true), []);

  return (
    <Section className="py-20">
      <SectionHeading
        center
        eyebrow="Built For Your Trade"
        title="Industry-specific from the first pixel"
        intro="Every template, every word of copy, every voice-agent script is tuned to how your industry actually gets hired."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((ind, i) => (
          <Reveal key={ind.slug} delay={i * 70}>
            <Link
              to="/industries/$slug"
              params={{ slug: ind.slug }}
              className="glass-card group relative flex h-full flex-col justify-between overflow-hidden p-7 transition-transform hover:-translate-y-1"
              onMouseEnter={() => setActiveInd(ind.slug)}
              onFocus={() => setActiveInd(ind.slug)}
            >
              <div
                className="absolute right-[-30%] top-[-30%] h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(circle, rgb(79 70 229 / 0.4), transparent 70%)",
                }}
                aria-hidden
              />
              <div className="relative">
                <h3 className="font-display text-xl font-semibold text-ink">
                  {ind.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{ind.stat}</p>
              </div>
              <div className="relative mt-6 flex items-center justify-between">
                <span className="font-code text-xs text-[var(--color-accent)]">
                  {ind.testimonial.result}
                </span>
                <ArrowRight
                  size={16}
                  className="text-ink-2 transition-transform group-hover:translate-x-1"
                />
              </div>

            </Link>
          </Reveal>
        ))}
      </div>
      {/* Shared illustrative stage — reserved space (zero CLS); vignettes
          follow the hovered/focused card, chips tap-select on touch. */}
      <div className="relative mx-auto mt-8 h-40 max-w-3xl">
        {mounted && (
          <Suspense fallback={null}>
            <IndustryStage
              active={activeInd}
              items={shown.map((i) => ({ slug: i.slug, name: i.name }))}
              onSelect={setActiveInd}
            />
          </Suspense>
        )}
      </div>
      <div className="mt-10 text-center">
        <Link to="/industries" className="btn-secondary">
          View all industries <ArrowRight size={16} />
        </Link>
      </div>
    </Section>
  );
}


export const Route = createFileRoute("/")({
  component: HomePage,
});
