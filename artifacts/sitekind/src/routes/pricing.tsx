import { createFileRoute, Link } from "@tanstack/react-router";

import { Check, Minus, ShieldCheck, ArrowRight } from "lucide-react";
import { Section, SectionHeading, Eyebrow, CtaBand } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { PricingCards } from "@/components/pricing/PricingCards";
import { Accordion } from "@/components/Accordion";
import {
  BreadcrumbSchema,
  FaqSchema,
  ProductSchema,
} from "@/components/Schema";
import { comparisonMatrix, marketComparison } from "@/lib/data/pricing";
import { pricingFaqs } from "@/lib/data/faqs";
import { DEMO_HREF } from "@/lib/demoHref";

function PricingPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Pricing", url: "/pricing" },
        ]}
      />
      <FaqSchema faqs={pricingFaqs} />
      <ProductSchema
        name="Core Agency Package"
        description="Complete AI-powered digital agency: website, SEO, content, and Google Ads."
        price="5000"
      />

      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <Section className="relative pb-10 pt-20 text-center">
          <div className="flex justify-center">
            <Eyebrow>Pricing</Eyebrow>
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[3.25rem]">
            Enterprise-grade AI. Small business prices.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-2">
            No retainers. No surprise invoices. Pick a plan, own your website,
            and cancel the low annual maintenance any time.
          </p>
        </Section>
      </section>

      <Section className="pb-8">
        <PricingCards />
      </Section>

      {/* Financing callout */}
      <Section className="py-8">
        <Reveal>
          <div className="glass-card flex flex-col items-center gap-6 px-8 py-10 text-center md:flex-row md:text-left">
            <div className="flex-1">
              <h3 className="font-display text-xl font-semibold text-ink">
                Can't do $5,000 up front? Neither can most shops.
              </h3>
              <p className="mt-2 max-w-2xl text-ink-2">
                The Core Package finances at <strong className="text-ink">$500 down + $375/month</strong> for 12
                months — same total, no interest. The question stops being “can I
                afford a website?” and becomes “can I afford $375/month for a
                complete digital presence?” Most owners answer yes.
              </p>
            </div>
            <Link to={DEMO_HREF} className="btn-primary shrink-0">
              Apply for Financing <ArrowRight size={17} />
            </Link>
          </div>
        </Reveal>
      </Section>

      {/* Comparison matrix */}
      <Section className="py-16">
        <SectionHeading
          center
          eyebrow="Compare Plans"
          title="Exactly what's in each plan"
        />
        <Reveal className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left font-display text-sm text-ink-2">
                  Feature
                </th>
                {comparisonMatrix.columns.map((c, i) => (
                  <th
                    key={c.name}
                    className={`p-4 text-center font-display text-sm font-semibold ${
                      i === 1 ? "text-[var(--color-accent)]" : "text-ink"
                    }`}
                  >
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonMatrix.criteria.map((crit, r) => (
                <tr key={crit} className="border-t border-[var(--card-border)]">
                  <td className="p-4 text-sm font-medium text-ink">{crit}</td>
                  {comparisonMatrix.columns.map((c) => {
                    const v = c.values[r];
                    return (
                      <td key={c.name} className="p-4 text-center">
                        {v === "✓" ? (
                          <Check
                            size={17}
                            className="mx-auto text-[var(--color-accent)]"
                          />
                        ) : v === "—" ? (
                          <Minus
                            size={16}
                            className="mx-auto text-ink-2 opacity-40"
                          />
                        ) : (
                          <span className="text-xs text-ink-2">{v}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </Section>

      {/* Market comparison */}
      <Section className="py-16">
        <SectionHeading
          center
          eyebrow="The Alternatives"
          title="What everyone else charges"
          intro="Year-one cost of assembling the same capabilities elsewhere."
        />
        <Reveal className="mt-12 overflow-x-auto">
          <table className="spec-table min-w-[680px]">
            <thead>
              <tr>
                <th>Service</th>
                <th>Traditional Agency</th>
                <th>Freelancer</th>
                <th>DIY (Wix/Squarespace)</th>
                <th className="!text-[var(--color-accent)]">sitekind</th>
              </tr>
            </thead>
            <tbody>
              {marketComparison.rows.map((row) => (
                <tr key={row.service}>
                  <td className="!text-ink !font-medium">{row.service}</td>
                  <td>{row.agency}</td>
                  <td>{row.freelancer}</td>
                  <td>{row.diy}</td>
                  <td className="!font-semibold !text-[var(--color-accent-hover)] dark:!text-[var(--color-accent)]">
                    {row.us}
                  </td>
                </tr>
              ))}
              <tr className="bg-[rgb(15_118_110_/0.06)]">
                <td className="!font-bold !text-ink">Total Year 1</td>
                <td className="!font-semibold !text-ink">
                  {marketComparison.totals.agency}
                </td>
                <td className="!font-semibold !text-ink">
                  {marketComparison.totals.freelancer}
                </td>
                <td className="!font-semibold !text-ink">
                  {marketComparison.totals.diy}
                </td>
                <td className="!font-bold !text-[var(--color-accent-hover)] dark:!text-[var(--color-accent)]">
                  {marketComparison.totals.us}
                </td>
              </tr>
            </tbody>
          </table>
        </Reveal>
      </Section>

      {/* Guarantee */}
      <Section className="py-10">
        <Reveal>
          <div className="glass-card flex items-start gap-5 px-8 py-8">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[rgb(15_118_110_/0.14)] text-[var(--color-accent)]">
              <ShieldCheck size={24} />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">
                The Mega Package Performance Guarantee
              </h3>
              <p className="mt-2 text-ink-2">
                If your business isn't ranking in the Top 3 of Google Maps for
                your primary keywords within 20 weeks, we keep working at no
                additional cost until it is. It's written into your agreement —
                in plain English.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* FAQ */}
      <Section className="py-16" id="faq">
        <SectionHeading
          center
          eyebrow="Questions"
          title="Everything owners ask before signing up"
        />
        <div className="mx-auto mt-12 max-w-3xl">
          <Accordion items={pricingFaqs} />
        </div>
      </Section>

      <CtaBand
        title="Pick a plan. Your preview is already built."
        subtitle="Start at $150/month or go all-in with the Core Package. You can be live in 24 hours."
        primary={{ href: "/demo", label: "Preview My Website" }}
        secondary={{ href: "/roi-calculator", label: "Calculate My ROI" }}
      />
    </>
  );
}


export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Plans From $150/mo to the $15k Mega Package" },
      { name: "description", content: "Transparent, fixed pricing. Starter at $150/mo, the Core Agency Package at $5,000/yr (or $375/mo financed), a $3,500/yr AI voice add-on, and a $15,000 Mega Package with a Top-3 Google Maps guarantee." },
      { property: "og:title", content: "Pricing — Plans From $150/mo to the $15k Mega Package" },
      { property: "og:description", content: "Transparent, fixed pricing. Starter at $150/mo, the Core Agency Package at $5,000/yr (or $375/mo financed), a $3,500/yr AI voice add-on, and a $15,000 Mega Package with a Top-3 Google Maps guarantee." }
    ],
  }),
  component: PricingPage,
});
