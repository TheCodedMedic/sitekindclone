import { createFileRoute, Link } from "@tanstack/react-router";

import { ArrowRight, PhoneCall, FileText, TrendingUp } from "lucide-react";
import {
  PortalHeader,
  KpiCard,
  AreaChart,
  StatusPill,
} from "@/components/portal/widgets";
import {
  kpis,
  trafficSeries,
  calls,
  contentCalendar,
  rankings,
  portalClient,
} from "@/lib/data/portal";

function PortalDashboard() {
  return (
    <>
      <PortalHeader
        title={`Welcome back, Joe 👋`}
        subtitle={`Here's how ${portalClient.business} is performing this month.`}
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} />
        ))}
      </div>

      {/* Chart + rankings */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-ink">
                Website traffic
              </h3>
              <p className="text-xs text-ink-2">Monthly visitors · 2026</p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-accent)] dark:text-[#2dd4bf]">
              <TrendingUp size={15} /> +409%
            </span>
          </div>
          <AreaChart data={trafficSeries} />
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display text-base font-semibold text-ink">
            Top keywords
          </h3>
          <div className="mt-4 space-y-3">
            {rankings.slice(0, 4).map((r) => (
              <div key={r.keyword} className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink">
                    {r.keyword}
                  </div>
                  <div className="text-xs text-ink-2">{r.volume}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-2 line-through">#{r.prev}</span>
                  <span className="rounded-lg bg-[rgb(15_118_110_/0.14)] px-2 py-1 font-code text-xs font-bold text-[var(--color-accent)] dark:text-[#2dd4bf]">
                    #{r.pos}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/portal/analytics"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] dark:text-[#fdba74]"
          >
            All rankings <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent calls + content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 font-display text-base font-semibold text-ink">
              <PhoneCall size={16} className="text-[var(--color-accent)]" /> Recent
              AI calls
            </h3>
            <Link
              to="/portal/voice-agent"
              className="text-sm font-semibold text-[var(--color-primary)] dark:text-[#fdba74]"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {calls.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink">{c.caller}</div>
                  <div className="mt-0.5 truncate text-xs text-ink-2">
                    {c.summary}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-2">{c.time}</div>
                </div>
                <div className="sm:shrink-0">
                  <StatusPill status={c.outcome} />
                </div>
              </div>

            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 font-display text-base font-semibold text-ink">
              <FileText size={16} className="text-[var(--color-primary)] dark:text-[#fdba74]" />{" "}
              Content calendar
            </h3>
            <Link
              to="/portal/content"
              className="text-sm font-semibold text-[var(--color-primary)] dark:text-[#fdba74]"
            >
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {contentCalendar.slice(0, 3).map((c) => (
              <div
                key={c.title}
                className="flex flex-col gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink">
                    {c.title}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-2">{c.date}</div>
                </div>
                <div className="sm:shrink-0">
                  <StatusPill status={c.status} />
                </div>
              </div>

            ))}
          </div>
        </div>
      </div>
    </>
  );
}


export const Route = createFileRoute("/portal/")({
  component: PortalDashboard,
});
