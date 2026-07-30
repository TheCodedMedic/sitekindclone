---
name: Testing the Expo mobile app
description: How to point browser/e2e testers at the Expo web app; known false positives
---
- The Expo artifact bypasses the shared proxy. Testers must open `https://$REPLIT_EXPO_DEV_DOMAIN/` directly; `/mobile/` on the regular dev domain returns 502/blank.
- Run `pnpm install` at repo root if the expo workflow fails with "Command 'expo' not found".
- False positives to expect from Playwright-style testers on react-native-web: (1) field placeholders (e.g. "Jordan Smith", "you@business.com") look like leftover values after a form reset — check input VALUES; (2) RN Pressable `disabled` doesn't expose a strong DOM disabled state, but presses are still blocked — verify by clicking, not by attribute.
