import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getDemoResearchConfig, type DemoResearchConfig } from "@/lib/demo-research-config.functions";
import { AdminNav } from "@/components/admin/AdminNav";

type Row = Database["public"]["Tables"]["demo_generation_runs"]["Row"];

export const Route = createFileRoute("/admin/demo-runs")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Demo generation runs · Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-2">{String(error?.message ?? error)}</p>
        <button
          className="mt-6 rounded-md border px-4 py-2 text-sm"
          onClick={() => { reset(); router.invalidate(); }}
        >
          Retry
        </button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Not found</h1>
    </div>
  ),
  component: DemoRunsPage,
});

type Gate =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "forbidden" }
  | { status: "admin" };

function DemoRunsPage() {
  const [gate, setGate] = useState<Gate>({ status: "loading" });
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "fallback" | "error">("all");
  const [failuresOnly, setFailuresOnly] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!userData.user) { setGate({ status: "signed-out" }); return; }
      const { data: isAdmin, error } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (cancelled) return;
      if (error || !isAdmin) { setGate({ status: "forbidden" }); return; }
      setGate({ status: "admin" });
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (gate.status !== "admin") return;
    let cancelled = false;
    (async () => {
      let q = supabase
        .from("demo_generation_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (statusFilter !== "all") q = q.eq("saved_status", statusFilter);
      if (failuresOnly) q = q.eq("parse_ok", false);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) { setLoadError(error.message); setRows([]); return; }
      setLoadError(null);
      setRows(data as Row[]);
    })();
    return () => { cancelled = true; };
  }, [gate.status, statusFilter, failuresOnly]);

  if (gate.status === "loading") {
    return <CenteredMessage title="Loading…" body="Checking your access." />;
  }
  if (gate.status === "signed-out") {
    return (
      <CenteredMessage
        title="Sign in required"
        body="This page is for admins only."
        action={<Link to="/admin/login" className="rounded-md border px-4 py-2 text-sm">Go to sign in</Link>}
      />
    );
  }
  if (gate.status === "forbidden") {
    return (
      <CenteredMessage
        title="Not authorized"
        body="Your account doesn't have admin access."
        action={<Link to="/" className="rounded-md border px-4 py-2 text-sm">Back home</Link>}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <AdminNav current="demo-runs" />
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold text-ink">Demo generation runs</h1>
        <p className="text-sm text-ink-2">
          One row per model attempt. Expand a failed row to inspect the raw model output that caused a JSON parse failure.
        </p>
      </header>

      <TuningPanel />


      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>All statuses</FilterChip>
        <FilterChip active={statusFilter === "success"} onClick={() => setStatusFilter("success")}>Success</FilterChip>
        <FilterChip active={statusFilter === "fallback"} onClick={() => setStatusFilter("fallback")}>Fallback</FilterChip>
        <FilterChip active={statusFilter === "error"} onClick={() => setStatusFilter("error")}>Error</FilterChip>
        <div className="ml-4 h-4 w-px bg-black/10 dark:bg-white/10" />
        <FilterChip active={failuresOnly} onClick={() => setFailuresOnly((v) => !v)}>
          Parse failures only
        </FilterChip>
      </div>

      {loadError && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Failed to load runs: {loadError}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[1200px] text-sm">
          <thead className="bg-black/[0.03] text-left text-xs uppercase tracking-wide text-ink-2 dark:bg-white/[0.04]">
            <tr>
              <th className="w-8 px-3 py-2"></th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Domain</th>
              <th className="px-3 py-2">Attempt</th>
              <th className="px-3 py-2">Label</th>
              <th className="px-3 py-2 text-right">Prompt&nbsp;chars</th>
              <th className="px-3 py-2 text-right">max_tokens</th>
              <th className="px-3 py-2">stop_reason</th>
              <th className="px-3 py-2">Parse</th>
              <th className="px-3 py-2">Saved</th>
              <th className="px-3 py-2">Final businessName</th>
              <th className="px-3 py-2 text-right">Elapsed</th>
            </tr>
          </thead>
          <tbody>
            {rows === null && (
              <tr><td className="px-3 py-6 text-center text-ink-2" colSpan={12}>Loading runs…</td></tr>
            )}
            {rows !== null && rows.length === 0 && (
              <tr><td className="px-3 py-6 text-center text-ink-2" colSpan={12}>No runs match these filters.</td></tr>
            )}
            {rows?.map((r) => {
              const isOpen = expanded.has(r.id);
              const canExpand = !r.parse_ok && (r.raw_preview || r.parse_error);
              return (
                <>
                  <tr key={r.id} className="border-t border-black/5 dark:border-white/5">
                    <td className="px-3 py-2">
                      {canExpand ? (
                        <button
                          aria-label={isOpen ? "Collapse" : "Expand"}
                          className="rounded border px-1.5 text-xs"
                          onClick={() => setExpanded((prev) => {
                            const next = new Set(prev);
                            if (next.has(r.id)) next.delete(r.id); else next.add(r.id);
                            return next;
                          })}
                        >{isOpen ? "−" : "+"}</button>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-ink-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2">{r.domain ?? <span className="text-ink-2">—</span>}</td>
                    <td className="px-3 py-2 tabular-nums">{r.attempt_index}</td>
                    <td className="px-3 py-2"><code className="text-xs">{r.attempt_label}</code></td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.prompt_length?.toLocaleString() ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.max_tokens ?? "—"}</td>
                    <td className="px-3 py-2"><code className="text-xs">{r.stop_reason ?? "—"}</code></td>
                    <td className="px-3 py-2">
                      {r.parse_ok
                        ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">ok</span>
                        : <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-200">fail</span>}
                    </td>
                    <td className="px-3 py-2"><StatusBadge value={r.saved_status} /></td>
                    <td className="px-3 py-2">{r.final_business_name ?? <span className="text-ink-2">—</span>}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink-2">{r.elapsed_ms ? `${r.elapsed_ms} ms` : "—"}</td>
                  </tr>
                  {isOpen && (
                    <tr key={r.id + "-detail"} className="border-t border-black/5 bg-black/[0.02] dark:border-white/5 dark:bg-white/[0.02]">
                      <td></td>
                      <td className="px-3 py-3" colSpan={11}>
                        {r.parse_error && (
                          <div className="mb-2">
                            <div className="mb-1 text-xs uppercase tracking-wide text-ink-2">Parse error</div>
                            <pre className="whitespace-pre-wrap break-words rounded bg-black/5 p-2 text-xs dark:bg-white/5">{r.parse_error}</pre>
                          </div>
                        )}
                        {r.raw_preview && (
                          <div>
                            <div className="mb-1 text-xs uppercase tracking-wide text-ink-2">Raw model output (first 4000 chars)</div>
                            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded bg-black/5 p-2 text-xs dark:bg-white/5">{r.raw_preview}</pre>
                          </div>
                        )}
                        <div className="mt-3 flex gap-4 text-xs text-ink-2">
                          <span>trace: <code>{r.trace_id}</code></span>
                          <span>model: <code>{r.model ?? "—"}</code></span>
                          <span>response chars: <code>{r.response_text_length}</code></span>
                          {r.lead_id && <span>lead: <code>{r.lead_id}</code></span>}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-ink-2">Showing up to 200 most recent rows.</p>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-xs " +
        (active
          ? "border-transparent bg-ink text-white dark:bg-white dark:text-black"
          : "border-black/15 text-ink-2 hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]")
      }
    >
      {children}
    </button>
  );
}

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    fallback: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    error: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  };
  const cls = map[value] ?? "bg-black/10 text-ink dark:bg-white/10";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{value}</span>;
}

function CenteredMessage({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-2">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

type LastRun = {
  created_at: string;
  domain: string | null;
  trace_id: string;
  attempt_label: string;
  raw_preview_cap: number | null;
  raw_note_cap: number | null;
};

function TuningPanel() {
  const [config, setConfig] = useState<DemoResearchConfig | null>(null);
  const [lastRun, setLastRun] = useState<LastRun | null | undefined>(undefined); // undefined = loading, null = none
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cfg, lr] = await Promise.all([
          getDemoResearchConfig(),
          supabase
            .from("demo_generation_runs")
            .select("created_at, domain, trace_id, attempt_label, raw_preview_cap, raw_note_cap")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);
        if (cancelled) return;
        setConfig(cfg);
        setLastRun((lr.data as LastRun | null) ?? null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [refreshTick]);

  if (error) return null; // e.g. 403 — silently hide

  const copy = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedKey(name);
      setTimeout(() => setCopiedKey((k) => (k === name ? null : k)), 1500);
    } catch {
      /* ignore */
    }
  };

  const capForName = (name: string) =>
    config?.caps.find((c) => c.name === name) ?? null;
  const lastValueFor = (name: string): number | null => {
    if (!lastRun) return null;
    if (name === "DEMO_RAW_MAX_CHARS") return lastRun.raw_preview_cap;
    if (name === "DEMO_RAW_NOTE_CHARS") return lastRun.raw_note_cap;
    return null;
  };

  return (
    <section className="mb-6 rounded-lg border border-black/10 dark:border-white/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-sm font-semibold text-ink">Demo research tuning</span>
        <span className="text-xs text-ink-2">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="border-t border-black/10 px-4 py-4 dark:border-white/10">
          {config === null ? (
            <div className="text-sm text-ink-2">Loading current caps…</div>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-2">Current effective caps</h2>
                <button
                  onClick={() => setRefreshTick((t) => t + 1)}
                  className="rounded border border-black/15 px-2 py-0.5 text-xs text-ink-2 hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]"
                >
                  Refresh
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {config.caps.map((cap) => (
                  <div key={cap.name} className="rounded-md border border-black/10 p-3 dark:border-white/10">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-medium text-ink">{cap.name}</code>
                      <button
                        onClick={() => copy(cap.name)}
                        className="rounded border border-black/15 px-2 py-0.5 text-xs text-ink-2 hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]"
                        aria-label={`Copy ${cap.name}`}
                      >
                        {copiedKey === cap.name ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="mt-2 font-mono text-2xl tabular-nums text-ink">
                      {cap.effective.toLocaleString()}
                    </div>
                    <div className="mt-1 text-[11px] text-ink-2">
                      default {cap.default.toLocaleString()} · min {cap.min.toLocaleString()} · max {cap.max.toLocaleString()}
                    </div>
                    <div className="mt-2">
                      <SourceBadge cap={cap} />
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-2">Redaction</h2>
              <div className="rounded-md border border-black/10 dark:border-white/10">
                <table className="w-full text-sm">
                  <tbody>
                    {config.redaction.map((flag) => (
                      <tr key={flag.name} className="border-b border-black/5 last:border-b-0 dark:border-white/5">
                        <td className="px-3 py-2">
                          <code className="text-xs font-medium text-ink">{flag.name}</code>
                        </td>
                        <td className="px-3 py-2">
                          {flag.enabled ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">on</span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">off</span>
                          )}
                          {flag.source === "unparsable" && (
                            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
                              unparsable “{flag.raw}” — using default
                            </span>
                          )}
                          {flag.source === "default" && (
                            <span className="ml-2 text-[11px] text-ink-2">default</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => copy(flag.name)}
                            className="rounded border border-black/15 px-2 py-0.5 text-xs text-ink-2 hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]"
                            aria-label={`Copy ${flag.name}`}
                          >
                            {copiedKey === flag.name ? "Copied" : "Copy"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-ink-2">
                Set to <code>0</code>/<code>false</code>/<code>off</code>/<code>no</code> to disable a category. Unset = redaction on.
              </p>

              <h2 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-2">Last request</h2>

              {lastRun === undefined ? (
                <div className="text-sm text-ink-2">Loading…</div>
              ) : lastRun === null ? (
                <div className="rounded-md border border-dashed border-black/15 p-3 text-sm text-ink-2 dark:border-white/15">
                  No demo runs recorded yet.
                </div>
              ) : (
                <div className="rounded-md border border-black/10 p-3 dark:border-white/10">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["DEMO_RAW_MAX_CHARS", "DEMO_RAW_NOTE_CHARS"] as const).map((name) => {
                      const lastVal = lastValueFor(name);
                      const cap = capForName(name);
                      const mismatch = lastVal != null && cap != null && lastVal !== cap.effective;
                      return (
                        <div key={name}>
                          <code className="text-xs font-medium text-ink">{name}</code>
                          <div className="mt-1 font-mono text-2xl tabular-nums text-ink">
                            {lastVal != null ? lastVal.toLocaleString() : "—"}
                          </div>
                          {mismatch && (
                            <div className="mt-1">
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                changed since last run (current {cap!.effective.toLocaleString()})
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-[11px] text-ink-2">
                    trace <code>{lastRun.trace_id}</code> · {lastRun.domain ?? "no domain"} · <code>{lastRun.attempt_label}</code> · {new Date(lastRun.created_at).toLocaleString()}
                  </div>
                </div>
              )}

              <p className="mt-4 text-xs text-ink-2">
                Update these in Backend → Edge function secrets, then rerun the tool. Values are read per-request.
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}


function SourceBadge({ cap }: { cap: DemoResearchConfig["caps"][number] }) {
  if (cap.source === "default") {
    return <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] text-ink-2 dark:bg-white/10">using default</span>;
  }
  if (cap.source === "env") {
    return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">from secret</span>;
  }
  if (cap.source === "clamped") {
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">clamped from {cap.raw}</span>;
  }
  return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-800 dark:bg-red-950 dark:text-red-200">unparsable “{cap.raw}” — using default</span>;
}

