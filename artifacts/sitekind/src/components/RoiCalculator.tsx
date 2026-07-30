import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, TrendingUp } from "lucide-react";

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-ink-2">{label}</label>
        <span className="font-code text-sm font-semibold text-ink">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-2)] accent-[var(--color-primary)]"
      />
    </div>
  );
}

export function RoiCalculator() {
  const [jobValue, setJobValue] = useState(350);
  const [monthlyCalls, setMonthlyCalls] = useState(180);
  const [missedPct, setMissedPct] = useState(28);
  const [rank, setRank] = useState(12);

  const out = useMemo(() => {
    const missedCalls = (monthlyCalls * missedPct) / 100;
    // AI captures ~70% of otherwise-missed calls; ~35% of captured calls book.
    const capturedCalls = missedCalls * 0.7;
    const bookingRate = 0.35;
    const recoveredJobs = capturedCalls * bookingRate;
    const callRevenue = recoveredJobs * jobValue;

    // SEO lift: climbing toward the 3-pack adds call volume. Model extra calls
    // proportional to how far from Top 3 you start.
    const seoExtraCalls = Math.max(0, rank - 3) * 2.2;
    const seoJobs = seoExtraCalls * bookingRate;
    const seoRevenue = seoJobs * jobValue;

    const monthlyGain = callRevenue + seoRevenue;
    const annualGain = monthlyGain * 12;

    // Compare against Core + AI (~$708/mo blended year one).
    const planMonthly = 708;
    const roi = ((monthlyGain - planMonthly) / planMonthly) * 100;
    const paybackDays =
      monthlyGain > 0 ? Math.max(1, Math.round((planMonthly / monthlyGain) * 30)) : 0;
    const weeksToTop3 = Math.min(20, Math.max(4, Math.round((rank - 3) * 1.1)));

    return {
      recoveredJobs: Math.round(recoveredJobs),
      monthlyGain: Math.round(monthlyGain),
      annualGain: Math.round(annualGain),
      roi: Math.round(roi),
      paybackDays,
      weeksToTop3,
    };
  }, [jobValue, monthlyCalls, missedPct, rank]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Inputs */}
      <div className="glass-card p-8">
        <h3 className="font-display text-lg font-semibold text-ink">
          Your business
        </h3>
        <div className="mt-7 space-y-8">
          <Slider
            label="Average job / service value"
            value={jobValue}
            min={50}
            max={5000}
            step={25}
            onChange={setJobValue}
            format={(v) => `$${v.toLocaleString()}`}
          />
          <Slider
            label="Phone calls per month"
            value={monthlyCalls}
            min={20}
            max={1000}
            step={10}
            onChange={setMonthlyCalls}
            format={(v) => v.toLocaleString()}
          />
          <Slider
            label="Estimated % of calls missed"
            value={missedPct}
            min={0}
            max={70}
            step={1}
            onChange={setMissedPct}
            format={(v) => `${v}%`}
          />
          <Slider
            label="Current Google Maps position"
            value={rank}
            min={1}
            max={30}
            step={1}
            onChange={setRank}
            format={(v) => (v >= 30 ? "Not ranking" : `#${v}`)}
          />
        </div>
      </div>

      {/* Outputs */}
      <div className="glass-card relative overflow-hidden p-8">
        <div className="mesh !inset-[-60%] opacity-30" aria-hidden />
        <div className="relative">
          <div className="flex items-center gap-2 text-[var(--color-accent)]">
            <TrendingUp size={18} />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Projected impact
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--card-border)] bg-[var(--surface)] p-6">
            <div className="text-sm text-ink-2">
              Additional revenue per month
            </div>
            <div className="mt-1 font-display text-4xl font-extrabold text-[var(--color-accent)]">
              ${out.monthlyGain.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-ink-2">
              ≈ ${out.annualGain.toLocaleString()} per year
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Jobs recovered / mo" value={`+${out.recoveredJobs}`} />
            <Metric label="Return on investment" value={`${out.roi}%`} />
            <Metric label="Payback period" value={`${out.paybackDays} days`} />
            <Metric
              label="Est. weeks to Top 3"
              value={rank <= 3 ? "Already there" : `${out.weeksToTop3} wks`}
            />
          </div>

          <p className="mt-5 text-xs leading-relaxed text-ink-2">
            Estimates model AI capturing ~70% of missed calls with a ~35%
            booking rate, benchmarked against the Core + AI plan (~$708/mo year
            one). Your results will vary.
          </p>

          <Link to="/pricing" className="btn-accent mt-6 w-full">
            Get Started <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-4">
      <div className="text-xs text-ink-2">{label}</div>
      <div className="mt-1 font-display text-xl font-bold text-ink">{value}</div>
    </div>
  );
}
