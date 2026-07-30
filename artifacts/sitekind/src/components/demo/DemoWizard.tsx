import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Globe,
  Loader2,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Star,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  claimLead,
  getTurnstileFailure,
  getTurnstileToken,
  runResearch,
  suggestDomains,
  turnstileFailureToError,
  type BusinessProfile,
  type DemoFlow,
  type DemoIntake,
  type DesignCandidate,
  type DesignSchema,
  type DomainSuggestion,
  type StepEvent,
} from "@/lib/demoApi";
import { createLead } from "@workspace/api-client-react";
import { PreviewForVertical } from "./previews";
import { ReportPanel } from "./ReportPanel";
import { DesignRationalePanel } from "./DesignRationalePanel";
import {
  applyRenderDirectives,
  buildEvidenceSummary,
  captureNodeToArenaJpegDataUrl,
  requestArenaJudge,
  requestDesignJudge,
  sanitizeArenaCandidates,
} from "@/lib/designJudge";


// "finalizing" (Stage A2) sits between the research result arriving and the
// reveal: the winner + rival candidates are judged off-screen and the
// customer only ever sees the ONE refined draft.
type Phase = "choose" | "form" | "running" | "finalizing" | "done" | "failed";

// What the pre-reveal judging concluded: "refined" = a judge verdict changed
// the shipped schema, "reviewed" = judging succeeded with nothing to change,
// "none" = judging skipped or failed (reveal the tournament winner as-is).
type JudgeOutcome = "refined" | "reviewed" | "none";

type LogLine = StepEvent & { ts: number };

const STEP_LABELS: Record<StepEvent["id"], string> = {
  captcha: "Security check",
  google: "Google Business Profile",
  site: "Your current website",
  synth: "Drafting your homepage",
  schema: "Designing your homepage",
  photos: "Best-photo review",
  logo: "Logo",
  store: "Saving draft",
};


