import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  PhoneCall,
  FileText,
  CreditCard,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { portalClient } from "@/lib/data/portal";

const links = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/portal/analytics", label: "Traffic & Rankings", icon: BarChart3 },
  { href: "/portal/voice-agent", label: "Voice Agent", icon: PhoneCall },
  { href: "/portal/content", label: "Content", icon: FileText },
  { href: "/portal/billing", label: "Billing", icon: CreditCard },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = useLocation({ select: (l) => l.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[264px] transform border-r border-[var(--card-border)] bg-surface-2 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-5">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden"
              aria-label="Close menu"
            >
              <X size={20} className="text-ink-2" />
            </button>
          </div>

          {/* Client badge */}
          <div className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--surface)] p-4">
            <div className="text-sm font-semibold text-ink">
              {portalClient.business}
            </div>
            <div className="mt-0.5 text-xs text-ink-2">{portalClient.plan}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[rgb(15_118_110_/0.12)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-accent)] dark:text-[#2dd4bf]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              All systems live
            </div>
          </div>

          <nav className="mt-6 flex-1 space-y-1">
            {links.map((l) => {
              const active = l.exact
                ? pathname === l.href
                : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-ink-2 hover:bg-[var(--surface)] hover:text-ink"
                  }`}
                >
                  <l.icon size={18} />
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-1 border-t border-[var(--card-border)] pt-4">
            <a
              href={`https://${portalClient.domain}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
            >
              <ExternalLink size={18} /> View live site
            </a>
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink"
            >
              <LogOut size={18} /> Sign out
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--card-border)] bg-[var(--nav-glass)] px-5 backdrop-blur-md lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-ink" />
          </button>
          <div className="hidden text-sm text-ink-2 lg:block">
            {portalClient.city} · {portalClient.since}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-sm font-bold text-white">
              J
            </span>
          </div>
        </header>
        <div className="flex-1 px-5 py-8 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
