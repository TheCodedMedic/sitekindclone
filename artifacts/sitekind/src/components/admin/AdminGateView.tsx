import { Link } from "@tanstack/react-router";
import type { TeamGate } from "@/hooks/useTeamGate";

function CenteredMessage({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-2">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function AdminGateView({
  gate,
  redirectPath,
}: {
  gate: Exclude<TeamGate, { status: "member" }>;
  redirectPath?: string;
}) {
  if (gate.status === "loading") {
    return <CenteredMessage title="Loading…" body="Checking your access." />;
  }
  if (gate.status === "signed-out") {
    return (
      <CenteredMessage
        title="Sign in required"
        body="This page is for the sitekind team."
        action={
          <Link
            to="/admin/login"
            search={redirectPath ? { redirect: redirectPath } : undefined}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Go to sign in
          </Link>
        }
      />
    );
  }
  return (
    <CenteredMessage
      title="Not authorized"
      body="Your account isn't on the sitekind team allowlist."
      action={
        <Link to="/" className="rounded-md border px-4 py-2 text-sm">
          Back home
        </Link>
      }
    />
  );
}
