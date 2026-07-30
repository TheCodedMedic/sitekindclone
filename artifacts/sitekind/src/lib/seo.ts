// Per-route <head> helpers. Route-level head() entries override the root
// defaults (HeadContent keeps the deepest match's tags per name/property
// key), so each helper emits exactly one entry per key.
import { site } from "./site";

/**
 * Clamp a meta description to `max` chars without cutting mid-word.
 * Collapses whitespace; appends an ellipsis only when truncated.
 */
export function truncateDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 60 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:.—–-]+$/, "")}…`;
}

/**
 * Standard head() payload for a marketing page: unique
 * "<Entity> — sitekind" title plus description/OG/Twitter tags.
 * og:image is inherited from the root (site-wide /og.png).
 */
export function pageHead(title: string, description: string) {
  const fullTitle = `${title} — ${site.name}`;
  const desc = truncateDescription(description);
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: desc },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: desc },
    ],
  };
}

/** Fallback for unknown slugs — inherit the root defaults, never crash. */
export function emptyHead() {
  return { meta: [] };
}
