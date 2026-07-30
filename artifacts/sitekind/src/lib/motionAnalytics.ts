/**
 * Lightweight, privacy-safe motion analytics.
 *
 * `track()` dispatches a DOM CustomEvent ("sitekind:analytics") that any
 * listener (tag manager, telemetry bridge) can consume, and logs via
 * console.debug in dev. It never makes a network request itself and must
 * NEVER be passed pointer coordinates or other per-frame data — event names
 * and coarse metadata only.
 */

export const ANALYTICS_EVENT_NAME = "sitekind:analytics";

export type AnalyticsDetail = {
  event: string;
  data?: Record<string, string | number | boolean | null>;
  ts: number;
};

export function track(event: string, data?: AnalyticsDetail["data"]): void {
  if (typeof window === "undefined") return;
  try {
    const detail: AnalyticsDetail = { event, data, ts: Date.now() };
    window.dispatchEvent(new CustomEvent(ANALYTICS_EVENT_NAME, { detail }));
    if (import.meta.env.DEV) {
      console.debug(`[analytics] ${event}`, data ?? {});
    }
  } catch {
    // analytics must never break the page
  }
}
