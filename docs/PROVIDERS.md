# Providers

The authoritative, agent-facing matrix is
[`.claude/skills/everything-stack/references/provider-matrix.md`](../.claude/skills/everything-stack/references/provider-matrix.md).
This page explains it for humans.

## Three tiers of effort

**Zero-signup** — works the moment you run `npm run setup`:
Next.js, Convex local backend, Clerk accountless app, demo billing, first-party analytics.

**One approval** — a CLI prints a URL, you approve in the browser once:
Stripe test mode (`stripe login`), Stripe Projects (hosting, PostHog and 60+ providers),
Convex cloud (`npx convex login`), claiming Clerk (`npx clerk auth login`), Polar sandbox.

**Port** — the reference app's code must be adapted: other frameworks, databases or auth
providers. The component skills include porting guides; the agent confirms before starting.

## Stripe Projects

[Stripe Projects](https://projects.dev) provisions services in accounts **you** own, stores
credentials in an encrypted vault and syncs them to `.env`. One Stripe login covers every
provider. Everything Stack uses it for hosting (Vercel, Cloudflare, Netlify…), analytics
(PostHog, Mixpanel, Amplitude) and optional extras (Resend, Upstash, Supabase, Neon…).

Convex and Polar are not in its catalog, so they use their own CLI/MCP.

Browse: `stripe projects catalog` or https://projects.dev/providers.

## Production

Zero-signup accounts are for development. Going live means a claimed Clerk app with a production
instance, a Convex cloud production deployment, live payment keys and a host — see
[DEPLOYMENT.md](DEPLOYMENT.md).
