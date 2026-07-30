import { createFileRoute, Link } from "@tanstack/react-router";
import { Component, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useTeamGate } from "@/hooks/useTeamGate";
import { AdminGateView } from "@/components/admin/AdminGateView";
import { AdminNav } from "@/components/admin/AdminNav";
import { StatusPill } from "@/components/admin/StatusPill";
import { ReportView } from "@/components/demo/ReportPanel";
import { PreviewForVertical } from "@/components/demo/previews";
import { DesignRationalePanel } from "@/components/demo/DesignRationalePanel";
import type { BusinessProfile, DemoIntake, DomainSuggestion, Report, ReportRaw } from "@/lib/demoApi";

type CrmStatus = Database["public"]["Enums"]["crm_lead_status"];
type LeadRow = Database["public"]["Tables"]["demo_leads"]["Row"];
type NoteRow = Database["public"]["Tables"]["lead_notes"]["Row"];
type ActivityRow = Database["public"]["Tables"]["lead_activities"]["Row"];
type RunRow = Database["public"]["Tables"]["demo_generation_runs"]["Row"];
type TeamRow = Database["public"]["Tables"]["team_members"]["Row"];

const STATUSES: CrmStatus[] = [
  "new",
  "report_viewed",
  "contacted",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
];

const PRIORITIES = ["low", "normal", "high"] as const;

export const Route = createFileRoute("/admin/crm/$leadId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lead · CRM · Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LeadDetailPage,
});

function LeadDetailPage() {
  const { leadId } = Route.useParams();
  const gate = useTeamGate();

  if (gate.status !== "member") {
    return <AdminGateView gate={gate} redirectPath={`/admin/crm/${leadId}`} />;
  }

  return <LeadDetail leadId={leadId} userId={gate.user.id} />;
}

type Contact = { name?: string; email?: string; phone?: string; notes?: string };

