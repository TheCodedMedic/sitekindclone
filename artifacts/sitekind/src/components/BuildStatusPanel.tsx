import { useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";

import { backendReady } from "@/lib/demoApi";

const BUILD_SHA = typeof __BUILD_SHA__ !== "undefined" ? __BUILD_SHA__ : "dev";
const BUILD_TIME = typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : "";

function shortSha(sha: string) {
  return sha === "dev" ? "dev" : sha.slice(0, 7);
}

function formatTime(iso: string) {
  if (!iso) return "unknown";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function environmentLabel(host: string) {
  if (host.startsWith("id-preview--") || host.includes("--dev.lovable.app")) return "preview";
  if (host === "localhost" || host.startsWith("127.")) return "local";
  return "production";
}

export function BuildStatusPanel() {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [host, setHost] = useState("");
  const [connected, setConnected] = useState(true);
  const [time, setTime] = useState("");

  useEffect(() => {
    setHost(window.location.hostname);
    setConnected(backendReady());
    setTime(formatTime(BUILD_TIME));
  }, []);

  if (dismissed) return null;

  const env = host ? environmentLabel(host) : "…";
  const sha = shortSha(BUILD_SHA);


  const copyPayload = [
    `build: ${sha}`,
    `built: ${BUILD_TIME || "unknown"}`,
    `env:   ${env}`,
    `host:  ${host}`,
    `gate:  ${connected ? "backend connected" : "backend NOT connected"}`,
  ].join("\n");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto mt-4 max-w-4xl px-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground shadow-sm">
        <span className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              connected ? "bg-emerald-500" : "bg-red-500"
            }`}
            aria-hidden
          />
          <span className="font-medium text-foreground">
            {connected ? "Backend connected" : "Backend NOT connected"}
          </span>
        </span>

        <span className="hidden h-4 w-px bg-border sm:inline-block" aria-hidden />

        <span>
          build{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
            {sha}
          </code>
        </span>
        <span>
          built <span className="text-foreground">{time}</span>
        </span>
        <span>
          env <span className="text-foreground">{env}</span>
        </span>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-foreground transition hover:bg-muted"
            aria-label="Copy build info"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="inline-flex items-center rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
