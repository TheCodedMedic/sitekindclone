import { createFileRoute } from "@tanstack/react-router";

import { PortalHeader, KpiCard, AreaChart } from "@/components/portal/widgets";
import { ArrowUp } from "lucide-react";
import { kpis, trafficSeries, rankings } from "@/lib/data/portal";

function AnalyticsPage() {
  return (
    <>
      <PortalHeader
        title="Traffic & Rankings"
        subtitle="How your website and Google Maps presence are trending."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} />
        ))}
      </div>

      <div className="mt-6 glass-card p-6">
        <h3 className="font-display text-base font-semibold text-ink">
          Website visitors
        </h3>
        <p className="text-xs text-ink-2">Monthly, last 7 months</p>
        <div className="mt-4">
          <AreaChart data={trafficSeries} height={260} />
        </div>
      </div>

      <div className="mt-6 glass-card overflow-hidden">
        <div className="border-b border-[var(--card-border)] p-6">
          <h3 className="font-display text-base font-semibold text-ink">
            Keyword rankings
          </h3>
          <p className="text-xs text-ink-2">
            Google Maps position vs. campaign start
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--card-border)] text-left text-xs uppercase tracking-wide text-ink-2">
                <th className="px-6 py-3 font-medium">Keyword</th>
                <th className="px-6 py-3 font-medium">Volume</th>
                <th className="px-6 py-3 font-medium">Start</th>
                <th className="px-6 py-3 font-medium">Now</th>
                <th className="px-6 py-3 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r) => (
                <tr
                  key={r.keyword}
                  className="border-b border-[var(--card-border)] last:border-0"
                >
                  <td className="px-6 py-4 text-sm font-medium text-ink">
                    {r.keyword}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-2">{r.volume}</td>
                  <td className="px-6 py-4 text-sm text-ink-2">#{r.prev}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-[rgb(15_118_110_/0.14)] px-2.5 py-1 font-code text-xs font-bold text-[var(--color-accent)] dark:text-[#2dd4bf]">
                      #{r.pos}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] dark:text-[#2dd4bf]">
                      <ArrowUp size={14} /> {r.prev - r.pos}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}


export const Route = createFileRoute("/portal/analytics")({
  component: AnalyticsPage,
});
