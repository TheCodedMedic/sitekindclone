/**
 * Shared vocabulary for the hero "Run a sample lead" signature scene
 * (Level A of the motion hierarchy — the ONE user-triggered hero sequence).
 *
 * The deterministic state machine lives in HeroConsole; ConsoleRouteLayer
 * only *reads* the phase to fire node micro-responses, so this module keeps
 * the two lazily-split chunks in sync without a runtime dependency cycle.
 *
 * Total scripted duration: 550+450+800+550+450 = 2800ms — inside the
 * 2800–3600ms signature-scene band (--motion-scene).
 */

export type SampleLeadPhase =
  | "idle"
  | "ringing"
  | "answered"
  | "qualifying"
  | "booking"
  | "reward"
  | "complete";

/** Ordered animated phases with their durations (ms). */
export const SAMPLE_LEAD_STEPS: ReadonlyArray<
  readonly [Exclude<SampleLeadPhase, "idle" | "complete">, number]
> = [
  ["ringing", 550], // 450–650ms band
  ["answered", 450], // 400–550ms band
  ["qualifying", 800], // 650–900ms band
  ["booking", 550], // 450–650ms band
  ["reward", 450], // 350–550ms band
] as const;

export const SAMPLE_LEAD_RUNNING_PHASES: ReadonlyArray<SampleLeadPhase> =
  SAMPLE_LEAD_STEPS.map(([phase]) => phase);

export function isSampleLeadRunning(phase: SampleLeadPhase): boolean {
  return phase !== "idle" && phase !== "complete";
}

/* ── Deterministic sequence runner ─────────────────────────────────────
 * Extracted from HeroConsole (unchanged behavior) so the timer chain is
 * unit-testable with an injected clock (scripts/test-motion.mjs).
 * HeroConsole owns the React side (state, tracking, audio wiring) and
 * drives this machine through the callbacks below.
 */

/** Injectable timer surface (defaults to global setTimeout/clearTimeout). */
export type SampleLeadScheduler = {
  schedule: (cb: () => void, ms: number) => unknown;
  cancel: (handle: unknown) => void;
};

export type SampleLeadMachineOptions = {
  /** Fired on every phase change (including reset back to "idle"). */
  onPhase: (phase: SampleLeadPhase) => void;
  /** AUDIO COORDINATION: while true, start() is a no-op — audio wins. */
  isAudioActive?: () => boolean;
  /** Fired once per successful start() (analytics). */
  onStart?: () => void;
  /** Fired when a run reaches "complete" (analytics). */
  onComplete?: () => void;
  scheduler?: SampleLeadScheduler;
};

export type SampleLeadMachine = {
  /**
   * Start (or restart) the sequence. Returns false (no-op) while audio is
   * active; restarting cancels the previous run first — never two chains.
   */
  start: () => boolean;
  /** Back to "idle", cancelling any pending timer (audio start / unmount). */
  reset: () => void;
  /** Current phase (introspection / tests). */
  phase: () => SampleLeadPhase;
  /** Whether a stage timer is currently scheduled. */
  hasPendingTimer: () => boolean;
};

const defaultScheduler: SampleLeadScheduler = {
  schedule: (cb, ms) => setTimeout(cb, ms),
  cancel: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

export function createSampleLeadMachine(
  options: SampleLeadMachineOptions,
): SampleLeadMachine {
  const scheduler = options.scheduler ?? defaultScheduler;
  const isAudioActive = options.isAudioActive ?? (() => false);

  let phase: SampleLeadPhase = "idle";
  let handle: unknown = null;
  let runId = 0;

  const setPhase = (next: SampleLeadPhase) => {
    phase = next;
    options.onPhase(next);
  };

  const clearTimer = () => {
    if (handle !== null) {
      scheduler.cancel(handle);
      handle = null;
    }
  };

  return {
    start() {
      if (isAudioActive()) return false; // audio wins — never overlap
      runId++;
      const run = runId;
      clearTimer();
      options.onStart?.();

      let index = 0;
      setPhase(SAMPLE_LEAD_STEPS[0][0]);
      const advance = () => {
        handle = scheduler.schedule(() => {
          if (runId !== run) return; // superseded by a newer run/reset
          handle = null;
          index++;
          if (index >= SAMPLE_LEAD_STEPS.length) {
            setPhase("complete");
            options.onComplete?.();
            return;
          }
          setPhase(SAMPLE_LEAD_STEPS[index][0]);
          advance();
        }, SAMPLE_LEAD_STEPS[index][1]);
      };
      advance();
      return true;
    },
    reset() {
      runId++;
      clearTimer();
      setPhase("idle");
    },
    phase: () => phase,
    hasPendingTimer: () => handle !== null,
  };
}
