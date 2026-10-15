import "server-only";
import { createPolar, type Polar } from "@polar-sh/sdk/2026-10";
import type { SubscriptionSync } from "./types";

/** Polar SDK v1: dated API versions, snake_case models, `environment` option. */
export function polarEnvironment(): "sandbox" | "production" {
  return process.env.POLAR_SERVER === "production" ? "production" : "sandbox";
}

let client: Polar | null = null;
export function polar(): Polar {
  if (!process.env.POLAR_ACCESS_TOKEN) throw new Error("POLAR_ACCESS_TOKEN is not set");
  client ??= createPolar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    environment: polarEnvironment(),
  });
  return client;
}

/**
 * Polar products are created once (by the es-billing skill via the Polar
 * sandbox MCP) and mapped with POLAR_PRODUCT_ID_PRO / POLAR_PRODUCT_ID_TEAM.
 */
export function polarProductId(planId: string) {
  return process.env[`POLAR_PRODUCT_ID_${planId.toUpperCase()}`];
}

export async function createPolarCheckout(opts: {
  planId: string;
  userId: string;
  email?: string;
  successUrl: string;
}) {
  const productId = polarProductId(opts.planId);
  if (!productId) throw new Error(`POLAR_PRODUCT_ID_${opts.planId.toUpperCase()} is not set`);
  const checkout = await polar().checkouts.create({
    products: [productId],
    external_customer_id: opts.userId,
    customer_email: opts.email,
    success_url: `${opts.successUrl}?checkout_id={CHECKOUT_ID}`,
    metadata: { userId: opts.userId, plan: opts.planId },
  });
  return checkout.url;
}

type PolarSubscription = Awaited<ReturnType<Polar["subscriptions"]["get"]>>;
const STATUSES = ["active", "trialing", "past_due", "canceled", "incomplete"] as const;

export function polarSubscriptionToSync(
  sub: PolarSubscription,
  fallback: { userId?: string; plan?: string } = {},
): SubscriptionSync | null {
  const userId = sub.customer?.external_id ?? (sub.metadata?.userId as string | undefined) ?? fallback.userId;
  if (!userId) return null;
  return {
    externalUserId: userId,
    provider: "polar",
    plan: String(sub.metadata?.plan ?? fallback.plan ?? "pro"),
    status: STATUSES.find((s) => s === sub.status) ?? "canceled",
    amountCents: sub.amount,
    currency: sub.currency,
    externalCustomerId: sub.customer_id,
    externalSubscriptionId: sub.id,
    currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end).getTime() : undefined,
  };
}
