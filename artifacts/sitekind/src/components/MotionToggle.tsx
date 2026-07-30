import { useEffect, useState } from "react";
import { Zap, ZapOff } from "lucide-react";
import { useMotion } from "@/lib/motion/MotionProvider";
import { track } from "@/lib/motionAnalytics";

/**
 * Ambient-motion on/off switch, styled to sit beside ThemeToggle.
 * Defaults to the visitor's OS preference; an explicit choice is persisted
 * (localStorage "sitekind-motion") via MotionProvider.
 */
export function MotionToggle() {
  const { motionOn, setMotionOverride } = useMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggle() {
    const next = !motionOn;
    setMotionOverride(next ? "on" : "off");
    track("motion_toggle_changed", { motion: next ? "on" : "off" });
  }

  const label = motionOn ? "Turn ambient motion off" : "Turn ambient motion on";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={mounted ? motionOn : undefined}
      aria-label={label}
      title={mounted ? label : "Toggle ambient motion"}
      className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--card-border)] text-ink-2 transition-colors hover:text-ink"
    >
      {mounted && !motionOn ? (
        <ZapOff size={18} aria-hidden />
      ) : (
        <Zap size={18} aria-hidden />
      )}
    </button>
  );
}
