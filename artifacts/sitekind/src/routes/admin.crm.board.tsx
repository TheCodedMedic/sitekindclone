import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useTeamGate } from "@/hooks/useTeamGate";
import { AdminGateView } from "@/components/admin/AdminGateView";
import { AdminNav } from "@/components/admin/AdminNav";
import { FollowUpsDuePanel } from "@/components/admin/FollowUpsDuePanel";
import { CrmStatsRow } from "@/components/admin/CrmStatsRow";

type LeadRow = Database["public"]["Views"]["crm_lead_list"]["Row"];
type TeamRow = Database["public"]["Tables"]["team_members"]["Row"];
type CrmStatus = Database["public"]["Enums"]["crm_lead_status"];

const COLUMNS: CrmStatus[] = [
  "new",
  "report_viewed",
  "contacted",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
];

const PAGE = 100;

export const Route = createFileRoute("/admin/crm/board")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pipeline · CRM · Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BoardPage,
});

function BoardPage() {
  const gate = useTeamGate();
  if (gate.status !== "member") {
    return <AdminGateView gate={gate} redirectPath="/admin/crm/board" />;
  }
  return <Board userId={gate.user.id} />;
}

type ColState = { rows: LeadRow[]; total: number | null; limit: number; loading: boolean };

function emptyCol(): ColState {
  return { rows: [], total: null, limit: PAGE, loading: true };
}

function Board({ userId }: { userId: string }) {
  const [cols, setCols] = useState<Record<CrmStatus, ColState>>(() => ({
    new: emptyCol(),
    report_viewed: emptyCol(),
    contacted: emptyCol(),
    qualified: emptyCol(),
    proposal_sent: emptyCol(),
    won: emptyCol(),
    lost: emptyCol(),
  }));
  const [team, setTeam] = useState<Map<string, TeamRow>>(new Map());
  const [dragOver, setDragOver] = useState<CrmStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lostPrompt, setLostPrompt] = useState<{ lead: LeadRow; fromStatus: CrmStatus } | null>(null);

  const fetchCol = useCallback(async (status: CrmStatus, limit = PAGE) => {
    const { data, error, count } = await supabase
      .from("crm_lead_list")
      .select("*", { count: "exact" })
      .eq("status", status)
      .order("created_at", { ascending: false })
      .range(0, limit - 1);
    if (error) {
      setError(error.message);
      return;
    }
    setCols((c) => ({
      ...c,
      [status]: { rows: (data ?? []) as LeadRow[], total: count ?? null, limit, loading: false },
    }));
  }, []);

  useEffect(() => {
    (async () => {
      const teamR = await supabase.from("team_members").select("*");
      const m = new Map<string, TeamRow>();
      for (const t of (teamR.data ?? []) as TeamRow[]) m.set(t.user_id, t);
      setTeam(m);
    })();
    void Promise.all(COLUMNS.map((s) => fetchCol(s)));
  }, [fetchCol]);

  const moveCard = useCallback(
    async (leadId: string, fromStatus: CrmStatus, toStatus: CrmStatus, lostReason?: string) => {
      if (fromStatus === toStatus) return;
      const snapshot = cols;
      // Optimistic
      setCols((c) => {
        const src = c[fromStatus];
        const idx = src.rows.findIndex((r) => r.id === leadId);
        if (idx === -1) return c;
        const moved = { ...src.rows[idx], status: toStatus, lost_reason: lostReason ?? null };
        const dst = c[toStatus];
        return {
          ...c,
          [fromStatus]: { ...src, rows: src.rows.filter((_, i) => i !== idx), total: (src.total ?? src.rows.length) - 1 },
          [toStatus]: { ...dst, rows: [moved, ...dst.rows], total: (dst.total ?? dst.rows.length) + 1 },
        };
      });
      const patch: Database["public"]["Tables"]["demo_leads"]["Update"] =
        toStatus === "lost"
          ? { status: "lost", lost_reason: lostReason ?? null }
          : { status: toStatus, lost_reason: null };
      const { error } = await supabase.from("demo_leads").update(patch).eq("id", leadId);
      if (error) {
        setCols(snapshot);
        setError(`Move failed: ${error.message}`);
        setTimeout(() => setError(null), 4000);
      }
    },
    [cols],
  );

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      <AdminNav current="crm-board" userId={userId} />

      <header className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Pipeline board</h1>
          <p className="text-sm text-ink-2">Drag cards between stages. Dropping onto Lost asks for a reason.</p>
        </div>
      </header>

      <CrmStatsRow />
      <FollowUpsDuePanel />

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => {
          const col = cols[status];
          const displayCount =
            col.total != null ? String(col.total) : col.rows.length >= col.limit ? `${col.limit}+` : String(col.rows.length);
          const hasMore = col.total != null && col.rows.length < col.total;
          return (
            <div
              key={status}
              className={
                "flex w-72 shrink-0 snap-start flex-col rounded-lg border p-2 transition-colors " +
                (dragOver === status
                  ? "border-[var(--color-accent)] bg-[rgb(15_118_110_/0.06)]"
                  : "border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]")
              }
              onDragOver={(e) => { e.preventDefault(); setDragOver(status); }}
              onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const raw = e.dataTransfer.getData("application/json");
                if (!raw) return;
                let payload: { id: string; fromStatus: CrmStatus };
                try { payload = JSON.parse(raw); } catch { return; }
                if (payload.fromStatus === status) return;
                if (status === "lost") {
                  const lead = cols[payload.fromStatus].rows.find((r) => r.id === payload.id);
                  if (lead) setLostPrompt({ lead, fromStatus: payload.fromStatus });
                  return;
                }
                void moveCard(payload.id, payload.fromStatus, status);
              }}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="font-display text-sm font-bold text-ink">{statusLabel(status)}</span>
                <span className="text-xs text-ink-2 tabular-nums">{displayCount}</span>
              </div>

              <div className="flex flex-col gap-2">
                {col.loading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={`sk-${status}-${i}`}
                      className="h-16 animate-pulse rounded-md border border-black/10 bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.04]"
                    />
                  ))}
                {!col.loading && col.rows.length === 0 && (
                  <div className="rounded-md border border-dashed border-black/10 p-3 text-center text-xs text-ink-2 dark:border-white/10">
                    Empty
                  </div>
                )}
                {col.rows.map((r) => (
                  <Card key={r.id ?? Math.random()} row={r} status={status} team={team} />
                ))}
                {hasMore && (
                  <button
                    onClick={() => void fetchCol(status, col.limit + PAGE)}
                    className="mt-1 rounded-md border border-black/15 px-2 py-1 text-xs text-ink-2 hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]"
                  >
                    Load {Math.min(PAGE, (col.total ?? 0) - col.rows.length)} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {lostPrompt && (
        <LostReasonModal
          onCancel={() => setLostPrompt(null)}
          onConfirm={(reason) => {
            const { lead, fromStatus } = lostPrompt;
            setLostPrompt(null);
            if (lead.id) void moveCard(lead.id, fromStatus, "lost", reason);
          }}
        />
      )}
    </div>
  );
}

