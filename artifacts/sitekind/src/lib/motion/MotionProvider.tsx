/**
 * Motion preference context for the whole site.
 *
 * Combines, with live listeners:
 *  - OS `prefers-reduced-motion` (matchMedia + change listener)
 *  - persisted visitor override (localStorage "sitekind-motion": "on" | "off";
 *    unset falls back to the OS preference)
 *  - pointer capability ("(pointer: fine)" + "(hover: hover)")
 *  - document visibility
 *
 * SSR contract: the server (and first client paint) renders with neutral
 * defaults — the real values arrive in a mount effect, mirroring the
 * ThemeToggle `mounted` pattern. First-paint flash is prevented by
 * <MotionScript/>, an inline pre-hydration script (mirroring ThemeScript)
 * that stamps `motion-off` on <html> so pure-CSS decorative animations are
 * gated before React loads.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  MOTION_OFF_CLASS,
  MOTION_STORAGE_KEY,
  persistOverride,
  readStoredOverride,
  resolveMotionOn,
  type MotionOverride,
} from "./motionPreference";

// Pure resolution/persistence logic lives in ./motionPreference (unit-tested
// in scripts/test-motion.mjs); re-exported here for existing consumers.
export { MOTION_OFF_CLASS, MOTION_STORAGE_KEY } from "./motionPreference";
export type { MotionOverride } from "./motionPreference";

export type MotionContextValue = {
  /** Final resolved switch: override wins, otherwise OS preference. */
  motionOn: boolean;
  /** Raw OS `prefers-reduced-motion: reduce` state. */
  reducedMotion: boolean;
  /** True only for fine-pointer + hover-capable devices (mouse/trackpad). */
  finePointer: boolean;
  /** Document visibility — false while the tab is hidden. */
  visible: boolean;
  /** The visitor's persisted override ("on" | "off" | null = OS default). */
  motionOverride: MotionOverride;
  /** Persist a new override; `null` returns to the OS default. */
  setMotionOverride: (value: MotionOverride) => void;
};

const defaultValue: MotionContextValue = {
  motionOn: true,
  reducedMotion: false,
  finePointer: false,
  visible: true,
  motionOverride: null,
  setMotionOverride: () => {},
};

const MotionContext = createContext<MotionContextValue>(defaultValue);

/** Read motion preferences anywhere below <MotionProvider>. */
export function useMotion(): MotionContextValue {
  return useContext(MotionContext);
}

/** matchMedia change listener with legacy-Safari fallback. */
function listenMql(mql: MediaQueryList, cb: () => void): () => void {
  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", cb);
    return () => mql.removeEventListener("change", cb);
  }
  // Older WebKit
  mql.addListener(cb);
  return () => mql.removeListener(cb);
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  // SSR-safe neutral defaults; corrected on mount.
  const [motionOverride, setOverrideState] = useState<MotionOverride>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Persisted override (readStoredOverride absorbs getItem throws; the
    // outer try guards `window.localStorage` access itself, e.g. blocked
    // cookies).
    try {
      setOverrideState(readStoredOverride(window.localStorage));
    } catch {
      // storage unavailable — stay on OS default
    }

    // OS reduced-motion, live
    const reduceMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduce = () => setReducedMotion(reduceMql.matches);
    syncReduce();
    const offReduce = listenMql(reduceMql, syncReduce);

    // Pointer capability, live (docking/undocking a mouse, convertibles)
    const fineMql = window.matchMedia("(pointer: fine)");
    const hoverMql = window.matchMedia("(hover: hover)");
    const syncPointer = () => setFinePointer(fineMql.matches && hoverMql.matches);
    syncPointer();
    const offFine = listenMql(fineMql, syncPointer);
    const offHover = listenMql(hoverMql, syncPointer);

    // Tab visibility
    const syncVisible = () =>
      setVisible(document.visibilityState !== "hidden");
    syncVisible();
    document.addEventListener("visibilitychange", syncVisible);

    return () => {
      offReduce();
      offFine();
      offHover();
      document.removeEventListener("visibilitychange", syncVisible);
    };
  }, []);

  const motionOn = resolveMotionOn(motionOverride, reducedMotion);

  // Keep the <html> class in sync so pure-CSS decorative animations are
  // gated too. (MotionScript stamps the first-paint value pre-hydration.)
  useEffect(() => {
    document.documentElement.classList.toggle(MOTION_OFF_CLASS, !motionOn);
  }, [motionOn]);

  const setMotionOverride = useCallback((value: MotionOverride) => {
    setOverrideState(value);
    try {
      persistOverride(window.localStorage, value);
    } catch {
      // storage unavailable — in-memory only
    }
  }, []);

  const value = useMemo<MotionContextValue>(
    () => ({
      motionOn,
      reducedMotion,
      finePointer,
      visible,
      motionOverride,
      setMotionOverride,
    }),
    [motionOn, reducedMotion, finePointer, visible, motionOverride, setMotionOverride],
  );

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

/**
 * Inline pre-hydration script (mirrors ThemeScript): stamps `motion-off` on
 * <html> before first paint so decorative CSS animations never flash for
 * visitors who turned motion off (or whose OS prefers reduced motion).
 * An explicit "on" override clears the class.
 */
export function MotionScript() {
  const code = `(function(){try{var v=localStorage.getItem('${MOTION_STORAGE_KEY}');var off=v==='off'||(v!=='on'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);var c=document.documentElement.classList;c.remove('${MOTION_OFF_CLASS}');if(off)c.add('${MOTION_OFF_CLASS}');}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
