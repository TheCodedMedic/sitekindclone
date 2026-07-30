import { Link, useLocation } from "@tanstack/react-router";
import { Github, Linkedin, Twitter, Youtube } from "lucide-react";
import { footerColumns, site } from "@/lib/site";

import { Logo } from "./Logo";

export function Footer() {
  const pathname = useLocation({ select: (l) => l.pathname });
  if (pathname.startsWith("/portal") || pathname.startsWith("/login"))
    return null;

  return (
    <footer className="relative mt-24 border-t border-[var(--card-border)] bg-surface-2">
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-2">
              The fully automated digital agency for service businesses.
              Enterprise-grade AI at small-business prices.
            </p>
            <p className="font-accent mt-4 text-lg text-ink-2">
              A Lake Holdings company
            </p>
            <div className="mt-5 flex gap-2">
              {[Twitter, Linkedin, Youtube, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--card-border)] text-ink-2 transition-colors hover:text-ink"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h4 className="font-display text-sm font-semibold text-ink">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href as string}
                      className="text-sm text-ink-2 transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[var(--card-border)] pt-8 text-sm text-ink-2 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="text-xs">
            Websites · AI voice receptionist · Local SEO — built for service businesses
          </p>
        </div>

      </div>
    </footer>
  );
}
