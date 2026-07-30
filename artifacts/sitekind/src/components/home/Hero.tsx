import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Play, Sparkles, Square } from "lucide-react";
import { DEMO_HREF } from "@/lib/demoHref";
import { useCallPlayback } from "@/lib/useCallPlayback";
import { HeroConsole } from "@/components/home/motion/HeroConsole";

// Decorative hero ambience — lazy: if this chunk never loads, the hero is
// simply the current static hero (motion is always progressive enhancement).
const AmbientAutomationField = lazy(
  () => import("@/components/home/motion/AmbientAutomationField"),
);

export function Hero() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header ref={headerRef} className="relative overflow-hidden pt-[72px]">
      <div className="mesh" aria-hidden />
      <div className="dot-grid" aria-hidden />
      {mounted && (
        <Suspense fallback={null}>
          <AmbientAutomationField hostRef={headerRef} />
        </Suspense>
      )}

      <div className="relative mx-auto max-w-[1280px] px-6 pb-20 pt-20 text-center lg:px-10 lg:pb-28 lg:pt-28">
        <div
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--glass)] px-4 py-1.5 text-sm font-medium text-ink-2 backdrop-blur-md"
          style={{ animation: "rise-in 0.6s ease-out both" }}
        >
          <Sparkles size={15} className="text-[var(--color-accent)]" />
          Website, AI receptionist, and SEO — live in 24 hours
        </div>


        <h1
          className="mx-auto mt-7 max-w-4xl font-display text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-[3.5rem] lg:text-[4rem]"
          style={{ animation: "rise-in 0.7s ease-out 0.05s both" }}
        >
          The Fully Automated{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-[var(--color-primary)] via-[#fb923c] to-[var(--color-accent)] bg-clip-text text-transparent">
              Digital Agency
            </span>
          </span>{" "}

          for Service Businesses
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-2 sm:text-xl"
          style={{ animation: "rise-in 0.7s ease-out 0.12s both" }}
        >
          Get an enterprise-grade website, AI voice receptionist, and automated
          SEO — for less than the cost of a single billboard.
        </p>

        <div
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animation: "rise-in 0.7s ease-out 0.18s both" }}
        >
          <Link to="/pricing" className="btn-primary w-full sm:w-auto">
            View Pricing <ArrowRight size={18} />
          </Link>
          <Link to={DEMO_HREF} className="btn-secondary w-full sm:w-auto">
            <Play size={16} /> See a Live Demo
          </Link>
        </div>

        <p
          className="mt-5 font-code text-xs text-ink-2"
          style={{ animation: "rise-in 0.7s ease-out 0.24s both" }}
        >
          Live in 24 hours · No contract on Starter · You own your domain
        </p>

        {/* Floating dashboard mock */}
        <div
          className="relative mx-auto mt-16 max-w-4xl"
          style={{ animation: "rise-in 0.9s ease-out 0.3s both" }}
        >
          <HeroConsole>
            {({ sampleBoost }) => (
              <div className="glass-card overflow-hidden p-2 shadow-2xl">
                <div className="flex items-center gap-1.5 px-3 py-2.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                  <span className="ml-3 font-code text-[11px] text-ink-2">
                    preview.sitekind.ai/joes-hvac-plano
                  </span>
                </div>
                <div className="grid gap-2 rounded-xl bg-[var(--surface)] p-4 sm:grid-cols-3">
                  <MockStat label="Calls this month" value="248" trend="+34%" />
                  <MockStat label="Maps position" value="#3" trend="▲ from #24" />
                  <MockStat
                    label="Booked jobs"
                    value={sampleBoost ? "188" : "187"}
                    trend="+41 after-hrs"
                    sampleActive={sampleBoost}
                  />
                  <HeroCallCard />
                </div>
              </div>
            )}
          </HeroConsole>
        </div>
      </div>
    </header>
  );
}

