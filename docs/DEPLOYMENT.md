# Deployment

Ask your agent to "deploy to Vercel" (or Cloudflare) — the `es-deploy` skill runs every step and
pauses only for browser approvals. The manual outline:

1. **Verify locally**: `npm run verify && npm run test:e2e`.
2. **Claim accounts**: `npx clerk@latest auth login` (Clerk), `npx convex login` (Convex).
3. **Convex production**: `npx convex deploy`, then set `CLERK_JWT_ISSUER_DOMAIN`,
   `CLERK_SECRET_KEY`, `CONVEX_SERVER_SECRET`, `BILLING_MODE` (and `ADMIN_EMAILS`) with
   `npx convex env set --prod …`. Create a production deploy key.
4. **Clerk production instance** with your domain.
5. **Host**: provision with Stripe Projects (`stripe projects add vercel/project` or
   `cloudflare/worker`). Build command: `npx convex deploy --cmd 'npm run build'`.
   Set env: `CONVEX_DEPLOY_KEY`, Clerk production keys, `CONVEX_SERVER_SECRET`, `BILLING_MODE`,
   payment keys, PostHog key, `NEXT_PUBLIC_APP_URL`.
6. **Webhooks**: Stripe → `https://<domain>/api/webhooks/stripe` (`customer.subscription.*`);
   Polar → `https://<domain>/api/webhooks/polar` (`subscription.*`).
7. **Smoke test**: `curl https://<domain>/api/health`, sign up, upgrade (test mode first), open `/admin`.

Cloudflare runs Next.js through OpenNext — see the `nextjs-on-cloudflare` skill.
