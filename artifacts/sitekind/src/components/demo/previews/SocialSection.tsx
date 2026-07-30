import { useEffect, useState } from "react";
import { Facebook, Instagram, Music2, Twitter } from "lucide-react";
import { domainSlug } from "./types";

// Simulated social-feed section rendered INSIDE each template's page flow, so
// it reads as a "Follow us" section of the mocked client website (not a
// sitekind UI card floating under the browser-chrome mock). Uses the
// business's REAL photos (Google profile + their site) arranged as an
// Instagram-style wall + auto-playing slideshow. Clearly labeled a preview —
// we don't fabricate posts, captions, or engagement numbers.

export type SocialTheme = {
  /** Tile / media background inside the section. */
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  border: string;
  /** Optional font family for the section heading (defaults to inherit). */
  headingFont?: string;
};

export function SocialSection({
  photos,
  businessName,
  theme,
  heading = "Follow Along",
  paddingClass = "px-6",
  variant = "wall",
  padY = 24,
}: {
  photos: string[];
  businessName: string;
  theme: SocialTheme;
  /** null = suppressed (R5 dedup: the layout's section divider already
   * prints this label — rendering it again here duplicated "FOLLOW ALONG"
   * a few dozen px below the divider on every numbered/chapter layout). */
  heading?: string | null;
  paddingClass?: string;
  /** "wall" = slideshow + IG grid + marquee; "strip" = compact marquee only. */
  variant?: "wall" | "strip";
  /** Section rhythm token from the DesignSpec — vertical padding scales with
   * it (R7: fixed py-6 blew the 1.6×padY dead-zone cap at dense densities). */
  padY?: number;
}) {
  const [active, setActive] = useState(0);
  const slides = photos.slice(0, 6);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % slides.length), 2600);
    return () => clearInterval(id);
  }, [slides.length]);

  if (photos.length === 0) return null;
  const strip = [...photos, ...photos]; // duplicated track for seamless marquee
  const handle = domainSlug(businessName);

  const padBlock = Math.min(24, Math.max(10, Math.round(padY * 0.55)));
  return (
    <div
      className={`border-t ${paddingClass}`}
      style={{ borderColor: theme.border, color: theme.ink, paddingTop: padBlock, paddingBottom: padBlock }}
    >
      {/* Section header — styled like the template's other section labels.
          The text label is skipped when the divider already carries it (R5);
          the platform icons stay as the section's visual signature. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {heading && (
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: theme.accent, fontFamily: theme.headingFont }}
          >
            {heading}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2.5" style={{ color: theme.muted }}>
          <Instagram size={13} /> <Music2 size={13} /> <Facebook size={13} /> <Twitter size={13} />
        </div>
      </div>
      <div className="mt-1 text-[11px]" style={{ color: theme.muted }}>
        @{handle} · everywhere {businessName} posts
      </div>

      {variant === "strip" ? (
        <div className="mt-4 overflow-hidden">
          <div className="flex w-max gap-2" style={{ animation: "marquee 32s linear infinite" }}>
            {strip.map((u, i) => (
              <img key={u + i} src={u} alt="" className="h-20 w-28 rounded-md object-cover" loading="lazy" />
            ))}
          </div>
          {/* R6: full-opacity muted — inline opacity on an already-muted
              color dragged the footnote below the 3.4 meta floor. */}
          <p className="mt-3 text-[10px] leading-snug" style={{ color: theme.muted }}>
            Preview: simulated with your real public photos. On your live site we wire Instagram, TikTok,
            Facebook &amp; X so new posts appear here automatically.
          </p>
        </div>
      ) : (
        <>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_1fr]">
        {/* Auto-playing slideshow (crossfade) */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg" style={{ background: theme.surface }}>
          {slides.map((u, i) => (
            <img
              key={u + i}
              src={u}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
              style={{ opacity: i === active ? 1 : 0 }}
            />
          ))}
          {/* D7 (round-3 audit): the black/45 + blur plate over a photo
              composited to ~2.9:1 worst-case for the 10px white label. Solid
              0.72 plate, no blur — worst-case composite (over pure white)
              stays >=4.5 for white text. */}
          <span
            className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
            style={{ background: "rgba(0,0,0,0.72)" }}
          >
            <Instagram size={11} /> Latest posts
          </span>
          <div className="absolute bottom-2 right-2 flex gap-1">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </div>

        {/* IG-style wall */}
        <div className="grid grid-cols-3 content-start gap-1.5">
          {photos.slice(0, 9).map((u, i) => (
            <img key={u + i} src={u} alt="" className="aspect-square w-full rounded-md object-cover" loading="lazy" />
          ))}
        </div>
      </div>

      {/* Marquee filmstrip */}
      {photos.length >= 3 && (
        <div className="mt-3 overflow-hidden">
          <div className="flex w-max gap-2" style={{ animation: "marquee 32s linear infinite" }}>
            {strip.map((u, i) => (
              <img key={u + i} src={u} alt="" className="h-14 w-20 rounded-md object-cover" loading="lazy" />
            ))}
          </div>
        </div>
      )}

      {/* Honesty footnote — tiny, inside the mock. R6: full-opacity muted —
          the 0.85 opacity on an already-muted color measured 3.19-3.24 vs
          the 3.4 meta floor across fixtures. */}
      <p className="mt-3 text-[10px] leading-snug" style={{ color: theme.muted }}>
        Preview: simulated with your real public photos. On your live site we wire Instagram, TikTok,
        Facebook &amp; X so new posts appear here automatically.
      </p>
        </>
      )}
    </div>
  );
}
