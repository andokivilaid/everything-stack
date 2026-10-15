import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { pushSubscription } from "@/lib/convex-server";
import { polar, polarSubscriptionToSync } from "@/lib/billing/polar";
import { syncStripeCheckoutSession } from "@/lib/billing/stripe";

/**
 * Called by the checkout success page. Syncs the subscription straight from the
 * provider so local development works even without webhook forwarding.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const { sessionId, checkoutId } = (await req.json().catch(() => ({}))) as {
    sessionId?: string;
    checkoutId?: string;
  };

  try {
    if (sessionId) {
      const sync = await syncStripeCheckoutSession(sessionId);
      if (!sync || sync.externalUserId !== userId) {
        return NextResponse.json({ error: "Checkout does not belong to you" }, { status: 403 });
      }
      await pushSubscription(sync);
      return NextResponse.json({ ok: true });
    }
    if (checkoutId) {
      const checkout = await polar().checkouts.get(checkoutId);
      if (checkout.external_customer_id !== userId) {
        return NextResponse.json({ error: "Checkout does not belong to you" }, { status: 403 });
      }
      if (checkout.subscription_id) {
        const sub = await polar().subscriptions.get(checkout.subscription_id);
        const sync = polarSubscriptionToSync(sub, {
          userId,
          plan: String(checkout.metadata?.plan ?? "pro"),
        });
        if (sync) await pushSubscription(sync);
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Missing sessionId or checkoutId" }, { status: 400 });
  } catch (err) {
    console.error("[billing/sync]", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
