---
name: es-auth
description: Manage authentication for an Everything Stack app — Clerk accountless dev apps, claiming the app, B2B organizations and roles, production instances, or porting to WorkOS/Auth0. Use for "claim my Clerk app", "add organizations", "add teams", "SSO", "make auth production-ready", or a non-Clerk auth choice.
---

# es-auth

Reference: **Clerk** (`@clerk/nextjs` v7, Core 3). Official skills `clerk-setup`, `clerk-cli`,
`clerk-nextjs-patterns`, `clerk-orgs`, `clerk-webhooks`, `clerk-testing` are installed — they are
authoritative for Clerk APIs.

## How it's wired

- `src/app/layout.tsx` — `<ClerkProvider>`.
- `src/proxy.ts` — `clerkMiddleware`; `/dashboard(.*)` and `/admin(.*)` call `auth.protect()`.
  (Next.js 16 renamed middleware to *proxy*.)
- `src/app/sign-in|sign-up/[[...]]` — Clerk components inside `<Suspense>` (required by Cache Components).
- Marketing header reads auth state client-side (`useAuth`) so marketing pages stay static.
- Clerk → Convex: default session token, no JWT template (see es-database).
- Core 3 removed `<SignedIn>/<SignedOut>`; use `<Show when="signed-in">` or `useAuth()`.

## Accountless (default)

`npm run setup` runs `npx clerk@latest init --accountless --no-skills -y --framework next --pm npm --template b2c-saas`.
It writes dev keys to `.env.local` and a claim token to `.clerk/keyless.json` (gitignored).
Re-running is safe: it keeps the existing unclaimed app (use `--fresh` to replace it).

## Claim (one browser approval)

```bash
npx clerk@latest auth login     # attaches the unclaimed app to the user's account
npx clerk@latest env pull       # optional: refresh keys
```

Claim before sharing the app with real users — unclaimed apps are development-only.

## B2B / teams

Set `auth.clerkTemplate: "b2b-saas"` (fresh app: `npx clerk@latest init --accountless --fresh --template b2b-saas`),
then follow `clerk-orgs`: `<OrganizationSwitcher>` in `AppShell`, org-scoped Convex data
(`orgId` from `useAuth()` → pass to mutations; validate membership server-side), roles via `has()`.
The Convex provider already refreshes tokens when `orgId`/`orgRole` change.

## Production

1. Claim the app; create a production instance in Clerk with the user's domain (`clerk-cli`).
2. Production keys on the host via es-deploy (`npx clerk@latest env pull --instance prod`).
3. Set `CLERK_JWT_ISSUER_DOMAIN` on the **production** Convex deployment to the production
   Frontend API URL, and `CLERK_SECRET_KEY` to the production secret.
4. Optional: `clerk-webhooks` for `user.deleted` → delete Convex user data.

## Porting to WorkOS / Auth0

Provision via es-provision. Replace `ClerkProvider`, `proxy.ts`, sign-in pages and
`useClerkAuthForConvex` (Convex needs `fetchAccessToken` returning the provider's JWT), and
update `convex/auth.config.ts` issuer/JWKS. Keep `users.sync` but fetch the profile from the new
provider's API. Requires an account (no accountless mode).
