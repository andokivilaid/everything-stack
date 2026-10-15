# Everything Stack — agent instructions

This repo is a template: a working SaaS (Next.js 16 + Convex + Clerk + Stripe/Polar + analytics)
plus the skills an AI coding agent needs to tailor, provision and verify it.

## If the user wants to set up / start / configure the app

Load and follow the **`everything-stack`** skill (`.claude/skills/everything-stack/SKILL.md`,
mirrored in `.agents/skills/`). It runs the interview, provisioning, build and verification.
Claude Code users can also type `/everything`.

## Commands

| Command | What it does |
|---|---|
| `npm run setup` | Zero-signup local setup (idempotent): deps, vendor skills, Clerk accountless app, Convex local backend, wiring, billing mode |
| `npm run dev` | Next.js + Convex together (`-- --stripe` also forwards Stripe webhooks) |
| `npm run verify` | Codegen, typecheck, lint, build, live auth→db→billing→admin round trip |
| `npm run test:e2e` | Playwright browser e2e with real Clerk sign-in |
| `npm run doctor` | Read-only health check |
| `npm run skills` | Install/refresh official vendor skills for the configured stack |
| `npm run config:apply` | Apply `everything.config.json` to `src/config/` |
| `npm run env:set -- NAME` | Store a secret with hidden input (never paste secrets into chat) |

## Skills

Everything Stack: `everything-stack` (orchestrator), `es-provision`, `es-database`, `es-auth`,
`es-billing`, `es-analytics`, `es-deploy`, `es-framework`, `es-design`, `es-verify`.

Official vendor skills (installed by `npm run skills`, pinned in `skills-lock.json`): `stripe-projects`,
`stripe-best-practices`, `clerk-*`, `convex*`, `setup-polar`, `polar-*`, `deploy-to-vercel`,
`vercel-react-best-practices`, `web-design-guidelines`, `frontend-design`, `webapp-testing`, and
Cloudflare skills when Cloudflare is chosen. Prefer them over memory for provider APIs.

## Hard rules

- Never print, paste or commit secret values. Refer to env vars by name. Don't read `.env*`, `.clerk/`, `.projects/vault/`.
- Credentials come from CLIs (`clerk init`, `convex dev`, `stripe projects`), never from the user typing keys into chat.
- Don't hand-edit `convex/_generated/`, `.projects/`, `src/config/stack.ts`.
- Run Convex through npm scripts (they unset `TZ`; Convex's local backend requires UTC).
- Next.js 16 is not the Next.js in your training data — read `node_modules/next/dist/docs/` before
  changing framework code. Middleware is `src/proxy.ts`; Cache Components is on, so request-reading
  client hooks need `<Suspense>`.
- `npm run verify` must pass before you say something works. Report the checks you actually ran.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
