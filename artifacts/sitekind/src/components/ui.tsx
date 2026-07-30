import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

// Decorative convergence layer for the final CTA band — lazy, opt-in per
// page (Stage 3 motion). If the chunk never loads, the band is unchanged.
const CtaConvergence = lazy(() =>
  import("@/components/home/motion/CtaConvergence").then((m) => ({
    default: m.CtaConvergence,
  })),
);

// Section wrapper — consistent max-width + vertical rhythm (spec §14.3).
export function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-[1280px] px-6 lg:px-10 ${className}`}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center = false,
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-4 font-display text-[2rem] font-bold leading-[1.15] tracking-tight text-ink sm:text-[2.5rem] lg:text-[3rem]">
        {title}
      </h2>
      {intro && (
        <p className="mt-4 text-lg leading-relaxed text-ink-2">{intro}</p>
      )}
    </div>
  );
}

export function CtaLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
}) {
  const cls =
    variant === "primary"
      ? "btn-primary"
      : variant === "accent"
        ? "btn-accent"
        : "btn-secondary";
  return (
    <Link to={href} className={`${cls} ${className}`}>
      {/* .btn-label mirrors the button's inline-flex layout exactly; it only
          moves when ButtonMagnetics writes --bx/--by (fine pointer, motion
          on) — ≤3px magnetic follow, static otherwise. */}
      <span className="btn-label">{children}</span>
    </Link>
  );
}

// Big closing CTA band reused across pages.
export function CtaBand({
  title,
  subtitle,
  primary = { href: "/pricing", label: "Get Started for $150/mo" },
  secondary = { href: "/demo", label: "See a Live Demo" },
  convergence = false,
}: {
  title: string;
  subtitle?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  /** Opt-in decorative route-node convergence layer (homepage). */
  convergence?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Section className="py-20">
      <div className="glass-card relative overflow-hidden px-8 py-16 text-center sm:px-16">
        <div className="mesh !inset-[-40%] opacity-40" aria-hidden />
        {convergence && mounted && (
          <Suspense fallback={null}>
            <CtaConvergence />
          </Suspense>
        )}
        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-[1.9rem] font-bold leading-tight tracking-tight text-ink sm:text-[2.5rem]">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-2">{subtitle}</p>
          )}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLink href={primary.href} variant="primary">
              {primary.label} <ArrowRight size={18} />
            </CtaLink>
            <CtaLink href={secondary.href} variant="secondary">
              {secondary.label}
            </CtaLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function Stat({
  value,
  label,
  accent = false,
}: {
  value: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        className={`font-display text-[2.25rem] font-extrabold leading-none tracking-tight sm:text-[2.75rem] ${
          accent ? "text-[var(--color-accent)]" : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 text-sm text-ink-2">{label}</div>
    </div>
  );
}

export function Badge({
  children,
  tone = "primary",
}: {
  children: React.ReactNode;
  tone?: "primary" | "accent" | "warning" | "muted";
}) {
  const tones: Record<string, string> = {
    primary:
      "bg-[rgb(194_65_12_/0.12)] text-[var(--color-primary)] dark:text-[#fdba74] border-[rgb(194_65_12_/0.25)]",
    accent:
      "bg-[rgb(15_118_110_/0.12)] text-[var(--color-accent)] dark:text-[#2dd4bf] border-[rgb(15_118_110_/0.28)]",
    warning:
      "bg-[rgb(245_158_11_/0.12)] text-[var(--color-warning)] border-[rgb(245_158_11_/0.28)]",
    muted:
      "bg-[var(--surface-2)] text-ink-2 border-[var(--card-border)]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
