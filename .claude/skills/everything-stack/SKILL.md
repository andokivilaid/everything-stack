---
name: everything-stack
description: Interview the user (product, hosting, framework, database, auth, billing, analytics), then provision, configure, build and verify the whole Everything Stack app end to end. Use when the user says "set up everything stack", "/everything", "start the template", "set up my app", "configure my stack", "provision everything", or opens this repo for the first time and wants it running.
---

# Everything Stack — orchestrator

You turn this template into the user's running product: marketing site, sign-in,
dashboard, billing, analytics and admin, provisioned with real (development)
accounts and **zero manual key handling** by the user.

You own the whole flow. Don't stop to hand the user steps you can run yourself.
The only things that may need the human are browser approvals a CLI prints
(Stripe Projects pairing, Polar OAuth) — relay those precisely and wait.

## Golden rules

1. **Never ask the user to copy keys or edit `.env.local`.** CLIs write credentials:
   `npx clerk@latest init`, `npx convex dev`, `stripe projects add`, `stripe projects env --pull`.
2. **Never print secret values.** Refer to env vars by name only.
3. **Never hand-edit** `.projects/`, `.clerk/`, `convex/_generated/`, or `src/config/stack.ts`.
   Change `everything.config.json` and run `npm run config:apply`.
4. **The default path must stay zero-signup**: Clerk accountless app + Convex anonymous local
   backend + demo billing. Everything else is an upgrade the user opts into.
5. **Verify before you claim success.** `npm run verify` must pass. Report what you ran.
6. Convex's local backend refuses to start when `TZ` is set — always run Convex through the
   npm scripts (they unset it) or prefix with `env -u TZ`.

## Step 1 — Interview (one round)

Ask everything in **one** structured round. Use the AskUserQuestion tool when available
(max 4 questions per call → two calls), otherwise a single numbered message. Always show
the default; "just go" / "defaults" means accept all defaults.

Read `references/questions.md` for the exact questions, options, defaults and what each
choice changes. Then read `references/provider-matrix.md` to know which choices are
zero-signup, which need one browser approval, and which require porting app code.

If the user already stated preferences in their message, don't re-ask those.

## Step 2 — Record the answers

Write `everything.config.json` (schema: `everything.config.schema.json`). Then:

```bash
npm run config:apply      # rewrites src/config/stack.ts + product copy in src/config/site.ts
```

For product copy beyond name/tagline/description (features, FAQ, plans, prices), edit
`src/config/site.ts` directly — write real, specific copy for *their* product, in plain
sentence case, from the end user's point of view. No lorem ipsum.

## Step 3 — Local zero-signup setup

```bash
npm run setup
```

This is idempotent. It installs deps, installs official vendor skills, creates an accountless
Clerk app, starts an anonymous local Convex backend, wires Clerk → Convex (issuer domain +
Clerk secret on Convex), generates `CONVEX_SERVER_SECRET`, and picks the billing mode.

If it fails, read `docs/TROUBLESHOOTING.md`, fix, re-run. Do not continue on a failed setup.

## Step 4 — Component skills (only for non-default or upgraded choices)

Run the matching skill for each layer the user changed or asked to make "real":

| Layer | Skill | When |
|---|---|---|
| Provisioning via Stripe Projects | `es-provision` | Any hosted service: hosting, PostHog, extra providers |
| Database | `es-database` | Convex cloud, or a non-Convex database |
| Auth | `es-auth` | Claiming the Clerk app, orgs/B2B, other auth providers |
| Billing | `es-billing` | Real Stripe test mode, Polar sandbox, webhooks |
| Analytics | `es-analytics` | PostHog/Mixpanel/Amplitude |
| Hosting & deploy | `es-deploy` | Deploying to Vercel or Cloudflare |
| Framework | `es-framework` | Anything other than Next.js |
| Design | `es-design` | Re-theming to the user's brand (always run if they gave brand input) |
| Verification | `es-verify` | Always, last |

Official vendor skills (installed by `npm run skills` into `.claude/skills` and `.agents/skills`)
are the source of truth for provider APIs: `stripe-projects`, `clerk-*`, `convex*`, `setup-polar`,
`polar-integration`, `deploy-to-vercel`, `nextjs-on-cloudflare`, `vercel-react-best-practices`,
`frontend-design`. Prefer them over memory for any provider-specific detail.

## Step 5 — Verify

```bash
npm run verify        # typecheck, lint, build, live auth→db→billing→admin round trip
npm run test:e2e      # browser e2e (Playwright) incl. real sign-in via Clerk
```

Both must pass. If a check fails, fix the cause (not the test) and re-run.

## Step 6 — Report

End with the report template in `references/report.md`: what's running, what's real vs demo,
the exact command to start (`npm run dev`), the one or two upgrade steps that would make the
next layer "real", and anything that needed the user's browser.

## Scope notes

- The reference app is Next.js + Convex + Clerk. Choosing a different framework, database or
  auth provider means **porting app code** — follow the relevant `es-*` skill's porting guide,
  keep the same features and routes, and keep `npm run verify` green.
- Never delete or overwrite the user's existing work in a non-template repo. If the repo already
  has app code that isn't this template's, stop and ask.
