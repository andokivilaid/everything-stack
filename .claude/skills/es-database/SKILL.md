---
name: es-database
description: Set up, upgrade or swap the Everything Stack database layer — Convex local (no account), Convex cloud, or porting to Supabase/Neon/Turso. Use when changing database mode, adding tables or functions, moving Convex to the cloud, or the user picks a non-Convex database.
---

# es-database

The reference app uses **Convex**: schema in `convex/schema.ts`, functions in `convex/*.ts`,
generated types in `convex/_generated/` (never edit). Official skills `convex`,
`convex-quickstart`, `convex-env`, `convex-reviewer`, `convex-launch-readiness` are installed —
use them for API details.

## Data model

| Table | Purpose |
|---|---|
| `users` | Synced from Clerk by `users.sync` (action → Clerk Backend API for verified email/name). First user is admin; `ADMIN_EMAILS` grants admin. |
| `subscriptions` | Written by `billing.syncSubscription` (server secret) or `billing.demoCheckout`. |
| `items` | Demo resource with a free-plan limit (5). Replace with the user's real domain model. |
| `events` | First-party analytics (`analytics.track`), read by `analytics.overview` for admin. |

Auth: `convex/auth.config.ts` validates Clerk's **default** session token (customJwt, RS256,
JWKS from `CLERK_JWT_ISSUER_DOMAIN`). No Clerk JWT template is needed — that's what makes
accountless Clerk work.

## Modes

**Local (default, zero-signup)** — `npm run setup` runs `CONVEX_AGENT_MODE=anonymous npx convex dev`.
Data lives in `~/.convex/anonymous-convex-backend-state/`. Requires `TZ` unset (scripts handle it).

**Cloud** — when the user wants a hosted dev deployment or is heading to production:

```bash
npx convex login                                   # one browser approval
npx convex dev --once --configure new              # creates project + dev deployment, rewrites .env.local
npm run setup                                       # re-applies Convex env vars to the new deployment
```

Re-running setup is required: env vars (`CLERK_JWT_ISSUER_DOMAIN`, `CLERK_SECRET_KEY`,
`CONVEX_SERVER_SECRET`, `BILLING_MODE`, `ADMIN_EMAILS`) are per deployment.

## Adding the user's domain model

1. Add tables to `convex/schema.ts` with indexes for every query pattern (`withIndex`, not `filter`).
2. Write queries/mutations that start with `requireUser` / `requireAdmin` from `convex/lib.ts`.
3. Check ownership on every document access (`doc.userId === user._id`).
4. Use the `convex-reviewer` skill on the diff.
5. `npm run verify`.

## Porting to another database (Supabase / Neon / Turso / Prisma)

Provision with es-provision. Then port in this order, keeping routes and UI unchanged:
1. Schema → SQL migrations with the same tables/columns and indexes.
2. `convex/*.ts` functions → server actions / route handlers in `src/server/` with the same
   names and authorization checks (Clerk `auth()` on the server).
3. Replace `useQuery`/`useMutation` with server components + server actions (or TanStack Query).
   Realtime: Supabase Realtime, or polling.
4. Remove `convex/`, `ConvexClientProvider`, Convex scripts; update `scripts/verify.mjs` to hit the
   new endpoints.
5. `npm run verify` and `npm run test:e2e` must pass.

Tell the user this removes the zero-signup local database (the provider needs an account via Stripe Projects).
