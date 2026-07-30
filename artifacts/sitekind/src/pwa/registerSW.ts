// The ONLY place a service worker gets registered.
// Refuses registration in dev, iframes, and every Lovable preview host.
// A `?sw=off` query param unregisters any existing worker (kill switch).
//
// Do not import this file from anywhere except a client-only effect
// (e.g. useEffect in __root.tsx). Never import from route loaders or
// server code — service workers are browser-only.

const SW_PATH = "/sw.js";

function isPreviewOrDevHost(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;

  // Any iframe context (Lovable editor preview is always iframed).
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }

  const host = window.location.hostname;
  if (host.startsWith("id-preview--")) return true;
  if (host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;

  return false;
}

async function unregisterMatching(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL ?? r.installing?.scriptURL ?? r.waiting?.scriptURL ?? "";
          return url.endsWith(SW_PATH);
        })
        .map((r) => r.unregister()),
    );
  } catch {
    /* noop */
  }
}

export async function registerAppServiceWorker(): Promise<void> {
  if (typeof window === "undefined") return;

  // Kill switch: append ?sw=off to any URL to force unregister.
  const url = new URL(window.location.href);
  if (url.searchParams.get("sw") === "off") {
    await unregisterMatching();
    return;
  }

  // Never register in dev, iframe previews, or Lovable preview hosts.
  if (isPreviewOrDevHost()) {
    await unregisterMatching();
    return;
  }

  if (!("serviceWorker" in navigator)) return;

  try {
    await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[sw] registration failed", err);
  }
}
