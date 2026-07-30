import { createFileRoute } from "@tanstack/react-router";

import { PortalHeader, KpiCard, StatusPill } from "@/components/portal/widgets";
import { Clock, PhoneIncoming, PhoneCall } from "lucide-react";
import { calls } from "@/lib/data/portal";
import { AudioCallDemo } from "@/components/AudioCallDemo";

const voiceKpis = [
  { label: "Calls handled", value: "248", delta: "+34% MoM" },
  { label: "Appointments booked", value: "187", delta: "75% of calls" },
  { label: "Avg. pickup time", value: "0.4s", delta: "First ring" },
  { label: "After-hours saves", value: "41", delta: "Would've been lost" },
];

function VoiceAgentPage() {
  return (
    <>
      <PortalHeader
        title="AI Voice Agent"
        subtitle="Every call, answered. Here's what Ava handled for you."
      />

      {/* Live status */}
      <div className="glass-card mb-6 flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[rgb(15_118_110_/0.15)] text-[var(--color-accent)]">
            <PhoneCall size={20} />
          </span>
          <div>
            <div className="text-sm font-semibold text-ink">
              Ava · Active & answering
            </div>
            <div className="text-xs text-ink-2">
              Trained on HVAC · books into Google Calendar
            </div>
          </div>
        </div>
        <div className="flex items-end gap-1" aria-hidden>
          {[0.5, 0.9, 0.6, 1, 0.7, 0.85].map((h, i) => (
            <span
              key={i}
              className="w-1.5 rounded-full bg-[var(--color-accent)]"
              style={{
                height: `${h * 26}px`,
                animation: "var(--animate-waveform)",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {voiceKpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Sample call — the canonical pre-recorded Ava demo */}
        <div>
          <div className="mb-3">
            <h3 className="font-display text-base font-semibold text-ink">
              Hear Ava in action
            </h3>
            <p className="text-xs text-ink-2">
              A real recorded call — Ava answers, triages, and books the job
            </p>
          </div>
          <AudioCallDemo />
        </div>

        {/* Call log */}
        <div className="glass-card self-start overflow-hidden">
          <div className="border-b border-[var(--card-border)] p-6">
            <h3 className="font-display text-base font-semibold text-ink">
              Recent call transcripts
            </h3>
            <p className="text-xs text-ink-2">
              Every call recorded and transcribed for quality
            </p>
          </div>
          <div className="divide-y divide-[var(--card-border)]">
            {calls.map((c) => (
              <div key={c.id} className="flex items-start gap-4 p-5">
                <span
                  className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[rgb(194_65_12_/0.14)] text-[var(--color-primary)] dark:text-[#fdba74]"
                  aria-hidden
                >
                  <PhoneIncoming size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {c.caller}
                    </span>
                    <span className="rounded-md bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-medium text-ink-2">
                      {c.tag}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-ink-2">
                      <Clock size={12} /> {c.duration}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-ink-2">{c.summary}</p>
                  <div className="mt-1 text-[11px] text-ink-2">{c.time}</div>
                </div>
                <StatusPill status={c.outcome} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}


export const Route = createFileRoute("/portal/voice-agent")({
  component: VoiceAgentPage,
});