export function DemoWizard() {
  const [phase, setPhase] = useState<Phase>("choose");
  const [flow, setFlow] = useState<DemoFlow>("has-site");
  const [log, setLog] = useState<LogLine[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [judgeAvailable, setJudgeAvailable] = useState<boolean | undefined>(undefined);
  const [arenaAvailable, setArenaAvailable] = useState<boolean | undefined>(undefined);
  const [candidates, setCandidates] = useState<DesignCandidate[]>([]);
  // The ONE profile the customer sees — set exactly once per run, after
  // whatever pre-reveal judging completed (or failed silently).
  const [finalProfile, setFinalProfile] = useState<BusinessProfile | null>(null);
  const [judgeOutcome, setJudgeOutcome] = useState<JudgeOutcome>("none");
  const [beforeShot, setBeforeShot] = useState<string | null>(null);
  const [domains, setDomains] = useState<DomainSuggestion[] | null>(null);
  const [domainsNote, setDomainsNote] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; code?: string; traceId?: string; detail?: string } | null>(null);
  const [stall, setStall] = useState<{ sinceMs: number; willFailInMs: number } | null>(null);
  const intakeRef = useRef<DemoIntake | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const switchingRef = useRef<boolean>(false);

  function cancelRun() {
    switchingRef.current = false;
    abortRef.current?.abort();
    abortRef.current = null;
    setStall(null);
    setError(null);
    setLog([]);
    // Leaving the "finalizing" phase unmounts PreRevealJudge, whose effect
    // cleanup aborts all in-flight arena work (captures + fetch).
    setFinalProfile(null);
    setJudgeOutcome("none");
    setCandidates([]);
    setPhase("choose");
  }

  function domainToName(domain?: string): string | undefined {
    if (!domain) return undefined;
    const root = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[./]/)[0];
    if (!root) return undefined;
    return root.charAt(0).toUpperCase() + root.slice(1);
  }

  async function start(intake: DemoIntake, opts: { isAutoReconnect?: boolean } = {}) {
    intakeRef.current = intake;
    setLog([]);
    setProfile(null);
    setFinalProfile(null);
    setJudgeOutcome("none");
    setArenaAvailable(undefined);
    setCandidates([]);
    setDomains(null);
    setError(null);
    setStall(null);
    setPhase("running");

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    switchingRef.current = false;

    try {
      intake.turnstileToken = await getTurnstileToken();
      const turnstileFailure = getTurnstileFailure();
      if (!intake.turnstileToken && turnstileFailure) {
        throw turnstileFailureToError(turnstileFailure);
      }
      await runResearch(intake, (e) => {
        if (e.type === "step") {
          // Auto-fallback: prospect domain doesn't resolve → switch to no-site flow.
          if (
            intake.flow === "has-site" &&
            e.id === "site" &&
            e.status === "fail" &&
            /doesn't resolve/i.test(e.detail) &&
            !switchingRef.current
          ) {
            switchingRef.current = true;
            ctrl.abort();
            const nextIntake: DemoIntake = {
              flow: "no-site",
              businessName: intake.businessName || domainToName(intake.domain),
              description: intake.description,
              city: intake.city,
              state: intake.state,
              radiusMiles: 15,
              phone: intake.phone,
            };
            setFlow("no-site");
            queueMicrotask(() => { void start(nextIntake); });
            return;
          }
          setLog((l) => {
            const cleaned = l.filter((x) => x.id !== "captcha" || x.detail.indexOf("Reconnecting") === -1);
            const next = cleaned.filter((x) => !(x.id === e.id && x.status === "start" && e.status !== "start"));
            return [...next, { ...e, ts: Date.now() }];
          });
        } else if (e.type === "result") {
          setProfile(e.profile);
          setLeadId(e.leadId);
          setJudgeAvailable(e.judgeAvailable);
          setArenaAvailable(e.arenaAvailable);
          setCandidates(e.designCandidates ?? []);
          setBeforeShot(e.beforeScreenshot);
          // Stage A2 — the reveal happens ONCE, after whatever pre-reveal
          // judging (arena or one-shot) completed or failed. When judging
          // can't run at all, reveal the tournament winner immediately.
          const canJudge = Boolean(e.profile.designSchema) && Boolean(e.leadId) && e.judgeAvailable !== false;
          if (canJudge) {
            setPhase("finalizing");
          } else {
            setFinalProfile(e.profile);
            setJudgeOutcome("none");
            setPhase("done");
          }
          if (intake.flow === "no-site") {
            void fetchDomains(e.profile, intake);
          }
        } else if (e.type === "error") {
          if (switchingRef.current || ctrl.signal.aborted) return;
          setError({ message: e.error, code: e.code, traceId: e.traceId, detail: e.detail });
          setPhase("failed");
        }
      }, {
        signal: ctrl.signal,
        onRetry: ({ attempt, delayMs }) => {
          setLog((l) => [
            ...l.filter((x) => !(x.id === "captcha" && x.detail.indexOf("Reconnecting") !== -1)),
            {
              type: "step",
              id: "captcha",
              status: "start",
              detail: `Reconnecting… attempt ${attempt} of 3 (retrying in ${Math.round(delayMs / 100) / 10}s)`,
              ts: Date.now(),
            },
          ]);
        },
        onStall: (info) => setStall(info),
      });
    } catch (err) {
      const isAbort =
        (err instanceof DOMException && err.name === "AbortError") ||
        ctrl.signal.aborted ||
        switchingRef.current;
      if (isAbort) {
        setStall(null);
        return;
      }
      // The backend closed the stream without a terminal frame (isolate
      // died / proxy cut the connection). One automatic reconnect covers
      // the transient case; a second failure surfaces to the user as usual.
      const errCode = (err as { code?: string } | null)?.code;
      if (errCode === "stream_incomplete" && !opts.isAutoReconnect) {
        queueMicrotask(() => { void start(intake, { isAutoReconnect: true }); });
        return;
      }
      if (err && typeof err === "object" && "status" in err && "message" in err) {
        const e = err as unknown as { message: string; code?: string; traceId?: string; detail?: string };
        setError({ message: e.message, code: e.code, traceId: e.traceId, detail: e.detail });
      } else {
        setError({ message: String(err instanceof Error ? err.message : err) });
      }
      setStall(null);
      setPhase("failed");
    }
  }

  async function fetchDomains(p: BusinessProfile, intake: DemoIntake) {
    try {
      const r = await suggestDomains({
        businessName: p.businessName,
        city: intake.city,
        state: intake.state,
        vertical: p.vertical,
      });
      if (r.available.length) {
        setDomains(r.available);
        setDomainsNote(null);
      } else if (r.unverified.length) {
        setDomains(r.unverified);
        setDomainsNote("Availability checker is offline — treat these as name ideas, we'll confirm before registering.");
      } else {
        setDomains([]);
        setDomainsNote("Domain suggestions are unavailable right now.");
      }
    } catch {
      setDomains([]);
      setDomainsNote("Domain suggestions are unavailable right now.");
    }
  }


  return (
    <div>
      
      {phase === "choose" && <PathChooser onPick={(f) => { setFlow(f); setPhase("form"); }} />}
      {phase === "form" && (
        <IntakeForm flow={flow} onBack={() => setPhase("choose")} onSubmit={start} />
      )}
      {(phase === "running" || phase === "failed" || phase === "finalizing") && (
        <BuildLog
          log={log}
          error={phase === "failed" ? error : null}
          stall={phase === "running" ? stall : null}
          onRetry={() => {
            if (intakeRef.current) void start(intakeRef.current);
            else setPhase("form");
          }}
          onCancel={phase === "running" || phase === "finalizing" ? cancelRun : undefined}
        />
      )}

      {phase === "finalizing" && profile && profile.designSchema && leadId && (
        <PreRevealJudge
          profile={profile}
          leadId={leadId}
          arenaAvailable={arenaAvailable}
          candidates={candidates}
          onDone={(finalP, outcome) => {
            setFinalProfile(finalP);
            setJudgeOutcome(outcome);
            setPhase("done");
          }}
        />
      )}

      {phase === "done" && finalProfile && intakeRef.current && (
        <ResultView
          profile={finalProfile}
          flow={flow}
          leadId={leadId}
          judgeOutcome={judgeOutcome}
          beforeShot={beforeShot}
          domains={domains}
          domainsNote={domainsNote}
          log={log}
          intake={intakeRef.current}
          onRestart={() => setPhase("choose")}
        />
      )}
    </div>
  );
}

