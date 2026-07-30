import { useEffect, useState } from "react";
import { MapPin, Phone, Star, Clock, Menu } from "lucide-react";
import { useMotion } from "@/lib/motion/MotionProvider";
import { useSectionVisibility } from "@/lib/motion/useSectionVisibility";

export type PreviewData = {
  name: string;
  city: string;
  rating: number;
  reviews: number;
  phone: string;
  tagline: string;
  services: string[];
  industry: string;
};

/** Inline style helper for the shared fv-* animation stagger. */
function fvDelay(ms: number) {
  return { "--fv-delay": `${ms}ms` } as React.CSSProperties;
}

// A polished mock of an AI-generated client website, populated from
// "agb_primary" data (spec §16.4 / §16.6).
//
// `demo` (Stage 4, item 5 — industry detail pages) turns it into the page's
// ONE Level-B demonstration: the mini site assembles once on first viewport
// entry (nav → hero → service chips → info cells), reusing the fv-* CSS
// grammar from the feature pages. SSR / reduced motion / motion off render
// the finished site; `demo=false` (default) is exactly the old static mock.
export function PreviewMock({
  data,
  demo = false,
}: {
  data: PreviewData;
  demo?: boolean;
}) {
  const { motionOn } = useMotion();
  const { ref, isVisible } = useSectionVisibility<HTMLDivElement>({
    threshold: 0.25,
    once: true,
  });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const live = demo && mounted && motionOn && isVisible;

  return (
    <div
      ref={ref}
      className={`glass-card overflow-hidden shadow-2xl ${live ? "fv-live" : ""}`}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-[var(--card-border)] bg-[var(--surface)] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate font-code text-[11px] text-ink-2">
          {slugify(data.name)}.com
        </span>
        {demo && (
          <span className="sample-tag font-code ml-auto shrink-0" aria-hidden="true">
            SAMPLE
          </span>
        )}
      </div>

      {/* Faux site */}
      <div className="bg-[var(--surface)]">
        {/* Site nav */}
        <div
          className="fv-item flex items-center justify-between border-b border-[var(--card-border)] px-5 py-3"
          style={fvDelay(0)}
        >
          <span className="font-display text-sm font-bold text-ink">
            {data.name}
          </span>
          <div className="hidden items-center gap-4 text-[11px] text-ink-2 sm:flex">
            <span>Services</span>
            <span>Reviews</span>
            <span>Contact</span>
            <span className="rounded-md bg-[var(--color-primary)] px-2.5 py-1 font-semibold text-white">
              Book Now
            </span>
          </div>
          <Menu size={16} className="text-ink-2 sm:hidden" />
        </div>

        {/* Hero */}
        <div
          className="fv-item relative overflow-hidden px-6 py-10"
          style={fvDelay(140)}
        >
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            }}
            aria-hidden
          />
          <div className="relative text-white">
            <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-medium backdrop-blur">
              <Star size={10} className="fill-white" /> {data.rating} ·{" "}
              {data.reviews} reviews
            </div>
            <h3 className="mt-3 font-display text-xl font-extrabold leading-tight sm:text-2xl">
              {data.tagline}
            </h3>
            <p className="mt-1.5 text-xs text-white/80">
              {data.industry} · {data.city}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[var(--color-primary)]">
                <Phone size={12} /> {data.phone}
              </span>
              <span className="inline-flex items-center rounded-lg bg-black/25 px-3 py-2 text-xs font-semibold backdrop-blur">
                Get a Free Quote
              </span>
            </div>
          </div>
        </div>

        {/* Services grid */}
        <div className="px-6 py-6">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-2">
            Our Services
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {data.services.map((s, i) => (
              <div
                key={s}
                className="fv-item rounded-lg border border-[var(--card-border)] bg-[var(--surface-2)] px-3 py-2.5 text-xs font-medium text-ink"
                style={fvDelay(320 + i * 70)}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Info bar */}
        <div
          className="fv-item grid grid-cols-3 gap-px border-t border-[var(--card-border)] bg-[var(--card-border)] text-center"
          style={fvDelay(760)}
        >
          <InfoCell icon={<MapPin size={13} />} label="Serving" value={data.city} />
          <InfoCell icon={<Clock size={13} />} label="Hours" value="Open · 24/7 AI" />
          <InfoCell
            icon={<Star size={13} />}
            label="Rating"
            value={`${data.rating} ★`}
          />
        </div>
      </div>
    </div>
  );
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[var(--surface)] px-2 py-3">
      <div className="flex items-center justify-center gap-1 text-[var(--color-accent)]">
        {icon}
      </div>
      <div className="mt-1 text-[9px] uppercase tracking-wide text-ink-2">
        {label}
      </div>
      <div className="text-[11px] font-semibold text-ink">{value}</div>
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
