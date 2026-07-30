import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui";
import { testimonials } from "@/lib/data/marketing";

export function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((a) => (a + 1) % testimonials.length),
      6000,
    );
    return () => clearInterval(id);
  }, []);

  const t = testimonials[active];

  return (
    <Section className="py-20">
      <SectionHeading
        center
        eyebrow="Proof"
        title="Results service businesses can feel"
        intro="Composite results from our pilot program and portfolio-brand campaign data."
      />

      <div className="mx-auto mt-12 max-w-3xl">
        <div className="glass-card relative overflow-hidden px-8 py-12 text-center sm:px-14">
          <Quote
            size={48}
            className="mx-auto text-[var(--color-primary)] opacity-30"
          />
          <blockquote className="mt-6 font-display text-xl font-medium leading-relaxed text-ink sm:text-2xl">
            “{t.quote}”
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className="fill-[var(--color-warning)] text-[var(--color-warning)]"
              />
            ))}
          </div>
          <div className="mt-4">
            <div className="font-semibold text-ink">{t.author}</div>
            <div className="text-sm text-ink-2">{t.role}</div>
          </div>
          <div className="mt-6 inline-flex rounded-full border border-[rgb(15_118_110_/0.28)] bg-[rgb(15_118_110_/0.1)] px-4 py-1.5 text-sm font-semibold text-[var(--color-accent)] dark:text-[#2dd4bf]">
            {t.result}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Testimonial ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === active
                  ? "w-8 bg-[var(--color-primary)]"
                  : "w-2 bg-[var(--surface-2)]"
              }`}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
