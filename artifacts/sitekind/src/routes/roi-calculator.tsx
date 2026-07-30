import { createFileRoute } from "@tanstack/react-router";

import { Section, Eyebrow, CtaBand } from "@/components/ui";
import { RoiCalculator } from "@/components/RoiCalculator";
import { BreadcrumbSchema } from "@/components/Schema";

function RoiPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "ROI Calculator", url: "/roi-calculator" },
        ]}
      />
      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <Section className="relative py-16 text-center">
          <div className="flex justify-center">
            <Eyebrow>ROI Calculator</Eyebrow>
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[3.25rem]">
            What are missed calls costing you?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-2">
            Move the sliders to match your business. We'll estimate the revenue
            an AI receptionist and better rankings could recover.
          </p>
        </Section>
      </section>

      <Section className="pb-16">
        <div className="mx-auto max-w-5xl">
          <RoiCalculator />
        </div>
      </Section>

      <CtaBand
        title="Turn those missed calls into booked jobs"
        subtitle="Your preview website is already built. Add the AI voice agent and start capturing every call."
        primary={{ href: "/demo", label: "Preview My Website" }}
        secondary={{ href: "/pricing", label: "See Pricing" }}
      />
    </>
  );
}


export const Route = createFileRoute("/roi-calculator")({
  head: () => ({
    meta: [
      { title: "ROI Calculator — What an AI Agency Is Worth to You" },
      { name: "description", content: "Estimate the additional revenue from capturing missed calls and climbing Google Maps rankings. See your payback period and return on investment in seconds." },
      { property: "og:title", content: "ROI Calculator — What an AI Agency Is Worth to You" },
      { property: "og:description", content: "Estimate the additional revenue from capturing missed calls and climbing Google Maps rankings. See your payback period and return on investment in seconds." }
    ],
  }),
  component: RoiPage,
});
