import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Demo: any credentials route into the portal.
    setTimeout(() => router.navigate({ to: "/portal" }), 700);
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-2">
          Email
        </span>
        <input
          type="email"
          required
          defaultValue="joe@joeshvacair.com"
          className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-2 focus:border-[var(--color-primary)]"
          placeholder="you@business.com"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink-2">
          Password
        </span>
        <input
          type="password"
          required
          defaultValue="demo-password"
          className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-2 focus:border-[var(--color-primary)]"
          placeholder="••••••••"
        />
      </label>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Signing in…
          </>
        ) : (
          <>
            Sign In <ArrowRight size={16} />
          </>
        )}
      </button>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-[var(--card-border)]" />
        <span className="text-xs text-ink-2">or</span>
        <span className="h-px flex-1 bg-[var(--card-border)]" />
      </div>

      <button
        type="button"
        onClick={submit}
        className="btn-secondary w-full"
        disabled={loading}
      >
        <Mail size={16} /> Email me a magic link
      </button>

      <p className="pt-1 text-center text-xs text-ink-2">
        Demo portal — any credentials sign you in.
      </p>
    </form>
  );
}