/* ── Step 1: pick a path ──────────────────────────────────────────── */

function PathChooser({ onPick }: { onPick: (f: DemoFlow) => void }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <button
        onClick={() => onPick("has-site")}
        className="glass-card group flex h-full cursor-pointer flex-col items-start p-8 text-left transition-transform hover:-translate-y-1"
      >
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-[rgb(194_65_12_/0.12)] text-[var(--color-primary)]">
          <Globe size={22} />
        </span>
        <h2 className="mt-5 font-display text-xl font-bold text-ink">
          I have a website
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">
          Give us your domain. We'll read your current site, find your Google
          reviews and photos, and rebuild your homepage — side by side with the
          old one.
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] transition-all group-hover:gap-2.5">
          Rebuild my site <ArrowRight size={15} />
        </span>
      </button>

      <button
        onClick={() => onPick("no-site")}
        className="glass-card group flex h-full cursor-pointer flex-col items-start p-8 text-left transition-transform hover:-translate-y-1"
      >
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-[rgb(15_118_110_/0.12)] text-[var(--color-accent)]">
          <Sparkles size={22} />
        </span>
        <h2 className="mt-5 font-display text-xl font-bold text-ink">
          I don't have a website yet
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">
          Tell us about your business and where you work. We'll build your
          first homepage and suggest great available domain names.
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] transition-all group-hover:gap-2.5">
          Build my first site <ArrowRight size={15} />
        </span>
      </button>
    </div>
  );
}

/* ── Step 2: intake form ──────────────────────────────────────────── */

const inputCls =
  "w-full rounded-xl border border-[var(--card-border)] bg-[var(--surface)] px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-2 focus:border-[var(--color-primary)]";

function Field({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-2">
        {label}
        {optional && <span className="ml-1.5 text-xs opacity-70">(optional)</span>}
      </span>
      {children}
    </label>
  );
}

function IntakeForm({
  flow,
  onBack,
  onSubmit,
}: {
  flow: DemoFlow;
  onBack: () => void;
  onSubmit: (intake: DemoIntake) => void;
}) {
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [radius, setRadius] = useState(15);
  const [phone, setPhone] = useState("");

  const valid =
    city.trim() && state.trim() && (flow === "has-site" ? domain.trim() : name.trim() && description.trim());

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      flow,
      domain: flow === "has-site" ? domain.trim() : undefined,
      businessName: name.trim() || undefined,
      description: description.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      radiusMiles: flow === "no-site" ? radius : undefined,
      phone: phone.trim() || undefined,
    });
  }

  return (
    <form onSubmit={submit} className="glass-card p-6 sm:p-8">
      <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
        ← Back
      </button>

      <div className="grid gap-4 sm:grid-cols-2">
        {flow === "has-site" ? (
          <div className="sm:col-span-2">
            <Field label="Your current website">
              <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="joeshvac.com" className={inputCls} />
            </Field>
          </div>
        ) : (
          <>
            <Field label="Business name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Joe's HVAC & Air" className={inputCls} />
            </Field>
            <Field label="Phone" optional>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-0100" className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="What do you do?">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Family-owned heating & cooling. Repairs, installs, 24/7 emergency service…"
                  className={inputCls}
                />
              </Field>
            </div>
          </>
        )}

        <Field label="City">
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Plano" className={inputCls} />
        </Field>
        <Field label="State">
          <input value={state} onChange={(e) => setState(e.target.value)} placeholder="TX" className={inputCls} />
        </Field>

        {flow === "has-site" && (
          <div className="sm:col-span-2">
            <Field label="Anything we should know about your business?" optional>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Specialties, service area, things you don't do…"
                className={inputCls}
              />
            </Field>
          </div>
        )}

        {flow === "no-site" && (
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <span id="radius-label" className="text-sm font-medium text-ink-2">How far do you serve customers?</span>
              <span className="font-code text-sm font-semibold text-ink">
                {radius <= 5 ? "My neighborhood" : `~${radius} miles`}
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={50}
              step={1}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              aria-label="Service radius in miles"
              aria-labelledby="radius-label"
              aria-valuemin={2}
              aria-valuemax={50}
              aria-valuenow={radius}
              aria-valuetext={radius <= 5 ? "My neighborhood" : `about ${radius} miles`}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-2)] accent-[var(--color-primary)]"
            />
          </div>
        )}
      </div>

      <button type="submit" disabled={!valid} className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50">
        <Search size={16} /> Draft my homepage from real data
      </button>
      <p className="mt-3 text-center text-xs text-ink-2">
        About 30 seconds. Real research — Google profile, reviews, photos
        {flow === "has-site" ? ", and your current site" : ", and available domains"}.
      </p>
    </form>
  );
}


