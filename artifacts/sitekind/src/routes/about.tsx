import { createFileRoute } from "@tanstack/react-router";

import { Globe, MapPin, PenLine, PhoneCall, type LucideIcon } from "lucide-react";
import { Section, SectionHeading, Eyebrow, Stat, CtaBand } from "@/components/ui";
import { Reveal as R } from "@/components/Reveal";
import { BreadcrumbSchema } from "@/components/Schema";
import { CountUpValue } from "@/components/home/motion/CountUpValue";
import { useMotion } from "@/lib/motion/MotionProvider";
import { useSectionVisibility } from "@/lib/motion/useSectionVisibility";

const values = [
  {
    title: "Automation First",
    body: "Every process that can be automated will be — from onboarding to content to support. Humans handle judgment; software handles everything else.",
  },
  {
    title: "Radical Affordability",
    body: "Enterprise tools at small-business prices, because AI eliminates the labor costs that make traditional agencies unaffordable.",
  },
  {
    title: "Data-Driven Decisions",
    body: "Every template, script, and SEO recommendation is tuned to how a specific trade — HVAC, salons, restaurants — actually wins customers. No generic playbooks.",
  },
  {
    title: "Measurable ROI",
    body: "Clients see clear, quantifiable returns — more calls, more bookings, higher rankings — within 90 days, or we keep working.",
  },
];

const moat = [
  {
    title: "The Product Moat",
    body: "A website, AI voice receptionist, and automated local SEO — assembled, launched, and maintained as one system, not three vendors to babysit.",
    stat: "24 hrs",
    label: "from signup to live",
  },
  {
    title: "The Infrastructure Moat",
    body: "GigaCluster: automated, self-healing server infrastructure with watchdog recovery and nightly maintenance that would cost a competitor $500K+ to replicate.",
    stat: "99.9%",
    label: "uptime SLA",
  },
  {
    title: "The Operational Moat",
    body: "Institutional knowledge from running multi-touch acquisition and payment operations across portfolio brands at a 91.7% payment success rate.",
    stat: "$5.4M+",
    label: "revenue proven",
  },
];

// The four systems the copy below describes as "one system" — decorative
// diagram fodder only (Stage 4, item 7).
const systems: { icon: LucideIcon; label: string }[] = [
  { icon: Globe, label: "AI Website" },
  { icon: PhoneCall, label: "Voice Agent" },
  { icon: PenLine, label: "SEO Content" },
  { icon: MapPin, label: "Google Maps" },
];

/**
 * Restrained four-systems diagram: node chips connected by short accent
 * links. Assembles ONCE on first viewport entry (motion on only); hover
 * response is a ≤2px lift on fine pointers. Decorative (aria-hidden),
 * static assembled state for SSR / reduced motion / motion off. No
 * particles, nothing continuous.
 */
