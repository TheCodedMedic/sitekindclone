import { useState } from "react";
import { Check, X } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { useTweenedNumber } from "@/lib/motion/useTweenedNumber";

const traditional = [
  "$5,000/month retainer",
  "6-week build timeline",
  "Phone rings to voicemail after 5pm",
  "Content when the writer gets to it",
  "Account manager you chase for updates",
];

const ours = [
  "$417/month (Core Package)",
  "Live in 24 hours",
  "AI answers every call, 24/7",
  "Weekly content, auto-published",
  "A dashboard that updates itself",
];

export function ValueComparison() {
  const [pos, setPos] = useState(50);
  // Same math as always — the tween only smooths the DISPLAYED savings
  // figure (instant under reduced motion / motion off). The native range
  // input keeps its built-in drag-while-held + arrow-key behavior.
  const months = Math.round((pos / 100) * 24) || 1;
  const savings = (5000 - 417) * months;
  const savingsDisplay = useTweenedNumber(savings);

  return (
    <Section className="py-20">
      <SectionHeading
        center
        eyebrow="The Math"
        title={
          <>
            Same outcomes.{" "}
            <span className="text-[var(--color-accent)]">One-twelfth</span> the
            price.
          </>
        }
        intro="Drag to compare a traditional agency against sitekind. The deliverables match. The invoice doesn't."
      />

      <Reveal className="mt-12">
        <div className="glass-card overflow-hidden">
          <div className="relative grid md:grid-cols-2">
            {/* Traditional */}
            <div className="border-b border-[var(--card-border)] p-8 md:border-b-0 md:border-r">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-lg font-semibold text-ink">
                  Traditional Agency
                </h3>
                <span className="font-display text-2xl font-bold text-ink-2">
                  $5,000<span className="text-sm font-normal">/mo</span>
                </span>
              </div>
              <ul className="mt-6 space-y-3.5">
                {traditional.map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-ink-2">
                    <X
                      size={18}
                      className="mt-0.5 shrink-0 text-[#ef4444]"
                    />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ours */}
            <div className="relative overflow-hidden p-8">
              <div className="mesh !inset-[-60%] opacity-30" aria-hidden />
              <div className="relative">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    sitekind Core
                  </h3>
                  <span className="font-display text-2xl font-bold text-[var(--color-accent)]">
                    $417<span className="text-sm font-normal">/mo</span>
                  </span>
                </div>
                <ul className="mt-6 space-y-3.5">
                  {ours.map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-3 text-sm font-medium text-ink"
                    >
                      <Check
                        size={18}
                        className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                      />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive savings bar */}
          <div className="border-t border-[var(--card-border)] bg-[var(--surface)] px-8 py-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="months"
                className="text-sm font-medium text-ink-2"
              >
                Over <span className="font-code text-ink">{months}</span>{" "}
                months, you'd save
              </label>
              <span className="font-display text-2xl font-extrabold text-[var(--color-accent)]">
                ${savingsDisplay.toLocaleString()}
              </span>
            </div>
            <input
              id="months"
              type="range"
              min={1}
              max={100}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-2)] accent-[var(--color-primary)]"
              aria-label="Adjust comparison timeframe"
            />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
