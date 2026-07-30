import { createFileRoute } from "@tanstack/react-router";

import { Mail, MessageSquare, Phone } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { BreadcrumbSchema } from "@/components/Schema";

const channels = [
  { icon: Mail, label: "Email", value: "hello@sitekind.ai" },
  { icon: Phone, label: "Sales", value: "(888) 555-0199" },
  { icon: MessageSquare, label: "Support", value: "Live chat in your client portal" },
];

function ContactPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ]}
      />
      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <Section className="relative py-16">
          <div className="max-w-2xl">
            <Eyebrow>Contact</Eyebrow>
            <h1 className="mt-5 font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[3rem]">
              Let's talk about your business
            </h1>
            <p className="mt-5 text-lg text-ink-2">
              Whether you're ready to start or just have questions, we're here.
              Most inquiries get a same-day response.
            </p>
          </div>
        </Section>
      </section>

      <Section className="pb-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div className="space-y-4">
            {channels.map((c) => (
              <div key={c.label} className="glass-card flex items-center gap-4 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[rgb(194_65_12_/0.14)] text-[var(--color-primary)] dark:text-[#fdba74]">
                  <c.icon size={20} />
                </span>
                <div>
                  <div className="text-xs uppercase tracking-wide text-ink-2">
                    {c.label}
                  </div>
                  <div className="text-sm font-semibold text-ink">{c.value}</div>
                </div>
              </div>
            ))}
            <div className="glass-card p-6">
              <div className="font-display text-sm font-semibold text-ink">
                Prefer to see it first?
              </div>
              <p className="mt-2 text-sm text-ink-2">
                Generate a live preview of your website in seconds — no call
                required.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </Section>
    </>
  );
}


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Talk to sitekind" },
      { name: "description", content: "Questions about plans, industries, or the AI voice agent? Send us a message and our team will respond within one business day." },
      { property: "og:title", content: "Contact — Talk to sitekind" },
      { property: "og:description", content: "Questions about plans, industries, or the AI voice agent? Send us a message and our team will respond within one business day." }
    ],
  }),
  component: ContactPage,
});
