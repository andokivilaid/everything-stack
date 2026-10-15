import { Webhooks } from "@polar-sh/nextjs";
import { NextResponse } from "next/server";
import { pushSubscription } from "@/lib/convex-server";
import { polarSubscriptionToSync } from "@/lib/billing/polar";

/** Local: expose localhost with a tunnel and add it as a Polar sandbox webhook endpoint. */
const secret = process.env.POLAR_WEBHOOK_SECRET;

async function sync(sub: Parameters<typeof polarSubscriptionToSync>[0]) {
  const data = polarSubscriptionToSync(sub);
  if (data) await pushSubscription(data);
}

export const POST = secret
  ? Webhooks({
      webhookSecret: secret,
      onSubscriptionCreated: async ({ data }) => sync(data),
      onSubscriptionUpdated: async ({ data }) => sync(data),
      onSubscriptionCanceled: async ({ data }) => sync(data),
      onSubscriptionRevoked: async ({ data }) => sync(data),
    })
  : async () => NextResponse.json({ error: "POLAR_WEBHOOK_SECRET not set" }, { status: 501 });
