import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Check, PhoneCall, Star } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { submitBookCall, BookCallError } from "@/lib/bookCall";
import { useMotion } from "@/lib/motion/MotionProvider";

// Lightweight client-side "looks valid" checks — DECORATIVE only (they
// drive the little check icons). Real validation stays server-side in the
// book-call edge function; nothing about submission logic changes.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ONE restrained success reward — ≤6 glyphs, inside the card bounds,
// reusing the hero's .reward-glyph one-shot animation. Motion-gated.
const SUCCESS_GLYPHS: Array<{
  left: string;
  top: string;
  delay: number;
  star?: boolean;
}> = [
  { left: "70%", top: "30%", delay: 0 },
  { left: "80%", top: "22%", delay: 90, star: true },
  { left: "88%", top: "36%", delay: 150 },
  { left: "75%", top: "46%", delay: 60, star: true },
  { left: "84%", top: "54%", delay: 170 },
  { left: "65%", top: "20%", delay: 120 },
];

function SuccessBurst() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {SUCCESS_GLYPHS.map((g, i) => (
        <span
          key={i}
          className="reward-glyph absolute"
          style={{
            left: g.left,
            top: g.top,
            animationDelay: `${g.delay}ms`,
            color: g.star ? "var(--color-warning)" : "var(--color-accent)",
          }}
        >
          {g.star ? (
            <Star size={12} fill="currentColor" strokeWidth={0} />
          ) : (
            <Check size={13} strokeWidth={3} />
          )}
        </span>
      ))}
    </div>
  );
}

function InputCheck({ on }: { on: boolean }) {
  return (
    <span
      className={`input-check ${on ? "input-check-on" : ""}`}
      aria-hidden="true"
    >
      <Check size={12} strokeWidth={3} />
    </span>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--card-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-2 focus:border-[var(--color-primary)]";

// Prominent "book a call" band: heading, one-line pitch, inline 3-field
// form. Submits to the book-call edge function (Turnstile-verified,
// rate-limited) via src/lib/bookCall.ts.
export function BookCallCta() {
  const { pathname } = useLocation();
  const { motionOn } = useMotion();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", company: "", website: "" });

  // Decorative valid-input indicators (Stage 3, item 8).
  const nameValid = form.name.trim().length > 0;
  const emailValid = EMAIL_RE.test(form.email.trim());
  const companyValid = form.company.trim().length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);
    try {
      await submitBookCall({ ...form, page: pathname });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof BookCallError
          ? err.message
          : "Couldn't submit your request. Please try again.",
      );
    }
  };

  return (
    <Section className="py-16">
      <Reveal>
        <div className="glass-card relative overflow-hidden px-8 py-12 sm:px-14">
          <div className="mesh !inset-[-50%] opacity-25" aria-hidden />
          {status === "sent" && motionOn && <SuccessBurst />}
          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <Eyebrow>Talk To Us</Eyebrow>
              <h2 className="mt-4 font-display text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-[2.25rem]">
                Prefer to talk it through?{" "}
                <span className="font-accent text-[var(--color-primary)]">book a call</span>
              </h2>
              <p className="mt-3 max-w-md text-ink-2">
                Fifteen minutes with our team — we'll show you your preview
                site and map out exactly what it would take to go live.
              </p>
            </div>

            {status === "sent" ? (
              <div className="success-pop flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[rgb(15_118_110_/0.15)] text-[var(--color-accent)]">
                  <Check size={26} />
                </span>
                <div>
                  <div className="font-display text-xl font-semibold text-ink">
                    Request received.
                  </div>
                  <p className="mt-1.5 text-sm text-ink-2">
                    We'll reach out within one business day to set up your call.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-3" noValidate>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="relative block sm:col-span-1">
                    <span className="sr-only">Your name</span>
                    <input
                      className={`${inputCls} pr-10`}
                      placeholder="Your name"
                      autoComplete="name"
                      maxLength={120}
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    <InputCheck on={nameValid} />
                  </label>
                  <label className="relative block sm:col-span-1">
                    <span className="sr-only">Work email</span>
                    <input
                      className={`${inputCls} pr-10`}
                      type="email"
                      placeholder="Work email"
                      autoComplete="email"
                      maxLength={200}
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                    <InputCheck on={emailValid} />
                  </label>
                  <label className="relative block sm:col-span-2">
                    <span className="sr-only">Business name</span>
                    <input
                      className={`${inputCls} pr-10`}
                      placeholder="Business name (optional)"
                      autoComplete="organization"
                      maxLength={160}
                      value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    />
                    <InputCheck on={companyValid} />
                  </label>
                </div>
                {/* Honeypot — hidden from real users, bots fill it. */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {status === "sending" ? (
                    <span className="btn-spinner" aria-hidden="true" />
                  ) : (
                    <PhoneCall size={16} />
                  )}
                  {status === "sending" ? "Sending…" : "Book a call"}
                </button>
                {status === "error" && error && (
                  <p role="alert" className="text-sm font-medium text-[#dc2626]">
                    {error}
                  </p>
                )}
                <p className="text-xs text-ink-2">
                  No sales pressure — just a walkthrough. We'll reach out within
                  one business day.
                </p>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
