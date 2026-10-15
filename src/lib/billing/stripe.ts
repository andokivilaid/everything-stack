import "server-only";
import Stripe from "stripe";
import type { Plan } from "@/config/site";
import type { SubscriptionSync } from "./types";

let client: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/**
 * Uses inline price_data so no products/prices need to exist in the Stripe
 * account up front. Swap to lookup_key-based prices for production catalogs.
 */
export async function createStripeCheckout(opts: {
  plan: Plan;
  userId: string;
  email?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: opts.email,
    client_reference_id: opts.userId,
    metadata: { userId: opts.userId, plan: opts.plan.id },
    subscription_data: { metadata: { userId: opts.userId, plan: opts.plan.id } },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: opts.plan.currency,
          unit_amount: opts.plan.priceCents,
          recurring: { interval: opts.plan.interval },
          product_data: { name: opts.plan.name },
        },
      },
    ],
    success_url: `${opts.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: opts.cancelUrl,
    allow_promotion_codes: true,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

export function stripeSubscriptionToSync(sub: Stripe.Subscription): SubscriptionSync | null {
  const userId = sub.metadata?.userId;
  if (!userId) return null;
  const item = sub.items.data[0];
  const status =
    (["active", "trialing", "past_due", "canceled", "incomplete"] as const).find((s) => s === sub.status) ??
    (sub.status === "unpaid" ? "past_due" : "canceled");
  return {
    externalUserId: userId,
    provider: "stripe",
    plan: sub.metadata?.plan ?? "pro",
    status,
    amountCents: item?.price.unit_amount ?? 0,
    currency: item?.price.currency ?? "usd",
    externalCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    externalSubscriptionId: sub.id,
    currentPeriodEnd: item?.current_period_end ? item.current_period_end * 1000 : undefined,
  };
}

export async function syncStripeCheckoutSession(sessionId: string) {
  const session = await stripe().checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });
  const sub = session.subscription;
  if (!sub || typeof sub === "string") return null;
  return stripeSubscriptionToSync(sub);
}

export async function createStripePortal(customerId: string, returnUrl: string) {
  const portal = await stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return portal.url;
}
