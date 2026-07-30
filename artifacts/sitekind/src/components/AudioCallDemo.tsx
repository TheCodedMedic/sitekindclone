import { useEffect, useRef } from "react";
import { Phone, PhoneCall, PhoneOff } from "lucide-react";
import { callScript } from "@/lib/data/callScript";
import { useCallPlayback } from "@/lib/useCallPlayback";

// Two-sided demo call with pre-generated Grok flagship voices (Ava = eve,
// caller = rex) and a spec-accurate US ringback. If a line's mp3 can't load,
// the player degrades to timed text so the demo never breaks. Sequencing
// lives in the shared useCallPlayback hook (also powers the homepage hero).
export function AudioCallDemo() {
  const { state, lineIndex, speaking, textOnly, seconds, start, stop } = useCallPlayback();
  const scrollRef = useRef<HTMLDivElement>(null);
  const visible = lineIndex + 1; // lines revealed

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [visible, state]);

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--surface)] px-6 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${
              state === "active"
                ? "bg-[rgb(15_118_110_/0.15)] text-[var(--color-accent)]"
                : state === "ringing"
                  ? "bg-[rgb(245_158_11_/0.15)] text-[var(--color-warning)]"
                  : "bg-[var(--surface-2)] text-ink-2"
            }`}
          >
            <PhoneCall size={20} />
          </span>
          <div>
            <div className="text-sm font-semibold text-ink">Ava · AI Receptionist</div>
            <div className="font-code text-xs text-ink-2">
              {state === "idle" && "Joe's HVAC & Air · Plano, TX"}
              {state === "ringing" && "Calling Joe's HVAC & Air…"}
              {state === "active" && `On call · ${mmss}${speaking ? ` · ${speaking === "ai" ? "Ava" : "Mike"} speaking` : ""}`}
              {state === "ended" && "Call ended · appointment booked, 2–4 PM"}
            </div>
          </div>
        </div>
        {(state === "active" || state === "ringing") && (
          <div className="flex items-end gap-1" aria-hidden>
            {[0.5, 0.9, 0.6, 1, 0.7].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full ${speaking === "caller" ? "bg-[var(--color-primary)]" : "bg-[var(--color-accent)]"}`}
                style={{
                  height: `${h * 22}px`,
                  animation: state === "active" && speaking ? "var(--animate-waveform)" : "none",
                  animationDelay: `${i * 0.1}s`,
                  opacity: state === "ringing" ? 0.35 : 1,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="h-80 space-y-3 overflow-y-auto bg-[var(--surface-2)] p-6">
        {state === "idle" && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Phone size={32} className="text-ink-2" />
            <p className="mt-4 max-w-xs text-sm text-ink-2">
              Press <span className="font-semibold text-ink">Call Now</span> and
              listen in: a real two-sided call — Mike's AC just died, and Ava
              books the rescue. Turn your sound on.
            </p>
          </div>
        )}
        {state === "ringing" && (
          <div className="flex h-full items-center justify-center">
            <span className="animate-[pulse-slow_1.2s_ease-in-out_infinite] font-code text-sm text-[var(--color-warning)]">
              ● ringing…
            </span>
          </div>
        )}
        {(state === "active" || state === "ended") &&
          callScript.slice(0, visible).map((line, i) => (
            <div
              key={i}
              className={`flex ${line.who === "ai" ? "justify-start" : "justify-end"}`}
              style={{ animation: "rise-in 0.4s ease-out both" }}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  line.who === "ai"
                    ? "rounded-tl-sm bg-[var(--color-accent)] text-white"
                    : "rounded-tr-sm border border-[var(--card-border)] bg-[var(--surface)] text-ink"
                } ${i === visible - 1 && speaking ? "ring-2 ring-[rgb(194_65_12_/0.25)]" : ""}`}
              >
                {line.text}
              </div>
            </div>
          ))}
      </div>

      {/* Controls */}
      <div className="border-t border-[var(--card-border)] bg-[var(--surface)] px-6 py-4">
        <div className="flex items-center gap-3">
          {state === "idle" || state === "ended" ? (
            <button onClick={start} className="btn-accent flex-1">
              <PhoneCall size={17} /> {state === "ended" ? "Replay Call" : "Call Now"}
            </button>
          ) : (
            <button
              onClick={stop}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#ef4444] px-6 py-4 font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              <PhoneOff size={17} /> End Call
            </button>
          )}
        </div>
        <p className="mt-2.5 text-center font-code text-[10px] text-ink-2">
          {textOnly
            ? "Text preview — voice audio is being minted with Grok flagship voices"
            : "Voices: Grok flagship (xAI) · scripted demo call, real product answers live"}
        </p>
      </div>
    </div>
  );
}
