// Phase 9 — admin observability dashboard for design-diversity telemetry.
// Reads the demo_design_telemetry rollup and renders drift, clash rate,
// and motif/DNA histograms plus a recent-runs table. Deep-links each row
// back to /admin/demo-runs?trace=<trace_id>.
// Phase 10 — adds Alerts, Auto-tune, and Export panels.
import { useEffect, useMemo, useState } from "react";
import type { DesignTelemetryRow } from "@/lib/designTelemetry.functions";
import {
  evaluateDesignAlerts,
  recomputeDistinctnessBaseline,
  applyDistinctnessSuggestion,
  getDistinctnessTuningState,
  getExportTokenPreview,
  type AlertVerticalStat,
  type TuningState,
} from "@/lib/designTelemetry.functions";

const VERTICALS = ["all", "restaurant-hospitality", "trades", "beauty-wellness", "fitness", "auto-carwash", "generic"];


function bucketCounts(rows: DesignTelemetryRow[], pick: (r: DesignTelemetryRow) => string | null | undefined) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const v = pick(r);
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export function DesignTelemetryDashboard({
  rows,
  vertical,
  onVerticalChange,
  loading,
}: {
  rows: DesignTelemetryRow[];
  vertical: string;
  onVerticalChange: (v: string) => void;
  loading: boolean;
}) {
  const [showFallbacks, setShowFallbacks] = useState(false);
  const filtered = useMemo(
    () => (showFallbacks ? rows : rows.filter((r) => !r.used_fallback)),
    [rows, showFallbacks],
  );

  const clashRate = useMemo(() => {
    if (filtered.length === 0) return 0;
    const clashes = filtered.filter((r) => r.combos_clashed || r.retried).length;
    return clashes / filtered.length;
  }, [filtered]);

  const lockoutRate = useMemo(() => {
    if (filtered.length === 0) return 0;
    return filtered.filter((r) => r.lockout_pass).length / filtered.length;
  }, [filtered]);

  const motifHist = useMemo(() => bucketCounts(filtered, (r) => r.chosen_motif), [filtered]);
  const dnaHist = useMemo(() => bucketCounts(filtered, (r) => r.chosen_dna), [filtered]);

  const distinctnessPoints = useMemo(
    () => filtered.filter((r) => typeof r.final_distinctness === "number"),
    [filtered],
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-wrap items-center gap-2">
        <label className="text-xs uppercase tracking-wide text-ink-2">Vertical</label>
        <select
          value={vertical}
          onChange={(e) => onVerticalChange(e.target.value)}
          className="rounded-md border border-black/15 bg-transparent px-2 py-1 text-sm dark:border-white/15"
        >
          {VERTICALS.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <label className="ml-4 flex items-center gap-2 text-xs text-ink-2">
          <input
            type="checkbox"
            checked={showFallbacks}
            onChange={(e) => setShowFallbacks(e.target.checked)}
          />
          Include fallback runs
        </label>
        {loading && <span className="text-xs text-ink-2">Loading…</span>}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Runs (window)" value={filtered.length.toString()} />
        <StatCard
          label="Clash / retry rate"
          value={filtered.length ? `${Math.round(clashRate * 100)}%` : "—"}
          hint="rows where combo clashed OR a retry was needed"
        />
        <StatCard
          label="Lockout pass rate"
          value={filtered.length ? `${Math.round(lockoutRate * 100)}%` : "—"}
          hint="rows resolved only by third-pass motif lockout"
        />
      </section>

      <section className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-2">
          Distinctness vs adaptive threshold (final score per run)
        </h2>
        <DistinctnessChart rows={distinctnessPoints} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Histogram title="Chosen motifs" data={motifHist} />
        <Histogram title="Chosen layout-DNA buckets" data={dnaHist} />
      </section>

      <Phase10Panels vertical={vertical} />

      <section className="rounded-lg border border-black/10 dark:border-white/10">
        <h2 className="border-b border-black/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-2 dark:border-white/10">
          Recent runs
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-black/[0.03] text-left text-xs uppercase tracking-wide text-ink-2 dark:bg-white/[0.04]">
              <tr>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Vertical</th>
                <th className="px-3 py-2">Density</th>
                <th className="px-3 py-2 text-right">Threshold</th>
                <th className="px-3 py-2 text-right">Final</th>
                <th className="px-3 py-2">Motif</th>
                <th className="px-3 py-2">DNA</th>
                <th className="px-3 py-2">Flags</th>
                <th className="px-3 py-2">Trace</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-ink-2">No telemetry rows match this filter.</td></tr>
              )}
              {filtered.slice(0, 100).map((r) => (
                <tr key={r.id} className="border-t border-black/5 dark:border-white/5">
                  <td className="px-3 py-2 tabular-nums text-ink-2">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{r.vertical ?? "—"}</td>
                  <td className="px-3 py-2">{r.density ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.threshold_used?.toFixed(2) ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {typeof r.final_distinctness === "number" ? (
                      <span className={r.threshold_used != null && r.final_distinctness < r.threshold_used ? "text-red-600" : "text-emerald-700"}>
                        {r.final_distinctness.toFixed(2)}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2"><code className="text-xs">{r.chosen_motif ?? "—"}</code></td>
                  <td className="px-3 py-2"><code className="text-xs">{r.chosen_dna ?? "—"}</code></td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.used_fallback && <Chip tone="warn">fallback</Chip>}
                      {r.retried && <Chip tone="info">retried</Chip>}
                      {r.combos_clashed && <Chip tone="danger">clash</Chip>}
                      {r.lockout_pass && <Chip tone="accent">lockout</Chip>}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {r.trace_id ? (
                      <a
                        href={`/admin/demo-runs?trace=${encodeURIComponent(r.trace_id)}`}
                        className="text-xs text-blue-600 underline decoration-dotted hover:decoration-solid dark:text-blue-400"
                      >
                        {r.trace_id.slice(0, 8)}…
                      </a>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 100 && (
          <p className="px-4 py-2 text-xs text-ink-2">Showing 100 of {filtered.length} rows.</p>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
      <div className="text-xs uppercase tracking-wide text-ink-2">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold tabular-nums text-ink">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-ink-2">{hint}</div>}
    </div>
  );
}

function Chip({ tone, children }: { tone: "warn" | "info" | "danger" | "accent"; children: React.ReactNode }) {
  const map = {
    warn: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
    danger: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
    accent: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${map[tone]}`}>{children}</span>;
}

function Histogram({ title, data }: { title: string; data: [string, number][] }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  return (
    <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-2">{title}</h3>
      {data.length === 0 && <p className="text-sm text-ink-2">No data.</p>}
      <ul className="flex flex-col gap-1.5">
        {data.map(([label, n]) => (
          <li key={label} className="flex items-center gap-3 text-xs">
            <span className="w-52 shrink-0 truncate font-mono text-ink">{label}</span>
            <span className="relative h-4 flex-1 rounded bg-black/[0.05] dark:bg-white/[0.06]">
              <span
                className="absolute inset-y-0 left-0 rounded bg-emerald-500/70"
                style={{ width: `${(n / max) * 100}%` }}
              />
            </span>
            <span className="w-8 shrink-0 text-right tabular-nums text-ink-2">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DistinctnessChart({ rows }: { rows: DesignTelemetryRow[] }) {
  if (rows.length === 0) return <p className="text-sm text-ink-2">No scored runs in this window.</p>;
  // rows come newest-first — reverse for x = time.
  const points = [...rows].reverse();
  const w = 800;
  const h = 180;
  const pad = { l: 32, r: 12, t: 8, b: 20 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const x = (i: number) => pad.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => pad.t + (1 - Math.max(0, Math.min(1, v))) * ih;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={w - pad.r} y1={y(g)} y2={y(g)} stroke="currentColor" strokeOpacity="0.08" />
          <text x={4} y={y(g) + 3} fontSize="9" fill="currentColor" opacity="0.6">{g.toFixed(2)}</text>
        </g>
      ))}
      {/* threshold line per run (dashed) */}
      {points.map((r, i) =>
        typeof r.threshold_used === "number" ? (
          <circle key={`t-${r.id}`} cx={x(i)} cy={y(r.threshold_used)} r={1.5} fill="currentColor" opacity="0.35" />
        ) : null,
      )}
      {/* score points */}
      {points.map((r, i) => {
        const v = r.final_distinctness ?? 0;
        const below = r.threshold_used != null && v < r.threshold_used;
        return (
          <circle
            key={r.id}
            cx={x(i)}
            cy={y(v)}
            r={3}
            fill={below ? "#dc2626" : "#059669"}
          >
            <title>{`${new Date(r.created_at).toLocaleString()} · ${r.vertical ?? "?"} · score ${v.toFixed(2)} vs threshold ${r.threshold_used?.toFixed(2) ?? "?"}`}</title>
          </circle>
        );
      })}
      {/* connecting line */}
      <polyline
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1"
        points={points.map((r, i) => `${x(i)},${y(r.final_distinctness ?? 0)}`).join(" ")}
      />
    </svg>
  );
}

// ── Phase 10 panels ────────────────────────────────────────────────────

function Phase10Panels({ vertical }: { vertical: string }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <AlertsPanel />
      <AutoTunePanel />
      <ExportPanel vertical={vertical} />
    </section>
  );
}

function AlertsPanel() {
  const [stats, setStats] = useState<AlertVerticalStat[]>([]);
  const [threshold, setThreshold] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async (dryRun: boolean) => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await evaluateDesignAlerts({ data: { dryRun } });
      setStats(r.stats);
      setThreshold(r.threshold);
      if (!dryRun && r.fired.length > 0) setMsg(`Fired ${r.fired.length} alert(s): ${r.fired.join(", ")}`);
      else if (!dryRun) setMsg("No verticals crossed the threshold.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(true); /* dry-run on mount */ }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-2">Alerts</h3>
        <span className="text-[10px] text-ink-2">7d threshold {(threshold * 100).toFixed(0)}%</span>
      </div>
      {stats.length === 0 && <p className="text-sm text-ink-2">No data yet.</p>}
      <ul className="flex flex-col gap-1 text-xs">
        {stats.slice(0, 6).map((s) => (
          <li key={s.vertical} className="flex items-center justify-between gap-2">
            <span className="truncate font-mono">{s.vertical}</span>
            <span className={`tabular-nums ${s.wouldAlert ? "text-red-600 font-semibold" : "text-ink-2"}`}>
              {(s.rate7d * 100).toFixed(0)}% · {s.runs7d} runs
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex gap-2 pt-2">
        <button
          onClick={() => load(false)}
          disabled={busy}
          className="rounded-md border border-black/15 px-3 py-1.5 text-xs hover:bg-black/[0.04] disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/[0.04]"
        >
          {busy ? "Evaluating…" : "Evaluate now"}
        </button>
      </div>
      {msg && <p className="text-[11px] text-ink-2">{msg}</p>}
    </div>
  );
}

function AutoTunePanel() {
  const [state, setState] = useState<TuningState | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    getDistinctnessTuningState().then(setState).catch((e) => setMsg(String(e)));
  }, []);

  const recompute = async () => {
    setBusy(true); setMsg(null);
    try { setState(await recomputeDistinctnessBaseline()); }
    catch (e) { setMsg(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };
  const apply = async () => {
    setBusy(true); setMsg(null);
    try {
      const next = await applyDistinctnessSuggestion();
      setState(next);
      setMsg("Applied. Update BASE_DISTINCTNESS_THRESHOLD env var to take effect.");
    } catch (e) { setMsg(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-2">Auto-tune baseline</h3>
      <div className="flex items-baseline gap-3">
        <span className="text-[11px] text-ink-2">Current</span>
        <span className="font-display text-xl font-bold tabular-nums text-ink">{state?.current_value?.toFixed(2) ?? "—"}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-[11px] text-ink-2">Suggested</span>
        <span className="tabular-nums text-ink">{state?.suggested_value != null ? state.suggested_value.toFixed(2) : "—"}</span>
      </div>
      {state?.rationale && <p className="text-[11px] text-ink-2">{state.rationale}</p>}
      <div className="mt-auto flex gap-2 pt-2">
        <button
          onClick={recompute}
          disabled={busy}
          className="rounded-md border border-black/15 px-3 py-1.5 text-xs hover:bg-black/[0.04] disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/[0.04]"
        >
          {busy ? "…" : "Recompute"}
        </button>
        <button
          onClick={apply}
          disabled={busy || state?.suggested_value == null}
          className="rounded-md border border-black/15 px-3 py-1.5 text-xs hover:bg-black/[0.04] disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/[0.04]"
        >
          Apply suggestion
        </button>
      </div>
      {msg && <p className="text-[11px] text-ink-2">{msg}</p>}
    </div>
  );
}

function ExportPanel({ vertical }: { vertical: string }) {
  const [days, setDays] = useState(30);
  const [preview, setPreview] = useState<{ preview: string | null; configured: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getExportTokenPreview().then(setPreview).catch(() => setPreview({ preview: null, configured: false }));
  }, []);

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  // NOTE: the raw token is not exposed by the server fn; the copyable URL
  // uses a placeholder so admins paste the real token from Project Settings.
  const url = `${origin}/api/public/design-telemetry/csv?token=YOUR_TOKEN&vertical=${encodeURIComponent(vertical)}&days=${days}`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { /* ignore */ }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-2">CSV export</h3>
      <div className="text-[11px] text-ink-2">
        Token: <code>{preview?.configured ? preview.preview : "not configured"}</code>
      </div>
      <label className="flex items-center gap-2 text-xs">
        Days
        <input
          type="number"
          min={1}
          max={365}
          value={days}
          onChange={(e) => setDays(Math.max(1, Math.min(365, Number(e.target.value) || 30)))}
          className="w-20 rounded-md border border-black/15 bg-transparent px-2 py-1 text-xs dark:border-white/15"
        />
      </label>
      <code className="block max-h-24 overflow-auto rounded bg-black/[0.04] p-2 text-[10px] break-all dark:bg-white/[0.05]">
        {url}
      </code>
      <div className="mt-auto flex gap-2 pt-2">
        <button
          onClick={copy}
          className="rounded-md border border-black/15 px-3 py-1.5 text-xs hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.04]"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
      <p className="text-[10px] text-ink-2">Replace <code>YOUR_TOKEN</code> with the full <code>DESIGN_TELEMETRY_EXPORT_TOKEN</code> secret before hitting the URL.</p>
    </div>
  );
}

