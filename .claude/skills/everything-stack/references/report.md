# Final report template

Keep it short. Use this shape:

```
<Product name> is running.

  npm run dev   → http://localhost:3000

| Layer     | Provider              | State                                   |
|-----------|-----------------------|-----------------------------------------|
| Hosting   | Vercel                | provisioned / not deployed yet          |
| Framework | Next.js 16            | —                                       |
| Database  | Convex                | local backend (no account)              |
| Auth      | Clerk                 | accountless dev app (unclaimed)         |
| Billing   | Stripe                | test mode / demo                        |
| Analytics | First-party + PostHog | live / first-party only                 |

Checks: npm run verify ✓ (28 checks) · npm run test:e2e ✓ (7 tests)

What's real vs. simulated: <one sentence>

Next step to make it more real: <the single most valuable upgrade, as one command>
Needed your browser: <list, or "nothing">
```

Rules:
- Never include secret values. Env var names are fine.
- State the verify/e2e results you actually observed, with counts.
- If anything is degraded (e.g. demo billing because Stripe CLI isn't logged in), say so plainly
  and give the exact command that fixes it.
