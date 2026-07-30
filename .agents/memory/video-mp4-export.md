---
name: Agent-side MP4 export of video artifacts
description: How to export a video-js artifact to MP4 without the user's preview export button
---

Video artifacts (video-js stack) have no agent-side export callback — the preview UI owns export. To produce an MP4 yourself:

1. Install `chromium` as a Nix system dependency and `playwright-core` in a /tmp scratch dir (npm). Playwright needs its bundled ffmpeg for recordVideo: `npx playwright install ffmpeg`.
2. Launch chromium (`executablePath`, `--no-sandbox --autoplay-policy=no-user-gesture-required`), context with `recordVideo` 1280x720.
3. The artifact's `useVideoPlayer` hook calls `window.startRecording?.()` on mount and `window.stopRecording?.()` after one full pass. Stub those via `addInitScript` + `exposeFunction` to capture wall-clock markers; the non-iframed page renders the raw video (no control bar).
4. Trim the webm with ffmpeg using `startOffset = startMarker - contextCreate` and `duration = stop - start`, encode h264 yuv420p +faststart. Caveat: the webm's first frame lags contextCreate by ~0.5-1s, so that offset over-trims. Correct it: `firstFrameLag ≈ (contextCreate→close wall time) - ffprobe(webm duration)`, then `startOffset -= firstFrameLag`. Verify by ffprobing the final MP4 duration against the known loop length and extracting first/last frames. To add the audio track, mux the composite mp3 as a second input (`-map 0:v -map 1:a -c:a aac -shortest`). Both cut points are exactly one loop apart, so the `<video loop>` embed is seamless even if the offset is ~100ms off.

**Why:** needed when a task requires embedding an exported MP4 (e.g. homepage promo) and waiting on the user isn't acceptable.
**How to apply:** any "export/embed the video artifact as a file" request. Remember to uninstall chromium and delete `.cache/ms-playwright` after. The homepage embed is a static snapshot — re-export after promo video changes.

Staleness guard: `scripts/promo-video-freshness.mjs check` (registered as the `promo-video-fresh` validation step) hashes the promo video sources against the manifest next to the exported MP4. After any re-export, run `node scripts/promo-video-freshness.mjs update` to refresh the manifest, or the check fails.
