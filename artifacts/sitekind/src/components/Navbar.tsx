import { Link, useLocation } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { nav } from "@/lib/site";
import { features } from "@/lib/data/features";
import { industries } from "@/lib/data/industries";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { MotionToggle } from "./MotionToggle";
import { FeatureIcon } from "./FeatureIcon";

// Sliding active-route underline (framer-motion layoutId) — lazy so the
// animation library stays out of the critical bundle. Until it mounts the
// active item is marked by its existing text color, exactly as before.
const NavActiveIndicator = lazy(() => import("./NavActiveIndicator"));

type DropdownItem = {
  href: string;
  title: string;
  sub: string;
  icon?: React.ReactNode;
  badge?: string;
};

const featureItems: DropdownItem[] = features.map((f) => ({
  href: `/features/${f.slug}`,
  title: f.navLabel,
  sub: f.tagline,
  icon: <FeatureIcon name={f.icon} className="h-9 w-9" size={18} />,
}));


const industryItems: DropdownItem[] = industries.slice(0, 6).map((i) => ({
  href: `/industries/${i.slug}`,
  title: i.name,
  sub: i.stat,
}));


export function Navbar() {
  const pathname = useLocation({ select: (l) => l.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/portal")) return null;

  return (
    <header
      className={`nav-glass fixed inset-x-0 top-0 z-50 transition-shadow ${
        scrolled ? "shadow-[0_8px_30px_rgb(0_0_0_/0.12)]" : ""
      }`}
    >
      {/* Header widens past the 1280px content column only at ≥1800px — the
          phone number needs the extra room (nav is viewport-centered, so the
          cluster and phone can never fit inside 1280 together). */}
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6 lg:px-10 min-[1800px]:max-w-[1500px]">
        <Logo />

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            // Decorative shared-layout underline under the active item.
            const indicator = mounted && active && (
              <Suspense fallback={null}>
                <NavActiveIndicator />
              </Suspense>
            );

            if (item.href === "/features") {
              return (
                <NavDropdown
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  active={active}
                  items={featureItems}
                  viewAllLabel="View all features"
                  panelClass="min-w-[520px]"
                  withIcons
                  indicator={indicator}
                />
              );
            }
            if (item.href === "/industries") {
              return (
                <NavDropdown
                  key={item.href}
                  label={item.label}
                  href={item.href}
                  active={active}
                  items={industryItems}
                  viewAllLabel="View all industries"
                  panelClass="min-w-[420px]"
                  indicator={indicator}
                />
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`relative rounded-lg px-2 py-2 text-sm font-medium transition-colors xl:px-3.5 xl:text-[0.9375rem] ${
                  active ? "text-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                {item.label}
                {indicator}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 xl:gap-2.5">
          {/* Click-to-call adapts to the space: icon-only button everywhere
              (one tap on mobile), full number only on ultra-wide screens
              where the centered nav leaves room for it. */}
          <a
            href="tel:+18885550199"
            aria-label="Call sitekind: (888) 555-0199"
            title="(888) 555-0199"
            className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--card-border)] text-[var(--color-accent)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] lg:h-9 lg:w-9 xl:h-10 xl:w-10 min-[1800px]:hidden"
          >
            <Phone size={17} />
          </a>
          <a
            href="tel:+18885550199"
            className="hidden items-center gap-1.5 text-[0.9375rem] font-bold text-ink transition-colors hover:text-[var(--color-primary)] min-[1800px]:inline-flex"
          >
            <Phone size={15} className="text-[var(--color-accent)]" />
            (888) 555-0199
          </a>
          <Link
            to="/login"
            className="hidden text-[0.9375rem] font-medium text-ink-2 transition-colors hover:text-ink sm:block"
          >
            Login
          </Link>
          {/* Between lg and xl the centered nav needs the width — the toggle
              stays available on mobile (menu row) and from xl up. */}
          <div className="lg:max-xl:hidden">
            <MotionToggle />
          </div>
          <ThemeToggle />
          <Link
            to="/pricing"
            className="hidden rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-[0.9375rem] font-semibold text-white transition-transform hover:scale-[1.03] sm:inline-flex xl:px-5 dark:shadow-[var(--shadow-glow)]"
          >
            Get Started
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--card-border)] text-ink lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--card-border)] px-6 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-ink-2 transition-colors hover:bg-[var(--surface-2)] hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/login" className="btn-secondary w-full">
                Client Login
              </Link>
              <Link to="/pricing" className="btn-primary w-full">
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavDropdown({
  label,
  href,
  active,
  items,
  viewAllLabel,
  panelClass,
  withIcons,
  indicator,
}: {
  label: string;
  href: string;
  active: boolean;
  items: DropdownItem[];
  viewAllLabel: string;
  panelClass?: string;
  withIcons?: boolean;
  /** Decorative active-route underline (rendered when this item is active). */
  indicator?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => {
        cancelClose();
        setOpen(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) scheduleClose();
      }}
    >
      <Link
        to={href}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`relative inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors xl:px-3.5 xl:text-[0.9375rem] ${
          active ? "text-ink" : "text-ink-2 hover:text-ink"
        }`}
      >
        {label}
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
        {indicator}
      </Link>

      {open && (
        <div
          className={`nav-dropdown-panel absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 ${panelClass ?? ""}`}
        >
          <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--surface)] shadow-[0_24px_60px_rgb(0_0_0_/0.22)] backdrop-blur-md">
            <ul
              role="menu"
              aria-label={label}
              className="flex max-h-[min(70vh,560px)] flex-col overflow-y-auto p-2"
            >
              {items.map((it) => (
                <li key={it.href}>
                  <Link
                    to={it.href}
                    role="menuitem"
                    className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--surface-2)]"
                  >
                    {withIcons && it.icon}
                    {!withIcons && it.badge && (
                      <span className="mt-0.5 w-14 shrink-0 rounded-md border border-[var(--card-border)] bg-[var(--surface-2)] px-1.5 py-0.5 text-center font-code text-[10px] text-ink-2">
                        {it.badge}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-ink">
                        {it.title}
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-xs leading-snug text-ink-2">
                        {it.sub}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-[var(--card-border)] p-2">
              <Link
                to={href}
                role="menuitem"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--surface-2)] dark:text-[#fdba74]"
              >
                {viewAllLabel}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
