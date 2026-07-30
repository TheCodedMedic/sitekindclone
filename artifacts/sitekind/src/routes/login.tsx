import { createFileRoute, Link } from "@tanstack/react-router";

import { LoginForm } from "@/components/LoginForm";
import { Logo } from "@/components/Logo";
import { DEMO_HREF } from "@/lib/demoHref";

function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-[72px]">
      <div className="mesh" aria-hidden />
      <div className="dot-grid" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="glass-card p-8">
          <h1 className="font-display text-2xl font-bold text-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-ink-2">
            Sign in to your client portal to see traffic, calls, content, and
            billing.
          </p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-ink-2">
          Don't have an account?{" "}
          <Link
            to={DEMO_HREF}
            className="font-semibold text-[var(--color-primary)] dark:text-[#fdba74]"
          >
            Preview your website
          </Link>
        </p>
      </div>
    </div>
  );
}


export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Client Login" },
      { name: "description", content: "Sign in to your sitekind client portal." },
      { property: "og:title", content: "Client Login" },
      { property: "og:description", content: "Sign in to your sitekind client portal." }
    ],
  }),
  component: LoginPage,
});
