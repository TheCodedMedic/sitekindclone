import { useCallback, useEffect, useRef, useState } from "react";
import { callScript, RING_AUDIO, type CallLine } from "@/lib/data/callScript";

export type CallPlaybackState = "idle" | "ringing" | "active" | "ended";

export type CallPlayback = {
  state: CallPlaybackState;
  /** Index of the line currently (or last) played; -1 before the first line. */
  lineIndex: number;
  /** The line currently (or last) shown; null before the first line. */
  currentLine: CallLine | null;
  /** Who is speaking right now, or null between lines / when stopped. */
  speaking: CallLine["who"] | null;
  /** True when audio failed and we degraded to timed-text playback. */
  textOnly: boolean;
  /** Elapsed seconds while the call is active. */
  seconds: number;
  start: () => void;
  stop: () => void;
};

/**
 * The single playback engine for the canonical Ava demo call:
 * plays the US ringback (RING_AUDIO), then the 15 pre-minted Grok lines
 * from callScript in order. If ring or a line's mp3 can't load/play,
 * it degrades to timed text so the demo never breaks.
 *
 * Used by AudioCallDemo (full transcript UI) and the homepage hero card
 * (compact inline player) so both surfaces share one sequencing engine.
 */
export function useCallPlayback(onLine?: (line: CallLine, index: number) => void): CallPlayback {
  const [state, setState] = useState<CallPlaybackState>("idle");
  const [lineIndex, setLineIndex] = useState(-1);
  const [speaking, setSpeaking] = useState<CallLine["who"] | null>(null);
  const [textOnly, setTextOnly] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aliveRef = useRef(0); // increments to cancel in-flight sequences
  const onLineRef = useRef(onLine);
  onLineRef.current = onLine;

  const cleanup = useCallback(() => {
    aliveRef.current++;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, []);

  const playLine = useCallback((i: number, run: number) => {
    if (aliveRef.current !== run) return;
    if (i >= callScript.length) {
      setSpeaking(null);
      setState("ended");
      return;
    }
    const line = callScript[i];
    setLineIndex(i);
    setSpeaking(line.who);
    onLineRef.current?.(line, i);
    const next = () => {
      if (aliveRef.current !== run) return;
      setSpeaking(null);
      timerRef.current = setTimeout(() => playLine(i + 1, run), 420);
    };
    const a = new Audio(line.audio);
    audioRef.current = a;
    a.onended = next;
    a.onerror = () => {
      setTextOnly(true);
      timerRef.current = setTimeout(next, line.ms);
    };
    void a.play().catch(() => {
      setTextOnly(true);
      timerRef.current = setTimeout(next, line.ms);
    });
  }, []);

  const start = useCallback(() => {
    cleanup();
    const run = aliveRef.current;
    setLineIndex(-1);
    setSeconds(0);
    setTextOnly(false);
    setSpeaking(null);
    setState("ringing");
    const ring = new Audio(RING_AUDIO);
    audioRef.current = ring;
    const begin = () => {
      if (aliveRef.current !== run) return;
      setState("active");
      playLine(0, run);
    };
    ring.onended = begin;
    ring.onerror = () => {
      timerRef.current = setTimeout(begin, 2400);
    };
    void ring.play().catch(() => {
      timerRef.current = setTimeout(begin, 2400);
    });
  }, [cleanup, playLine]);

  const stop = useCallback(() => {
    cleanup();
    setSpeaking(null);
    setState("ended");
  }, [cleanup]);

  // Elapsed-time ticker while the call is live.
  useEffect(() => {
    if (state !== "active") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  // Kill audio + timers on unmount.
  useEffect(() => () => cleanup(), [cleanup]);

  return {
    state,
    lineIndex,
    currentLine: lineIndex >= 0 ? callScript[lineIndex] : null,
    speaking,
    textOnly,
    seconds,
    start,
    stop,
  };
}
