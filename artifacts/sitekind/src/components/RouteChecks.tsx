import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

type Status = "pending" | "ok" | "fail";
type Row = { path: string; status: Status; httpStatus?: number; ms?: number };

export function RouteChecks({ routes }: { routes: readonly string[] }) {
  const [rows, setRows] = useState<Row[]>(() =>
    routes.map((p) => ({ path: p, status: "pending" as const })),
  );
  const [runId, setRunId] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setRunning(true);
    setRows(routes.map((p) => ({ path: p, status: "pending" as const })));

    (async () => {
      // Small concurrency pool so we don't slam the browser.
      const pool = 6;
      let cursor = 0;
      async function worker() {
        while (!cancelled) {
          const i = cursor++;
          if (i >= routes.length) return;
          const path = routes[i];
          const started = performance.now();
          try {
            const res = await fetch(path, {
              method: "GET",
              cache: "no-store",
              redirect: "follow",
            });
            const ms = Math.round(performance.now() - started);
            const row: Row = {
              path,
              status: res.ok ? "ok" : "fail",
              httpStatus: res.status,
              ms,
            };
            if (!cancelled)
              setRows((r) => r.map((x) => (x.path === path ? row : x)));
          } catch {
            const ms = Math.round(performance.now() - started);
            if (!cancelled)
              setRows((r) =>
                r.map((x) =>
                  x.path === path ? { path, status: "fail", ms } : x,
                ),
              );
          }
        }
      }
      await Promise.all(Array.from({ length: pool }, worker));
      if (!cancelled) setRunning(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [routes, runId]);

  const okCount = rows.filter((r) => r.status === "ok").length;
  const failCount = rows.filter((r) => r.status === "fail").length;
  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Pill tone={failCount === 0 && !running ? "ok" : running ? "muted" : "fail"}>
          {running
            ? `Checking… ${routes.length - pendingCount}/${routes.length}`
            : failCount === 0
              ? "All routes healthy"
              : `${failCount} failing`}
        </Pill>
        <span className="text-sm text-ink-2">
          {okCount} ok · {failCount} fail · {pendingCount} pending
        </span>
        <button
          type="button"
          onClick={() => setRunId((n) => n + 1)}
          disabled={running}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm text-ink-2 transition-colors hover:text-ink disabled:opacity-50"
        >
          <RefreshCw size={14} className={running ? "animate-spin" : ""} />
          Re-check
        </button>
      </div>

      <ul className="divide-y divide-[var(--card-border)] overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--surface)]">
        {rows.map((r) => (
          <li
            key={r.path}
            className="flex items-center gap-3 px-4 py-2.5 font-code text-sm"
          >
            <StatusIcon status={r.status} />
            <span className="flex-1 truncate text-ink">{r.path}</span>
            {r.httpStatus !== undefined && (
              <span
                className={
                  r.status === "ok" ? "text-ink-2" : "text-[var(--color-warning)]"
                }
              >
                {r.httpStatus}
              </span>
            )}
            {r.ms !== undefined && (
              <span className="w-14 text-right text-xs text-ink-2">{r.ms}ms</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "pending")
    return <Loader2 size={16} className="animate-spin text-ink-2" />;
  if (status === "ok")
    return <CheckCircle2 size={16} className="text-[var(--color-accent)]" />;
  return <XCircle size={16} className="text-[var(--color-warning)]" />;
}

function Pill({
  tone,
  children,
}: {
  tone: "ok" | "fail" | "muted";
  children: React.ReactNode;
}) {
  const classes =
    tone === "ok"
      ? "border-[rgb(15_118_110_/0.28)] bg-[rgb(15_118_110_/0.1)] text-[var(--color-accent)] dark:text-[#2dd4bf]"
      : tone === "fail"
        ? "border-[rgb(245_158_11_/0.28)] bg-[rgb(245_158_11_/0.1)] text-[var(--color-warning)]"
        : "border-[var(--card-border)] bg-[var(--surface-2)] text-ink-2";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${classes}`}
    >
      {children}
    </span>
  );
}
