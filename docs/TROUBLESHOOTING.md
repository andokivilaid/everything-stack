# Troubleshooting

Start with `npm run doctor`. It checks the toolchain, which variables exist (never their values)
and the agent tooling.

## Setup

**Convex: "Local backend did not start on port 3210"**
Convex's local backend requires UTC and refuses to start when `TZ` is set. The npm scripts unset
it. If you run Convex directly: `env -u TZ npx convex dev`.

**Convex: "A local backend is still running on port 3210"**
Another `convex dev` is running (often `npm run dev` in another terminal). Stop it, or leave it
running — `npm run setup` detects it and lets its watcher push changes.

**Convex: "Environment variable CLERK_JWT_ISSUER_DOMAIN is used in auth config file but its value was not set"**
Run `npm run setup`; it sets Convex env vars before pushing.

**Clerk init fails**
Needs network access to `api.clerk.com`. Re-run `npm run setup`. Existing keys are kept; to start
over with a fresh unclaimed app: `npx clerk@latest init --accountless --fresh`.

## Running

**Dashboard says the session isn't reaching the database**
The Clerk issuer on Convex doesn't match your keys (e.g. you changed Clerk apps). `npm run setup`.

**Users have no email or name in admin**
`CLERK_SECRET_KEY` isn't set on Convex. `npm run setup`.

**"Free plan is limited to 5 items"**
Working as designed. Upgrade from the billing page (demo mode activates instantly).

**Stripe checkout fails**
`npm run doctor` → check billing mode. Re-run `npm run setup` after `stripe login` so the test key
and `BILLING_MODE` are set in both places.

**Webhooks don't arrive locally**
`npm run dev -- --stripe` forwards them; store the `whsec_…` secret as `STRIPE_WEBHOOK_SECRET`.
Upgrades still work without webhooks thanks to the success-page sync.

## Building

**"Next.js encountered URL data … outside of `<Suspense>`"**
Cache Components is on. Wrap the component that reads `usePathname`/`useSearchParams`/cookies in
`<Suspense>`.

**`Cannot find name 'LayoutProps'`**
Run `npx next typegen` (included in `npm run typecheck` and `npm run verify`).

## Agent

**Vendor skills missing**
`npm run skills`. Everything Stack's own skills work without them.

**MCP server needs authentication**
Hosted servers (Clerk, Stripe, Polar, PostHog, Vercel) authenticate in the browser the first time
they're used. In Claude Code: `/mcp` → select → Authenticate.
