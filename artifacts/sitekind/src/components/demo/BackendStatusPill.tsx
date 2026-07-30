import { useEffect, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { useBackendHealth } from "@/hooks/useBackendHealth";

function relTime(ts: number | null): string {
  if (!ts) return "";
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  return `${m}m ago`;
}

export function BackendStatusPill() {
  const { health, lastCheckedAt, checking, recheck } = useBackendHealth();
  const [expanded, setExpanded] = useState(false);
  const [, setTick] = useState(0);

  // Keep relative time fresh.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(id);
  }, []);

  const loading = health === null;
  const status = health?.status;

  let dotClass = "bg-ink-3";
  let label = "Checking backend…";
  let meta: string | null = null;
  if (!loading && health) {
    if (status === "ok") {
      dotClass = "bg-emerald-500";
      label = "Backend connected";
      meta = `${health.ms}ms`;
    } else if (status === "degraded") {
      dotClass = "bg-amber-500";
      label = "Backend degraded";
      meta = health.code ?? (health.httpStatus ? `HTTP ${health.httpStatus}` : null);
    } else {
      dotClass = "bg-red-500";
      label = "Backend offline";
      meta = "no response";
    }
  }

  const canExpand = !loading && status !== "ok";
  const detail =
    health && status !== "ok" && "detail" in health ? (health as { detail?: string }).detail : undefined;
  const code = health && status === "degraded" ? health.code : undefined;
  const traceId = health && status === "degraded" ? health.traceId : undefined;

  return (
    <div className="mb-4 rounded-md border border-ink-1/20 bg-surface-1/60 px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${dotClass} ${loading || checking ? "animate-pulse" : ""}`}
        />
        <span className="font-medium text-ink-1">{label}</span>
        {meta && <span className="font-code text-ink-2">· {meta}</span>}
        {lastCheckedAt && <span className="text-ink-2">· checked {relTime(lastCheckedAt)}</span>}
        <div className="ml-auto flex items-center gap-2">
          {canExpand && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-ink-2 underline underline-offset-2 hover:text-ink-1"
            >
              {expanded ? "hide" : "details"}
            </button>
          )}
          <button
            type="button"
            onClick={() => void recheck()}
            disabled={checking}
            aria-label="Recheck backend"
            className="text-ink-2 hover:text-ink-1 disabled:opacity-50"
          >
            {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      {expanded && canExpand && (
        <div className="mt-2 space-y-1 border-t border-ink-1/10 pt-2 font-code text-[11px] text-ink-2">
          {code && (
            <div>
              code: <span className="text-ink-1">{code}</span>
            </div>
          )}
          {traceId && (
            <div>
              trace: <span className="text-ink-1">{traceId}</span>
            </div>
          )}
          {detail && (
            <div className="break-words">
              detail: <span className="text-ink-1">{detail}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
