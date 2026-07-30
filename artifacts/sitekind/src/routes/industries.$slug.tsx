import { createFileRoute, Link } from "@tanstack/react-router";

import { notFound } from "@tanstack/react-router";
import { ArrowRight, Quote, TriangleAlert } from "lucide-react";
import { Section, CtaLink, Eyebrow, Stat } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { PreviewMock } from "@/components/PreviewMock";
import { BreadcrumbSchema } from "@/components/Schema";
import { getIndustry } from "@/lib/data/industries";
import { DEMO_HREF } from "@/lib/demoHref";
import { pageHead, emptyHead } from "@/lib/seo";
import { BookCallCta } from "@/components/home/BookCallCta";


function IndustryPage() {
  const { slug } = Route.useParams();
  const ind = getIndustry(slug);
  if (!ind) throw notFound();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Industries", url: "/industries" },
          { name: ind.name, url: `/industries/${ind.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <div className="dot-grid" aria-hidden />
        <Section className="relative py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Link
                to="/industries"
                className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-2 transition-colors hover:text-ink"
              >
                ← All industries
              </Link>
              <div className="flex items-center gap-2">
                <Eyebrow>{ind.shortName}</Eyebrow>
              </div>

              <h1 className="mt-4 font-display text-[2.25rem] font-extrabold leading-[1.12] tracking-tight text-ink sm:text-[2.75rem]">
                {ind.name} businesses deserve better than a template website.
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-ink-2">
                {ind.heroHook}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CtaLink href={DEMO_HREF} variant="primary">
                  Get Your {ind.shortName} Website <ArrowRight size={17} />
                </CtaLink>
                <CtaLink href="/pricing" variant="secondary">
                  Starting at $150/mo
                </CtaLink>
              </div>
            </div>

            <Reveal delay={120}>
              <PreviewMock
                demo
                data={{
                  name: ind.previewBusiness.name,
                  city: ind.previewBusiness.city,
                  rating: ind.previewBusiness.rating,
                  reviews: ind.previewBusiness.reviews,
                  phone: ind.previewBusiness.phone,
                  tagline: ind.previewBusiness.tagline,
                  services: ind.services,
                  industry: ind.name,
                }}
              />
            </Reveal>
          </div>
        </Section>
      </section>

      {/* Stats */}
      <Section className="py-12">
        <div className="glass-card grid gap-8 px-8 py-10 sm:grid-cols-3">
          <Reveal>
            <Stat
              value={ind.testimonial.result}
              label="pilot-program result"
              accent
            />
          </Reveal>
          <Reveal delay={90}>
            <Stat
              value={`${ind.services.length}`}
              label={`${ind.shortName.toLowerCase()} services on the built-in site`}
            />
          </Reveal>
          <Reveal delay={180}>
            <Stat value="24 hrs" label="from signup to live website" />
          </Reveal>
        </div>
      </Section>


      {/* Pain points */}
      <Section className="py-16">
        <div className="max-w-2xl">
          <Eyebrow>The Problem</Eyebrow>
          <h2 className="mt-4 font-display text-[1.75rem] font-bold tracking-tight text-ink sm:text-[2.25rem]">
            What's costing {ind.shortName.toLowerCase()} businesses leads
          </h2>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {ind.painPoints.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <div className="glass-card h-full p-7">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[rgb(245_158_11_/0.14)] text-[var(--color-warning)]">
                  <TriangleAlert size={20} />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Testimonial */}
      <Section className="py-16">
        <Reveal>
          <div className="glass-card relative overflow-hidden px-8 py-12 sm:px-14">
            <div className="mesh !inset-[-50%] opacity-25" aria-hidden />
            <div className="relative mx-auto max-w-3xl text-center">
              <Quote
                size={40}
                className="mx-auto text-[var(--color-primary)] opacity-30"
              />
              <blockquote className="mt-5 font-display text-xl font-medium leading-relaxed text-ink sm:text-2xl">
                “{ind.testimonial.quote}”
              </blockquote>
              <div className="mt-5 text-sm text-ink-2">
                {ind.testimonial.author}
              </div>
              <div className="mt-4 inline-flex rounded-full border border-[rgb(15_118_110_/0.28)] bg-[rgb(15_118_110_/0.1)] px-4 py-1.5 text-sm font-semibold text-[var(--color-accent)] dark:text-[#2dd4bf]">
                {ind.testimonial.result}
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      <BookCallCta />

      {/* CTA */}
      <Section className="pb-20">
        <div className="glass-card flex flex-col items-center gap-6 px-8 py-14 text-center">
          <h2 className="max-w-2xl font-display text-[1.75rem] font-bold tracking-tight text-ink sm:text-[2.25rem]">
            Ready to see your {ind.shortName.toLowerCase()} website?
          </h2>
          <p className="max-w-xl text-ink-2">
            We'll generate a live preview from your real business data — photos,
            reviews, hours, and all — in seconds.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CtaLink href={DEMO_HREF} variant="primary">
              Preview My Website <ArrowRight size={17} />
            </CtaLink>
            <CtaLink href="/pricing" variant="secondary">
              See Pricing
            </CtaLink>
          </div>
        </div>
      </Section>
    </>
  );
}


export const Route = createFileRoute("/industries/$slug")({
  head: ({ params }) => {
    const ind = getIndustry(params.slug);
    return ind
      ? pageHead(ind.name, `${ind.heroHook} ${ind.stat}`)
      : emptyHead();
  },
  component: IndustryPage,
});
