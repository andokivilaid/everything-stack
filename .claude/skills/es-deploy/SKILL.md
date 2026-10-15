---
name: es-deploy
description: Deploy an Everything Stack app to production on Vercel or Cloudflare — Convex cloud production, Clerk production instance, live billing keys, env vars and domains. Use for "deploy", "go live", "ship to production", "put it on Vercel/Cloudflare".
---

# es-deploy

Production is never zero-signup: every layer needs a claimed account. Walk the user through it
in this order, running every command yourself and pausing only for browser approvals.

## Pre-flight

```bash
npm run verify && npm run test:e2e
npx clerk@latest auth login                 # claim the accountless Clerk app
npx convex login                            # Convex account (not in Stripe Projects)
```

## 1. Convex production

```bash
npx convex deploy                           # creates/updates the prod deployment
npx convex env set --prod CLERK_JWT_ISSUER_DOMAIN https://<prod-frontend-api>
npx convex env set --prod CLERK_SECRET_KEY <prod secret via clerk env pull — do not print>
npx convex env set --prod CONVEX_SERVER_SECRET <new random value>
npx convex env set --prod BILLING_MODE stripe
```

Generate a **production deploy key** in the Convex dashboard for the host's build
(`CONVEX_DEPLOY_KEY`); the build command becomes `npx convex deploy --cmd 'npm run build'`.

## 2a. Vercel

Provision via es-provision (`stripe projects add vercel/project`), then use the official
`deploy-to-vercel` / `vercel-cli-with-tokens` skills or the Vercel MCP:
- Build command: `npx convex deploy --cmd 'npm run build'`
- Env: `CONVEX_DEPLOY_KEY`, Clerk prod keys, `CONVEX_SERVER_SECRET` (same as on Convex),
  `BILLING_MODE`, live `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (or Polar), PostHog key,
  `NEXT_PUBLIC_APP_URL=https://<domain>`.
- Domain: add the custom domain, then add it to the Clerk production instance.

## 2b. Cloudflare

Provision via es-provision (`stripe projects add cloudflare/worker`). Next.js runs on Workers via
OpenNext — follow the official `nextjs-on-cloudflare` and `wrangler` skills
(`npm i -D @opennextjs/cloudflare wrangler`, `wrangler.jsonc`, `opennextjs-cloudflare build && deploy`).
Same env vars as Vercel, set with `wrangler secret put`.

## 3. Webhooks

Stripe: live endpoint `https://<domain>/api/webhooks/stripe`, events `customer.subscription.created|updated|deleted`.
Polar: endpoint `https://<domain>/api/webhooks/polar`, events `subscription.*`.

## 4. Smoke test production

`curl https://<domain>/api/health` (all `configured: true`, billing mode correct), sign up, upgrade
with a real card in test mode first, check `/admin`. Use the `convex-launch-readiness` skill.
