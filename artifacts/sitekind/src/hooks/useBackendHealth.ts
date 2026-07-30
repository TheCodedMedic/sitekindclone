import { useCallback, useEffect, useRef, useState } from "react";
import { checkBackendHealth, type BackendHealth } from "@/lib/demoApi";

const POLL_MS = 30_000;

export function useBackendHealth() {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const inflight = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    setChecking(true);
    try {
      const result = await checkBackendHealth(ctrl.signal);
      if (ctrl.signal.aborted) return;
      setHealth(result);
      setLastCheckedAt(Date.now());
    } finally {
      if (inflight.current === ctrl) setChecking(false);
    }
  }, []);

  useEffect(() => {
    void run();
    const id = setInterval(() => void run(), POLL_MS);
    const onFocus = () => void run();
    const onOnline = () => void run();
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      inflight.current?.abort();
    };
  }, [run]);

  return { health, lastCheckedAt, checking, recheck: run };
}