// Compact inline player for the canonical Ava demo call — same recording and
// sequencing engine (useCallPlayback) as the full AudioCallDemo on
// /features/voice-agent: US ringback, then 15 pre-minted Grok voice lines.
function HeroCallCard({
  onPlaybackActiveChange,
}: {
  /** Reports ringing/active playback upward so ambient motion can yield. */
  onPlaybackActiveChange?: (active: boolean) => void;
}) {
  const { state, currentLine, speaking, start, stop } = useCallPlayback();
  const playing = state === "ringing" || state === "active";

  const notifyRef = useRef(onPlaybackActiveChange);
  notifyRef.current = onPlaybackActiveChange;
  useEffect(() => {
    notifyRef.current?.(playing);
  }, [playing]);

  return (
    <div className="glass-card col-span-full p-4 text-left">
      <div className="flex w-full items-center justify-between gap-3">
        {playing ? (
          <>
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[rgb(15_118_110_/0.15)] text-[var(--color-accent)]">
                <Play size={16} />
              </span>
              <div className="min-w-0 text-left">
                <div className="text-sm font-semibold text-ink">
                  {state === "ringing" ? "Calling Joe's HVAC & Air…" : "Live call · Ava is on the line"}
                </div>
                <div className="text-xs text-ink-2">Real recording · Grok flagship voices</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-end gap-1" aria-hidden>
                {[0.4, 0.8, 0.5, 1, 0.6, 0.9, 0.45].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1.5 rounded-full ${speaking === "caller" ? "bg-[var(--color-primary)]" : "bg-[var(--color-accent)]"}`}
                    style={{
                      height: `${h * 28}px`,
                      animation: speaking ? "var(--animate-waveform)" : "none",
                      animationDelay: `${i * 0.09}s`,
                      opacity: state === "ringing" ? 0.35 : 1,
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={stop}
                aria-label="Stop the sample call"
                className="grid h-9 w-9 place-items-center rounded-full bg-[#ef4444] text-white transition-transform hover:scale-105"
              >
                <Square size={13} fill="currentColor" />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={start}
            aria-label="Play a recorded sample call: Ava the AI receptionist books a job for Joe's HVAC"
            className="flex w-full items-center justify-between gap-3 text-left transition-transform hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--color-primary)] text-white shadow-lg">
                <span
                  className="absolute inset-0 rounded-full bg-[var(--color-primary)] opacity-40 motion-safe:animate-ping"
                  aria-hidden
                />
                <Play size={17} className="relative ml-0.5" fill="currentColor" />
              </span>
              <div className="text-left">
                <div className="text-sm font-semibold text-ink">
                  {state === "ended" ? "Replay the call" : "Hear Ava book a real job"}
                </div>
                <div className="text-xs text-ink-2">45-second live call · turn sound on</div>
              </div>
            </div>
            <div className="flex items-end gap-1" aria-hidden>
              {[0.4, 0.8, 0.5, 1, 0.6, 0.9, 0.45].map((h, i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-full bg-[var(--color-accent)] opacity-50"
                  style={{ height: `${h * 28}px` }}
                />
              ))}
            </div>
          </button>
        )}
      </div>
      {playing && currentLine && (
        <p
          key={`${speaking ?? "x"}-${currentLine.text.slice(0, 12)}`}
          className="mt-3 truncate border-t border-[var(--card-border)] pt-2.5 text-xs italic text-ink-2"
          style={{ animation: "rise-in 0.3s ease-out both" }}
        >
          <span className={`not-italic font-semibold ${currentLine.who === "ai" ? "text-[var(--color-accent)]" : "text-[var(--color-primary)]"}`}>
            {currentLine.who === "ai" ? "Ava" : "Mike"}:
          </span>{" "}
          {currentLine.text}
        </p>
      )}
      {state === "ended" && (
        <p className="mt-3 border-t border-[var(--card-border)] pt-2.5 text-xs text-ink-2">
          Appointment booked, today 2–4 PM ·{" "}
          <Link to="/features/$slug" params={{ slug: "voice-agent" }} className="font-semibold text-[var(--color-accent)] hover:underline">
            See the full transcript →
          </Link>
        </p>
      )}
    </div>
  );
}

function MockStat({
  label,
  value,
  trend,
  sampleActive,
}: {
  label: string;
  value: string;
  trend: string;
  /** Shows the "+1 Sample" chip while the sample-lead demo boosts this stat. */
  sampleActive?: boolean;
}) {
  return (
    <div className="relative glass-card p-4 text-left">
      <div className="text-xs text-ink-2">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold text-ink">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-[var(--color-accent)]">
        {trend}
      </div>
      {sampleActive !== undefined && (
        <span
          className={`sample-chip font-code ${sampleActive ? "sample-chip-on" : ""}`}
          aria-hidden={!sampleActive}
        >
          +1 SAMPLE
        </span>
      )}
    </div>
  );
}
