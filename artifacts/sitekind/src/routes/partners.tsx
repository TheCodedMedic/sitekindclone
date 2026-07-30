import { createFileRoute } from "@tanstack/react-router";

import { Check, ArrowRight, Handshake, Layers, DollarSign } from "lucide-react";
import { Section, SectionHeading, Eyebrow, CtaLink, CtaBand } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { BreadcrumbSchema } from "@/components/Schema";

const benefits = [
  {
    icon: Layers,
    title: "White-label everything",
    body: "Your brand, your clients, our engine. Dashboards, reports, and preview sites all carry your logo — never ours.",
  },
  {
    icon: DollarSign,
    title: "Keep the margin",
    body: "Wholesale pricing lets you set your own rates. Sell the Core Package at your price; pay ours. The spread is yours.",
  },
  {
    icon: Handshake,
    title: "Zero build cost",
    body: "No engineering team, no AI infrastructure, no voice-agent integrations to maintain. Onboard clients the day you sign.",
  },
];

const tiers = [
  {
    name: "Referral",
    desc: "Send us clients, we handle everything.",
    points: ["$500 credit per closed referral", "No commitment", "We deliver and support"],
  },
  {
    name: "White-Label",
    desc: "Resell the full platform under your brand.",
    points: ["Your branding end to end", "Wholesale pricing", "Set your own retail rates", "Dedicated partner manager"],
    featured: true,
  },
  {
    name: "Strategic",
    desc: "Deep integration for established agencies.",
    points: ["Volume pricing", "Co-branded onboarding", "API access", "Priority feature requests"],
  },
];

function PartnersPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Partners", url: "/partners" },
        ]}
      />

      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <div className="dot-grid" aria-hidden />
        <Section className="relative py-20 text-center">
          <div className="flex justify-center">
            <Eyebrow>Agency Partner Program</Eyebrow>
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[3.25rem]">
            Offer AI services without building the AI
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-2">
            Traditional agencies are losing clients to AI-native competitors.
            White-label our platform and offer websites, voice agents, and
            automated SEO under your own brand — starting today.
          </p>
          <div className="mt-8 flex justify-center">
            <CtaLink href="/contact" variant="primary">
              Become a Partner <ArrowRight size={17} />
            </CtaLink>
          </div>
        </Section>
      </section>

      <Section className="py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 90}>
              <div className="glass-card h-full p-8">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[rgb(194_65_12_/0.14)] text-[var(--color-primary)] dark:text-[#fdba74]">
                  <b.icon size={22} />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                  {b.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">
                  {b.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-16">
        <SectionHeading
          center
          eyebrow="Partnership Tiers"
          title="Three ways to work together"
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div
                className={`glass-card flex h-full flex-col p-8 ${
                  t.featured
                    ? "border-2 border-[var(--color-primary)] dark:shadow-[var(--shadow-glow)]"
                    : ""
                }`}
              >
                <h3 className="font-display text-xl font-bold text-ink">
                  {t.name}
                </h3>
                <p className="mt-2 text-sm text-ink-2">{t.desc}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-ink-2">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                      />
                      {p}
                    </li>
                  ))}
                </ul>
                <CtaLink
                  href="/contact"
                  variant={t.featured ? "primary" : "secondary"}
                  className="mt-8 w-full"
                >
                  Get Started
                </CtaLink>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Add AI to your agency's toolkit"
        subtitle="Book a partnership call and start offering AI services this quarter."
        primary={{ href: "/contact", label: "Become a Partner" }}
        secondary={{ href: "/features", label: "See the Platform" }}
      />
    </>
  );
}


export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Agency Partner Program — White-Label AI Services" },
      { name: "description", content: "Offer AI websites, voice agents, and automated SEO to your clients without building the technology. White-label the sitekind platform under your own brand." },
      { property: "og:title", content: "Agency Partner Program — White-Label AI Services" },
      { property: "og:description", content: "Offer AI websites, voice agents, and automated SEO to your clients without building the technology. White-label the sitekind platform under your own brand." }
    ],
  }),
  component: PartnersPage,
});
