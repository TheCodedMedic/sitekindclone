import { createFileRoute } from "@tanstack/react-router";
import { useListLeads, setAuthTokenGetter } from "@workspace/api-client-react";
import type { Lead } from "@workspace/api-client-react";
import { supabase } from "@/integrations/supabase/client";
import { useTeamGate } from "@/hooks/useTeamGate";
import { AdminGateView } from "@/components/admin/AdminGateView";
import { AdminNav } from "@/components/admin/AdminNav";

// Attach the Supabase access token to API server calls (no cookie session
// exists between the web app and the API server).
setAuthTokenGetter(async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
});

export const Route = createFileRoute("/admin/leads")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lead inbox · Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const gate = useTeamGate();
  if (gate.status !== "member") {
    return <AdminGateView gate={gate} redirectPath="/admin/leads" />;
  }
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AdminNav current="leads" userId={gate.user.id} />
      <LeadsList />
    </div>
  );
}

const SOURCE_STYLES: Record<string, string> = {
  "web-demo": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  "web-contact": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  "mobile-demo": "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  "mobile-contact": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
};

function SourceBadge({ source }: { source: string }) {
  const style =
    SOURCE_STYLES[source] ??
    "bg-black/[0.06] text-ink-2 dark:bg-white/[0.08] dark:text-ink-2";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {source}
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LeadsList() {
  const { data, isLoading, error, refetch, isFetching } = useListLeads();

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-ink-2">Loading leads…</p>;
  }
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load leads{error.message ? `: ${error.message}` : ""}
        </p>
        <button
          className="mt-4 rounded-md border border-black/15 px-4 py-2 text-sm dark:border-white/15"
          onClick={() => void refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const leads = data?.leads ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">
          Lead inbox{" "}
          <span className="text-sm font-normal text-ink-2">
            ({leads.length} {leads.length === 1 ? "lead" : "leads"})
          </span>
        </h1>
        <button
          className="rounded-md border border-black/15 px-3 py-1.5 text-xs text-ink-2 hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {leads.length === 0 ? (
        <p className="rounded-lg border border-dashed border-black/15 py-12 text-center text-sm text-ink-2 dark:border-white/15">
          No leads yet. Submissions from the demo wizard and contact forms will show up here.
        </p>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </ul>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <li className="rounded-lg border border-black/10 p-4 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SourceBadge source={lead.source} />
          <span className="font-medium text-ink">{lead.name}</span>
          {lead.businessName && (
            <span className="text-sm text-ink-2">· {lead.businessName}</span>
          )}
        </div>
        <time className="text-xs text-ink-2" dateTime={lead.createdAt}>
          {formatDate(lead.createdAt)}
        </time>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <a href={`mailto:${lead.email}`} className="text-ink underline underline-offset-2">
          {lead.email}
        </a>
        {lead.phone && (
          <a href={`tel:${lead.phone}`} className="text-ink-2">
            {lead.phone}
          </a>
        )}
      </div>

      {lead.message && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-2">{lead.message}</p>
      )}

      {lead.details && Object.keys(lead.details).length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-ink-2">Details</summary>
          <pre className="mt-1 overflow-x-auto rounded bg-black/[0.04] p-2 text-xs dark:bg-white/[0.06]">
            {JSON.stringify(lead.details, null, 2)}
          </pre>
        </details>
      )}
    </li>
  );
}
