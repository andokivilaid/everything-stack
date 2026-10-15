# Getting started

## Requirements

- **Node.js 20.9+** (22 LTS recommended — `.nvmrc` pins 22)
- **git**
- Optional: **Stripe CLI** (`brew install stripe/stripe-cli/stripe`) for Stripe Projects and real Stripe test mode
- Optional: a coding agent — Claude Code, Codex, Cursor, …

Nothing else. No accounts, no API keys.

## 1. Create your copy

```bash
gh repo create my-app --template andokivilaid/everything-stack --private --clone
cd my-app
```

Or click **Use this template** on GitHub, or `npx degit andokivilaid/everything-stack my-app`.

## 2a. Set up with an agent

Open the folder in your agent and run `/everything` (Claude Code) or paste
[`prompts/kickoff.md`](../prompts/kickoff.md). Answer the interview. The agent finishes with a
report of what's running and how to start it.

## 2b. Set up by hand

```bash
npm run setup
npm run dev
```

Open http://localhost:3000, click **Start free**, create an account. The first account becomes
the admin, so `/admin` shows up in the sidebar.

## 3. Make it yours

Edit `everything.config.json` (product name, tagline, choices) and run `npm run config:apply`.
Edit copy, features, FAQ and plans in `src/config/site.ts`. Design tokens live at the top of
`src/app/globals.css`.

## 4. Check it works

```bash
npm run verify       # ~2 minutes: static checks, build, live round trip
npm run test:e2e     # browser e2e with a real sign-in
```

## Upgrading layers

| Want | Run |
|---|---|
| Real Stripe test payments | `stripe login`, then `npm run setup` |
| Your Clerk app in your account | `npx clerk@latest auth login` |
| Hosted Convex | `npx convex login && npx convex dev --once --configure new && npm run setup` |
| PostHog / hosting / more | ask your agent, or see the `es-provision` skill |
