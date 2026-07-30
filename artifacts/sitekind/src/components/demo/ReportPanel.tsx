import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Loader2, TriangleAlert, X } from "lucide-react";
import {
  getTurnstileFailure,
  getTurnstileToken,
  runReport,
  turnstileFailureToError,
  type Report,
  type ReportInput,
  type ReportRaw,
  type ReportStepEvent,
} from "@/lib/demoApi";

const STEP_LABELS: Record<ReportStepEvent["id"], string> = {
  contact: "Unlocking report",
  maps: "Google Maps audit",
  speed: "Google Lighthouse",
  onpage: "On-page SEO",
  synth: "Growth analysis",
};

const PKG: Record<Report["recommendations"][number]["package"], { label: string; price: string; tone: string }> = {
  starter: { label: "Starter", price: "$150/mo", tone: "bg-[rgb(15_118_110_/0.12)] text-[var(--color-accent)]" },
  core: { label: "Core Agency", price: "$5,000/yr", tone: "bg-[rgb(194_65_12_/0.12)] text-[var(--color-primary)]" },
  "ai-voice": { label: "AI Voice Agent", price: "+$3,500/yr", tone: "bg-[rgb(245_158_11_/0.14)] text-[var(--color-warning)]" },
  mega: { label: "Mega Package", price: "$15,000", tone: "bg-[rgb(42_33_24_/0.10)] text-ink" },
};

type Line = ReportStepEvent & { ts: number };

