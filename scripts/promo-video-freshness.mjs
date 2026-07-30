#!/usr/bin/env node
/**
 * Guards against the homepage promo video going stale.
 *
 * The sitekind homepage embeds a static MP4 export of the promo video
 * artifact (artifacts/sitekind-promo-video). This script hashes the promo
 * video's source inputs and compares them against the manifest written at
 * export time (artifacts/sitekind/public/videos/sitekind-promo.manifest.json).
 *
 * Usage:
 *   node scripts/promo-video-freshness.mjs check    # exit 1 if export is stale
 *   node scripts/promo-video-freshness.mjs update   # rewrite manifest after a re-export
 *
 * Re-export recipe: .agents/memory/video-mp4-export.md
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const videoDir = path.join(root, "artifacts/sitekind-promo-video");
const outDir = path.join(root, "artifacts/sitekind/public/videos");
const manifestPath = path.join(outDir, "sitekind-promo.manifest.json");
const exportedFiles = ["sitekind-promo.mp4", "sitekind-promo-poster.jpg"];

const IGNORE = new Set(["node_modules", "dist", ".cache"]);

function listSourceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (IGNORE.has(entry) || entry.endsWith(".tsbuildinfo")) continue;
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...listSourceFiles(full));
    else out.push(full);
  }
  return out.sort();
}

function computeSourceHash() {
  const hash = createHash("sha256");
  for (const file of listSourceFiles(videoDir)) {
    hash.update(path.relative(root, file));
    hash.update("\0");
    hash.update(readFileSync(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

const mode = process.argv[2];
const sourceHash = computeSourceHash();

if (mode === "update") {
  for (const f of exportedFiles) {
    if (!existsSync(path.join(outDir, f))) {
      console.error(`Missing exported file: ${f} — run the re-export first.`);
      process.exit(1);
    }
  }
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        sourceHash,
        sourceDir: "artifacts/sitekind-promo-video",
        exportedFiles,
        exportedAt: new Date().toISOString(),
        note: "Written by scripts/promo-video-freshness.mjs update after re-exporting the promo MP4. Do not edit by hand.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`Manifest updated: sourceHash=${sourceHash.slice(0, 12)}…`);
} else if (mode === "check") {
  if (!existsSync(manifestPath)) {
    console.error(
      "STALE: no export manifest found. Re-export the promo MP4 (see .agents/memory/video-mp4-export.md), then run: node scripts/promo-video-freshness.mjs update",
    );
    process.exit(1);
  }
  for (const f of exportedFiles) {
    if (!existsSync(path.join(outDir, f))) {
      console.error(`STALE: exported file missing: artifacts/sitekind/public/videos/${f}`);
      process.exit(1);
    }
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.sourceHash !== sourceHash) {
    console.error(
      [
        "STALE: the promo video sources (artifacts/sitekind-promo-video) changed since the homepage MP4 was exported.",
        "The homepage is still showing the old video.",
        "Fix: re-export the MP4 + poster into artifacts/sitekind/public/videos/",
        "(headless recipe: .agents/memory/video-mp4-export.md), then run:",
        "  node scripts/promo-video-freshness.mjs update",
      ].join("\n"),
    );
    process.exit(1);
  }
  console.log("Homepage promo video export is up to date with the promo video sources.");
} else {
  console.error("Usage: node scripts/promo-video-freshness.mjs <check|update>");
  process.exit(1);
}
