---
name: es-provision
description: Provision hosted services for an Everything Stack app through Stripe Projects (Vercel, Cloudflare, PostHog, Supabase, Neon, Resend, Upstash and 60+ more) so credentials land in .env automatically. Use when the everything-stack skill needs hosting, analytics or any third-party service, or the user asks to "add a provider", "provision X", "get me an API key for X".
---

# es-provision — Stripe Projects

Stripe Projects creates real resources **in the user's own provider accounts**, stores
credentials in an encrypted vault and syncs them to `.env`. One Stripe login covers every
provider. The official `stripe-projects` skill (installed by `npm run skills`) is the
authoritative workflow — read it first; this skill adds the Everything Stack specifics.

## 1. CLI + plugin

```bash
which stripe && stripe --version || npm install -g @stripe/cli@latest
stripe plugin install projects
```

## 2. Init (once per repo)

```bash
stripe projects status --json || stripe projects init --accept-tos --yes --json
```

If init returns `BROWSER_AUTH_REQUIRED` with `details.reason: "handoff_prepared"`, show the user
`details.browser_url` and `details.verification_code`, wait for them to approve, then re-run the
**same** init command. Don't run a separate `stripe login`.

Init installs a local `stripe-projects-cli` skill (`.agents/skills/stripe-projects-cli` or
`.claude/skills/stripe-projects-cli`) — follow it for post-init commands.

## 3. Add services from the answers

Always confirm availability first: `stripe projects search <name> --json`.

| everything.config.json | Command |
|---|---|
| `hosting.provider: "vercel"` | `stripe projects add vercel/project --no-interactive --auto-confirm --accept-tos --json` |
| `hosting.provider: "cloudflare"` | `stripe projects add cloudflare/worker …` |
| `hosting.provider: "netlify"` | `stripe projects add netlify/project …` |
| `analytics.providers` has `posthog` | `stripe projects add posthog/analytics …` |
| `analytics.providers` has `mixpanel` | `stripe projects add mixpanel/analytics …` |
| `analytics.providers` has `amplitude` | `stripe projects add amplitude/analytics …` |
| `database.provider: "supabase"` | `stripe projects add supabase/project …` |
| `database.provider: "neon"` | `stripe projects add neon/postgres …` |
| transactional email (optional) | `stripe projects add resend/email …` |

Convex and Polar are **not** in the catalog — use es-database / es-billing.

## 4. Sync credentials

```bash
stripe projects env --pull          # writes .env (Stripe Projects' output file)
stripe projects env --json          # list variable NAMES — never print values
```

Next.js reads `.env.local` *and* `.env`, so synced vars work without copying. If a provider's
variable name differs from what the app reads (see `.env.example`), adapt the **code** to the
provider's name rather than copying secrets between files. Browser-exposed values must be
`NEXT_PUBLIC_`-prefixed; for a public value with another name, map it in `next.config.ts`:

```ts
env: { NEXT_PUBLIC_POSTHOG_KEY: process.env.POSTHOG_PROJECT_API_KEY },
```

## 5. Commit the right state

Commit `.projects/state.json` and `.projects/state.local.json`. Never commit `.projects/vault/`,
`.projects/cache/` or `.env*` (already in `.gitignore`).

## Rules

- Never read or edit `.projects/` directly; use the CLI.
- Never hand the user "go sign up at X" — check the catalog first.
- Report: provider, service, tier, env var **names**.
