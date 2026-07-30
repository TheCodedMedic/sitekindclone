import { createFileRoute, Link } from "@tanstack/react-router";

import { useEffect, useState } from "react";
import { notFound } from "@tanstack/react-router";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { Section, CtaLink, Eyebrow, Stat } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { FeatureIcon } from "@/components/FeatureIcon";
import { BreadcrumbSchema } from "@/components/Schema";
import { VoiceDemo } from "@/components/VoiceDemo";
import { features, getFeature } from "@/lib/data/features";
import { DEMO_HREF } from "@/lib/demoHref";
import { pageHead, emptyHead } from "@/lib/seo";
import { useMotion } from "@/lib/motion/MotionProvider";
import { useSectionVisibility } from "@/lib/motion/useSectionVisibility";
import { track } from "@/lib/motionAnalytics";

function FeaturePage() {
  const { slug } = Route.useParams();
  const f = getFeature(slug);
  if (!f) throw notFound();

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Features", url: "/features" },
          { name: f.title, url: `/features/${f.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden pt-[72px]">
        <div className="mesh" aria-hidden />
        <div className="dot-grid" aria-hidden />
        <Section className="relative py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Link
                to="/features"
                className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-2 transition-colors hover:text-ink"
              >
                ← All features
              </Link>
              <div>
                <Eyebrow>{f.navLabel}</Eyebrow>
              </div>
              <h1 className="mt-4 font-display text-[2.25rem] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-[3rem]">
                {f.hero}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-ink-2">
                {f.summary}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CtaLink href={f.cta.href} variant="primary">
                  {f.cta.label} <ArrowRight size={17} />
                </CtaLink>
                <CtaLink href={DEMO_HREF} variant="secondary">
                  See a Live Demo
                </CtaLink>
              </div>
            </div>

            <Reveal delay={120}>
              {f.slug === "voice-agent" ? (
                <VoiceDemo />
              ) : (
                <FeatureVisual slug={f.slug} icon={f.icon} />
              )}
            </Reveal>
          </div>
        </Section>
      </section>

      {/* Pain stats */}
      <Section className="py-12">
        <div className="glass-card grid gap-8 px-8 py-10 sm:grid-cols-3">
          {f.pains.map((p, i) => (
            <Reveal key={p.label} delay={i * 90}>
              <Stat value={p.stat} label={p.label} accent={i === 0} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Sections */}
      <Section className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-10">
            {f.sections.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="relative border-l-2 border-[var(--card-border)] pl-6">
                  <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-[var(--color-primary)]" />
                  <h2 className="font-display text-xl font-semibold text-ink">
                    {s.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-ink-2">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="glass-card sticky top-24 p-8">
              <FeatureIcon name={f.icon} className="h-12 w-12" size={24} />
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                What's included
              </h3>
              <ul className="mt-5 space-y-3">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-ink-2">
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                    />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-4 text-sm leading-relaxed text-ink-2">
                {f.priceContext}
              </div>
              <CtaLink href={f.cta.href} variant="primary" className="mt-6 w-full">
                {f.cta.label}
              </CtaLink>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Cross-links */}
      <Section className="py-16">
        <h3 className="font-display text-lg font-semibold text-ink">
          Explore other features
        </h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {features
            .filter((o) => o.slug !== f.slug)
            .map((o) => (
              <Link
                key={o.slug}
                to="/features/$slug"
                params={{ slug: o.slug }}
                className="glass-card group flex items-center gap-4 p-5 transition-transform hover:-translate-y-1"
              >
                <FeatureIcon name={o.icon} className="h-11 w-11" size={20} />
                <div>
                  <div className="text-sm font-semibold text-ink">{o.title}</div>
                  <div className="mt-0.5 text-xs text-ink-2">{o.tagline}</div>
                </div>
              </Link>
            ))}
        </div>
      </Section>
    </>
  );
}

/** Inline style helper for the fv-* animation stagger. */
function fvDelay(ms: number) {
  return { "--fv-delay": `${ms}ms` } as React.CSSProperties;
}

/**
 * Per-slug hero demonstration (Stage 4, item 4 — ONE per page). The
 * previously static visuals now assemble once on first viewport entry
 * (motion on only) and can be replayed via the floating SAMPLE button.
 * SSR / reduced motion / motion off render the finished state — the markup
 * below is byte-identical to the old static visuals plus fv-* class hooks.
 */
function FeatureVisual({ slug, icon }: { slug: string; icon: string }) {
  const { motionOn } = useMotion();
  const { ref, isVisible } = useSectionVisibility<HTMLDivElement>({
    threshold: 0.25,
    once: true,
  });
  const [mounted, setMounted] = useState(false);
  const [runId, setRunId] = useState(0);
  useEffect(() => setMounted(true), []);

  const hasDemo =
    slug === "ai-websites" || slug === "automated-seo" || slug === "google-maps";
  if (!hasDemo) {
    return <FeatureIcon name={icon} className="mx-auto h-40 w-40" size={64} />;
  }

  const live = mounted && motionOn && isVisible;

  return (
    <div ref={ref} className={`relative ${live ? "fv-live" : ""}`}>
      {/* Re-keying restarts the one-shot entry sequence (Replay). */}
      <div key={runId}>
        {slug === "ai-websites" ? (
          <WebsiteAssemblyVisual />
        ) : slug === "automated-seo" ? (
          <SeoQueueVisual />
        ) : (
          <MapsRankVisual />
        )}
      </div>
      {mounted && motionOn && (
        <button
          type="button"
          className="sample-lead-btn"
          aria-label="Replay the demonstration"
          onClick={() => {
            setRunId((n) => n + 1);
            track("feature_demo_replayed", { demo: slug });
          }}
        >
          <span className="sample-tag font-code" aria-hidden="true">
            SAMPLE
          </span>
          <RotateCcw size={13} aria-hidden="true" />
          Replay demo
        </button>
      )}
    </div>
  );
}

/* ai-websites: data → page assembly (hero, copy lines, gallery, buttons). */
function WebsiteAssemblyVisual() {
  return (
    <div className="glass-card overflow-hidden p-2">
      <div className="flex items-center gap-1.5 px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="space-y-3 rounded-xl bg-[var(--surface)] p-5">
        <div
          className="fv-item h-24 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] opacity-90"
          style={fvDelay(0)}
        />
        <div
          className="fv-item h-3 w-3/4 rounded bg-[var(--surface-2)]"
          style={fvDelay(120)}
        />
        <div
          className="fv-item h-3 w-1/2 rounded bg-[var(--surface-2)]"
          style={fvDelay(200)}
        />
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="fv-item h-16 rounded-lg bg-[var(--surface-2)]"
              style={fvDelay(300 + i * 90)}
            />
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <div
            className="fv-item h-8 w-28 rounded-lg bg-[var(--color-primary)]"
            style={fvDelay(600)}
          />
          <div
            className="fv-item h-8 w-24 rounded-lg border border-[var(--card-border)]"
            style={fvDelay(660)}
          />
        </div>
      </div>
    </div>
  );
}

/* automated-seo: queue posts land one by one, judge pill confirms last. */
function SeoQueueVisual() {
  const posts = [
    "5 Signs Your AC Needs Repair This Summer",
    "How Much Does a Furnace Tune-Up Cost in Denver?",
    "Emergency Plumber in Frisco: What to Do First",
    "Fall HVAC Maintenance Checklist for Homeowners",
  ];
  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-code text-xs text-ink-2">content-engine › queue</span>
        <span
          className="fv-pop rounded-full bg-[rgb(15_118_110_/0.15)] px-2.5 py-1 text-xs font-semibold text-[var(--color-accent)]"
          style={fvDelay(680)}
        >
          3-judge: passed
        </span>
      </div>
      <div className="space-y-3">
        {posts.map((p, i) => (
          <div
            key={p}
            className="fv-item flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-3"
            style={fvDelay(i * 140)}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[rgb(194_65_12_/0.15)] font-code text-xs text-[var(--color-primary)] dark:text-[#fdba74]">
              W{i + 1}
            </span>
            <span className="flex-1 text-sm text-ink">{p}</span>
            <Check size={16} className="text-[var(--color-accent)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* google-maps: the rank bars grow week over week, #3 confirms at the end. */
function MapsRankVisual() {
  const ranks = [
    { wk: "Wk 1", pos: 24 },
    { wk: "Wk 6", pos: 11 },
    { wk: "Wk 10", pos: 5 },
    { wk: "Wk 14", pos: 3 },
  ];
  return (
    <div className="glass-card p-8">
      <div className="mb-6 flex items-baseline justify-between">
        <span className="font-code text-xs text-ink-2">maps-rank › "plumber plano"</span>
        <span
          className="fv-pop font-display text-2xl font-extrabold text-[var(--color-accent)]"
          style={fvDelay(700)}
        >
          #3
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        {ranks.map((r, i) => (
          <div key={r.wk} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end">
              <div
                className="fv-bar w-full rounded-t-lg bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-accent)]"
                style={{
                  height: `${((25 - r.pos) / 25) * 100}%`,
                  ...fvDelay(i * 150),
                }}
              />
            </div>
            <span className="font-code text-xs text-ink">#{r.pos}</span>
            <span className="text-[10px] text-ink-2">{r.wk}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-ink-2">
        Position climb over a 20-week campaign (composite)
      </p>
    </div>
  );
}


export const Route = createFileRoute("/features/$slug")({
  head: ({ params }) => {
    const f = getFeature(params.slug);
    return f ? pageHead(f.title, f.summary) : emptyHead();
  },
  component: FeaturePage,
});
