# Walkthrough: what the agent does

This is what a typical `/everything` session looks like, step by step.

## 1. Interview

The agent asks one round of questions (two prompts of up to four questions):

1. What are you building? *("Courtside — court booking for squash clubs")*
2. Hosting — **Vercel** · Cloudflare · decide later
3. Framework — **Next.js** · TanStack Start · React Router · Vite SPA
4. Database — **Convex local** · Convex cloud · Supabase/Neon/Turso
5. Auth — **Clerk accountless** · Clerk B2B · WorkOS/Auth0
6. Billing — **Stripe** · Polar · demo only
7. Analytics — **first-party + PostHog** · Mixpanel · Amplitude
8. Admin emails (optional)

"Defaults" accepts everything in bold. Choices that require porting code get one confirmation.

## 2. Config

The answers go into `everything.config.json`. `npm run config:apply` regenerates
`src/config/stack.ts` (the stack drawn on the landing page) and the product name, tagline and
description in `src/config/site.ts`. The agent then writes real copy for your product: features,
FAQ, plan names and prices.

## 3. Zero-signup setup

`npm run setup`:

1. installs dependencies and the official vendor skills for your stack
2. creates an accountless Clerk app → keys in `.env.local`
3. decides the billing mode (Stripe test key from your Stripe CLI login, or demo)
4. configures an anonymous local Convex backend
5. sets Convex env: Clerk issuer + secret, server secret, billing mode, admin emails
6. pushes the Convex functions with auth enabled

## 4. Real providers (only what you chose)

- **Stripe Projects** (`es-provision`): `stripe projects init` (one browser approval), then
  `stripe projects add vercel/project`, `posthog/analytics`, … — credentials sync to `.env`.
- **Polar** (`es-billing`): Polar sandbox MCP creates products; you create one access token in the
  sandbox dashboard and store it with `npm run env:set -- POLAR_ACCESS_TOKEN`.
- **Design** (`es-design`): tokens and copy tuned to your brand, checked for contrast in light and dark.

## 5. Proof

```text
npm run verify
  ✓ Convex codegen  ✓ TypeScript  ✓ ESLint  ✓ next build
  ✓ GET / → 200  ✓ /pricing  ✓ /sign-in  ✓ /sign-up  ✓ /dashboard is protected
  ✓ /api/health: auth, database, server secret configured
  ✓ Real Clerk session token accepted by Convex
  ✓ Verified profile synced  ✓ Items CRUD  ✓ Free-plan limit  ✓ Checkout  ✓ Admin analytics
npm run test:e2e
  ✓ landing (desktop + mobile)  ✓ pricing  ✓ protected routes
  ✓ sign in through Clerk's UI → add items → upgrade → admin
```

## 6. Report

The agent ends with a table of every layer, what's real versus simulated, the command to run
(`npm run dev`), and the single next step that makes it more real.
