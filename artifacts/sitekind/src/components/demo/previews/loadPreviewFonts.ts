// Lazy-loads the preview-only Google Fonts used by the demo template
// components. These families are intentionally excluded from the global
// render-blocking font <link> in src/routes/__root.tsx so they never cost the
// marketing pages a request — they are only needed once a /demo preview
// renders. The families/weights/italics below MUST stay in sync with the font
// stacks declared in design.ts (the `F` map) — every family referenced by an
// art-direction pack must be loaded here.
const PREVIEW_FONTS_LINK_ID = "demo-preview-fonts";

const PREVIEW_FONTS_HREF =
  "https://fonts.googleapis.com/css2" +
  "?family=Instrument+Serif" +
  "&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600" +
  "&family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600" +
  "&family=Archivo+Black" +
  "&family=IBM+Plex+Sans:wght@400;500;600;700" +
  "&family=Bebas+Neue" +
  "&family=Barlow:wght@400;500;600;700" +
  "&family=Space+Grotesk:wght@400;500;600;700" +
  "&family=DM+Sans:wght@400;500;600;700" +
  "&family=Karla:wght@400;500;600;700" +
  "&family=Inter:wght@400;500;600;700" +
  "&display=swap";

/**
 * Injects the preview-only font stylesheet into <head> exactly once. Client-only
 * and idempotent (guarded by an id check), so it is safe to call on every
 * preview render.
 */
export function loadPreviewFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById(PREVIEW_FONTS_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = PREVIEW_FONTS_LINK_ID;
  link.rel = "stylesheet";
  link.href = PREVIEW_FONTS_HREF;
  document.head.appendChild(link);
}

// Loads arbitrary Google Font families the design-schema agent (or the
// Stage-2 font-library pairing engine) picked — e.g. Bodoni Moda, Bricolage
// Grotesque. Accepts either bare family names (legacy schema strings) or
// {family, weights, italics} specs so any library pairing loads with exactly
// the weights/axes it declares. Idempotent per (family, weights, italics)
// signature: writes a per-request <link> tag and never re-appends the same
// signature. Silently ignores unknown / non-Google families — the browser
// just uses the CSS fallback stack in that case.
export type ExtraFontRequest = string | { family: string; weights?: number[]; italics?: boolean };

const DEFAULT_WEIGHTS = [400, 500, 600, 700];
const loadedFamilies = new Set<string>();

export function loadExtraFontFamilies(families: ExtraFontRequest[]) {
  if (typeof document === "undefined" || families.length === 0) return;
  const parts: string[] = [];
  const keys: string[] = [];
  for (const req of families) {
    const spec = typeof req === "string" ? { family: req, weights: undefined, italics: false } : req;
    const family = typeof spec.family === "string" ? spec.family.trim() : "";
    if (!family || !/^[A-Za-z0-9 +'-]+$/.test(family)) continue;
    const weights = (spec.weights ?? DEFAULT_WEIGHTS)
      .filter((w) => Number.isInteger(w) && w >= 100 && w <= 900)
      .sort((a, b) => a - b);
    const wlist = weights.length > 0 ? [...new Set(weights)] : DEFAULT_WEIGHTS;
    const italics = spec.italics === true;
    const key = `${family}|${wlist.join(",")}|${italics ? "i" : ""}`;
    if (loadedFamilies.has(key) || keys.includes(key)) continue;
    const famEnc = encodeURIComponent(family).replace(/%20/g, "+");
    const axis = italics
      ? `ital,wght@${wlist.map((w) => `0,${w}`).join(";")};${wlist.map((w) => `1,${w}`).join(";")}`
      : `wght@${wlist.join(";")}`;
    parts.push(`family=${famEnc}:${axis}`);
    keys.push(key);
  }
  if (parts.length === 0) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?" + parts.join("&") + "&display=swap";
  document.head.appendChild(link);
  for (const k of keys) loadedFamilies.add(k);
}
