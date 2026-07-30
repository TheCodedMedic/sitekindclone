// Kill-switch service worker.
//
// The previous vite-plugin-pwa worker was broken (precache pointed at
// client/-prefixed paths that 404, and createHandlerBoundToURL("/") threw on
// evaluation), so browsers that installed an earlier worker could NEVER
// receive an update and were pinned to a stale app shell forever.
//
// This worker evaluates cleanly, so the browser's byte-diff update check
// accepts it. It then deletes every cache, unregisters itself, and reloads
// its clients onto the live network-served app. Do NOT re-enable PWA
// caching without keeping this deployed for several weeks first.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (e) {
        /* cache cleanup is best-effort */
      }
      try {
        await self.registration.unregister();
      } catch (e) {
        /* already gone */
      }
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        try {
          await client.navigate(client.url);
        } catch (e) {
          /* client may have closed */
        }
      }
    })(),
  );
});
