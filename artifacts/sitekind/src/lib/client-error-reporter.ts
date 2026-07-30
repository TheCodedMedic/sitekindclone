/**
 * Client-side error reporter.
 *
 * Installs window `error` + `unhandledrejection` listeners in the browser and
 * forwards them (plus manual `reportClientError` calls) to
 * `/api/public/client-errors`, which logs them to Server Logs so mobile
 * preview failures are debuggable.
 */

type ErrorKind =
  | "window-error"
  | "unhandled-rejection"
  | "resource-error"
  | "manual";

type Payload = {
  kind: ErrorKind;
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  col?: number;
  url?: string;
  userAgent?: string;
  viewport?: string;
  context?: Record<string, unknown>;
  at: string;
};

const ENDPOINT = "/api/public/client-errors";
const DEDUPE_WINDOW_MS = 5_000;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

let installed = false;
const recent = new Map<string, number>();
const timestamps: number[] = [];

function shouldSend(key: string): boolean {
  const now = Date.now();
  // dedupe
  const last = recent.get(key);
  if (last && now - last < DEDUPE_WINDOW_MS) return false;
  recent.set(key, now);
  // rate limit
  while (timestamps.length && now - timestamps[0] > RATE_WINDOW_MS) {
    timestamps.shift();
  }
  if (timestamps.length >= RATE_MAX) return false;
  timestamps.push(now);
  return true;
}

function send(payload: Payload) {
  const key = `${payload.kind}::${payload.message}::${payload.stack ?? ""}`;
  if (!shouldSend(key)) return;

  try {
    // eslint-disable-next-line no-console
    console.error("[client-error]", payload);
  } catch {
    // ignore
  }

  try {
    const body = JSON.stringify(payload);
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
    if (typeof fetch === "function") {
      void fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // never let the reporter itself throw
  }
}

function baseFields(): Pick<Payload, "url" | "userAgent" | "viewport" | "at"> {
  const w = typeof window !== "undefined" ? window : undefined;
  return {
    url: w?.location?.href,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    viewport: w
      ? `${w.innerWidth}x${w.innerHeight}`
      : undefined,
    at: new Date().toISOString(),
  };
}

function truncate(s: string | undefined, max = 4000): string | undefined {
  if (!s) return s;
  return s.length > max ? s.slice(0, max) + "…[truncated]" : s;
}

export function reportClientError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const err =
    error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : JSON.stringify(error));
  send({
    kind: "manual",
    message: truncate(err.message) ?? "Unknown error",
    stack: truncate(err.stack),
    context,
    ...baseFields(),
  });
}

export function installClientErrorReporter(): void {
  if (installed) return;
  if (typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event: ErrorEvent) => {
    // Resource load failure (script/link/img 404): event.error is null,
    // event.target is the failing element.
    const target = event.target as
      | (HTMLElement & { src?: string; href?: string; tagName?: string })
      | null;
    if (target && target !== (window as unknown as EventTarget) && target.tagName) {
      const url = target.src || target.href;
      send({
        kind: "resource-error",
        message: `Failed to load ${target.tagName.toLowerCase()}${url ? `: ${url}` : ""}`,
        source: url,
        ...baseFields(),
      });
      return;
    }

    const err = event.error;
    send({
      kind: "window-error",
      message: truncate(err?.message ?? event.message) ?? "Unknown error",
      stack: truncate(err?.stack),
      source: event.filename,
      line: event.lineno,
      col: event.colno,
      ...baseFields(),
    });
  }, true); // capture phase to catch resource errors

  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const err =
      reason instanceof Error
        ? reason
        : new Error(
            typeof reason === "string" ? reason : JSON.stringify(reason ?? "unknown"),
          );
    send({
      kind: "unhandled-rejection",
      message: truncate(err.message) ?? "Unhandled promise rejection",
      stack: truncate(err.stack),
      ...baseFields(),
    });
  });
}

// Auto-install on import in the browser.
installClientErrorReporter();
