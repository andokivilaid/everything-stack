import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { pushSubscription } from "@/lib/convex-server";
import { stripe, stripeSubscriptionToSync } from "@/lib/billing/stripe";

/**
 * Local:  stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *         (prints the whsec_… value for STRIPE_WEBHOOK_SECRET)
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not set" }, { status: 501 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sync = stripeSubscriptionToSync(event.data.object);
      if (sync) await pushSubscription(sync);
      break;
    }
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
