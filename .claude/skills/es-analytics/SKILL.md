---
name: es-analytics
description: Set up analytics for an Everything Stack app — the built-in first-party analytics (Convex), PostHog via Stripe Projects, or Mixpanel/Amplitude — and custom events and admin charts. Use for "add analytics", "connect PostHog", "track an event", "add a chart to admin".
---

# es-analytics

## First-party (always on, zero-signup)

- `src/components/app/analytics.tsx` tracks a `pageview` on every route change via
  `analytics.track` (cookie-less, session-scoped anonymous ID).
- `convex/analytics.ts`: `track` only accepts names in `ALLOWED_EVENTS`; `overview` (admin-only)
  powers the admin dashboard (14-day series, users, paying customers, MRR, top pages).
- Signups are recorded server-side in `users.upsert`; `checkout_started` in `useCheckout`.

Add an event: add its name to `ALLOWED_EVENTS`, call `track({ name, props })` from the UI, and
(optionally) add it to `overview` and the admin page.

## PostHog (one Stripe approval)

```bash
stripe projects add posthog/analytics --no-interactive --auto-confirm --accept-tos --json
stripe projects env --pull
stripe projects env --json       # find the project API key variable NAME
```

The app reads `NEXT_PUBLIC_POSTHOG_KEY` (+ optional `NEXT_PUBLIC_POSTHOG_HOST`). If Stripe
Projects names it differently, map it in `next.config.ts` (`env: { NEXT_PUBLIC_POSTHOG_KEY: process.env.<NAME> }`)
— the PostHog project key is a public, browser-safe key. Don't copy secrets between files.

`analytics.tsx` initialises PostHog when the key exists and sends `$pageview` alongside the
first-party event. For identify, call `posthog.identify(userId, { email })` after sign-in.
The PostHog MCP (`posthog` in `.mcp.json`) lets you create dashboards and insights for the user.

## Mixpanel / Amplitude

Provision with es-provision, `npm i mixpanel-browser` / `@amplitude/analytics-browser`, initialise
next to PostHog in `analytics.tsx`, gated on the key's presence. Keep first-party tracking.

## Verify

`npm run verify` asserts the admin overview returns data. Open `/admin` as an admin to see charts.
