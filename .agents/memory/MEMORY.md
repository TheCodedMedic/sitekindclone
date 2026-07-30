# Memory Index

- [Pushing to the user's GitHub repo](github-push.md) — gitPush fails with UNKNOWN; use the GitHub connector's Octokit `createOrUpdateFileContents` instead.

- [Agent-side MP4 export of video artifacts](video-mp4-export.md) — record the promo loop headlessly with playwright-core + nix chromium; homepage MP4 embed is a static snapshot; `promo-video-fresh` validation step catches stale exports — run the freshness script's `update` after re-export.
- [Demo wizard dev limits](demo-wizard-dev-limits.md) — /demo backend is external (404 in dev) and Turnstile blocks .replit.dev; assert visible error state, not success. Stale dev DB → run db push.
- [Testing the Expo mobile app](expo-testing.md) — testers must hit the Expo dev domain directly (not /mobile/); RN-web placeholder/disabled false positives.
