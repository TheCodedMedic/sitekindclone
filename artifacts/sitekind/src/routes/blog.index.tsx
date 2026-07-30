import { createFileRoute } from "@tanstack/react-router";

import { Section, Eyebrow, CtaBand } from "@/components/ui";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { BreadcrumbSchema } from "@/components/Schema";

function BlogPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ]}
      />
      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <Section className="relative py-16 text-center">
          <div className="flex justify-center">
            <Eyebrow>The Blog</Eyebrow>
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[3.25rem]">
            Marketing that works for people who work with their hands
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-2">
            Published weekly by the same AI content engine that runs our
            clients' blogs. We eat our own dog food.
          </p>
        </Section>
      </section>

      <Section className="pb-16">
        <BlogIndex />
      </Section>

      <CtaBand
        title="Want this running on your website?"
        subtitle="Weekly, SEO-optimized, quality-judged content — auto-published to your site while you work."
        primary={{ href: "/features/automated-seo", label: "See How It Works" }}
        secondary={{ href: "/pricing", label: "See Pricing" }}
      />
    </>
  );
}


export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — AI, Local SEO & Marketing for Service Businesses" },
      { name: "description", content: "Practical guides on AI voice agents, local SEO, Google Business Profile, and marketing for HVAC, restaurants, salons, and every service business — published weekly by the same engine that powers our clients." },
      { property: "og:title", content: "Blog — AI, Local SEO & Marketing for Service Businesses" },
      { property: "og:description", content: "Practical guides on AI voice agents, local SEO, Google Business Profile, and marketing for HVAC, restaurants, salons, and every service business — published weekly by the same engine that powers our clients." }
    ],
  }),
  component: BlogPage,
});
