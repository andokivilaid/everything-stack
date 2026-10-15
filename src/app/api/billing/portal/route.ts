import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { appUrl, billingMode } from "@/lib/env";
import { polar } from "@/lib/billing/polar";
import { createStripePortal } from "@/lib/billing/stripe";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const { customerId } = (await req.json().catch(() => ({}))) as { customerId?: string };
  const returnUrl = `${appUrl()}/dashboard/billing`;
  const mode = billingMode();

  try {
    if (mode === "stripe" && customerId) {
      return NextResponse.json({ url: await createStripePortal(customerId, returnUrl) });
    }
    if (mode === "polar") {
      const session = await polar().customerSessions.create({
        external_customer_id: userId,
        return_url: returnUrl,
      });
      return NextResponse.json({ url: session.customer_portal_url });
    }
    return NextResponse.json({ mode: "demo" });
  } catch (err) {
    console.error("[billing/portal]", err);
    return NextResponse.json({ error: "Could not open the billing portal" }, { status: 500 });
  }
}