function FourSystemsDiagram() {
  const { motionOn } = useMotion();
  const { ref, isVisible } = useSectionVisibility<HTMLDivElement>({
    threshold: 0.3,
    once: true,
  });
  const live = motionOn && isVisible;

  return (
    <div
      ref={ref}
      className={`sys-diagram mt-10 ${live ? "sys-live" : ""}`}
      aria-hidden="true"
    >
      {systems.map((s, i) => {
        const Icon = s.icon;
        return (
          <span key={s.label} className="contents">
            {i > 0 && (
              <span
                className="sys-connector"
                style={{ "--fv-delay": `${i * 220 - 90}ms` } as React.CSSProperties}
              />
            )}
            <span
              className="sys-node"
              style={{ "--fv-delay": `${i * 220}ms` } as React.CSSProperties}
            >
              <Icon size={15} className="text-[var(--color-accent)]" />
              {s.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function AboutPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ]}
      />

      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <div className="dot-grid" aria-hidden />
        <Section className="relative py-20">
          <div className="max-w-3xl">
            <Eyebrow>Our Story</Eyebrow>
            <h1 className="mt-5 font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[3.25rem]">
              We're not a website builder. We're not an agency. We're a new
              category.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-2">
              The traditional agency model is broken for local service
              businesses. Monthly retainers of $2,000–$5,000 for SEO, plus
              thousands more for a website, are simply unaffordable for a
              three-truck HVAC company or a family restaurant. DIY builders
              demand time and expertise owners don't have — and lack the AI
              features that define modern marketing. We built the third option.
            </p>
            <FourSystemsDiagram />
          </div>
        </Section>
      </section>

      {/* Mission / Vision */}
      <Section className="py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <R>
            <div className="glass-card h-full p-8">
              <Eyebrow>Mission</Eyebrow>
              <p className="mt-4 font-display text-xl font-medium leading-relaxed text-ink">
                To democratize enterprise-grade digital marketing and AI
                automation for every local service business in North America —
                replacing expensive, labor-intensive agencies with intelligent,
                scalable technology that works around the clock.
              </p>
            </div>
          </R>
          <R delay={100}>
            <div className="glass-card h-full p-8">
              <Eyebrow>Vision</Eyebrow>
              <p className="mt-4 font-display text-xl font-medium leading-relaxed text-ink">
                To become the default digital infrastructure for service
                businesses — the “Shopify of service industries” — where every
                plumber, restaurant, salon, and contractor generates leads and
                books customers without lifting a finger.
              </p>
            </div>
          </R>
        </div>
      </Section>

      {/* Moat */}
      <Section className="py-16">
        <SectionHeading
          center
          eyebrow="Our Unfair Advantage"
          title="Three moats no competitor can replicate overnight"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {moat.map((m, i) => (
            <R key={m.title} delay={i * 100}>
              <div className="glass-card h-full p-8">
                {/* Count-up once on entry; SSR renders the final value. */}
                <Stat
                  value={<CountUpValue value={m.stat} />}
                  label={m.label}
                  accent={i === 2}
                />
                <h3 className="mt-6 font-display text-lg font-semibold text-ink">
                  {m.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">
                  {m.body}
                </p>
              </div>
            </R>
          ))}
        </div>
      </Section>

      {/* Values */}
      <Section className="py-16">
        <SectionHeading
          center
          eyebrow="Core Values"
          title="Four principles we operate on"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {values.map((v, i) => (
            <R key={v.title} delay={i * 80}>
              <div className="glass-card flex h-full gap-5 p-7">
                <span className="font-display text-3xl font-extrabold text-[rgb(194_65_12_/0.3)]">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">
                    {v.body}
                  </p>
                </div>
              </div>
            </R>
          ))}
        </div>
      </Section>

      {/* Portfolio */}
      <Section className="py-16">
        <R>
          <div className="glass-card p-8 sm:p-12">
            <Eyebrow>The Lake Holdings Portfolio</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              We didn't start from scratch. We inherited a proven engine.
            </h2>
            <p className="mt-4 max-w-3xl text-ink-2">
              sitekind operates under Lake Holdings, leveraging shared
              infrastructure and operational playbooks from portfolio brands
              that have already generated $5.4M+ in revenue across 18,600+
              transactions. The payment infrastructure, acquisition playbooks,
              and operational knowledge transfer directly.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                ["MySafeDomain", "$5.07M"],
                ["Admin Manual", "$179K"],
                ["LaborCompliant", "$82K"],
                ["DomainNetworks", "$96K"],
                ["GeographicAG", "$14K"],
              ].map(([name, rev]) => (
                <div
                  key={name}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-4"
                >
                  <div className="font-display text-lg font-bold text-ink">
                    {rev}
                  </div>
                  <div className="mt-1 text-xs text-ink-2">{name}</div>
                </div>
              ))}
            </div>
          </div>
        </R>
      </Section>

      <CtaBand
        title="Join the businesses building on our platform"
        primary={{ href: "/demo", label: "Preview My Website" }}
        secondary={{ href: "/pricing", label: "See Pricing" }}
      />
    </>
  );
}


export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — The Automated Agency for Service Businesses" },
      { name: "description", content: "sitekind is a Lake Holdings company delivering websites, AI voice receptionists, and automated local SEO to service businesses — one system, launched in 24 hours." },
      { property: "og:title", content: "About — The Automated Agency for Service Businesses" },
      { property: "og:description", content: "sitekind is a Lake Holdings company delivering websites, AI voice receptionists, and automated local SEO to service businesses — one system, launched in 24 hours." }
    ],
  }),
  component: AboutPage,
});

