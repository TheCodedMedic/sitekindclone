/**
 * IndustryStage — the ONE shared illustrative stage under the homepage
 * industry grid (Stage 3, item 5). Shows a tiny label+glyph vignette for
 * whichever industry card is hovered/focused (fine pointers) or selected
 * via the chip row (coarse pointers / keyboard). Every vignette is marked
 * SAMPLE — nothing here pretends to be live customer activity.
 *
 * Motion: vignette swaps are a small rise-in (motion-base); under
 * html.motion-off they become a simple opacity dissolve (spec: reduced →
 * simple dissolve). Per-vignette accents are one-shot CSS animations that
 * only run while the stage is onscreen AND motion is on (`.ind-stage-live`);
 * otherwise they rest at their static end states. The only continuous
 * element is the HVAC night-call pulse ring — one mover, paused offscreen.
 */
import {
  CalendarCheck2,
  Check,
  Home,
  MoonStar,
  Route,
  Scissors,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useMotion } from "@/lib/motion/MotionProvider";
import { useSectionVisibility } from "@/lib/motion/useSectionVisibility";

type Accent = "pulse" | "check" | "slots" | "route" | "ticket" | "blocks";

type Vignette = {
  icon: LucideIcon;
  title: string;
  sub: string;
  accent: Accent;
};

const VIGNETTES: Record<string, Vignette> = {
  hvac: {
    icon: MoonStar,
    title: "2:14 AM — no-heat call",
    sub: "Ava answers and books the 8:00 AM slot",
    accent: "pulse",
  },
  restaurants: {
    icon: CalendarCheck2,
    title: "Friday, 7:42 PM",
    sub: "Table for four booked while the floor is full",
    accent: "check",
  },
  "beauty-salons": {
    icon: Scissors,
    title: "Tomorrow's chairs",
    sub: "Two of three open slots filled overnight",
    accent: "slots",
  },
  landscaping: {
    icon: Route,
    title: "Thursday estimate route",
    sub: "Two new stops added between existing jobs",
    accent: "route",
  },
  "auto-repair": {
    icon: Wrench,
    title: "Service ticket, drafted",
    sub: "Brake inspection booked for 10:00 AM",
    accent: "ticket",
  },
  remodeling: {
    icon: Home,
    title: "Project preview",
    sub: "Kitchen remodel gallery page drafted and published",
    accent: "blocks",
  },
};

const FALLBACK: Vignette = {
  icon: Sparkles,
  title: "Automation at work",
  sub: "Calls answered, jobs booked, pages published",
  accent: "check",
};

export type IndustryStageItem = { slug: string; name: string };

export function IndustryStage({
  active,
  items,
  onSelect,
}: {
  active: string;
  items: IndustryStageItem[];
  onSelect: (slug: string) => void;
}) {
  const { motionOn } = useMotion();
  const { ref, isVisible } = useSectionVisibility<HTMLDivElement>({
    threshold: 0.25,
  });
  const live = motionOn && isVisible;
  const v = VIGNETTES[active] ?? FALLBACK;
  const Icon = v.icon;

  return (
    <div
      ref={ref}
      className={`glass-card absolute inset-0 flex flex-col justify-between overflow-hidden p-4 ${
        live ? "ind-stage-live" : ""
      }`}
    >
      <span
        className="sample-tag font-code absolute right-3 top-3 z-[2]"
        aria-hidden="true"
      >
        SAMPLE
      </span>

      {/* Decorative vignette — swaps (keyed) when the selection changes. */}
      <div
        key={active}
        className="ind-vignette flex min-h-0 flex-1 items-center gap-3 pr-16"
        aria-hidden="true"
      >
        <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[rgb(15_118_110_/0.12)] text-[var(--color-accent)]">
          <Icon size={18} />
          {v.accent === "pulse" && <span className="ind-pulse-ring" />}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink">
            {v.title}
          </div>
          <div className="truncate text-xs text-ink-2">{v.sub}</div>
        </div>
        <div className="ml-auto hidden shrink-0 sm:block">
          <AccentVisual accent={v.accent} />
        </div>
      </div>

      {/* Tap-to-select chips — the coarse-pointer / keyboard affordance. */}
      <div
        className="mt-3 flex gap-2.5 overflow-x-auto pb-0.5"
        role="group"
        aria-label="Choose an industry example"
      >
        {items.map((it) => (
          <button
            key={it.slug}
            type="button"
            className="ind-chip"
            aria-pressed={it.slug === active}
            aria-label={`Show a ${it.name} example`}
            onClick={() => onSelect(it.slug)}
          >
            {it.name.split(" ")[0].replace(",", "")}
          </button>
        ))}
      </div>
    </div>
  );
}

export default IndustryStage;

function AccentVisual({ accent }: { accent: Accent }) {
  switch (accent) {
    case "check":
      return (
        <span className="ind-pop grid h-7 w-7 place-items-center rounded-full bg-[rgb(15_118_110_/0.15)] text-[var(--color-accent)]">
          <Check size={14} strokeWidth={3} />
        </span>
      );
    case "slots":
      return (
        <span className="flex items-center gap-1">
          <span className="ind-slot ind-slot-fill" />
          <span
            className="ind-slot ind-slot-fill"
            style={{ animationDelay: "220ms" }}
          />
          <span className="ind-slot" />
        </span>
      );
    case "route":
      return (
        <svg width="72" height="26" viewBox="0 0 72 26" fill="none">
          <path
            className="ind-route-path"
            d="M3 20 C 18 6, 32 22, 46 10 S 66 4, 69 6"
            pathLength={1}
            stroke="var(--color-accent)"
            strokeOpacity="0.7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="1"
          />
          <circle cx="3" cy="20" r="2.5" fill="var(--color-primary)" />
          <circle cx="69" cy="6" r="2.5" fill="var(--color-accent)" />
        </svg>
      );
    case "ticket":
      return (
        <span className="ind-slide inline-flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--surface)] px-2.5 py-1.5">
          <Wrench size={11} className="text-[var(--color-primary)]" />
          <span className="font-code text-[9px] text-ink-2">10:00 AM</span>
        </span>
      );
    case "blocks":
      return (
        <span className="flex items-end gap-1">
          <span className="ind-block h-3 w-4 rounded-sm bg-[rgb(194_65_12_/0.3)]" />
          <span
            className="ind-block h-5 w-4 rounded-sm bg-[rgb(15_118_110_/0.3)]"
            style={{ animationDelay: "120ms" }}
          />
          <span
            className="ind-block h-4 w-4 rounded-sm bg-[rgb(245_158_11_/0.35)]"
            style={{ animationDelay: "240ms" }}
          />
        </span>
      );
    default:
      return null; // "pulse" renders on the vignette icon itself
  }
}
