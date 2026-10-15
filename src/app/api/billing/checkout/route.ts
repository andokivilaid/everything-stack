import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { plans } from "@/config/site";
import { appUrl, billingMode } from "@/lib/env";
import { createPolarCheckout } from "@/lib/billing/polar";
import { createStripeCheckout } from "@/lib/billing/stripe";

const body = z.object({ plan: z.enum(["pro", "team"]) });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  const plan = plans.find((p) => p.id === parsed.data.plan)!;

  const mode = billingMode();
  // Demo mode: the client completes the upgrade via a Convex mutation.
  if (mode === "demo") {
    return NextResponse.json({ mode, plan: plan.id, amountCents: plan.priceCents, currency: plan.currency });
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const successUrl = `${appUrl()}/dashboard/billing/success`;

  try {
    const url =
      mode === "stripe"
        ? await createStripeCheckout({
            plan,
            userId,
            email,
            successUrl,
            cancelUrl: `${appUrl()}/pricing`,
          })
        : await createPolarCheckout({ planId: plan.id, userId, email, successUrl });
    return NextResponse.json({ mode, url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
