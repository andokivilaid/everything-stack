Take my Everything Stack app to production on <Vercel | Cloudflare> at <domain>.

Use the `es-deploy` skill end to end, plus `es-auth` (production instance), `es-billing` (live keys,
webhooks) and the official `convex-launch-readiness` and `deploy-to-vercel` / `nextjs-on-cloudflare`
skills. Run every command yourself; stop only for browser approvals and tell me exactly what to click.
Never print or ask me to paste secret values — use CLIs, the host's env tooling, or
`npm run env:set -- NAME` for anything that must be typed.

Before switching to live payment keys, run the full flow in test mode on the production URL.
Finish with: the URL, `/api/health` output, a checklist of what you verified on production, and
anything still pending.
