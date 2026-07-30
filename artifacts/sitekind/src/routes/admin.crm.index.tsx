import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useTeamGate } from "@/hooks/useTeamGate";
import { AdminGateView } from "@/components/admin/AdminGateView";
import { AdminNav } from "@/components/admin/AdminNav";
import { FollowUpsDuePanel } from "@/components/admin/FollowUpsDuePanel";
import { CrmStatsRow } from "@/components/admin/CrmStatsRow";
import { StatusPill, statusLabel } from "@/components/admin/StatusPill";
import { rowsToCsv, downloadCsv, todayFilenameDate } from "@/lib/csvExport";

type LeadRow = Database["public"]["Views"]["crm_lead_list"]["Row"];
type TeamRow = Database["public"]["Tables"]["team_members"]["Row"];
type CrmStatus = Database["public"]["Enums"]["crm_lead_status"];

const STATUSES: CrmStatus[] = [
  "new", "report_viewed", "contacted", "qualified", "proposal_sent", "won", "lost",
];

const PAGE_SIZE = 50;
const EXPORT_BATCH = 1000;

export const Route = createFileRoute("/admin/crm/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Leads · CRM · Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CrmListPage,
});

function CrmListPage() {
  const gate = useTeamGate();
  if (gate.status !== "member") {
    return <AdminGateView gate={gate} redirectPath="/admin/crm" />;
  }
  return <CrmList userId={gate.user.id} />;
}

type StatusFilter = CrmStatus | "all";
type FlowFilter = "all" | "has-site" | "no-site";

