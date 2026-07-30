import { Bell, Sparkles, Unlock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Notif = Database["public"]["Tables"]["crm_notifications"]["Row"];

const POLL_MS = 60_000;

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("crm_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return;
    setItems((data ?? []) as Notif[]);
  }, []);

  useEffect(() => {
    void refetch();
    const t = setInterval(() => void refetch(), POLL_MS);
    return () => clearInterval(t);
  }, [refetch]);

  // Click-outside to close
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const unread = items.filter((n) => !(n.read_by ?? []).includes(userId));
  const badge = unread.length === 0 ? null : unread.length > 9 ? "9+" : String(unread.length);

  const markRead = async (n: Notif) => {
    if ((n.read_by ?? []).includes(userId)) return;
    const next = [...(n.read_by ?? []), userId];
    // Optimistic
    setItems((cur) => cur.map((x) => (x.id === n.id ? { ...x, read_by: next } : x)));
    await supabase.from("crm_notifications").update({ read_by: next }).eq("id", n.id);
  };

  const openNotif = async (n: Notif) => {
    await markRead(n);
    setOpen(false);
    if (n.lead_id) {
      router.navigate({ to: "/admin/crm/$leadId", params: { leadId: n.lead_id } });
    }
  };

  const markAllRead = async () => {
    const targets = items.filter((n) => !(n.read_by ?? []).includes(userId));
    if (targets.length === 0) return;
    setItems((cur) =>
      cur.map((n) =>
        (n.read_by ?? []).includes(userId) ? n : { ...n, read_by: [...(n.read_by ?? []), userId] },
      ),
    );
    await Promise.all(
      targets.map((n) =>
        supabase
          .from("crm_notifications")
          .update({ read_by: [...(n.read_by ?? []), userId] })
          .eq("id", n.id),
      ),
    );
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md border border-black/15 p-1.5 text-ink-2 hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]"
      >
        <Bell size={16} />
        {badge && (
          <span className="absolute -right-1 -top-1 min-w-[16px] rounded-full bg-red-600 px-1 text-[10px] font-bold leading-4 text-white text-center">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-2 top-14 z-50 max-h-[70vh] overflow-hidden rounded-lg border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-neutral-900 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
          <div className="flex items-center justify-between border-b border-black/10 p-2 dark:border-white/10">
            <span className="font-display text-sm font-semibold text-ink">Notifications</span>
            <button
              onClick={() => void markAllRead()}
              disabled={unread.length === 0}
              className="text-xs text-ink-2 hover:underline disabled:opacity-40"
            >
              Mark all read
            </button>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 && (
              <li className="p-4 text-center text-sm text-ink-2">Nothing yet.</li>
            )}
            {items.map((n) => {
              const isRead = (n.read_by ?? []).includes(userId);
              return (
                <li key={n.id}>
                  <button
                    onClick={() => void openNotif(n)}
                    className={
                      "flex w-full items-start gap-2 border-b border-black/5 p-3 text-left hover:bg-black/[0.03] dark:border-white/5 dark:hover:bg-white/[0.04] " +
                      (isRead ? "opacity-60" : "")
                    }
                  >
                    <span className="mt-0.5 shrink-0 text-ink-2">
                      {n.kind === "new_lead" ? <Sparkles size={14} /> : <Unlock size={14} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{n.title}</span>
                      {n.body && (
                        <span className="block truncate text-xs text-ink-2">{n.body}</span>
                      )}
                      <span className="block text-[10px] text-ink-2 tabular-nums">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </span>
                    {!isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" aria-label="Unread" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
