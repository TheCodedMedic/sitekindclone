/**
 * Shared requestAnimationFrame loop — the ONE rAF driver for every
 * continuously-animated effect on the site (pointer interpolation, count-ups,
 * scene sequencing). Subscribers share a single frame callback instead of
 * each spinning their own loop.
 *
 * Behavior:
 *  - auto-starts on the first subscriber
 *  - auto-stops when the last subscriber leaves
 *  - pauses while the document is hidden (visibilitychange) and resumes on
 *    return without a giant delta spike
 *  - SSR-inert: importing this module on the server does nothing
 *
 * `createFrameLoop` is exported with injectable timing/document for unit
 * tests; app code uses the `frameLoop` singleton.
 */

export type FrameCallback = (now: number, deltaMs: number) => void;

export type FrameLoopOptions = {
  /** Injectable requestAnimationFrame (tests). */
  requestFrame?: (cb: (now: number) => void) => number;
  /** Injectable cancelAnimationFrame (tests). */
  cancelFrame?: (handle: number) => void;
  /** Injectable document accessor (tests / SSR). */
  getDocument?: () => Pick<
    Document,
    "visibilityState" | "addEventListener" | "removeEventListener"
  > | null;
};

export type FrameLoop = {
  /** Register a per-frame callback. Returns an idempotent unsubscribe. */
  subscribe: (cb: FrameCallback) => () => void;
  /** Number of active subscribers (introspection / tests). */
  subscriberCount: () => number;
  /** Whether a frame is currently scheduled. */
  isRunning: () => boolean;
};

export function createFrameLoop(options: FrameLoopOptions = {}): FrameLoop {
  const getDocument =
    options.getDocument ??
    (() => (typeof document === "undefined" ? null : document));
  const requestFrame =
    options.requestFrame ??
    ((cb: (now: number) => void) =>
      typeof window === "undefined" ? 0 : window.requestAnimationFrame(cb));
  const cancelFrame =
    options.cancelFrame ??
    ((handle: number) => {
      if (typeof window !== "undefined") window.cancelAnimationFrame(handle);
    });

  const subscribers = new Set<FrameCallback>();
  let handle: number | null = null;
  let lastNow: number | null = null;
  let visibilityListener: (() => void) | null = null;

  const isHidden = () => getDocument()?.visibilityState === "hidden";

  const tick = (now: number) => {
    handle = null;
    if (subscribers.size === 0 || isHidden()) {
      lastNow = null;
      return;
    }
    const delta = lastNow === null ? 0 : Math.max(0, now - lastNow);
    lastNow = now;
    // Snapshot so a callback unsubscribing mid-frame is safe.
    for (const cb of Array.from(subscribers)) {
      try {
        cb(now, delta);
      } catch (err) {
        if (import.meta.env?.DEV) {
          console.debug("[frameLoop] subscriber threw", err);
        }
      }
    }
    if (subscribers.size > 0 && !isHidden()) {
      handle = requestFrame(tick);
    }
  };

  const start = () => {
    if (handle === null && subscribers.size > 0 && !isHidden()) {
      lastNow = null; // avoid a huge first delta after pause/resume
      handle = requestFrame(tick);
    }
  };

  const stop = () => {
    if (handle !== null) {
      cancelFrame(handle);
      handle = null;
    }
    lastNow = null;
  };

  const attachVisibility = () => {
    if (visibilityListener) return;
    const doc = getDocument();
    if (!doc) return;
    visibilityListener = () => {
      if (isHidden()) stop();
      else start();
    };
    doc.addEventListener("visibilitychange", visibilityListener);
  };

  const detachVisibility = () => {
    if (!visibilityListener) return;
    const doc = getDocument();
    if (doc) doc.removeEventListener("visibilitychange", visibilityListener);
    visibilityListener = null;
  };

  return {
    subscribe(cb: FrameCallback) {
      subscribers.add(cb);
      attachVisibility();
      start();
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        subscribers.delete(cb);
        if (subscribers.size === 0) {
          stop();
          detachVisibility();
        }
      };
    },
    subscriberCount: () => subscribers.size,
    isRunning: () => handle !== null,
  };
}

/** App-wide singleton. Every animated effect should subscribe here. */
export const frameLoop: FrameLoop = createFrameLoop();
