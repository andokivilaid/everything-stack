---
name: es-verify
description: Verify an Everything Stack app actually works — static checks, production build, the live auth→database→billing→admin round trip with a real Clerk session, and Playwright browser e2e — and diagnose failures. Use after any change, before reporting success, or when the user says "test it", "does it work", "something's broken".
---

# es-verify

## Commands

```bash
npm run doctor        # read-only: toolchain, env presence, agent tooling (no secrets printed)
npm run verify:quick  # convex codegen, next typegen + tsc, eslint
npm run verify        # + next build + live e2e against `next start` and Convex
npm run test:e2e      # Playwright: public pages (desktop + mobile), real sign-in, items, upgrade, admin
```

`npm run verify` live checks (no browser): public pages 200, protected `/dashboard` redirects,
`/api/health` integrations, then it creates a throwaway Clerk user via the Backend API, mints a real
session token and drives Convex with it — profile sync, items CRUD, free-plan limit, checkout
(demo: activation; stripe/polar: a real checkout URL), admin analytics — and deletes the user.

`npm run test:e2e` signs in through Clerk's real UI with a sign-in ticket
(`/sign-in?__clerk_ticket=…`), so it exercises the browser auth flow end to end. Screenshots land
in `test-results/screens/`.

## Diagnosing

| Symptom | Cause → fix |
|---|---|
| Convex: "Local backend did not start" | `TZ` is set → run via npm scripts / `env -u TZ` |
| Convex: "A local backend is still running on port 3210" | Stop the old `convex dev` (or let `npm run dev` own it) |
| Convex: "CLERK_JWT_ISSUER_DOMAIN … not set" | Run `npm run setup` (sets Convex env, then pushes) |
| Dashboard says the session isn't reaching the database | Issuer mismatch → `npm run setup`; check `npx convex env list` (names only) |
| Build: "URL data … outside of `<Suspense>`" | Wrap the component reading pathname/search params in `<Suspense>` |
| Build: `Cannot find name 'LayoutProps'` | Run `next typegen` (part of `npm run typecheck`) |
| Profile has no email/name | `CLERK_SECRET_KEY` missing on Convex → `npm run setup` |
| Upgrade button sends signed-in user to sign-up | Clicked before Clerk loaded — buttons are disabled until `isLoaded`; don't remove that |
| Stripe checkout 500 | `STRIPE_SECRET_KEY` invalid or `BILLING_MODE` mismatch between Next and Convex → `npm run setup` |

Fix causes, not tests. Re-run until green, and report the counts you saw.
