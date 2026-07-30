// Renders the extracted business logo when available. When we couldn't
// pull a real mark from the site, falls back to a branded wordmark: a
// framed monogram + typographic name in the template's display font, so
// the header never reads as default template text.
import { useState } from "react";
import type { CSSProperties } from "react";
import { LogoChip } from "./LogoChip";

export type LogoMarkProps = {
  logoUrl?: string | null;
  businessName: string;
  className?: string;
  style?: CSSProperties;
  /** Font family for the wordmark fallback. Passed through from the template's display font. */
  wordmarkFont?: string;
  alt?: string;
  /** True when the template background is dark — tunes both chip and monogram treatment. */
  dark?: boolean;
};

/** Extract 1–3 initials from a business name, ignoring common connective words. */
function initialsOf(name: string): string {
  const stop = new Set([
    "the", "and", "of", "a", "an", "for", "at", "on", "in", "to",
    "co", "inc", "llc", "ltd", "&",
  ]);
  const parts = name
    .split(/\s+|[-_/]/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((w) => w.length > 0 && !stop.has(w.toLowerCase()));
  if (parts.length === 0) return name.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0] + (parts[2]?.[0] ?? "")).toUpperCase().slice(0, 3);
}

export function LogoMark({
  logoUrl,
  businessName,
  className = "h-8 w-auto",
  style,
  wordmarkFont,
  alt,
  dark = false,
}: LogoMarkProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (logoUrl && !imgFailed) {
    const heightClass = className
      .split(/\s+/)
      .filter((c) => /^(h-|sm:h-)/.test(c))
      .join(" ");
    return (
      <LogoChip
        src={logoUrl}
        alt={alt ?? `${businessName} logo`}
        dark={dark}
        className={heightClass || "h-10"}
        onError={() => setImgFailed(true)}
      />
    );
  }

  // ---- Branded fallback: monogram badge + wordmark ---------------------
  const initials = initialsOf(businessName);
  const font = wordmarkFont ?? "'Cormorant Garamond', 'Instrument Serif', Georgia, serif";
  const ink = style?.color ?? (dark ? "#f5f1e8" : "#111111");
  const borderColor = dark ? "rgba(245,241,232,0.55)" : "rgba(17,17,17,0.55)";

  return (
    <span
      className={`inline-flex items-center gap-2.5 leading-none ${className}`}
      style={style}
      aria-label={`${businessName} wordmark`}
    >
      <span
        aria-hidden
        className="inline-flex items-center justify-center rounded-[3px]"
        style={{
          height: "1.9em",
          minWidth: "1.9em",
          padding: "0 0.35em",
          border: `1px solid ${borderColor}`,
          fontFamily: font,
          // D8-D9 (round-3 audit): 0.78em of the nav wordmark size measured
          // 8.97px — floor the monogram at 9.5px (decorative logo art, so the
          // 9.5px floor suffices; it still scales up with larger wordmarks).
          fontSize: "max(9.5px, 0.78em)",
          fontWeight: 500,
          letterSpacing: "0.08em",
          color: ink as string,
        }}
      >
        {initials}
      </span>
      <span
        className="inline-flex flex-col"
        style={{ fontFamily: font, color: ink as string }}
      >
        <span
          style={{
            fontSize: "1.15em",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          {businessName}
        </span>
      </span>
    </span>
  );
}
