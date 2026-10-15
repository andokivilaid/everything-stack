---
name: es-billing
description: Configure billing for an Everything Stack app — demo mode, Stripe test mode (from the Stripe CLI login), Polar sandbox, webhooks, plans and prices, and going live. Use for "set up payments", "connect Stripe", "use Polar", "add a plan", "webhooks", "billing isn't working".
---

# es-billing

One checkout flow, three modes, chosen by `BILLING_MODE` (in `.env.local` **and** on Convex):

| Mode | When | Checkout |
|---|---|---|
| `demo` | default, no provider | `billing.demoCheckout` mutation activates the plan instantly |
| `stripe` | `STRIPE_SECRET_KEY` present | Stripe Checkout (inline `price_data`, no catalog setup) |
| `polar` | `POLAR_ACCESS_TOKEN` + product IDs | Polar Checkout |

Code: `src/lib/billing/{stripe,polar}.ts`, `src/app/api/billing/{checkout,sync,portal}`,
`src/app/api/webhooks/{stripe,polar}`, `convex/billing.ts`. Plans and prices: `plans` in
`src/config/site.ts`. Subscription state is written to Convex only via
`billing.syncSubscription`, guarded by `CONVEX_SERVER_SECRET`.

The success page (`/dashboard/billing/success`) syncs from the provider directly, so upgrades
work locally **without** webhook forwarding. Webhooks keep renewals/cancellations in sync.

## Stripe test mode (one browser approval)

```bash
stripe login            # if not already logged in (Stripe Projects users already are)
npm run setup           # reads the test-mode key from the CLI config; sets BILLING_MODE=stripe everywhere
```

Webhooks locally:

```bash
npm run dev -- --stripe   # runs `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
```

The first `stripe listen` prints a `whsec_…` secret. Store it without echoing it into chat:
`stripe listen --print-secret` → write to `.env.local` as `STRIPE_WEBHOOK_SECRET`
(e.g. `echo "STRIPE_WEBHOOK_SECRET=$(stripe listen --print-secret)" >> .env.local`).

Test card: `4242 4242 4242 4242`, any future date, any CVC.
Follow `stripe-best-practices` for anything beyond this (tax, trials, proration).

## Polar sandbox

Polar is not in Stripe Projects. Use the official `setup-polar` and `polar-integration` skills.

1. Polar sandbox MCP (already in `.mcp.json` as `polar-sandbox`) — the user authenticates once
   in the browser. Create or select the organization, then create two recurring monthly products
   matching `plans` (Pro, Team). Note the product IDs.
2. Access token: Polar has no API to mint an organization access token, so the user creates one in
   the sandbox dashboard (Settings → Developers). Have them store it **without pasting into chat**:
   `npm run env:set -- POLAR_ACCESS_TOKEN`.
3. Write the non-secret IDs yourself: `POLAR_PRODUCT_ID_PRO`, `POLAR_PRODUCT_ID_TEAM`, `POLAR_SERVER=sandbox`.
4. Set `billing.provider: "polar"` in `everything.config.json`, then `npm run setup`.
5. Webhooks: `polar auth login --sandbox`, `polar listen --print-secret` → `POLAR_WEBHOOK_SECRET`,
   then `polar listen localhost:3000/api/webhooks/polar`. Verify with `polar trigger subscription.created`.

Polar SDK v1 note: import `createPolar` from `@polar-sh/sdk/2026-10`; models are **snake_case**.

## Going live

Live keys only in the host's environment (es-deploy), never in `.env.local`. Create a live webhook
endpoint for `https://<domain>/api/webhooks/stripe` (events: `customer.subscription.*`) or the
Polar equivalent, and set `BILLING_MODE` on the production Convex deployment.
