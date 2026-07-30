import type { Database } from "@/integrations/supabase/types";

type CrmStatus = Database["public"]["Enums"]["crm_lead_status"];

export function statusLabel(s: CrmStatus | null | undefined): string {
  switch (s) {
    case "new": return "New";
    case "report_viewed": return "Report viewed";
    case "contacted": return "Contacted";
    case "qualified": return "Qualified";
    case "proposal_sent": return "Proposal sent";
    case "won": return "Won";
    case "lost": return "Lost";
    default: return "—";
  }
}

const CLS: Record<CrmStatus, string> = {
  new: "bg-black/10 text-ink dark:bg-white/10",
  report_viewed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
  contacted: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  qualified: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  proposal_sent: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  won: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  lost: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

export function StatusPill({ value }: { value: CrmStatus | null | undefined }) {
  if (!value) return <span className="text-ink-2">—</span>;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CLS[value]}`}>
      {statusLabel(value)}
    </span>
  );
}
