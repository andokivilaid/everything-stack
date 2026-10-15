# Finalize and test Everything Stack (maintainer brief)

You are finalizing the **Everything Stack** template repo (`andokivilaid/everything-stack`).
Work autonomously. Fix what's broken at the source, keep commits small and descriptive, and
don't mark anything done that you didn't observe passing. Ask me only for browser approvals
that a CLI prints.

## Already verified (October 2026, Linux, Node 22)

Run these first to confirm your environment matches — all must pass before you change anything:

```bash
npm ci
npm run setup          # zero-signup: Clerk accountless + Convex anonymous local + demo billing
npm run verify         # 28 checks incl. real Clerk session token → Convex round trip
npm run test:e2e       # 7 Playwright tests incl. real sign-in via Clerk's UI (desktop + mobile)
npm run doctor
```

Known environment gotcha: Convex's local backend requires `TZ` unset (scripts handle it).

## Not yet verified — your job

Work through these in order. For each: do it for real, fix any defect in code, scripts, skills
or docs, then re-run `npm run verify` + `npm run test:e2e`. Record results in `CHANGELOG.md`
under "Unreleased → Verified".

### 1. Stripe test mode
- Install the Stripe CLI, `stripe login` (ask me to approve), `npm run setup`.
- Confirm `.env.local` `BILLING_MODE=stripe` and Convex `BILLING_MODE` (`npx convex env list` — names/values
  of non-secrets only) match.
- `npm run verify` must report "Real checkout session created (stripe)".
- Browser: upgrade to Pro with `4242 4242 4242 4242`, land on `/dashboard/billing?upgraded=1`,
  plan shows Pro. Open the portal from "Manage subscription".
- `npm run dev -- --stripe`, store the webhook secret via `stripe listen --print-secret`, cancel the
  subscription in the portal, confirm the webhook marks it canceled in Convex.

### 2. Stripe Projects provisioning
- Follow the `es-provision` skill: `stripe projects init`, then `stripe projects add posthog/analytics`
  and `stripe projects add vercel/project`.
- Find PostHog's variable names with `stripe projects env --json`. If they differ from
  `NEXT_PUBLIC_POSTHOG_KEY`/`NEXT_PUBLIC_POSTHOG_HOST`, implement the mapping in `next.config.ts`
  **and** update `es-analytics`, `es-provision` and `.env.example` with the real names.
- Confirm PostHog receives `$pageview` (PostHog MCP or dashboard).

### 3. Polar sandbox
- Follow `es-billing` → Polar: sandbox MCP, create Pro/Team products, I'll create a token and store it
  with `npm run env:set -- POLAR_ACCESS_TOKEN`. Set product IDs, `billing.provider: "polar"`, `npm run setup`.
- Full checkout with the test card, success-page sync, `polar listen` + `polar trigger subscription.created`.
- Verify the Polar SDK v1 field names used in `src/lib/billing/polar.ts` against live responses.

### 4. Deploy to Vercel
- Follow `es-deploy` end to end on a throwaway project: Convex production deployment, claimed Clerk
  app (dev instance is fine for this test), Vercel env vars, `npx convex deploy --cmd 'npm run build'`.
- Smoke test the deployed URL: `/api/health`, sign-up, demo or Stripe upgrade, `/admin`.
- Fix anything the docs got wrong.

### 5. Cloudflare (OpenNext)
- Same as 4 on Cloudflare Workers using the official `nextjs-on-cloudflare` skill. Add whatever config
  files are needed behind a clear opt-in (don't break Vercel), and document them in `es-deploy`.

### 6. Fresh-clone experience
- In a new directory: `gh repo create es-smoke --template andokivilaid/everything-stack --private --clone`
  (after step 8 makes it a template), then `npm run setup && npm run verify`.
- Do the same on macOS if available, and on Windows (PowerShell): the `.agents/skills` symlinks and
  `env -u TZ` advice need a Windows path — fix scripts/docs as needed.
- Time `npm run setup` from clean; document it in the README if it exceeds 3 minutes.

### 7. Agent experience
- In a fresh clone, run `/everything` (Claude Code) with: "Courtside — court booking for squash clubs;
  defaults otherwise". The agent must finish with a passing verify and the report, without asking for keys.
- Repeat with Codex using `prompts/kickoff.md`.
- Tighten any skill instruction the agents misread. Keep `SKILL.md` files under ~250 lines; move detail
  to `references/`.

### 8. GitHub repository settings
Using `gh` (authenticated as the repo owner):
```bash
gh repo edit andokivilaid/everything-stack \
  --template \
  --description "Answer six questions, get a running SaaS. Next.js + Convex + Clerk + Stripe/Polar + analytics, provisioned by your coding agent." \
  --homepage "https://github.com/andokivilaid/everything-stack#readme" \
  --add-topic nextjs --add-topic convex --add-topic clerk --add-topic stripe --add-topic polar \
  --add-topic saas-starter --add-topic template --add-topic ai-agents --add-topic agent-skills \
  --add-topic claude-code --add-topic mcp \
  --enable-issues --enable-discussions --delete-branch-on-merge --enable-squash-merge \
  --enable-merge-commit=false --enable-rebase-merge=false
```
- Branch protection on `main`: require the `CI` workflow, linear history, no force pushes.
- Enable Dependabot alerts and secret scanning + push protection.
- Add repo secrets only if CI needs them (CI is designed to run with none).
- Confirm the CI workflow passes on `main` (it runs the zero-signup setup + verify + e2e).

### 9. Release
- Update `CHANGELOG.md`, tag `v1.0.0`, create a GitHub release summarizing what's verified.

## Definition of done

- Every section above has a "Verified" entry in `CHANGELOG.md` with date and what was observed.
- `npm run verify` and `npm run test:e2e` pass on a fresh clone with zero accounts.
- CI is green on `main`. The repo is a template with description and topics.
- No secrets in git history (`gh secret-scanning` / `git log -p | grep -E "sk_(test|live)_|whsec_|polar_oat_"` is empty).
