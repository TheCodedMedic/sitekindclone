import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Stats = {
  weekLeads: number | null;
  totalLeads: number | null;
  unlockedLeads: number | null;
  won: number | null;
  lost: number | null;
  err: string | null;
};

function startOfWeekISO() {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function CrmStatsRow() {
  const [s, setS] = useState<Stats>({
    weekLeads: null, totalLeads: null, unlockedLeads: null, won: null, lost: null, err: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const weekStart = startOfWeekISO();
      const countOnly = { count: "exact" as const, head: true };
      const [week, total, unlocked, won, lost] = await Promise.all([
        supabase.from("demo_leads").select("*", countOnly).gte("created_at", weekStart),
        supabase.from("demo_leads").select("*", countOnly),
        supabase.from("demo_leads").select("*", countOnly).not("contact", "is", null),
        supabase.from("demo_leads").select("*", countOnly).eq("status", "won"),
        supabase.from("demo_leads").select("*", countOnly).eq("status", "lost"),
      ]);
      if (cancelled) return;
      const err = week.error || total.error || unlocked.error || won.error || lost.error;
      setS({
        weekLeads: week.count ?? null,
        totalLeads: total.count ?? null,
        unlockedLeads: unlocked.count ?? null,
        won: won.count ?? null,
        lost: lost.count ?? null,
        err: err ? err.message : null,
      });
    })();
    return () => { cancelled = true; };
  }, []);

  const unlockRate =
    s.totalLeads != null && s.unlockedLeads != null && s.totalLeads > 0
      ? `${Math.round((s.unlockedLeads / s.totalLeads) * 100)}%`
      : "—";

  const winDen = (s.won ?? 0) + (s.lost ?? 0);
  const winRate =
    s.won != null && s.lost != null && winDen > 0
      ? `${Math.round((s.won / winDen) * 100)}%`
      : "—";

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      <Tile
        label="Leads this week"
        value={s.weekLeads == null ? "…" : String(s.weekLeads)}
        sub="Since Monday, local time"
      />
      <Tile
        label="Report-unlock rate"
        value={unlockRate}
        sub={
          s.totalLeads == null
            ? "…"
            : `${s.unlockedLeads ?? 0} of ${s.totalLeads} unlocked`
        }
      />
      <Tile
        label="Win rate"
        value={winRate}
        sub={
          s.won == null || s.lost == null
            ? "…"
            : `${s.won} won · ${s.lost} lost`
        }
      />
      {s.err && (
        <p className="col-span-full text-xs text-red-700 dark:text-red-300">{s.err}</p>
      )}
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="glass-card p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-2">{label}</div>
      <div className="mt-2 font-display text-3xl font-extrabold text-ink tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-ink-2">{sub}</div>
    </div>
  );
}
