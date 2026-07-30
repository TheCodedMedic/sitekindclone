import { Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/admin/NotificationBell";

export function AdminNav({
  current,
  userId,
}: {
  current: "crm" | "crm-board" | "leads" | "demo-runs" | "design-telemetry";
  userId?: string;
}) {
  const router = useRouter();

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/admin/login" });
  };

  const linkClass = (active: boolean) =>
    "rounded-md px-3 py-1.5 text-sm " +
    (active
      ? "bg-ink text-white dark:bg-white dark:text-black"
      : "text-ink-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]");

  return (
    <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-3 dark:border-white/10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-sm font-semibold text-ink">Admin</span>
        <span className="text-ink-2">·</span>
        <Link to="/admin/crm" className={linkClass(current === "crm")}>
          CRM list
        </Link>
        <Link to="/admin/crm/board" className={linkClass(current === "crm-board")}>
          Board
        </Link>
        <Link to="/admin/leads" className={linkClass(current === "leads")}>
          Lead inbox
        </Link>
        <Link to="/admin/demo-runs" className={linkClass(current === "demo-runs")}>
          Demo runs
        </Link>
        <Link to="/admin/design-telemetry" className={linkClass(current === "design-telemetry")}>
          Design telemetry
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {userId && <NotificationBell userId={userId} />}
        <button
          onClick={() => void onSignOut()}
          className="rounded-md border border-black/15 px-3 py-1.5 text-xs text-ink-2 hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