function CrmList({ userId }: { userId: string }) {
  const [rows, setRows] = useState<LeadRow[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [flowFilter, setFlowFilter] = useState<FlowFilter>("all");
  const [hasContact, setHasContact] = useState(false);
  const [hasReport, setHasReport] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, flowFilter, hasContact, hasReport, mineOnly, search]);

  // Apply the current filter state to a supabase query builder.
  // Uses `any` because supabase's typed builder is nominal and doesn't
  // survive a generic pass-through helper here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyFilters = (q: any): any => {
    let x = q;
    if (statusFilter !== "all") x = x.eq("status", statusFilter);
    if (flowFilter !== "all") x = x.eq("flow", flowFilter);
    if (hasContact) x = x.eq("has_contact", true);
    if (hasReport) x = x.eq("has_report", true);
    if (mineOnly) x = x.eq("owner_id", userId);
    if (search) {
      const safe = search.replace(/[,()%]/g, " ").trim();
      if (safe) {
        const like = `%${safe}%`;
        x = x.or(
          `business_name.ilike.${like},contact_email.ilike.${like},city.ilike.${like}`,
        );
      }
    }
    return x;
  };


  useEffect(() => {
    let cancelled = false;
    (async () => {
      const base = supabase
        .from("crm_lead_list")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      const q = applyFilters(base);
      const { data, error, count } = await q;
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        setRows([]);
        setTotal(0);
        return;
      }
      setLoadError(null);
      setRows((data ?? []) as LeadRow[]);
      setTotal(count ?? null);
    })();
    return () => { cancelled = true; };
     
  }, [statusFilter, flowFilter, hasContact, hasReport, mineOnly, search, page, userId]);

  const rangeLabel = useMemo(() => {
    if (!rows || rows.length === 0) return "0 of 0";
    const start = page * PAGE_SIZE + 1;
    const end = page * PAGE_SIZE + rows.length;
    return `${start}–${end}${total !== null ? ` of ${total}` : ""}`;
  }, [rows, page, total]);

  const canNext =
    rows !== null &&
    rows.length === PAGE_SIZE &&
    (total === null || page * PAGE_SIZE + rows.length < total);

  const exportCsv = async () => {
    setExporting(true);
    setExportError(null);
    setExportProgress(0);
    try {
      // Fetch team members once for owner display_name join.
      const { data: teamData } = await supabase.from("team_members").select("*");
      const teamById = new Map<string, TeamRow>();
      for (const t of (teamData ?? []) as TeamRow[]) teamById.set(t.user_id, t);

      const all: LeadRow[] = [];
      let from = 0;
      for (;;) {
        const base = supabase
          .from("crm_lead_list")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, from + EXPORT_BATCH - 1);
        const q = applyFilters(base);
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        const chunk = (data ?? []) as LeadRow[];
        all.push(...chunk);
        setExportProgress(all.length);
        if (chunk.length < EXPORT_BATCH) break;
        from += EXPORT_BATCH;
      }

      const headers = [
        "id", "created_at", "business_name", "vertical", "city", "state",
        "flow", "status", "priority", "owner", "contact_name", "contact_email",
        "has_report", "next_follow_up_at", "lost_reason",
      ];
      const csvRows = all.map((r) => [
        r.id ?? "",
        r.created_at ?? "",
        r.business_name ?? "",
        r.vertical ?? "",
        r.city ?? "",
        r.state ?? "",
        r.flow ?? "",
        r.status ?? "",
        r.priority ?? "",
        r.owner_id ? teamById.get(r.owner_id)?.display_name ?? "" : "",
        r.contact_name ?? "",
        r.contact_email ?? "",
        r.has_report ? "true" : "false",
        r.next_follow_up_at ?? "",
        r.lost_reason ?? "",
      ]);
      const csv = rowsToCsv(headers, csvRows);
      downloadCsv(`sitekind-leads-${todayFilenameDate()}.csv`, csv);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : String(e));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <AdminNav current="crm" userId={userId} />

      <header className="mb-6 flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-ink">CRM leads</h1>
        <p className="text-sm text-ink-2">
          Live prospects from the /demo pipeline. Click a row to open the lead.
        </p>
      </header>

      <CrmStatsRow />
      <FollowUpsDuePanel />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>All statuses</FilterChip>
        {STATUSES.map((s) => (
          <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {statusLabel(s)}
          </FilterChip>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterChip active={flowFilter === "all"} onClick={() => setFlowFilter("all")}>All flows</FilterChip>
        <FilterChip active={flowFilter === "has-site"} onClick={() => setFlowFilter("has-site")}>Has site</FilterChip>
        <FilterChip active={flowFilter === "no-site"} onClick={() => setFlowFilter("no-site")}>No site</FilterChip>
        <div className="ml-2 h-4 w-px bg-black/10 dark:bg-white/10" />
        <FilterChip active={hasContact} onClick={() => setHasContact((v) => !v)}>Has contact</FilterChip>
        <FilterChip active={hasReport} onClick={() => setHasReport((v) => !v)}>Has report</FilterChip>
        <FilterChip active={mineOnly} onClick={() => setMineOnly((v) => !v)}>Mine</FilterChip>
        <div className="ml-auto flex flex-1 items-center gap-2 sm:flex-none">
          <input
            type="search"
            placeholder="Search business, email, city…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full min-w-0 rounded-md border border-black/15 bg-transparent px-3 py-1.5 text-sm text-ink outline-none focus:border-[var(--color-accent)] dark:border-white/15 sm:w-64"
          />
          <button
            onClick={() => void exportCsv()}
            disabled={exporting}
            className="btn-primary inline-flex items-center gap-1.5 whitespace-nowrap text-xs disabled:opacity-60"
            title="Export current filtered results as CSV"
          >
            <Download size={14} />
            {exporting ? `Exporting… (${exportProgress})` : "Export CSV"}
          </button>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Failed to load leads: {loadError}
        </div>
      )}
      {exportError && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          Export failed: {exportError}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-black/10 dark:border-white/10 md:block">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="bg-black/[0.03] text-left text-xs uppercase tracking-wide text-ink-2 dark:bg-white/[0.04]">
            <tr>
              <th className="px-3 py-2">Business</th>
              <th className="px-3 py-2">Vertical</th>
              <th className="px-3 py-2">City / State</th>
              <th className="px-3 py-2">Flow</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Report</th>
              <th className="px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows === null && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-t border-black/5 dark:border-white/5">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-3 w-full animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}
            {rows !== null && rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-ink-2" colSpan={8}>
                  No leads match these filters.
                </td>
              </tr>
            )}
            {rows?.map((r) => (
              <tr
                key={r.id ?? Math.random()}
                className="border-t border-black/5 hover:bg-black/[0.02] dark:border-white/5 dark:hover:bg-white/[0.03]"
              >
                <td className="px-3 py-2">
                  {r.id ? (
                    <Link
                      to="/admin/crm/$leadId"
                      params={{ leadId: r.id }}
                      className="font-medium text-ink hover:underline"
                    >
                      {r.business_name ?? "—"}
                    </Link>
                  ) : (
                    <span>{r.business_name ?? "—"}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-ink-2">{r.vertical ?? "—"}</td>
                <td className="px-3 py-2 text-ink-2">{formatCityState(r.city, r.state)}</td>
                <td className="px-3 py-2"><FlowChip value={r.flow} /></td>
                <td className="px-3 py-2"><StatusPill value={r.status} /></td>
                <td className="px-3 py-2">
                  {r.has_contact ? (
                    <span className="inline-flex items-center gap-1 text-xs text-ink">
                      <span aria-hidden>✓</span>
                      <span className="text-ink-2">{r.contact_email ?? ""}</span>
                    </span>
                  ) : (
                    <span className="text-ink-2">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {r.has_report ? (
                    <span className="text-emerald-700 dark:text-emerald-300" aria-label="Has report">✓</span>
                  ) : (
                    <span className="text-ink-2">—</span>
                  )}
                </td>
                <td className="px-3 py-2 tabular-nums text-ink-2">
                  {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {rows === null &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`msk-${i}`} className="glass-card p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
            </div>
          ))}
        {rows !== null && rows.length === 0 && (
          <div className="glass-card p-6 text-center text-sm text-ink-2">
            No leads match these filters.
          </div>
        )}
        {rows?.map((r) => (
          <div key={r.id ?? Math.random()} className="glass-card p-4">
            <div className="flex items-start justify-between gap-2">
              {r.id ? (
                <Link
                  to="/admin/crm/$leadId"
                  params={{ leadId: r.id }}
                  className="font-medium text-ink hover:underline"
                >
                  {r.business_name ?? "—"}
                </Link>
              ) : (
                <span className="font-medium text-ink">{r.business_name ?? "—"}</span>
              )}
              <StatusPill value={r.status} />
            </div>
            <div className="mt-1 text-xs text-ink-2">
              {formatCityState(r.city, r.state)}
              {r.vertical && <> · {r.vertical}</>}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <FlowChip value={r.flow} />
              {r.has_contact && r.contact_email && (
                <span className="text-ink-2 truncate">{r.contact_email}</span>
              )}
              {r.has_report && (
                <span className="text-emerald-700 dark:text-emerald-300">✓ report</span>
              )}
              <span className="ml-auto tabular-nums text-ink-2">
                {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-ink-2">Showing {rangeLabel}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-black/15 px-3 py-1.5 text-xs text-ink-2 disabled:opacity-40 hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!canNext}
            className="rounded-md border border-black/15 px-3 py-1.5 text-xs text-ink-2 disabled:opacity-40 hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-xs " +
        (active
          ? "border-transparent bg-ink text-white dark:bg-white dark:text-black"
          : "border-black/15 text-ink-2 hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]")
      }
    >
      {children}
    </button>
  );
}

function FlowChip({ value }: { value: string | null }) {
  if (!value) return <span className="text-ink-2">—</span>;
  const cls =
    value === "has-site"
      ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{value}</span>;
}

function formatCityState(city: string | null, state: string | null) {
  if (city && state) return `${city}, ${state}`;
  return city ?? state ?? "—";
}
