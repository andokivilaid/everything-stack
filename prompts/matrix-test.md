# Matrix test (maintainers)

Exercise each non-default choice on its own branch, starting from a clean clone each time.
For each row: set `everything.config.json`, run the `everything-stack` skill non-interactively
with those answers, then `npm run verify` and `npm run test:e2e`. Record pass/fail and every fix
in `CHANGELOG.md`. Don't merge porting branches into `main`; turn what you learn into better
porting guides in the `es-*` skills.

| # | Change from defaults | Expected effort |
|---|---|---|
| 1 | billing: demo | none |
| 2 | billing: stripe | Stripe login |
| 3 | billing: polar | Polar sandbox + token |
| 4 | auth: Clerk B2B (`clerkTemplate: b2b-saas`) | org switcher + org-scoped data |
| 5 | database: Convex cloud | Convex login |
| 6 | analytics: + PostHog | Stripe Projects |
| 7 | hosting: Cloudflare | OpenNext |
| 8 | framework: TanStack Start | port |
| 9 | database: Supabase | port |
| 10 | auth: WorkOS | port |

Success means the agent reached a passing verify without asking for any key except Polar's
token (row 3), and its report correctly listed every browser approval it needed.
