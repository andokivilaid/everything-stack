# Security

Report vulnerabilities privately via
[GitHub security advisories](https://github.com/andokivilaid/everything-stack/security/advisories/new).
Please don't open public issues for security problems.

## Design

- No secrets are committed: `.env*`, `.clerk/`, `.projects/vault/` are gitignored, and
  `.claude/settings.json` denies agents read access to them.
- Credentials are written by provider CLIs. The one manual case (Polar access token) uses hidden
  input (`npm run env:set`).
- Every Convex function authenticates and checks ownership; admin checks happen server-side.
- Admin rights by email use the email verified by Clerk's Backend API, never client input.
- Server-to-Convex writes require `CONVEX_SERVER_SECRET`; webhooks verify signatures.

Development accounts created by `npm run setup` (unclaimed Clerk app, local Convex) are not for
production data.
