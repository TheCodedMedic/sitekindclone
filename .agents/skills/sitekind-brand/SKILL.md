---
name: sitekind-brand
description: Sitekind "Fresh Paint" brand & design system — colors, fonts, radii, shadows, motion tokens, voice/tone, stable class contracts, and how to apply the brand across the web app, pitch deck, promo video, and mobile app. Read before doing any visual, copy, or motion work on any Sitekind artifact.
---

# Sitekind Brand & Design System — "Fresh Paint"

Sitekind is **Main Street, not Silicon Valley** — a warm, human, light-first
brand for local service businesses. Every surface should feel like index cards
on a sunny counter, not glass panels in a SaaS dashboard.

**Canonical source of truth:** `artifacts/sitekind/src/styles.css` (tokens,
theming, all stable classes) and `artifacts/sitekind/src/lib/motion/tokens.ts`
(typed motion mirror). When this doc and the code disagree, the code wins.

## Brand personality & voice

- Warm, human, plain-spoken. Write like a helpful neighbor, not an enterprise
  vendor. No jargon, no "leverage/synergy", no uppercase-monospace eyebrows —
  the eyebrow is literally handwritten (Caveat) with a wavy amber underline.
- Light-first: the default theme is warm cream, not dark mode. Dark is a
  variant, never the hero presentation.
- Confidence without chill: clementine energy + deep-teal steadiness.
  Amber is the "sunshine" accent for highlights and playful tags.
- Do: "Get Started for $150/mo", "See a Live Demo", concrete outcomes
  (booked jobs, answered calls). Don't: abstract platform-speak.

## Color palette

| Token | Hex | Role |
|---|---|---|
| `--color-primary` | `#c2410c` | Clementine — CTAs, links, focus rings, logo mark |
| `--color-primary-hover` | `#9a3412` | Primary hover |
| `--color-accent` | `#0f766e` | Deep teal — secondary buttons, progress, "steady" signals |
| `--color-accent-hover` | `#115e59` | Accent hover |
| `--color-warning` | `#f59e0b` | Sunshine amber — highlights, sample tags, wavy underline |
| `--color-bg-light` | `#fffbf5` | Warm cream — default surface |
| `--color-bg-light-secondary` | `#ffffff` | Card/panel surface |
| `--color-bg-light-tertiary` | `#fdf3e7` | Peach tint surface |
| `--color-bg-dark` | `#1c1712` | Espresso — dark-variant surface |
| `--color-bg-dark-secondary` | `#28211a` | Dark secondary surface |
| `--color-text-light-primary` | `#2a2118` | Warm espresso ink (body text on light) |
| `--color-text-light-secondary` | `#6b5d4f` | Secondary ink |
| `--color-text-dark-primary` | `#f7f1e8` | Ink on dark |
| `--color-text-dark-secondary` | `#c4b5a4` | Secondary ink on dark |

Per-industry tint family (soft radials in `.mesh`, industry accents):
blush `#fbe7e0`, sky `#e3f1f5`, mint `#e4f2e8`.

Dark-mode accent lightening convention: primary text/links become `#fdba74`
(light clementine), accent becomes `#5eead4`/`#2dd4bf` (light teal),
amber tags become `#fcd34d`.

Semantic aliases flip with theme (`:root`/`.light` vs `.dark`): `--surface`,
`--surface-2`, `--surface-3`, `--ink`, `--ink-2`, `--card-border`, `--glass`,
`--nav-glass`. Prefer these over raw brand tokens in components.

## Typography

Fonts are loaded via Google Fonts `<link>` in each artifact's HTML head.

- `--font-display`: **Bricolage Grotesque** — headings, stats, wordmark.
  Bold/extrabold, tight tracking, tight leading (~1.15).
- `--font-body`: **Nunito Sans** — all body copy.
- `--font-accent`: **Caveat** (cursive) — eyebrows/handwritten warmth only.
- `--font-code`: **Fira Code** — tiny technical labels (route nodes, chips).

Utility classes: `.font-display`, `.font-accent`, `.font-code`.
Heading scale reference: section H2 ≈ 2–3rem responsive; stats 2.25–2.75rem.

## Radii & shadows

- `--radius-btn: 14px`, `--radius-card: 20px` (chips/pills: 9999px).
- `--shadow-card` / `--shadow-card-hover`: soft warm-ink shadows.
- `--shadow-glow` (clementine) / `--shadow-glow-accent` (teal): CTA glows.

## Motion

Typed mirror: `artifacts/sitekind/src/lib/motion/tokens.ts` — keep CSS and JS
in sync. Three-level hierarchy:

- **C — interface feedback:** `--motion-fast: 150ms`, `--motion-base: 240ms`
  (hovers, toggles, focus, panels).
