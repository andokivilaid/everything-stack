import type { AuthConfig } from "convex/server";

/**
 * Clerk → Convex auth without a Clerk "JWT template".
 *
 * Clerk's default session token is an RS256 JWT whose issuer is the instance's
 * Frontend API URL. Convex validates it with the `customJwt` provider, so this
 * works with accountless (unclaimed) Clerk apps that have no dashboard config.
 *
 * CLERK_JWT_ISSUER_DOMAIN is set on the Convex deployment by `npm run setup`
 * (derived from NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY). Example:
 *   https://happy-otter-12.clerk.accounts.dev
 */
const issuer = process.env.CLERK_JWT_ISSUER_DOMAIN;

export default {
  providers: issuer
    ? [
        {
          type: "customJwt",
          issuer,
          jwks: `${issuer}/.well-known/jwks.json`,
          algorithm: "RS256",
        },
      ]
    : [],
} satisfies AuthConfig;
