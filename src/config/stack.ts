/**
 * The stack this app was generated with. Written by scripts/apply-config.mjs
 * from everything.config.json — bottom layer first. Do not edit by hand.
 */
export const stack = [
  { layer: "Hosting", provider: "Vercel" },
  { layer: "Framework", provider: "Next.js" },
  { layer: "Database", provider: "Convex" },
  { layer: "Auth", provider: "Clerk" },
  { layer: "Billing", provider: "Stripe" },
  { layer: "Analytics", provider: "First-party + PostHog" },
] as const;
