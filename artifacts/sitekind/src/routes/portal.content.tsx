import { createFileRoute } from "@tanstack/react-router";

import { PortalHeader, StatusPill } from "@/components/portal/widgets";
import { Check, Sparkles } from "lucide-react";
import { contentCalendar } from "@/lib/data/portal";

function ContentPage() {
  return (
    <>
      <PortalHeader
        title="Content Calendar"
        subtitle="AI-written, quality-judged posts publishing to your blog every week."
      />

      {/* Engine status */}
      <div className="glass-card mb-6 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[rgb(194_65_12_/0.14)] text-[var(--color-primary)] dark:text-[#fdba74]">
            <Sparkles size={20} />
          </span>
          <div>
            <div className="text-sm font-semibold text-ink">
              Content engine · Running
            </div>
            <div className="text-xs text-ink-2">
              Next post publishes Jul 14 · 3-judge panel enabled
            </div>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[rgb(15_118_110_/0.12)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] dark:text-[#2dd4bf]">
          <Check size={14} /> 12 posts published this quarter
        </div>
      </div>

      {/* Calendar list */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-[var(--card-border)] p-6">
          <h3 className="font-display text-base font-semibold text-ink">
            Upcoming & recent posts
          </h3>
        </div>
        <div className="divide-y divide-[var(--card-border)]">
          {contentCalendar.map((c) => (
            <div
              key={c.title}
              className="flex items-center justify-between gap-4 p-5"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--card-border)] bg-[var(--surface)] text-center">
                  <span className="font-code text-[11px] font-semibold text-ink">
                    {c.date}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-ink">{c.title}</div>
                  <div className="mt-0.5 text-xs text-ink-2">
                    SEO blog post · ~1,100 words
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={c.status} />
                {(c.status === "In review" || c.status === "Draft") && (
                  <button className="hidden rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-[var(--surface-2)] sm:block">
                    {c.status === "In review" ? "Approve" : "Preview"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}


export const Route = createFileRoute("/portal/content")({
  component: ContentPage,
});
