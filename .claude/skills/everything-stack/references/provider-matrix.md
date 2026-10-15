# Provider matrix (verified October 2026)

Legend — **Zero-signup**: works with no account. **One approval**: one browser
confirmation printed by a CLI. **Account**: the user needs an account first.
**Port**: the reference app's code must be adapted.

| Layer | Choice | Setup path | Signup | Port |
|---|---|---|---|---|
| Framework | Next.js 16 (App Router, Cache Components) | built in | Zero-signup | — |
| Framework | TanStack Start / React Router | rewrite routes; Clerk + Convex both supported | Zero-signup | Port |
| Framework | Vite SPA | `@clerk/react` + `convex/react` | Clerk account (no accountless for plain React) | Port |
| Database | Convex local | `CONVEX_AGENT_MODE=anonymous npx convex dev` | Zero-signup | — |
| Database | Convex cloud | `npx convex login` → `npx convex dev --configure new` | One approval | — |
| Database | Supabase / Neon / Turso / Prisma | `stripe projects add supabase/project` etc. | One approval (Stripe) | Port |
| Auth | Clerk accountless | `npx clerk@latest init --accountless` | Zero-signup | — |
| Auth | Clerk claimed | `npx clerk@latest auth login` (claims the same app) | One approval | — |
| Auth | WorkOS / Auth0 | `stripe projects add workos/auth` / `auth0/client` | One approval (Stripe) | Port |
| Billing | Demo | built in (`BILLING_MODE=demo`) | Zero-signup | — |
| Billing | Stripe test mode | `stripe login` → `npm run setup` reads the test key | One approval | — |
| Billing | Polar sandbox | Polar sandbox MCP (OAuth) → org + products; token created in sandbox dashboard, stored with `npm run env:set` | One approval + one token | — |
| Analytics | First-party | built in (Convex `events` table) | Zero-signup | — |
| Analytics | PostHog | `stripe projects add posthog/analytics` | One approval (Stripe) | — |
| Analytics | Mixpanel / Amplitude | `stripe projects add mixpanel/analytics` / `amplitude/analytics` | One approval (Stripe) | small: add SDK init in `analytics.tsx` |
| Hosting | Vercel | `stripe projects add vercel/project` | One approval (Stripe) | — |
| Hosting | Cloudflare | `stripe projects add cloudflare/worker` + OpenNext adapter | One approval (Stripe) | small: OpenNext config |

## Not in the Stripe Projects catalog

Convex and Polar are **not** Stripe Projects providers. Use their own CLIs/MCPs (above).
Always confirm the current catalog with `stripe projects catalog --json` — it changes often.

## Stripe Projects is one approval for many providers

The first `stripe projects init --accept-tos --yes --json` may return a browser pairing
handoff (`BROWSER_AUTH_REQUIRED`). Show the user the URL and code, wait, then retry the same
command. After that, every `stripe projects add …` is non-interactive. See es-provision.

## Production

Local zero-signup choices are for development. Production needs: a claimed Clerk app with a
production instance, a Convex cloud deployment (`npx convex deploy`), live payment keys, and a
host. es-deploy walks through it.