export function ReportPanel({ input }: { input: ReportInput }) {
  const [log, setLog] = useState<Line[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [raw, setRaw] = useState<ReportRaw | null>(null);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      // Fresh invisible-Turnstile token per run — demo-report fails closed
      // without one whenever the secret is configured server-side.
      const turnstileToken = await getTurnstileToken();
      const turnstileFailure = getTurnstileFailure();
      if (!turnstileToken && turnstileFailure) {
        throw turnstileFailureToError(turnstileFailure);
      }
      await runReport({ ...input, turnstileToken }, (e) => {
        if (e.type === "step") {
          setLog((l) => [...l.filter((x) => !(x.id === e.id && x.status === "start" && e.status !== "start")), { ...e, ts: Date.now() }]);
        } else if (e.type === "result") {
          setReport(e.report);
          setRaw(e.raw);
        } else if (e.type === "error") {
          setError(e.error);
        }
      });
    })().catch((err) => setError(String(err instanceof Error ? err.message : err)));
  }, [input]);

  return (
    <div className="space-y-6" style={{ animation: "rise-in 0.5s ease-out both" }}>
      {/* Progress log (collapses to a done-line when the report lands) */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 font-code text-sm text-[var(--color-accent)]">
          {error ? <X size={15} className="text-[#ef4444]" /> : report ? <Check size={15} /> : <Loader2 size={15} className="animate-spin" />}
          {error ? "Report hit a snag" : report ? "Your free growth report" : "Building your free growth report…"}
        </div>
        {!report && (
          <ul className="mt-4 space-y-2.5">
            {log.map((l, i) => (
              <li key={`${l.id}-${l.status}-${i}`} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 shrink-0">
                  {l.status === "ok" && <Check size={15} className="text-[var(--color-accent)]" />}
                  {l.status === "start" && <Loader2 size={15} className="animate-spin text-ink-2" />}
                  {l.status === "skip" && <Check size={15} className="text-ink-2 opacity-50" />}
                  {l.status === "fail" && <TriangleAlert size={15} className="text-[var(--color-warning)]" />}
                </span>
                <span>
                  <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-ink-2">{STEP_LABELS[l.id]}</span>
                  <span className="text-ink">{l.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p className="mt-3 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3 font-code text-xs text-ink-2">
            {error} — our team still has your details and will send the report by email.
          </p>
        )}
      </div>

      {report && <ReportView report={report} raw={raw} businessName={input.businessName} />}

    </div>
  );
}

export function ReportView({
  report,
  raw,
  businessName,
}: {
  report: Report;
  raw: ReportRaw | null;
  businessName?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Headline */}
      <div className="glass-card p-7">
        <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink">{report.headline}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">{report.summary}</p>
      </div>

      {/* Lighthouse dials */}
      {raw?.scores && (
        <div className="glass-card p-6">
          <SectionTitle>Your website, scored by Google Lighthouse (mobile)</SectionTitle>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Dial label="Performance" value={raw.scores.performance} />
            <Dial label="SEO" value={raw.scores.seo} />
            <Dial label="Accessibility" value={raw.scores.accessibility} />
            <Dial label="Best practices" value={raw.scores.bestPractices} />
          </div>
          {(raw.scores.lcp || raw.scores.cls) && (
            <p className="mt-4 text-xs text-ink-2">
              Core Web Vitals: largest paint {raw.scores.lcp ?? "—"} · layout shift {raw.scores.cls ?? "—"} · blocking time {raw.scores.tbt ?? "—"}
            </p>
          )}
        </div>
      )}

      {/* Maps vs competitors */}
      {raw?.competitors && raw.competitors.length > 0 && (
        <div className="glass-card p-6">
          <SectionTitle>Google Maps: you vs. nearby competitors</SectionTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-left text-xs uppercase tracking-wide text-ink-2">
                  <th className="py-2 pr-4 font-medium">Business</th>
                  <th className="py-2 pr-4 font-medium">Rating</th>
                  <th className="py-2 font-medium">Reviews</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--card-border)] bg-[rgb(194_65_12_/0.06)]">
                  <td className="py-2.5 pr-4 font-semibold text-ink">{businessName ?? "You"} (you)</td>
                  <td className="py-2.5 pr-4 text-ink">{raw.maps?.found ? `${raw.maps.rating ?? "—"}★` : "Not listed"}</td>
                  <td className="py-2.5 text-ink">{raw.maps?.found ? raw.maps.reviews : "—"}</td>
                </tr>
                {raw.competitors.map((c) => (
                  <tr key={c.name} className="border-b border-[var(--card-border)] last:border-0">
                    <td className="py-2.5 pr-4 text-ink-2">{c.name}</td>
                    <td className="py-2.5 pr-4 text-ink-2">{c.rating ?? "—"}★</td>
                    <td className="py-2.5 text-ink-2">{c.reviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Findings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {report.mapsFindings.length > 0 && (
          <FindingsCard title="Local presence findings" items={report.mapsFindings} />
        )}
        {report.seoFindings.length > 0 && (
          <FindingsCard title="Website & SEO findings" items={report.seoFindings} />
        )}
      </div>

      {/* Growth */}
      {report.growth.opportunities.length > 0 && (
        <div className="glass-card p-6">
          <SectionTitle>Where the growth is</SectionTitle>
          <ul className="mt-4 space-y-3">
            {report.growth.opportunities.map((o) => (
              <li key={o.title} className="flex items-start gap-3">
                <ArrowRight size={16} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                <div>
                  <div className="text-sm font-semibold text-ink">{o.title}</div>
                  <div className="text-sm text-ink-2">{o.detail}</div>
                </div>
              </li>
            ))}
          </ul>
          {report.growth.estimate && (
            <p className="mt-4 rounded-xl bg-[rgb(15_118_110_/0.08)] p-3.5 text-sm font-medium text-[var(--color-accent)]">
              {report.growth.estimate}
            </p>
          )}
        </div>
      )}

      {/* Package recommendations */}
      <div className="glass-card p-6 sm:p-8">
        <SectionTitle>How sitekind would fix this</SectionTitle>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {report.recommendations.map((r) => {
            const pkg = PKG[r.package] ?? PKG.core;
            return (
              <div key={r.title} className="flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--surface)] p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${pkg.tone}`}>{pkg.label}</span>
                  <span className="font-code text-xs text-ink-2">{pkg.price}</span>
                </div>
                <div className="mt-3 text-sm font-semibold text-ink">{r.title}</div>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-2">{r.why}</p>
                <p className="mt-2 text-xs font-semibold text-[var(--color-accent)]">{r.impact}</p>
              </div>
            );
          })}
        </div>
        <Link to="/pricing" className="btn-primary mt-6 w-full sm:w-auto">
          See plans & get started <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}


function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="font-display text-base font-bold text-ink">{children}</h4>;
}

function Dial({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0;
  const color = value == null ? "var(--card-border)" : v >= 90 ? "#0F766E" : v >= 50 ? "#F59E0B" : "#DC2626";
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg viewBox="0 0 72 72" className="h-20 w-20 -rotate-90">
          <circle cx="36" cy="36" r={r} fill="none" stroke="var(--card-border)" strokeWidth="7" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(v / 100) * c} ${c}`} />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-display text-lg font-extrabold text-ink">
          {value ?? "—"}
        </span>
      </div>
      <span className="text-xs font-medium text-ink-2">{label}</span>
    </div>
  );
}

function FindingsCard({ title, items }: { title: string; items: Report["mapsFindings"] }) {
  const tone = { good: "text-[var(--color-accent)]", warn: "text-[var(--color-warning)]", bad: "text-[#DC2626]" };
  const Icon = ({ s }: { s: "good" | "warn" | "bad" }) =>
    s === "good" ? <Check size={16} className={tone[s]} /> : <TriangleAlert size={16} className={tone[s]} />;
  return (
    <div className="glass-card h-full p-6">
      <SectionTitle>{title}</SectionTitle>
      <ul className="mt-4 space-y-3.5">
        {items.map((f) => (
          <li key={f.title} className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0"><Icon s={f.severity} /></span>
            <div>
              <div className="text-sm font-semibold text-ink">{f.title}</div>
              <div className="text-sm leading-relaxed text-ink-2">{f.detail}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
