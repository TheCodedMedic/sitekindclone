import { useEffect, useState } from "react";

// Presents an extracted business logo so it looks intentional on any
// template, instead of dropping the raw <img> onto the mock:
// - fixed-height, width-capped container with object-contain sizing
// - canvas corner-sampling heuristic decides whether the mark needs a chip
//   (background plate) to stay legible:
//     * image has its own baked background (opaque corners) → white chip
//       with a hairline border, so the logo's art reads as a deliberate card
//     * transparent/white-backed mark → no chip when it already contrasts
//       with the template; a light chip for dark marks on dark templates and
//       an ink chip for very light marks on light templates (this replaces
//       the old `brightness(0) invert(1)` hack)
//     * CORS-tainted canvas / probe failure → safe default (white chip)
// - onError → caller falls back to the typographic wordmark
type ChipMode = "none" | "light" | "dark";

const LUMA = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

export function LogoChip({
  src,
  alt,
  dark = false,
  className = "h-10",
  onError,
}: {
  src: string;
  alt: string;
  /** True when the template background is dark. */
  dark?: boolean;
  /** Height classes for the chip container (e.g. "h-10"). Width is capped internally. */
  className?: string;
  /** Called when the logo image fails to load — caller should fall back to a wordmark. */
  onError?: () => void;
}) {
  // Until the probe finishes, dark templates get a light chip so a
  // white-on-transparent mark is never invisible while loading.
  const [chip, setChip] = useState<ChipMode>(dark ? "light" : "none");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Sample with a separate crossOrigin probe so the visible <img> keeps
    // loading even when the host doesn't send CORS headers.
    const probe = new Image();
    probe.crossOrigin = "anonymous";
    probe.onload = () => {
      if (cancelled) return;
      try {
        const size = 48;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(probe, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        const at = (x: number, y: number) => {
          const i = (y * size + x) * 4;
          return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
        };
        // 4 corners + 4 edge midpoints
        const m = size >> 1;
        const edges = [
          at(1, 1), at(size - 2, 1), at(1, size - 2), at(size - 2, size - 2),
          at(m, 1), at(m, size - 2), at(1, m), at(size - 2, m),
        ];
        const opaqueEdges = edges.filter((p) => p.a > 200);
        if (opaqueEdges.length >= 6) {
          // The image carries its own background (photo/JPEG box). Frame it
          // on a white chip so it reads as a deliberate card either way.
          setChip("light");
          return;
        }
        // Transparent-ish mark: average luminance of the visible pixels.
        let sum = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 16) {
          if (data[i + 3] > 96) {
            sum += LUMA(data[i], data[i + 1], data[i + 2]);
            n++;
          }
        }
        const avg = n > 0 ? sum / n : 0.5;
        if (dark) {
          // Dark mark on a dark template needs a light plate; anything with
          // enough brightness sits directly on the template.
          setChip(avg < 0.35 ? "light" : "none");
        } else {
          // Very light mark on a light template needs an ink plate.
          setChip(avg > 0.82 ? "dark" : "none");
        }
      } catch {
        // Tainted canvas or read failure — a white chip is safe on any bg.
        setChip("light");
      }
    };
    probe.onerror = () => {
      // CORS-blocked probe: the visible <img> may still render fine.
      if (!cancelled) setChip("light");
    };
    probe.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, dark]);

  if (failed) return null;

  const chipStyle =
    chip === "light"
      ? {
          background: "#ffffff",
          border: "1px solid rgba(15,23,42,0.10)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
        }
      : chip === "dark"
        ? {
            background: "rgba(15,23,42,0.92)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          }
        : {};

  return (
    <span
      className={`inline-flex max-w-[10rem] items-center justify-center overflow-hidden rounded-lg ${chip !== "none" ? "px-2 py-1" : ""} ${className}`}
      style={chipStyle}
    >
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain"
        loading="lazy"
        onError={() => {
          setFailed(true);
          onError?.();
        }}
      />
    </span>
  );
}