function LeadDetail({ leadId, userId }: { leadId: string; userId: string }) {
  const [lead, setLead] = useState<LeadRow | null>(null);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const refetch = useCallback(async () => {
    const [leadR, notesR, actR, runsR, teamR] = await Promise.all([
      supabase.from("demo_leads").select("*").eq("id", leadId).maybeSingle(),
      supabase.from("lead_notes").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
      supabase.from("lead_activities").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
      supabase.from("demo_generation_runs").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
      supabase.from("team_members").select("*").eq("is_active", true).order("display_name"),
    ]);
    if (leadR.error) {
      setLoadError(leadR.error.message);
      setLoading(false);
      return;
    }
    if (!leadR.data) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLead(leadR.data as LeadRow);
    setNotes((notesR.data ?? []) as NoteRow[]);
    setActivities((actR.data ?? []) as ActivityRow[]);
    setRuns((runsR.data ?? []) as RunRow[]);
    setTeam((teamR.data ?? []) as TeamRow[]);
    setLoadError(null);
    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const teamById = useMemo(() => {
    const m = new Map<string, TeamRow>();
    for (const t of team) m.set(t.user_id, t);
    return m;
  }, [team]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <AdminNav current="crm" userId={userId} />
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
        <div className="glass-card mb-6 p-6">
          <div className="h-6 w-64 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="mt-3 h-3 w-48 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.08]" />
        </div>
        <div className="glass-card mb-6 h-32 animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card h-40 animate-pulse" />
          <div className="glass-card h-40 animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !lead) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <AdminNav current="crm" userId={userId} />
        <Link to="/admin/crm" className="text-sm text-ink-2 hover:underline">← Back to leads</Link>
        <p className="mt-4 text-ink">Lead not found (or you don't have access).</p>
      </div>
    );
  }


  const intake = (lead.intake ?? {}) as DemoIntake;
  const profile = (lead.profile ?? null) as BusinessProfile | null;
  const contact = (lead.contact ?? null) as Contact | null;
  const reportJson = (lead.report ?? null) as { report?: Report; raw?: ReportRaw } | null;
  const domains = Array.isArray(lead.domains) ? (lead.domains as unknown as DomainSuggestion[]) : [];

  const businessName =
    profile?.businessName ??
    intake.businessName ??
    intake.domain ??
    "—";

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <AdminNav current="crm" userId={userId} />
      <div className="mb-4">

        <Link to="/admin/crm" className="text-sm text-ink-2 hover:underline">← Back to leads</Link>
      </div>

      {loadError && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {loadError}
        </div>
      )}

      {/* Header */}
      <header className="glass-card mb-6 p-6">
        <h1 className="font-display text-2xl font-bold text-ink">{businessName}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {profile?.vertical && <Chip>{profile.vertical}</Chip>}
          <span className="text-ink-2">{formatCityState(intake.city, intake.state)}</span>
          <FlowChip value={lead.flow} />
          <StatusPill value={lead.status} />
          <span className="text-ink-2">·</span>
          <span className="text-ink-2 tabular-nums">{new Date(lead.created_at).toLocaleString()}</span>
        </div>
      </header>

      {/* CRM controls */}
      <CrmControls lead={lead} team={team} onSaved={refetch} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Contact */}
        <section className="glass-card p-6">
          <SectionTitle>Contact</SectionTitle>
          {contact ? (
            <dl className="mt-3 space-y-1.5 text-sm">
              <Row label="Name">{contact.name ?? "—"}</Row>
              <Row label="Email">
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="text-[var(--color-accent)] hover:underline">
                    {contact.email}
                  </a>
                ) : "—"}
              </Row>
              <Row label="Phone">
                {contact.phone ? (
                  <a href={`tel:${contact.phone}`} className="text-[var(--color-accent)] hover:underline">
                    {contact.phone}
                  </a>
                ) : "—"}
              </Row>
              {contact.notes && <Row label="Notes">{contact.notes}</Row>}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink-2">
              Not claimed yet — prospect has not unlocked the report.
            </p>
          )}
        </section>

        {/* Intake */}
        <section className="glass-card p-6">
          <SectionTitle>Intake</SectionTitle>
          <dl className="mt-3 space-y-1.5 text-sm">
            <Row label="Flow">{intake.flow ?? "—"}</Row>
            <Row label="Domain">{intake.domain ?? "—"}</Row>
            <Row label="Business name">{intake.businessName ?? "—"}</Row>
            <Row label="Description">{intake.description ?? "—"}</Row>
            <Row label="City">{intake.city ?? "—"}</Row>
            <Row label="State">{intake.state ?? "—"}</Row>
            <Row label="Radius (mi)">{intake.radiusMiles ?? "—"}</Row>
            <Row label="Phone">{intake.phone ?? "—"}</Row>
          </dl>
        </section>
      </div>

      {/* Website preview */}
      {profile && (
        <details className="glass-card mt-6 p-6">
          <summary className="cursor-pointer font-display text-base font-bold text-ink">
            Website preview
          </summary>
          <div className="mt-4">
            <PreviewErrorBoundary>
              <PreviewForVertical profile={profile} logoUrl={profile.logoUrl} />
            </PreviewErrorBoundary>
          </div>
        </details>
      )}

      {profile?.designSchema && (
        <div className="mt-6">
          <DesignRationalePanel schema={profile.designSchema} adminDetail />
        </div>
      )}

      {/* Growth report */}
      <section className="mt-6">
        <SectionTitle>Growth report</SectionTitle>
        <div className="mt-3">
          {reportJson?.report ? (
            <ReportView
              report={reportJson.report}
              raw={reportJson.raw ?? null}
              businessName={businessName}
            />
          ) : (
            <div className="glass-card p-6 text-sm text-ink-2">Report not generated yet.</div>
          )}
        </div>
      </section>

      {/* Domains */}
      {domains.length > 0 && (
        <section className="glass-card mt-6 p-6">
          <SectionTitle>Domain suggestions</SectionTitle>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-left text-xs uppercase tracking-wide text-ink-2">
                  <th className="py-2 pr-4 font-medium">Domain</th>
                  <th className="py-2 pr-4 font-medium">Available</th>
                  <th className="py-2 font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((d, i) => (
                  <tr key={`${d.domain}-${i}`} className="border-b border-[var(--card-border)] last:border-0">
                    <td className="py-2 pr-4 font-code text-ink">{d.domain}</td>
                    <td className="py-2 pr-4 text-ink-2">
                      {d.available === true ? "Yes" : d.available === false ? "No" : "—"}
                    </td>
                    <td className="py-2 text-ink-2">{d.price ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Generation runs */}
      <section className="glass-card mt-6 p-6">
        <div className="flex items-center justify-between">
          <SectionTitle>Generation runs</SectionTitle>
          <Link to="/admin/demo-runs" className="text-xs text-ink-2 hover:underline">
            Open runs debugger →
          </Link>
        </div>
        {runs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-2">No runs recorded.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-xs">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-left uppercase tracking-wide text-ink-2">
                  <th className="py-2 pr-3 font-medium">When</th>
                  <th className="py-2 pr-3 font-medium">Attempt</th>
                  <th className="py-2 pr-3 font-medium">Model</th>
                  <th className="py-2 pr-3 font-medium">Parsed</th>
                  <th className="py-2 pr-3 font-medium">Saved</th>
                  <th className="py-2 pr-3 font-medium">Elapsed</th>
                  <th className="py-2 font-medium">Trace</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--card-border)] last:border-0">
                    <td className="py-1.5 pr-3 tabular-nums text-ink-2">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="py-1.5 pr-3 text-ink">{r.attempt_label ?? `#${r.attempt_index ?? "?"}`}</td>
                    <td className="py-1.5 pr-3 text-ink-2">{r.model ?? "—"}</td>
                    <td className="py-1.5 pr-3">{r.parse_ok ? "✓" : "✗"}</td>
                    <td className="py-1.5 pr-3 text-ink-2">{r.saved_status ?? "—"}</td>
                    <td className="py-1.5 pr-3 tabular-nums text-ink-2">
                      {r.elapsed_ms != null ? `${r.elapsed_ms}ms` : "—"}
                    </td>
                    <td className="py-1.5 font-code text-[10px] text-ink-2">{r.trace_id ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Notes */}
      <NotesSection
        leadId={leadId}
        userId={userId}
        notes={notes}
        teamById={teamById}
        onAdded={refetch}
      />

      {/* Activity */}
      <ActivitySection activities={activities} teamById={teamById} />
    </div>
  );
}

