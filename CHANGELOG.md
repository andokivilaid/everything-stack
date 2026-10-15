# Changelog

## Unreleased

### Added
- Reference app: Next.js 16 (Cache Components, `proxy.ts`), Convex, Clerk (Core 3), Stripe and
  Polar (SDK v1) billing with demo mode, first-party analytics + PostHog, admin dashboard.
- Zero-signup `npm run setup`: Clerk accountless app, Convex anonymous local backend, Clerk → Convex
  wiring without a JWT template, verified profile sync via the Clerk Backend API.
- `npm run verify`: 28 checks including a real Clerk session token driving Convex end to end.
- Playwright e2e (desktop + mobile) with real sign-in through Clerk's UI.
- Agent layer: `everything-stack` orchestrator + 9 component skills, `/everything` command,
  `.mcp.json` (9 servers), official vendor skill installer pinned by `skills-lock.json`.
- Docs, maintainer prompts, CI running the zero-signup path with no secrets.

### Verified
- 2026-10-15 — Linux, Node 22: clean-slate `npm run setup` (no accounts), `npm run verify`
  (28/28), `npm run test:e2e` (7/7). Billing in demo mode.

### Not yet verified
- Stripe test mode with a real Stripe account, Stripe Projects provisioning, Polar sandbox,
  Vercel and Cloudflare deploys, macOS/Windows, CI on GitHub. See `prompts/finalize-and-test.md`.
