// SVG-noise overlay for paper/grain texture on light templates.
export function Grain({ opacity = 0.35, mix = "multiply" }: { opacity?: number; mix?: "multiply" | "overlay" | "soft-light" }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ mixBlendMode: mix, opacity }}
    >
      <filter id="grain-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-noise)" />
    </svg>
  );
}

export function Halftone({ color = "#000", size = 3, opacity = 0.35 }: { color?: string; size?: number; opacity?: number }) {
  const id = `halftone-${color.replace("#", "")}-${size}`;
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity, mixBlendMode: "multiply" }}>
      <defs>
        <pattern id={id} width={size * 2} height={size * 2} patternUnits="userSpaceOnUse">
          <circle cx={size} cy={size} r={size * 0.5} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
