// Client SDK for the book-call edge function. Mirrors demoApi's transport:
// the request goes through the same-origin /api/demo proxy (which attaches
// the Supabase anon key and forwards the real client IP for rate limiting).
import { getTurnstileFailure, getTurnstileToken, turnstileFailureToError } from "./demoApi";

export type BookCallInput = {
  name: string;
  email: string;
  company?: string;
  /** Page the request came from, e.g. "/industries/hvac". */
  page?: string;
  /** Honeypot — real users never fill this. */
  website?: string;
};

export class BookCallError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "BookCallError";
    this.status = status;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateBookCall(input: BookCallInput): string | null {
  const name = input.name.trim();
  const email = input.email.trim();
  if (!name) return "Please tell us your name.";
  if (name.length > 120) return "That name looks too long.";
  if (!EMAIL_RE.test(email)) return "Please enter a valid email address.";
  if ((input.company ?? "").trim().length > 160) return "That company name looks too long.";
  return null;
}

export async function submitBookCall(input: BookCallInput): Promise<void> {
  const invalid = validateBookCall(input);
  if (invalid) throw new BookCallError(invalid, 400);

  const turnstileToken = await getTurnstileToken();
  const turnstileFailure = getTurnstileFailure();
  if (!turnstileToken && turnstileFailure) {
    const err = turnstileFailureToError(turnstileFailure);
    throw new BookCallError(err.message, err.status);
  }
  // Timeout-bounded so a hung connection can't pin the form in "Sending…"
  // forever (server side is bounded too; this covers the network leg).
  const res = await fetch("/api/demo/book-call", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: input.name.trim().slice(0, 120),
      email: input.email.trim().slice(0, 200),
      company: (input.company ?? "").trim().slice(0, 160) || undefined,
      page: (input.page ?? "").slice(0, 200) || undefined,
      website: input.website || undefined,
      turnstileToken,
    }),
    signal: AbortSignal.timeout(20_000),
  }).catch(() => null);

  if (!res) {
    throw new BookCallError(
      "Can't reach the server. Check your connection and try again.",
      0,
    );
  }
  if (res.ok) return;

  let message = "";
  try {
    const j = (await res.json()) as { error?: unknown };
    if (typeof j?.error === "string") message = j.error;
    // The /api/demo proxy embeds the upstream JSON body as a string in
    // `error` — unwrap one level so users see the actual message.
    if (message.startsWith("{")) {
      try {
        const inner = JSON.parse(message) as { error?: unknown };
        if (typeof inner?.error === "string") message = inner.error;
      } catch {
        // leave as-is
      }
    }
  } catch {
    // non-JSON error body — fall through to status-based message
  }
  if (/turnstile|captcha|bot check/i.test(message)) {
    message = "Bot check failed. Try again.";
  } else if (!message) {
    if (res.status === 429) message = "Too many requests — wait a moment and try again.";
    else if (res.status >= 500) message = "Something hiccuped on our end. Please try again in a moment.";
    else message = "Couldn't submit your request. Please try again.";
  }
  throw new BookCallError(message, res.status);
}
