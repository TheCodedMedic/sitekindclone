import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LeadRow = Database["public"]["Views"]["crm_lead_list"]["Row"];
type TeamRow = Database["public"]["Tables"]["team_members"]["Row"];
type CrmStatus = Database["public"]["Enums"]["crm_lead_status"];

function statusLabel(s: CrmStatus | string | null): string {
  switch (s) {
    case "new": return "New";
    case "report_viewed": return "Report viewed";
    case "contacted": return "Contacted";
    case "qualified": return "Qualified";
    case "proposal_sent": return "Proposal sent";
    case "won": return "Won";
    case "lost": return "Lost";
    default: return String(s ?? "—");
  }
}

export function FollowUpsDuePanel() {
  const [rows, setRows] = useState<LeadRow[] | null>(null);
  const [team, setTeam] = useState<Map<string, TeamRow>>(new Map());
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const eod = new Date();
      eod.setHours(23, 59, 59, 999);
      const [leadsR, teamR] = await Promise.all([
        supabase
          .from("crm_lead_list")
          .select("*")
          .not("next_follow_up_at", "is", null)
          .lte("next_follow_up_at", eod.toISOString())
          .not("status", "in", "(won,lost)")
          .order("next_follow_up_at", { ascending: true })
          .limit(50),
        supabase.from("team_members").select("*"),
      ]);
      if (cancelled) return;
      if (leadsR.error) {
        setErr(leadsR.error.message);
        setRows([]);
        return;
      }
      setRows((leadsR.data ?? []) as LeadRow[]);
      const m = new Map<string, TeamRow>();
      for (const t of (teamR.data ?? []) as TeamRow[]) m.set(t.user_id, t);
      setTeam(m);
    })();
    return () => { cancelled = true; };
  }, []);

  const now = useMemo(() => Date.now(), [rows]);

  return (
    <section className="glass-card mb-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-ink">Needs contact today</h2>
        {rows && rows.length > 0 && (
          <span className="text-xs text-ink-2">{rows.length} due</span>
        )}
      </div>
      {err && (
        <p className="mt-3 text-xs text-red-700 dark:text-red-300">{err}</p>
      )}
      {rows === null ? (
        <p className="mt-3 text-sm text-ink-2">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-2">No follow-ups due. Nice.</p>
      ) : (
        <ul className="mt-3 divide-y divide-black/5 dark:divide-white/5">
          {rows.map((r) => {
            const overdue = r.next_follow_up_at ? new Date(r.next_follow_up_at).getTime() < now : false;
            const owner = r.owner_id ? team.get(r.owner_id) : null;
            return (
              <li key={r.id ?? Math.random()} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                <Link
                  to="/admin/crm/$leadId"
                  params={{ leadId: r.id ?? "" }}
                  className="font-medium text-ink hover:underline"
                >
                  {r.business_name ?? "—"}
                </Link>
                <span className="text-xs text-ink-2">{statusLabel(r.status)}</span>
                {owner && <span className="text-xs text-ink-2">· {owner.display_name}</span>}
                {r.next_follow_up_at && (
                  <span className="ml-auto text-xs tabular-nums text-ink-2">
                    {new Date(r.next_follow_up_at).toLocaleString()}
                  </span>
                )}
                {overdue && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
                    Overdue
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