- **B — product demonstrations:** `--motion-slow: 600ms` (section demos).
- **A — the one signature hero scene:** `--motion-scene: 3200ms`.

Easings: `--ease-out-brand: cubic-bezier(0.22, 1, 0.36, 1)` (decisive start,
soft landing) and `--ease-spring-soft: cubic-bezier(0.34, 1.3, 0.64, 1)`
(low-overshoot spring).

Motion rules (non-negotiable):
- Transform/opacity only; every animation has a **static end state** under
  `html.motion-off` and `prefers-reduced-motion` — visitors must never see
  half-drawn UI. `html.motion-off` is stamped pre-paint by `MotionScript` and
  gates *decorative* motion only; functional feedback (button presses, form
  states, spinners' semantics) stays.
- Budgets: pointer tilt ≤1.5deg; near parallax ≤4px, far ≤14px; hover lifts
  ≤2px; magnetic button labels ≤3px. Calm over flashy — "breathing" via
  opacity, never scale-pulsing.

## Stable class contracts

Class names are stable — their rendering changed in the 2026-07 redesign, not
their contracts. Reuse them; don't fork:

- `.glass-card` — paper card (index card, not glass): white, warm border, 20px radius.
- `.nav-glass` — warm translucent blurred nav bar.
- `.mesh` — soft blush/sky/mint blurred radial blobs (atmosphere).
- `.dot-grid` — paper-grain noise texture (not dots anymore).
- `.eyebrow` — Caveat handwriting, clementine, wavy amber underline.
- `.btn-primary` (clementine fill) / `.btn-secondary` (teal outline) /
  `.btn-accent` (amber fill, espresso text) — with `.btn-label` for magnetics.
- `.reveal` / `.revealed` — scroll-in rise; `.reveal-fade` for opacity-only.
- `.bg-surface`, `.bg-surface-2/3`, `.text-ink`, `.text-ink-2`.

Shared React primitives: `artifacts/sitekind/src/components/ui.tsx`
(`Section` — max-w 1280px + px-6/lg:px-10, `Eyebrow`, `SectionHeading`,
`CtaLink`, `CtaBand`, `Stat`, `Badge`).

## Logo

- Mark: clementine rounded browser window with a **negative-space heart** and
  teal + cream browser-bar dots. SVG source:
  `artifacts/sitekind/public/brand/sitekind-logo.svg`; React lockup:
  `artifacts/sitekind/src/components/Logo.tsx`.
- Wordmark: lowercase two-tone "site|kind" — "site" in ink, "kind" in
  clementine, Bricolage Grotesque extrabold, tight tracking.

## Applying the brand across artifacts

- **Web (`artifacts/sitekind`)** — the reference implementation. Use tokens
  and stable classes above; never hardcode hex values in components.
- **Pitch deck (`artifacts/pitch-deck`)** — tokens in `src/index.css`, fonts
  in `index.html` (Bricolage + Nunito only; no Caveat/Fira loaded). Explicit
  light theme (`color-scheme: light`), static slides — no ambient motion.
- **Promo video (`artifacts/sitekind-promo-video`)** — full token set +
  all four fonts (`index.html`, `src/index.css`). Motion presets centralized
  in `src/lib/video/animations.ts` (Framer Motion springs, fades, kinetic
  typography); keep new scenes on those presets and the brand easings.
- **Mobile (`artifacts/sitekind-mobile`)** — colors in `constants/colors.ts`
  (light + dark palettes incl. tints), fonts loaded in `app/_layout.tsx`
  (Bricolage 600/700, Nunito 400/600/700), font styles centralized in
  `components/ui.tsx`, theme follows OS via `hooks/useColors.ts`. Motion is
  Reanimated entrance choreography (FadeIn/FadeInDown, 350–500ms, staggered
  90–320ms) — matches the base/slow bands.

When bringing the brand to a **new** artifact: load Bricolage Grotesque +
Nunito Sans at minimum (add Caveat/Fira Code only if eyebrows/technical labels
appear), copy the brand color tokens verbatim, default to the light cream
theme, and keep motion inside the fast/base/slow bands with the two brand
easings.

## Do / Don't

- **Do** default to light cream; **don't** lead with dark mode.
- **Do** use semantic aliases (`--surface`, `--ink`); **don't** hardcode hex.
- **Do** give every animation a static end state; **don't** ship motion that
  breaks under `motion-off` / reduced motion.
- **Do** keep eyebrows handwritten (Caveat + wavy amber underline);
  **don't** reintroduce uppercase-monospace enterprise eyebrows.
- **Do** reuse stable class names (`glass-card`, `mesh`…); **don't** rename
  or duplicate them.
- **Do** lighten accents in dark mode (`#fdba74`, `#5eead4`); **don't** use
  the saturated light-mode hues on espresso backgrounds.
