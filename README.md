# Everything Stack

**Answer six questions. Get a running SaaS.**

Everything Stack is a template plus a bundle of AI-agent skills. Open it in a coding agent, say
"set it up", answer a short interview (hosting, framework, database, auth, billing, analytics),
and the agent provisions real development accounts, wires every layer together, tailors the copy
to your product and proves it works — marketing site, sign-in, dashboard, billing, analytics and
an admin dashboard.

The default path needs **no accounts and no API keys**. Auth runs on an accountless Clerk
development app, the database is a local Convex backend, and billing starts in demo mode. Each
layer upgrades to a real provider with one browser approval when you're ready.

```text
            ┌────────────────────────────────────────────┐
 Analytics  │ First-party (Convex) + PostHog             │
 Billing    │ Stripe test mode · Polar sandbox · demo    │
 Auth       │ Clerk (accountless → claimed)              │
 Database   │ Convex (local → cloud)                     │
 Framework  │ Next.js 16 · Cache Components              │
 Hosting    │ Vercel · Cloudflare (via Stripe Projects)  │
            └────────────────────────────────────────────┘
```

---

## Quick start

### With a coding agent (recommended)

```bash
gh repo create my-app --template andokivilaid/everything-stack --private --clone
cd my-app
claude            # or Codex, Cursor, any agent that reads AGENTS.md
```

Then type **`/everything`** (Claude Code) or *"Set up Everything Stack for my product: …"*.
The agent interviews you, then does the rest. See [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md).

### Without an agent — one command

```bash
gh repo create my-app --template andokivilaid/everything-stack --private --clone
cd my-app
npm run setup     # zero-signup: Clerk accountless app + local Convex + demo billing
npm run dev       # → http://localhost:3000
```

The first account you create becomes the admin.

> Requires Node 20.9+ (22 LTS recommended). No other accounts needed for local development.

---

## What you get

| | |
|---|---|
| **Marketing site** | Landing page, pricing, FAQ, SEO metadata, sitemap, robots, light + dark themes |
| **Auth** | Sign-up, sign-in, user menu, protected routes (`src/proxy.ts`), verified profile sync |
| **Database** | Convex schema, realtime queries, optimistic updates, ownership checks on every write |
| **Billing** | Free / Pro / Team plans, checkout, customer portal, webhooks, plan limits — Stripe, Polar or demo |
| **Analytics** | Cookie-less first-party pageviews and events in Convex; PostHog when provisioned |
| **Admin** | Users and roles, paying customers, monthly revenue, 14-day traffic, top pages |
| **Agent layer** | 10 Everything Stack skills, 20+ official vendor skills, 9 MCP servers, `/everything` command |
| **Proof** | `npm run verify` (28 live checks) and Playwright e2e with a real sign-in |

## How "no keys" actually works

| Layer | Mechanism | You do |
|---|---|---|
| Auth | `npx clerk@latest init --accountless` creates a real, claimable Clerk dev app and writes keys | nothing (claim later with `npx clerk auth login`) |
| Database | `CONVEX_AGENT_MODE=anonymous npx convex dev` runs a local Convex backend | nothing |
| Auth ↔ DB | Convex validates Clerk's **default** session token (`customJwt`), so no JWT template is needed | nothing |
| Billing | Demo mode simulates checkout end to end; `stripe login` switches to real Stripe test mode | optional: one browser approval |
| Hosting, PostHog, 60+ providers | [Stripe Projects](https://projects.dev) creates accounts and syncs credentials to `.env` | one browser approval, once |

Details and the full matrix: [docs/PROVIDERS.md](docs/PROVIDERS.md).

## Commands

| Command | |
|---|---|
| `npm run setup` | Zero-signup setup. Idempotent — safe to re-run any time |
| `npm run dev` | Next.js + Convex together. `npm run dev -- --stripe` also forwards Stripe webhooks |
| `npm run verify` | Codegen, typecheck, lint, production build, and a live auth → database → billing → admin round trip |
| `npm run test:e2e` | Playwright on desktop and mobile, including a real Clerk sign-in |
| `npm run doctor` | Read-only health check (never prints secrets) |
| `npm run skills` | Install or refresh official vendor skills for your stack |
| `npm run config:apply` | Apply `everything.config.json` to `src/config/` |
| `npm run env:set -- NAME` | Store a secret with hidden input — the one case a CLI can't write it for you |

## Repository layout

```text
.claude/skills/        Everything Stack skills (orchestrator + 9 component skills)
.agents/skills/        Same skills for Codex, Cursor and other agents (symlinks)
.claude/commands/      /everything slash command
.mcp.json              Convex, Next.js devtools, Playwright, Clerk, Stripe, Polar, PostHog, Vercel, Cloudflare
AGENTS.md / CLAUDE.md  Agent instructions
everything.config.json Your interview answers (schema: everything.config.schema.json)
convex/                Schema, auth config, users, items, billing, analytics
src/app/               (marketing) pages, sign-in/up, dashboard, admin, API routes
src/config/            site.ts (copy, plans) and stack.ts (generated)
src/lib/billing/       Stripe and Polar adapters
scripts/               setup, dev, verify, doctor, install-skills, apply-config, set-env
e2e/                   Playwright tests
prompts/               Ready-to-paste prompts for coding agents
docs/                  Guides
```

## Docs

- [Getting started](docs/GETTING_STARTED.md)
- [Walkthrough: what the agent does](docs/WALKTHROUGH.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Providers and the zero-signup matrix](docs/PROVIDERS.md)
- [Skills, MCP servers and agents](docs/AGENTS_AND_SKILLS.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Agent prompts](prompts/README.md)

## FAQ

**Is this production-ready?** The code is. The default *accounts* are development-only by design:
an unclaimed Clerk app, a local database, demo billing. [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
(or the `es-deploy` skill) takes you to production.

**Can I pick something other than Next.js / Convex / Clerk?** Yes — the interview offers it and
the component skills include porting guides. Those paths require porting app code and usually an
account, and the agent tells you so before starting.

**Which agents work?** Anything that reads `AGENTS.md` and skills: Claude Code, Codex, Cursor and
others. Skills live in `.claude/skills` and `.agents/skills`.

## License

MIT © Ando Kivilaid. Official vendor skills installed by `npm run skills` keep their own licenses
and aren't redistributed in this repo.
