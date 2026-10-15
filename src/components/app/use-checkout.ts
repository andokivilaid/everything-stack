"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

type CheckoutResponse =
  | { mode: "demo"; plan: string; amountCents: number; currency: string }
  | { mode: "stripe" | "polar"; url: string }
  | { error: string };

/** One checkout flow for every billing mode (stripe, polar, demo). */
export function useCheckout() {
  const router = useRouter();
  const demoCheckout = useMutation(api.billing.demoCheckout);
  const track = useMutation(api.analytics.track);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout(plan: "pro" | "team") {
    setPending(true);
    setError(null);
    try {
      void track({ name: "checkout_started", props: { plan } }).catch(() => {});
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as CheckoutResponse;
      if ("error" in data) throw new Error(data.error);
      if (data.mode === "demo") {
        await demoCheckout({ plan: data.plan, amountCents: data.amountCents, currency: data.currency });
        router.push("/dashboard/billing?upgraded=1");
        return;
      }
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed. Try again.");
      setPending(false);
    }
  }

  return { checkout, pending, error };
}
