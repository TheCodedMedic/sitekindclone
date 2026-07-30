import { createFileRoute, Link } from "@tanstack/react-router";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Minus, Play } from "lucide-react";
import { Section, SectionHeading, CtaBand, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { FeatureIcon } from "@/components/FeatureIcon";
import { BreadcrumbSchema } from "@/components/Schema";
import { features } from "@/lib/data/features";
import { featureComparison } from "@/lib/data/marketing";
import { pageHead } from "@/lib/seo";
import { useMotion } from "@/lib/motion/MotionProvider";
import { track } from "@/lib/motionAnalytics";
import {
  CAPABILITY_DEMO_KIND_BY_SLUG,
  type CapabilityDemoKind,
} from "@/components/home/motion/CapabilityDemo";

// Same compact product windows as the homepage capability cards (Stage 4
// reuses the Stage 3 grammar — no new engines). Lazy: if the chunk never
// loads, the cards are simply the previous static cards.
const CapabilityDemo = lazy(() =>
  import("@/components/home/motion/CapabilityDemo").then((m) => ({
    default: m.CapabilityDemo,
  })),
);

function FeaturesPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Features", url: "/features" },
        ]}
      />

      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <Section className="relative py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center">
              <Eyebrow>Capabilities</Eyebrow>
            </div>
            <h1 className="mt-5 font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[3.25rem]">
              Everything your business needs.{" "}
              <span className="text-[var(--color-accent)]">Nothing it doesn't.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-2">
              Four AI systems replace an entire agency team — build, phones,
              content, and rankings — at a fraction of the cost.
            </p>
          </div>
        </Section>
      </section>

      <Section className="pb-4">
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={f.slug} delay={i * 90}>
              <FeatureCard feature={f} />
            </Reveal>
          ))}
        </div>
      </Section>

      <ComparisonTable />

      <CtaBand
        title="One platform. Every ranking signal."
        subtitle="See exactly what's included at each price point."
        primary={{ href: "/pricing", label: "See Pricing" }}
        secondary={{ href: "/demo", label: "Preview My Website" }}
      />
    </>
  );
}

// Feature card + compact product window (Level B — same pattern as the
// homepage CapabilityCard). Hover/focus activates the demo on fine
// pointers; coarse pointers get a tap-to-preview button (a sibling of the
// Link — never a button inside a link). The window has a fixed height
// (reserved SSR space, zero CLS) and is purely decorative.
function FeatureCard({ feature: f }: { feature: (typeof features)[number] }) {
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
      track("capability_demo_activated", { demo: kind, page: "features_hub" });
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
        <h2 className="mt-6 font-display text-xl font-semibold text-ink">
          {f.title}
        </h2>
        <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-2">
          {f.summary}
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
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] transition-all group-hover:gap-2.5 dark:text-[#fdba74]">
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

function Cell({ value }: { value: boolean | string }) {
  if (value === true)
    return <Check size={18} className="mx-auto text-[var(--color-accent)]" />;
  if (value === false)
    return <Minus size={18} className="mx-auto text-ink-2 opacity-40" />;
  return <span className="text-xs text-ink-2">{value}</span>;
}

function ComparisonTable() {
  const { rows, columns } = featureComparison;
  return (
    <Section className="py-20">
      <SectionHeading
        center
        eyebrow="Head to Head"
        title="sitekind vs. the alternatives"
        intro="The same comparison every service-business owner runs — laid out honestly."
      />
      <Reveal className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left" />
              {columns.map((c, i) => (
                <th
                  key={c.name}
                  className={`p-4 text-center font-display text-sm font-semibold ${
                    i === 0
                      ? "rounded-t-xl bg-[rgb(194_65_12_/0.1)] text-ink"
                      : "text-ink-2"
                  }`}
                >
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={row} className="border-t border-[var(--card-border)]">
                <td className="p-4 text-sm font-medium text-ink">{row}</td>
                {columns.map((c, i) => (
                  <td
                    key={c.name}
                    className={`p-4 text-center ${
                      i === 0 ? "bg-[rgb(194_65_12_/0.07)]" : ""
                    } ${r === rows.length - 1 && i === 0 ? "rounded-b-xl" : ""}`}
                  >
                    <Cell value={c.values[r]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </Section>
  );
}


export const Route = createFileRoute("/features/")({
  head: () =>
    pageHead(
      "Features: AI Websites, Voice Agents & Automated SEO",
      "Four AI systems working together: website generation, a 24/7 voice receptionist, automated SEO content, and Google Maps dominance. See what sitekind does.",
    ),
  component: FeaturesPage,
});
