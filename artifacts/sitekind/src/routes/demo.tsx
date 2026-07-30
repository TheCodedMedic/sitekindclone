import { createFileRoute } from "@tanstack/react-router";

import { Section, Eyebrow } from "@/components/ui";
import { DemoWizard } from "@/components/demo/DemoWizard";
import { BreadcrumbSchema } from "@/components/Schema";

const DESC =
  "Answer three questions. We research your real business — Google reviews, photos, your current site — and draft a new homepage from the actual evidence in about 30 seconds.";

function DemoPage() {
  return (

    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Demo", url: "/demo" },
        ]}
      />
      
      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <div className="dot-grid" aria-hidden />
        <Section className="relative py-16 text-center">
          <div className="flex justify-center">
            <Eyebrow>Live Draft · v1</Eyebrow>
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[3.25rem]">
            We'll draft your new homepage. In 30 seconds.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-2">
            Three questions. We research your actual business — your Google
            reviews, photos, current site — and draft a first version from
            real evidence, not a template guess. You take it from there with
            us.
          </p>
        </Section>
      </section>

      <Section className="pb-20">
        <div className="mx-auto max-w-4xl">
          <DemoWizard />
        </div>
      </Section>
    </>
  );
}

export const Route = createFileRoute("/demo")({
  
  head: () => ({
    meta: [
      { title: "Live Draft — We Draft Your New Homepage From Real Business Data" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Live Draft — We Draft Your New Homepage From Real Business Data" },
      { property: "og:description", content: DESC },
      // Prevent search engines indexing the versioned URL as canonical.
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "/demo" }],
  }),
  component: DemoPage,
});


