import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Team sign in · Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const router = useRouter();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const target = redirect && redirect.startsWith("/admin") ? redirect : "/admin/crm";

  // If already signed in as a team member, skip to the destination.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!userData.user) {
        setCheckingSession(false);
        return;
      }
      const { data: isMember } = await supabase.rpc("is_team_member", {
        _user_id: userData.user.id,
      });
      if (cancelled) return;
      if (isMember) {
        router.navigate({ to: target });
        return;
      }
      setCheckingSession(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router, target]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError || !data.user) {
        setError(signInError?.message ?? "Sign in failed.");
        return;
      }
      const { data: isMember, error: rpcError } = await supabase.rpc("is_team_member", {
        _user_id: data.user.id,
      });
      if (rpcError) {
        await supabase.auth.signOut();
        setError(rpcError.message);
        return;
      }
      if (!isMember) {
        await supabase.auth.signOut();
        setError("Your account is not on the sitekind team allowlist.");
        return;
      }
      router.navigate({ to: target });
    } finally {
      setBusy(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-sm text-ink-2">Checking your session…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <header className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">sitekind team sign in</h1>
        <p className="mt-2 text-sm text-ink-2">
          Operator-provisioned accounts only. No signup.
        </p>
      </header>
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-black/10 p-6 dark:border-white/10">
        <div>
          <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wide text-ink-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-[var(--color-accent)] dark:border-white/15"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wide text-ink-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-[var(--color-accent)] dark:border-white/15"
          />
        </div>
        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