function Card({ row, status, team }: { row: LeadRow; status: CrmStatus; team: Map<string, TeamRow> }) {
  const overdue = row.next_follow_up_at ? new Date(row.next_follow_up_at).getTime() < Date.now() : false;
  const owner = row.owner_id ? team.get(row.owner_id) : null;
  const initials = owner
    ? owner.display_name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : null;
  const priorityDot =
    row.priority === "high"
      ? "bg-[#C2410C]"
      : row.priority === "low"
        ? "bg-black/20 dark:bg-white/20"
        : "bg-black/40 dark:bg-white/40";

  return (
    <div
      draggable
      onDragStart={(e) => {
        if (!row.id) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify({ id: row.id, fromStatus: status }),
        );
        (e.currentTarget as HTMLDivElement).classList.add("opacity-50");
      }}
      onDragEnd={(e) => {
        (e.currentTarget as HTMLDivElement).classList.remove("opacity-50");
      }}
      className="cursor-grab rounded-md border border-black/10 bg-white p-2.5 shadow-sm active:cursor-grabbing dark:border-white/10 dark:bg-neutral-900"
    >
      <div className="flex items-start justify-between gap-2">
        {row.id ? (
          <Link
            to="/admin/crm/$leadId"
            params={{ leadId: row.id }}
            className="text-sm font-medium text-ink hover:underline"
          >
            {row.business_name ?? "—"}
          </Link>
        ) : (
          <span className="text-sm text-ink">{row.business_name ?? "—"}</span>
        )}
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${priorityDot}`} title={`Priority: ${row.priority ?? "normal"}`} />
      </div>
      <div className="mt-1 text-xs text-ink-2">
        {formatCityState(row.city, row.state)}
        {row.vertical && <> · {row.vertical}</>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {row.has_contact && row.contact_email && (
          <span className="max-w-full truncate rounded bg-black/[0.05] px-1.5 py-0.5 text-[10px] text-ink-2 dark:bg-white/[0.06]">
            {row.contact_email}
          </span>
        )}
        {initials && (
          <span className="rounded-full bg-black/[0.08] px-1.5 py-0.5 text-[10px] font-semibold text-ink dark:bg-white/[0.1]" title={owner?.display_name}>
            {initials}
          </span>
        )}
        {overdue && (
          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
            Overdue
          </span>
        )}
      </div>
    </div>
  );
}

function LostReasonModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg font-bold text-ink">Mark as Lost</h3>
        <p className="mt-1 text-sm text-ink-2">Add a short reason. Required.</p>
        <input
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Chose competitor, out of budget…"
          className="mt-3 w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-[var(--color-accent)] dark:border-white/15"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-black/15 px-3 py-1.5 text-sm text-ink-2 dark:border-white/15">
            Cancel
          </button>
          <button
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={!reason.trim()}
            className="rounded-md bg-ink px-3 py-1.5 text-sm text-white disabled:opacity-40 dark:bg-white dark:text-black"
          >
            Mark Lost
          </button>
        </div>
      </div>
    </div>
  );
}

function statusLabel(s: CrmStatus): string {
  switch (s) {
    case "new": return "New";
    case "report_viewed": return "Report viewed";
    case "contacted": return "Contacted";
    case "qualified": return "Qualified";
    case "proposal_sent": return "Proposal sent";
    case "won": return "Won";
    case "lost": return "Lost";
  }
}

function formatCityState(city: string | null, state: string | null) {
  if (city && state) return `${city}, ${state}`;
  return city ?? state ?? "—";
}
