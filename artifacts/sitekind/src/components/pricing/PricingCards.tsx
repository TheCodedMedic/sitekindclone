import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, CreditCard, Wallet } from "lucide-react";
import { plans } from "@/lib/data/pricing";
import { Badge } from "@/components/ui";
import { DEMO_HREF } from "@/lib/demoHref";

export function PricingCards() {
  const [financed, setFinanced] = useState(false);
  // Only crossfade the price after the visitor has actually used the
  // toggle — never on initial paint (calm page, Stage 4 item 6).
  const [touched, setTouched] = useState(false);
  const setMode = (next: boolean) => {
    if (next !== financed) setTouched(true);
    setFinanced(next);
  };

  return (
    <div>
      {/* Financing toggle */}
      <div className="mb-10 flex items-center justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-[var(--card-border)] bg-[var(--glass)] p-1 backdrop-blur">
          <button
            onClick={() => setMode(false)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-5 ${
              !financed
                ? "bg-[var(--color-primary)] text-white"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            <Wallet size={15} /> Pay in full
          </button>
          <button
            onClick={() => setMode(true)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:px-5 ${
              financed
                ? "bg-[var(--color-primary)] text-white"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            <CreditCard size={15} /> Finance monthly
          </button>

        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`glass-card plan-card relative flex flex-col p-6 ${
              plan.highlighted
                ? "plan-card-hl border-2 border-[var(--color-accent)] lg:-mt-3 lg:mb-3 dark:shadow-[var(--shadow-glow-accent)]"
                : ""
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge tone={plan.highlighted ? "accent" : "primary"}>
                  {plan.badge}
                </Badge>
              </div>
            )}

            <div className="mt-2">
              <h3 className="font-display text-lg font-bold text-ink">
                {plan.name}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
                {plan.blurb}
              </p>
            </div>

            <div className="mt-5">
              {/* Re-keying the core plan's price block after a toggle plays a
                  brief opacity crossfade (no movement — calm page). */}
              <div
                key={plan.id === "core" ? String(financed) : "static"}
                className={
                  plan.id === "core" && touched ? "price-swap" : undefined
                }
              >
                {plan.id === "core" && financed ? (
                  <>
                    <div className="font-display text-3xl font-extrabold text-ink">
                      $375
                      <span className="text-sm font-medium text-ink-2">/mo</span>
                    </div>
                    <div className="mt-1 text-xs text-ink-2">
                      $500 down · 12 months · $5,000 total
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-display text-3xl font-extrabold text-ink">
                      {plan.price}
                    </div>
                    <div className="mt-1 text-xs text-ink-2">{plan.priceNote}</div>
                    {plan.financing && (
                      <div className="mt-1 font-code text-[11px] text-[var(--color-accent)]">
                        {plan.financing}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <Link
              to={DEMO_HREF}
              className={`mt-5 w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-transform hover:scale-[1.02] ${
                plan.highlighted
                  ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] hover:text-white"
                  : "bg-[var(--color-primary)] text-white dark:shadow-[var(--shadow-glow)]"
              }`}
            >
              {plan.cta}
            </Link>

            <ul className="mt-6 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-xs text-ink-2">
                  <Check
                    size={15}
                    className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-[var(--card-border)] pt-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-2">
                Best for
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-ink">
                {plan.bestFor}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