function CrmControls({
  lead,
  team,
  onSaved,
}: {
  lead: LeadRow;
  team: TeamRow[];
  onSaved: () => Promise<void>;
}) {
  const [status, setStatus] = useState<CrmStatus>(lead.status);
  const [lostReason, setLostReason] = useState(lead.lost_reason ?? "");
  const [ownerId, setOwnerId] = useState<string>(lead.owner_id ?? "");
  const [priority, setPriority] = useState<string>(lead.priority);
  const [followUp, setFollowUp] = useState<string>(
    lead.next_follow_up_at ? toLocalInput(lead.next_follow_up_at) : "",
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async (patch: Database["public"]["Tables"]["demo_leads"]["Update"]) => {
    setBusy(true);
    setErr(null);
    const { error } = await supabase.from("demo_leads").update(patch).eq("id", lead.id);
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    await onSaved();
    setBusy(false);
  };

  const onStatusChange = async (next: CrmStatus) => {
    setStatus(next);
    if (next === "lost") {
      // reveal reason input; wait for reason submit
      return;
    }
    await save({ status: next, lost_reason: null });
  };

  const onLostSave = async () => {
    if (!lostReason.trim()) {
      setErr("Lost reason is required.");
      return;
    }
    await save({ status: "lost", lost_reason: lostReason.trim() });
  };

  const onOwnerChange = async (v: string) => {
    setOwnerId(v);
    await save({ owner_id: v || null });
  };

  const onPriorityChange = async (v: string) => {
    setPriority(v);
    await save({ priority: v });
  };

  const onFollowUpChange = async (v: string) => {
    setFollowUp(v);
    await save({ next_follow_up_at: v ? new Date(v).toISOString() : null });
  };

  const clearFollowUp = async () => {
    setFollowUp("");
    await save({ next_follow_up_at: null });
  };

  return (
    <section className="glass-card p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Field label="Status">
          <select
            value={status}
            disabled={busy}
            onChange={(e) => void onStatusChange(e.target.value as CrmStatus)}
            className={selectClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
          {status === "lost" && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                required
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="Lost reason (required)"
                className={inputClass}
              />
              <button
                onClick={() => void onLostSave()}
                disabled={busy || !lostReason.trim()}
                className="rounded-md border border-black/15 px-3 py-1.5 text-xs disabled:opacity-40 dark:border-white/15"
              >
                Save
              </button>
            </div>
          )}
        </Field>

        <Field label="Owner">
          <select
            value={ownerId}
            disabled={busy}
            onChange={(e) => void onOwnerChange(e.target.value)}
            className={selectClass}
          >
            <option value="">Unassigned</option>
            {team.map((t) => (
              <option key={t.user_id} value={t.user_id}>{t.display_name}</option>
            ))}
          </select>
        </Field>

        <Field label="Priority">
          <select
            value={priority}
            disabled={busy}
            onChange={(e) => void onPriorityChange(e.target.value)}
            className={selectClass}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>

        <Field label="Follow up by">
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={followUp}
              disabled={busy}
              onChange={(e) => void onFollowUpChange(e.target.value)}
              className={inputClass}
            />
            {followUp && (
              <button
                onClick={() => void clearFollowUp()}
                className="rounded-md border border-black/15 px-2 text-xs dark:border-white/15"
                title="Clear"
              >
                ×
              </button>
            )}
          </div>
        </Field>
      </div>
      {err && (
        <p className="mt-3 text-xs text-red-700 dark:text-red-300">{err}</p>
      )}
    </section>
  );
}

function NotesSection({
  leadId,
  userId,
  notes,
  teamById,
  onAdded,
}: {
  leadId: string;
  userId: string;
  notes: NoteRow[];
  teamById: Map<string, TeamRow>;
  onAdded: () => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const add = async () => {
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    setErr(null);
    const { error } = await supabase
      .from("lead_notes")
      .insert({ lead_id: leadId, author_id: userId, body: text });
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    setBody("");
    await onAdded();
    setBusy(false);
  };

  return (
    <section className="glass-card mt-6 p-6">
      <SectionTitle>Notes</SectionTitle>
      <div className="mt-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Add a note…"
          className="w-full rounded-md border border-black/15 bg-transparent p-2 text-sm text-ink outline-none focus:border-[var(--color-accent)] dark:border-white/15"
        />
        <div className="mt-2 flex items-center justify-between">
          {err && <span className="text-xs text-red-700 dark:text-red-300">{err}</span>}
          <button
            onClick={() => void add()}
            disabled={busy || !body.trim()}
            className="ml-auto rounded-md bg-ink px-3 py-1.5 text-xs text-white disabled:opacity-40 dark:bg-white dark:text-black"
          >
            Add note
          </button>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {notes.length === 0 && <li className="text-sm text-ink-2">No notes yet.</li>}
        {notes.map((n) => {
          const author = teamById.get(n.author_id);
          return (
            <li key={n.id} className="rounded-lg border border-[var(--card-border)] p-3">
              <div className="flex items-center justify-between text-xs text-ink-2">
                <span className="font-medium text-ink">{author?.display_name ?? n.author_id.slice(0, 8)}</span>
                <span className="tabular-nums">{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink">{n.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ActivitySection({
  activities,
  teamById,
}: {
  activities: ActivityRow[];
  teamById: Map<string, TeamRow>;
}) {
  return (
    <section className="glass-card mt-6 p-6">
      <SectionTitle>Activity</SectionTitle>
      {activities.length === 0 ? (
        <p className="mt-3 text-sm text-ink-2">No activity yet.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {activities.map((a) => {
            const actor = a.actor_id ? teamById.get(a.actor_id)?.display_name ?? a.actor_id.slice(0, 8) : null;
            return (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 shrink-0 text-base" aria-hidden>{activityIcon(a.type)}</span>
                <div className="flex-1">
                  <div className="text-ink">{activityLine(a)}</div>
                  <div className="text-xs text-ink-2 tabular-nums">
                    {new Date(a.created_at).toLocaleString()}
                    {actor && <> · by {actor}</>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────

const selectClass =
  "w-full rounded-md border border-black/15 bg-transparent px-2 py-1.5 text-sm text-ink outline-none focus:border-[var(--color-accent)] dark:border-white/15";
const inputClass = selectClass;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-2">{label}</span>
      {children}
    </label>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-base font-bold text-ink">{children}</h2>;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-32 shrink-0 text-xs uppercase tracking-wide text-ink-2">{label}</dt>
      <dd className="flex-1 text-ink">{children}</dd>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs font-medium text-ink dark:bg-white/[0.08]">
      {children}
    </span>
  );
}

function FlowChip({ value }: { value: string | null }) {
  if (!value) return null;
  const cls =
    value === "has-site"
      ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{value}</span>;
}

function statusLabel(s: CrmStatus) {
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

function formatCityState(city?: string | null, state?: string | null) {
  if (city && state) return `${city}, ${state}`;
  return city ?? state ?? "—";
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function activityIcon(type: string) {
  switch (type) {
    case "created": return "✨";
    case "claimed": return "🔓";
    case "report_generated": return "📊";
    case "status_change": return "🔀";
    case "owner_change": return "👤";
    case "follow_up_set": return "⏰";
    case "note_added": return "📝";
    default: return "•";
  }
}

function activityLine(a: ActivityRow): string {
  const d = (a.detail ?? {}) as Record<string, unknown>;
  switch (a.type) {
    case "created": {
      const biz = typeof d.business === "string" ? d.business : null;
      return biz ? `Lead created (${biz})` : "Lead created";
    }
    case "claimed": {
      const email = typeof d.email === "string" ? d.email : null;
      return email ? `Claimed by ${email}` : "Claimed";
    }
    case "report_generated": return "Report generated";
    case "status_change": {
      const from = typeof d.from === "string" ? d.from : "?";
      const to = typeof d.to === "string" ? d.to : "?";
      return `Status: ${from} → ${to}`;
    }
    case "owner_change": {
      return `Owner changed`;
    }
    case "follow_up_set": {
      const at = typeof d.at === "string" ? new Date(d.at).toLocaleString() : null;
      return at ? `Follow-up set for ${at}` : "Follow-up set";
    }
    case "note_added": return "Note added";
    default: return a.type;
  }
}

// ─── preview error boundary ───────────────────────────────────────────────

class PreviewErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) {
    return { err };
  }
  render() {
    if (this.state.err) {
      return (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--surface)] p-4 text-sm text-ink-2">
          Preview unavailable — profile data may be malformed.
        </div>
      );
    }
    return this.props.children;
  }
}
