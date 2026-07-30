import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { createLead } from "@workspace/api-client-react";

const industries = [
  "HVAC & Plumbing",
  "Restaurant",
  "Beauty & Salon",
  "Landscaping",
  "Auto Repair",
  "Remodeling",
  "Fitness",
  "Other",
];

const plans = ["Starter ($150/mo)", "Core Agency ($5k)", "Core + AI Voice", "Mega Package ($15k)", "Not sure yet"];

export function ContactForm() {
  const [name, setName] = useState("");
  const [biz, setBiz] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [plan, setPlan] = useState("");
  const [message, setMessage] = useState("");
  // Honeypot — hidden from humans; bots that fill it get silently dropped server-side.
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      await createLead({
        source: "web-contact",
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        businessName: biz.trim() || undefined,
        message: message.trim() || undefined,
        website: website || undefined,
        details: {
          ...(industry ? { industry } : {}),
          ...(plan ? { plan } : {}),
        },
      });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[rgb(15_118_110_/0.15)] text-[var(--color-accent)]">
          <Check size={30} />
        </span>
        <h3 className="mt-6 font-display text-2xl font-bold text-ink">
          Message received.
        </h3>
        <p className="mt-3 max-w-sm text-ink-2">
          Thanks for reaching out. A member of our team will get back to you
          within one business day — usually much sooner.
        </p>
        <button
          onClick={() => {
            setName("");
            setBiz("");
            setEmail("");
            setPhone("");
            setIndustry("");
            setPlan("");
            setMessage("");
            setState("idle");
          }}
          className="mt-6 text-sm text-ink-2 underline underline-offset-4 hover:text-ink"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card space-y-5 p-8">
      {/* Honeypot — visually hidden, ignored by humans, filled by naive bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name">
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Jane Smith" />
        </Field>
        <Field label="Business name" htmlFor="biz">
          <input id="biz" required value={biz} onChange={(e) => setBiz(e.target.value)} className={inputCls} placeholder="Smith Plumbing Co." />
        </Field>
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="jane@smithplumbing.com"
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="(555) 555-0100" />
        </Field>
        <Field label="Industry" htmlFor="industry">
          <select id="industry" className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="" disabled>
              Select…
            </option>
            {industries.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </Field>
        <Field label="Interested in" htmlFor="plan">
          <select id="plan" className={inputCls} value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="" disabled>
              Select…
            </option>
            {plans.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="How can we help?" htmlFor="msg">
        <textarea
          id="msg"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputCls}
          placeholder="Tell us about your business and what you're looking for…"
        />
      </Field>
      <button type="submit" disabled={state === "sending"} className="btn-primary w-full disabled:opacity-60 sm:w-auto">
        {state === "sending" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {state === "sending" ? "Sending…" : "Send Message"}
      </button>
      {state === "error" && (
        <p className="text-sm text-[var(--color-warning)]">
          Couldn't send your message — please try again. If it keeps failing,
          email hello@sitekind.ai directly.
        </p>
      )}
      <p className="text-xs text-ink-2">
        Prefer email? Reach us at hello@sitekind.ai — a human will get back to
        you within one business day.
      </p>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--card-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-2 focus:border-[var(--color-primary)]";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-2">{label}</span>
      {children}
    </label>
  );
}
