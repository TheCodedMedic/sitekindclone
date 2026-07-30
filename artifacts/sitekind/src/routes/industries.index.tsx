import { createFileRoute, Link } from "@tanstack/react-router";

import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Section, Eyebrow, CtaBand } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { BreadcrumbSchema } from "@/components/Schema";
import { industries } from "@/lib/data/industries";
import { pageHead } from "@/lib/seo";
import { BookCallCta } from "@/components/home/BookCallCta";

// The homepage's shared industry vignette stage, reused verbatim with this
// page's full trade list (Stage 4, item 5). Lazy: without the chunk the page
// is simply the previous static grid.
const IndustryStage = lazy(() =>
  import("@/components/home/motion/IndustryStage").then((m) => ({
    default: m.IndustryStage,
  })),
);

function IndustriesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeInd, setActiveInd] = useState(industries[0]?.slug ?? "hvac");
  useEffect(() => setMounted(true), []);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Industries", url: "/industries" },
        ]}
      />

      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <Section className="relative py-20 text-center">
          <div className="flex justify-center">
            <Eyebrow>Built For Your Trade</Eyebrow>
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[3.25rem]">
            Your industry deserves better than a template
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-2">
            Every site, script, and campaign is tuned to how your trade actually
            gets hired — from the AC-emergency call at 2 AM to the Friday-night
            reservation rush.
          </p>
        </Section>
      </section>

      <Section className="pb-4">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <Reveal key={ind.slug} delay={i * 60}>
              <Link
                to="/industries/$slug"
                params={{ slug: ind.slug }}
                className="glass-card group relative flex h-full flex-col overflow-hidden p-7 transition-transform hover:-translate-y-1"
                onMouseEnter={() => setActiveInd(ind.slug)}
                onFocus={() => setActiveInd(ind.slug)}
              >
                <div
                  className="absolute right-[-30%] top-[-30%] h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle, rgb(16 185 129 / 0.35), transparent 70%)",
                  }}
                  aria-hidden
                />
                <h2 className="relative font-display text-xl font-semibold text-ink">
                  {ind.name}
                </h2>
                <p className="relative mt-3 flex-1 text-sm leading-relaxed text-ink-2">
                  {ind.heroHook}
                </p>
                <div className="relative mt-5 flex items-center justify-between border-t border-[var(--card-border)] pt-4">
                  <span className="text-sm font-semibold text-[var(--color-accent)]">
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

          {/* "More coming" card */}
          <Reveal delay={industries.length * 60}>
            <div className="glass-card flex h-full flex-col items-start justify-center p-7">
              <h2 className="font-display text-lg font-semibold text-ink">
                Don't see your trade?
              </h2>
              <p className="mt-2 text-sm text-ink-2">
                Medical, legal, and real estate are next. If you serve a local
                market, we can build for you.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] dark:text-[#fdba74]"
              >
                Ask about your industry <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Shared illustrative stage — reserved space (zero CLS); vignettes
            follow the hovered/focused card, chips tap-select on touch. */}
        <div className="relative mx-auto mt-8 h-40 max-w-3xl">
          {mounted && (
            <Suspense fallback={null}>
              <IndustryStage
                active={activeInd}
                items={industries.map((i) => ({ slug: i.slug, name: i.name }))}
                onSelect={setActiveInd}
              />
            </Suspense>
          )}
        </div>
      </Section>

      <BookCallCta />

      <CtaBand
        title="See what we'd build for your business"
        subtitle="Enter your business name and watch a preview site generate in seconds."
        primary={{ href: "/demo", label: "Preview My Website" }}
        secondary={{ href: "/pricing", label: "See Pricing" }}
      />
    </>
  );
}


export const Route = createFileRoute("/industries/")({
  head: () =>
    pageHead(
      "Industries: Websites Built for Your Trade",
      "HVAC, restaurants, salons, landscaping, auto repair, remodeling, and fitness — websites, AI receptionists, and local SEO tuned to how your industry actually gets hired.",
    ),
  component: IndustriesPage,
});
