---
name: Pushing to the user's GitHub repo
description: gitPush helper fails against TheCodedMedic/sitekindclone; use the GitHub connector's Octokit client instead.
---

# Pushing files to the user's GitHub repo

The user's external repo is `TheCodedMedic/sitekindclone` (origin remote is set to it).

**Rule:** The `gitPush` callback fails with a generic `CLI_ERROR: UNKNOWN` even after the GitHub connection is attached to this repl; raw `git push` also fails auth (no local credentials). To put files in that repo, use the GitHub connection via `listConnections("github")` → `getClient()` (Octokit) and `repos.createOrUpdateFileContents` (base64 content, pass `sha` when updating).

**Why:** Verified 2026-07-30 — gitPush failed repeatedly while the Contents API worked first try (brand guide now at `docs/sitekind-brand/SKILL.md` on main).

**How to apply:** Any future "push/sync to my GitHub repo" request — go straight to the Octokit Contents API per file rather than retrying gitPush.
