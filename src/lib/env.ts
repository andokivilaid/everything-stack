import "server-only";

/**
 * Server-side feature detection. Every integration is optional at runtime:
 * the app degrades to a working demo mode instead of crashing on a missing key.
 */
export type BillingMode = "stripe" | "polar" | "demo";

export function billingMode(): BillingMode {
  const explicit = process.env.BILLING_MODE as BillingMode | undefined;
  if (explicit === "stripe" && process.env.STRIPE_SECRET_KEY) return "stripe";
  if (explicit === "polar" && process.env.POLAR_ACCESS_TOKEN) return "polar";
  if (explicit === "demo") return "demo";
  if (!explicit && process.env.STRIPE_SECRET_KEY) return "stripe";
  if (!explicit && process.env.POLAR_ACCESS_TOKEN) return "polar";
  return "demo";
}

export function integrations() {
  return {
    auth: {
      provider: "clerk",
      configured: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
    },
    database: {
      provider: "convex",
      configured: Boolean(process.env.NEXT_PUBLIC_CONVEX_URL),
      local: (process.env.NEXT_PUBLIC_CONVEX_URL ?? "").includes("127.0.0.1"),
    },
    billing: {
      mode: billingMode(),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY),
      polar: Boolean(process.env.POLAR_ACCESS_TOKEN),
      webhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET || process.env.POLAR_WEBHOOK_SECRET),
    },
    analytics: {
      firstParty: true,
      posthog: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY),
    },
    serverSecret: Boolean(process.env.CONVEX_SERVER_SECRET),
  };
}

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function serverSecret() {
  const s = process.env.CONVEX_SERVER_SECRET;
  if (!s) throw new Error("CONVEX_SERVER_SECRET is not set. Run `npm run setup`.");
  return s;
}