/* ── Step 3: live build log ───────────────────────────────────────── */

type ErrorInfo = { message: string; code?: string; traceId?: string; detail?: string };

function BuildLog({ log, error, stall, onRetry, onCancel }: { log: LogLine[]; error: ErrorInfo | null; stall: { sinceMs: number; willFailInMs: number } | null; onRetry: () => void; onCancel?: () => void }) {
  const copyDiagnostics = () => {
    if (!error) return;
    const payload = {
      message: error.message,
      code: error.code,
      traceId: error.traceId,
      detail: error.detail,
      url: typeof window !== "undefined" ? window.location.href : "",
      ts: new Date().toISOString(),
    };
    try {
      void navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex items-center gap-2 font-code text-sm text-[var(--color-accent)]">
        {error ? (
          <X size={15} className="text-[#ef4444]" />
        ) : (
          <Loader2 size={15} className="animate-spin" />
        )}
        <span className="flex-1">{error ? "Something went wrong" : "Drafting your homepage…"}</span>
        {onCancel && !error && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--card-border)] px-3 py-1 text-xs font-semibold text-ink-2 transition-colors hover:text-ink"
          >
            Cancel
          </button>
        )}
      </div>
      <ul className="mt-5 space-y-3">
        {log.map((line, i) => (
          <li key={`${line.id}-${line.status}-${i}`} className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0">
              {line.status === "ok" && <Check size={16} className="text-[var(--color-accent)]" />}
              {line.status === "start" && <Loader2 size={16} className="animate-spin text-ink-2" />}
              {line.status === "skip" && <Check size={16} className="text-ink-2 opacity-50" />}
              {line.status === "fail" && <TriangleAlert size={16} className="text-[var(--color-warning)]" />}
              {line.status === "warn" && <TriangleAlert size={16} className="text-[var(--color-warning)] opacity-70" />}
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-2">
                {STEP_LABELS[line.id]}
              </div>
              <div className="text-sm text-ink">{line.detail}</div>
            </div>
          </li>
        ))}
      </ul>
      {error && (
        <div className="mt-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-4">
            <p className="font-code text-xs text-ink">{error.message}</p>
            {(error.code || error.traceId) && (
              <p className="mt-2 font-code text-[10px] uppercase tracking-wide text-ink-2">
                {error.code ?? "error"}
                {error.traceId ? ` · trace ${error.traceId}` : ""}
              </p>
            )}
            {error.detail && (
              <details className="mt-3">
                <summary className="cursor-pointer font-code text-[10px] uppercase tracking-wide text-ink-2">
                  Technical details
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all font-code text-[11px] text-ink-2">
{error.detail}
                </pre>
              </details>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={onRetry} className="btn-secondary">
              Try again
            </button>
            <button onClick={copyDiagnostics} className="btn-secondary">
              Copy diagnostics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 3.5: pre-reveal finalization (Stage A2 arena) ───────────── */
// Owner mandate: the customer sees ONE near-perfect draft and never knows
// versions existed. While this runs, the result area shows a calm status
// card under the build log. Off-screen (absolute, -9999px, real 560px
// layout), the tournament winner ("A") and up to 3 rival candidates are
// rendered ONE AT A TIME (mount → settle fonts/images ≤2.5s → capture →
// unmount) at the reduced arena budget, ranked in ONE multi-image judge
// call, and the returned winner + its enum-valid directives become the one
// revealed draft. Any failure or a hard 90s overrun reveals the tournament
// winner immediately — console-only, no arena traces in the UI.

const FINALIZE_CEILING_MS = 90_000;
const FINALIZE_STATUS = [
  "Comparing design directions…",
  "Selecting the strongest design…",
  "Applying final refinements…",
] as const;

/** Render-relevant axes only — what the arena endpoint expects per label. */
function compactSchema(schema: DesignSchema): Record<string, unknown> {
  return JSON.parse(JSON.stringify({
    visual: schema.visual,
    homepage: schema.homepage,
    content: schema.content,
  })) as Record<string, unknown>;
}

/** A candidate ships only visual+homepage+content — rebuild a renderable
 * full schema by grafting those axes onto a clone of the winner's. */
function mergeCandidateSchema(base: DesignSchema, compact: DesignCandidate["schema"]): DesignSchema {
  const out = structuredClone(base);
  out.visual = structuredClone(compact.visual);
  out.homepage = structuredClone(compact.homepage);
  out.content = structuredClone(compact.content);
  return out;
}

function PreRevealJudge({
  profile,
  leadId,
  arenaAvailable,
  candidates,
  onDone,
}: {
  profile: BusinessProfile;
  leadId: string;
  arenaAvailable?: boolean;
  candidates: DesignCandidate[];
  onDone: (finalProfile: BusinessProfile, outcome: JudgeOutcome) => void;
}) {
  const [statusIdx, setStatusIdx] = useState(0);
  // At most ONE hidden preview exists at any moment (memory sanity) —
  // renderAndCapture mounts it, captures, and unmounts in a finally. The
  // token identifies WHICH candidate's render is currently committed: React
  // flushes these state updates on a scheduled task, while the capture
  // chain (settle → cached import → html2canvas's synchronous DOM clone)
  // runs entirely on microtasks — without a commit check the PREVIOUS
  // candidate's DOM is still mounted and every capture after the first
  // would clone STALE pixels under the new label.
  const [hiddenShot, setHiddenShot] = useState<{ profile: BusinessProfile; token: number } | null>(null);
  const hiddenRef = useRef<HTMLDivElement | null>(null);
  const shotTokenRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    const baseSchema = profile.designSchema;

    const finish = (p: BusinessProfile, outcome: JudgeOutcome) => {
      if (doneRef.current || cancelled) return;
      doneRef.current = true;
      onDone(p, outcome);
    };

    // Hard ceiling: whatever is still in flight at 90s, the customer sees
    // the tournament winner — silently.
    const ceiling = setTimeout(() => {
      console.warn("[demo] finalize ceiling hit — revealing the tournament winner");
      ctrl.abort();
      finish(profile, "none");
    }, FINALIZE_CEILING_MS);

    const aborted = () => cancelled || ctrl.signal.aborted;

    // Waits for React to COMMIT the hidden render for THIS token before
    // capturing. The data attribute flips in the same commit as the new
    // children, so a match guarantees fresh content; the child count guards
    // against a boundary-caught render crash (attribute updates, no
    // children). Returns null on timeout — never an unverified (stale or
    // empty) node, which would poison the arena with a mislabeled or blank
    // screenshot.
    const waitForHiddenNode = async (token: number): Promise<HTMLElement | null> => {
      const until = Date.now() + 2_500;
      while (Date.now() < until && !aborted()) {
        const n = hiddenRef.current;
        if (n && n.dataset.shotToken === String(token) && n.childElementCount > 0) return n;
        await new Promise((r) => setTimeout(r, 60));
      }
      return null;
    };

    const settleAssets = async (node: HTMLElement) => {
      const waits: Promise<unknown>[] = Array.from(node.querySelectorAll("img"))
        .filter((img) => !img.complete)
        .map((img) => new Promise((res) => {
          img.addEventListener("load", res, { once: true });
          img.addEventListener("error", res, { once: true });
        }));
      const fontsReady = document.fonts?.ready;
      if (fontsReady) waits.push(fontsReady.catch(() => undefined));
      await Promise.race([Promise.all(waits), new Promise((r) => setTimeout(r, 2_500))]);
    };

    const renderAndCapture = async (schema: DesignSchema): Promise<string | null> => {
      if (aborted()) return null;
      const token = ++shotTokenRef.current;
      setHiddenShot({ profile: { ...profile, designSchema: schema }, token });
      try {
        const node = await waitForHiddenNode(token);
        if (!node || aborted()) return null;
        await settleAssets(node);
        if (aborted()) return null;
        return await captureNodeToArenaJpegDataUrl(node);
      } catch (e) {
        console.warn("[demo] hidden capture failed:", e instanceof Error ? e.message : e);
        return null;
      } finally {
        setHiddenShot(null);
      }
    };

    (async () => {
      if (!baseSchema) {
        finish(profile, "none");
        return;
      }
      const evidence = buildEvidenceSummary(profile);
      let winnerShot: string | null = null;

      // ── Arena: winner "A" + up to 3 rivals, ranked over pixels ──────
      // sanitizeArenaCandidates drops malformed frames (wrong/duplicate
      // labels, missing render axes) so a bad candidate can neither crash
      // the hidden render nor 400 the whole arena request server-side.
      const rivals = sanitizeArenaCandidates(candidates);
      if (arenaAvailable === true && rivals.length >= 1) {
        setStatusIdx(0);
        const entries: { label: string; full: DesignSchema; compact: Record<string, unknown> }[] = [
          { label: "A", full: baseSchema, compact: compactSchema(baseSchema) },
          ...rivals.map((c) => ({
            label: c.label as string,
            full: mergeCandidateSchema(baseSchema, c.schema),
            compact: JSON.parse(JSON.stringify(c.schema)) as Record<string, unknown>,
          })),
        ];
        const shots: { label: string; imageDataUrl: string; full: DesignSchema; compact: Record<string, unknown> }[] = [];
        for (const entry of entries) {
          if (aborted()) return;
          const img = await renderAndCapture(entry.full);
          if (img) {
            shots.push({ label: entry.label, imageDataUrl: img, full: entry.full, compact: entry.compact });
            if (entry.label === "A") winnerShot = img;
          }
        }
        if (aborted()) return;

        if (winnerShot && shots.length >= 2) {
          setStatusIdx(1);
          const res = await requestArenaJudge({
            leadId,
            images: shots.map((s) => ({ imageDataUrl: s.imageDataUrl, label: s.label })),
            schemas: shots.map((s) => s.compact),
            evidence,
            signal: ctrl.signal,
          });
          if (aborted()) return;
          if (res.ok) {
            setStatusIdx(2);
            const winner = shots.find((s) => s.label === res.review.winnerLabel) ?? shots[0];
            const { schema: refined, applied } = applyRenderDirectives(winner.full, res.review.directives);
            console.debug(
              "[demo] arena verdict:",
              res.review.winnerLabel,
              "confidence", res.review.confidence,
              `${applied.length} directives applied`,
            );
            const changed = winner.label !== "A" || applied.length > 0;
            finish(changed ? { ...profile, designSchema: refined } : profile, changed ? "refined" : "reviewed");
            return;
          }
          // Arena failed mid-flight → reveal the tournament winner, silent.
          console.warn("[demo] arena judge unavailable:", res.error ?? res.code);
          finish(profile, "none");
          return;
        }
        // Not enough clean captures for a real arena — fall through to the
        // one-shot judge, reusing the winner capture when we have it.
        console.warn(`[demo] arena skipped — insufficient captures (${shots.length})`);
      }

      // ── Fallback: today's one-shot single-image judge, now hidden
      // BEFORE the reveal (the reveal always happens exactly once). ──────
      setStatusIdx(2);
      const img = winnerShot ?? (await renderAndCapture(baseSchema));
      if (!img || aborted()) {
        finish(profile, "none");
        return;
      }
      const res = await requestDesignJudge({
        leadId,
        imageDataUrl: img,
        schema: baseSchema,
        evidence,
        signal: ctrl.signal,
      });
      if (aborted()) return;
      if (!res.ok) {
        console.warn("[demo] design judge unavailable:", res.error ?? res.code);
        finish(profile, "none");
        return;
      }
      const { schema: refined, applied } = applyRenderDirectives(baseSchema, res.review.directives);
      console.debug("[demo] design judge:", res.review.renderScore, res.review.verdict, `${applied.length} applied`);
      finish(applied.length > 0 ? { ...profile, designSchema: refined } : profile, applied.length > 0 ? "refined" : "reviewed");
    })().catch((e) => {
      console.warn("[demo] finalize pass skipped:", e instanceof Error ? e.message : e);
      finish(profile, "none");
    });

    return () => {
      cancelled = true;
      ctrl.abort();
      clearTimeout(ceiling);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="glass-card mt-5 p-6" style={{ animation: "rise-in 0.4s ease-out both" }}>
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[rgb(194_65_12_/0.12)] text-[var(--color-primary)]">
            <Sparkles size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Loader2 size={14} className="animate-spin text-[var(--color-primary)]" />
              {FINALIZE_STATUS[statusIdx]}
            </div>
            <p className="mt-1 text-xs text-ink-2">
              Our AI design director is giving your draft a final pass. Usually under a minute.
            </p>
          </div>
        </div>
      </div>

      {hiddenShot && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: -9999,
            top: 0,
            width: 560,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div ref={hiddenRef} data-shot-token={hiddenShot.token}>
            {/* Keyed by token so a crashed candidate's boundary resets for
                the next one; on error the boundary renders nothing, the
                token'd node stays childless, and that shot is skipped. */}
            <HiddenPreviewBoundary key={hiddenShot.token}>
              <PreviewForVertical profile={hiddenShot.profile} logoUrl={hiddenShot.profile.logoUrl ?? null} />
            </HiddenPreviewBoundary>
          </div>
        </div>
      )}
    </>
  );
}

/** A rival schema that trips a preview render bug must cost ONE skipped
 * screenshot — never the wizard. Renders nothing on error; the capture
 * loop times out on the childless node and moves on. */
class HiddenPreviewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[demo] hidden preview render failed:", err?.message ?? err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* ── Step 4: result ───────────────────────────────────────────────── */

function ResultView({
  profile,
  flow,
  leadId,
  judgeOutcome,
  beforeShot,
  domains,
  domainsNote,
  log,
  intake,
  onRestart,
}: {
  profile: BusinessProfile;
  flow: DemoFlow;
  leadId: string | null;
  judgeOutcome: JudgeOutcome;
  beforeShot: string | null;
  domains: DomainSuggestion[] | null;
  domainsNote: string | null;
  log: LogLine[];
  intake: DemoIntake;
  onRestart: () => void;
}) {
  const googleLine = log.find((l) => l.id === "google" && l.status === "ok")?.detail;
  const siteLine = log.find((l) => l.id === "site" && l.status === "ok")?.detail;
  const sourceCount = [googleLine, siteLine, profile.reviews.length > 0 ? "reviews" : null].filter(Boolean).length;
  const [draftExpanded, setDraftExpanded] = useState(false);

  // Stage A2 — all judging (arena or one-shot) happened BEFORE this reveal,
  // in PreRevealJudge. `profile` is already the final refined draft; the
  // customer sees exactly one version. Only a quiet chip remains when any
  // judging succeeded.
  const shown = profile;

  const judgeStatusLine = judgeOutcome !== "none" ? (
    <div className="mt-2 text-[11px] text-ink-2">
      <span className="inline-flex items-center gap-1.5">
        <Check size={11} className="text-[var(--color-accent)]" /> Reviewed by our AI design director
        {judgeOutcome === "refined" ? " — refinements applied" : ""}
      </span>
    </div>
  ) : null;

  return (
    <div className="space-y-8" style={{ animation: "rise-in 0.5s ease-out both" }}>
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              Draft · v1
            </span>
            {googleLine && (
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgb(15_118_110_/0.28)] bg-[rgb(15_118_110_/0.08)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
                <Check size={13} /> {googleLine}
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-ink-2">
            First draft, built from {sourceCount} real source{sourceCount === 1 ? "" : "s"} — not a template guess. We refine v2 with you.
          </p>
        </div>
        <button
          onClick={() => {
            // Regeneration costs a full 30–90s run — don't discard silently.
            if (window.confirm("This discards your current draft and starts a new one. Continue?")) onRestart();
          }}
          className="text-sm text-ink-2 underline underline-offset-4 hover:text-ink"
        >
          Start over
        </button>
      </div>

      {beforeShot ? (
        // Balanced side-by-side (vineyard critique): both panes share the
        // same height budget — the draft scrolls inside its frame instead
        // of towering over the before-shot.
        // Breakout: the route container is max-w-4xl (896px), which left each
        // compare column ~438px — below every content breakpoint the preview
        // components are designed for (and below the 560px frame the design
        // judge scores). Negative margins let ONLY this grid expand toward the
        // Section's 1280px inner width, giving each pane ≥560px on desktop.
        <div className="grid gap-5 lg:grid-cols-2 lg:-mx-[min(12rem,max(0px,(100vw_-_60rem)/2))]">
          <div>
            <div className="mb-2 font-code text-xs uppercase tracking-wide text-ink-2">Your site today</div>
            <div className="glass-card overflow-hidden opacity-80 grayscale-[0.35]">
              <img src={beforeShot} alt="Your current website" className="max-h-[560px] w-full object-cover object-top" />
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-baseline justify-between font-code text-xs uppercase tracking-wide text-[var(--color-accent)]">
              <span>Your draft homepage</span>
              <button
                type="button"
                onClick={() => setDraftExpanded((v) => !v)}
                className="cursor-pointer font-semibold normal-case tracking-normal text-ink-2 underline-offset-2 hover:text-ink hover:underline"
              >
                {draftExpanded ? "Collapse" : "View full draft"}
              </button>
            </div>
            <div className="relative">
              <div
                className={`scrollbar-hidden overscroll-contain rounded-2xl ${draftExpanded ? "" : "max-h-[560px] overflow-y-auto"}`}
              >
                <div>
                  <PreviewForVertical profile={shown} logoUrl={shown.logoUrl ?? null} />
                </div>
              </div>
              {!draftExpanded && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-2xl"
                  // --color-bg is defined nowhere in src (tokens are --surface
                  // etc.), so the old var always fell back to cream and smeared
                  // light paint over dark-mode content.
                  style={{ background: "linear-gradient(180deg, transparent, var(--surface))" }}
                />
              )}
            </div>
            {judgeStatusLine}
          </div>
        </div>
      ) : (
        <div>
          <div>
            <PreviewForVertical profile={shown} logoUrl={shown.logoUrl ?? null} />
          </div>
          {judgeStatusLine}
        </div>
      )}

      {shown.designSchema && <DesignRationalePanel schema={shown.designSchema} />}

      {flow === "no-site" && <DomainGrid domains={domains} note={domainsNote} />}

      <NextStepsCard leadId={leadId} profile={profile} intake={intake} />
    </div>
  );
}



function DomainGrid({ domains, note }: { domains: DomainSuggestion[] | null; note: string | null }) {
  return (
    <div className="glass-card p-6 sm:p-8">
      <h3 className="font-display text-lg font-semibold text-ink">
        Domains that fit this draft
      </h3>
      {domains === null ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-ink-2">
          <Loader2 size={15} className="animate-spin" /> Checking availability…
        </div>
      ) : domains.length === 0 ? (
        <p className="mt-3 text-sm text-ink-2">{note ?? "No suggestions right now."}</p>
      ) : (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {domains.map((d) => (
              <div
                key={d.domain}
                className="flex items-center justify-between gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] px-3.5 py-3"
              >
                <span className="truncate font-code text-sm font-semibold text-ink">{d.domain}</span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {d.price && <span className="text-xs text-ink-2">${d.price}</span>}
                  {d.available === true && <Check size={15} className="text-[var(--color-accent)]" />}
                </span>
              </div>
            ))}
          </div>
          {note && <p className="mt-3 text-xs text-ink-2">{note}</p>}
          <p className="mt-3 text-xs text-ink-2">
            We register your favorite when we expand this draft into a live site — it's yours, in your name.
          </p>
        </>
      )}
    </div>
  );
}

function NextStepsCard({ leadId, profile, intake }: { leadId: string | null; profile: BusinessProfile; intake: DemoIntake }) {
  const businessName = profile.businessName;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setState("sending");
    const contact = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    // Capture the lead in our own backend first, then claim it in the demo
    // pipeline. Success if either lands — the point is the lead reaches us.
    const results = await Promise.allSettled([
      createLead({
        source: "web-demo",
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        businessName,
        message: contact.notes,
        details: {
          leadId,
          city: intake.city,
          state: intake.state,
          ...(intake.domain ? { domain: intake.domain } : {}),
          ...(profile.vertical ? { vertical: profile.vertical } : {}),
        },
      }),
      claimLead(leadId, contact),
    ]);
    if (results.some((r) => r.status === "fulfilled")) {
      setState("done");
    } else {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="space-y-6">
        <div className="glass-card flex flex-col items-center gap-3 p-8 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[rgb(15_118_110_/0.15)] text-[var(--color-accent)]">
            <Check size={26} />
          </span>
          <h3 className="font-display text-xl font-bold text-ink">On it, {name.split(" ")[0]}.</h3>
          <p className="max-w-md text-sm text-ink-2">
            A designer + engineer will reach out within one business day to expand
            this draft of {businessName} into v2. Meanwhile — your full report is
            being built right here:
          </p>
        </div>
        <ReportPanel
          input={{
            leadId,
            contact: {
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim() || undefined,
              notes: notes.trim() || undefined,
            },
            businessName,
            domain: intake.domain,
            city: intake.city,
            state: intake.state,
            vertical: profile.vertical,
          }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-xl font-bold text-ink">
          Let our team build this for you —{" "}
          <span className="text-[var(--color-primary)]">for less than a cup of coffee a day.</span>
        </h3>
        <p className="text-sm text-ink-2">
          This v1 draft becomes your <strong className="text-ink">live site starting at
          $150/mo (≈ $4.90/day)</strong> — hosting, updates, and upkeep all handled.
          Leave your details and your <strong className="text-ink">free growth &amp; SEO
          report builds right here on this page</strong> — Google Maps audit vs. nearby
          competitors, a real Google Lighthouse run, on-page SEO checks — and a
          designer + engineer follows up within one business day.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Your name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" className={inputCls} required />
        </Field>
        <Field label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" className={inputCls} required />
        </Field>
        <Field label="Business">
          <input value={businessName} readOnly className={`${inputCls} opacity-70`} />
        </Field>
        <Field label="Phone" optional>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-0100" className={inputCls} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Anything specific we should tackle in v2?" optional>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. add online booking, rework the menu section, tighten the hero copy…"
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      <button type="submit" disabled={state === "sending"} className="btn-primary mt-5 w-full disabled:opacity-60">
        {state === "sending" ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        Build it for me — see my free report
      </button>

      <p className="mt-3 text-center text-xs text-ink-2">
        $150/mo Starter · no contract · you own your domain &amp; site
      </p>

      {state === "error" && (
        <p className="mt-3 text-sm text-[var(--color-warning)]">
          Couldn't save that — try again, or head to <Link to="/contact" className="underline">contact</Link>.
        </p>
      )}
    </form>
  );
}



