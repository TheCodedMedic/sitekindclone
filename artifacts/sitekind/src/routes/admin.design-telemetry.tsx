import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminNav } from "@/components/admin/AdminNav";
import { DesignTelemetryDashboard } from "@/components/admin/DesignTelemetryDashboard";
import { listDesignTelemetry, type DesignTelemetryRow } from "@/lib/designTelemetry.functions";

export const Route = createFileRoute("/admin/design-telemetry")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Design telemetry · Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-2">{String(error?.message ?? error)}</p>
        <button className="mt-6 rounded-md border px-4 py-2 text-sm" onClick={() => { reset(); router.invalidate(); }}>
          Retry
        </button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Not found</h1>
    </div>
  ),
  component: DesignTelemetryPage,
});

type Gate = { status: "loading" } | { status: "signed-out" } | { status: "forbidden" } | { status: "admin" };

function DesignTelemetryPage() {
  const [gate, setGate] = useState<Gate>({ status: "loading" });
  const [rows, setRows] = useState<DesignTelemetryRow[]>([]);
  const [vertical, setVertical] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!userData.user) { setGate({ status: "signed-out" }); return; }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (cancelled) return;
      if (!isAdmin) { setGate({ status: "forbidden" }); return; }
      setGate({ status: "admin" });
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (gate.status !== "admin") return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listDesignTelemetry({ data: { vertical, days: 30, limit: 300 } })
      .then((r) => { if (!cancelled) setRows(r.rows); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [gate.status, vertical]);

  if (gate.status === "loading") return <CenteredMessage title="Loading…" body="Checking your access." />;
  if (gate.status === "signed-out") {
    return (
      <CenteredMessage
        title="Sign in required"
        body="This page is for admins only."
        action={<Link to="/admin/login" className="rounded-md border px-4 py-2 text-sm">Go to sign in</Link>}
      />
    );
  }
  if (gate.status === "forbidden") {
    return (
      <CenteredMessage
        title="Not authorized"
        body="Your account doesn't have admin access."
        action={<Link to="/" className="rounded-md border px-4 py-2 text-sm">Back home</Link>}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      <AdminNav current="design-telemetry" />
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold text-ink">Design telemetry</h1>
        <p className="text-sm text-ink-2">
          Distinctness drift, clash rate, and motif/DNA histograms from the demo-diversity gate. Last 30 days.
        </p>
      </header>
      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Failed to load telemetry: {error}
        </div>
      )}
      <DesignTelemetryDashboard
        rows={rows}
        vertical={vertical}
        onVerticalChange={setVertical}
        loading={loading}
      />
    </div>
  );
}

function CenteredMessage({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-2">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
