---
name: Demo wizard dev-environment limits
description: Why the sitekind /demo wizard can't complete end-to-end in dev, and what "correct" looks like there.
---

- The web demo wizard's backend (`/api/demo/*`, SSE research run) is NOT served by artifacts/api-server; it lives in external Supabase edge functions (legacy copies in `.migration-backup/supabase/functions/`). In dev it 404s.
- Cloudflare Turnstile's fallback sitekey does not allow the `.replit.dev` domain, so the wizard fails the bot check in dev with a visible "Bot check is misconfigured" error + Try again/Copy diagnostics. That visible error IS the expected dev behavior — not a silent failure, not fixable in-repo (Cloudflare allowlist).
- **How to apply:** when e2e-testing /demo in dev, assert the visible error state, not a successful run. The contact form (`POST /api/leads`) works fully locally.
- If `/api/leads` 500s with `relation "leads" does not exist`, the dev DB schema is stale: run `pnpm --filter @workspace/db run push`.
