"use client";

import { useMutation, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { PricingTable } from "@/components/marketing/pricing-table";
import { Button } from "@/components/ui/button";
import { formatPrice, plans } from "@/config/site";
import { api } from "../../../../convex/_generated/api";

function UpgradedNotice() {
  const params = useSearchParams();
  if (!params.get("upgraded")) return null;
  return (
    <p
      role="status"
      className="mb-6 rounded-[var(--radius)] border border-success px-4 py-3 text-sm text-success"
    >
      Upgrade complete. Your new plan is active.
    </p>
  );
}

export default function BillingPage() {
  const me = useQuery(api.users.me);
  const cancelDemo = useMutation(api.billing.demoCancel);
  const [error, setError] = useState<string | null>(null);
  const sub = me?.subscription;
  const active = sub && ["active", "trialing"].includes(sub.status);
  const plan = plans.find((p) => p.id === (active ? sub?.plan : "free"));

  async function manage() {
    setError(null);
    if (sub?.provider === "demo") {
      await cancelDemo();
      return;
    }
    const res = await fetch("/api/billing/portal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customerId: sub?.externalCustomerId }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) window.location.assign(data.url);
    else setError(data.error ?? "Couldn't open the billing portal.");
  }

  return (
    <>
      <PageHeader title="Billing" />
      <Suspense fallback={null}>
        <UpgradedNotice />
      </Suspense>

      <section className="mb-12 flex flex-wrap items-center justify-between gap-6 rounded-[var(--radius)] border border-rule bg-surface p-6">
        <div>
          <p className="text-sm text-ink-soft">Current plan</p>
          <p className="display mt-1 text-2xl">{plan?.name ?? "Free"}</p>
          {active && sub && (
            <p className="mt-1 text-sm text-ink-soft">
              {formatPrice(sub.amountCents, sub.currency)} per month
              {sub.currentPeriodEnd && ` · renews ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
              {sub.provider === "demo" && " · demo billing"}
            </p>
          )}
        </div>
        {active && (
          <Button variant="secondary" onClick={() => void manage()}>
            {sub?.provider === "demo" ? "Cancel subscription" : "Manage subscription"}
          </Button>
        )}
      </section>
      {error && (
        <p role="alert" className="-mt-8 mb-8 text-sm text-danger">
          {error}
        </p>
      )}

      <h2 className="mb-6 text-lg font-semibold">Change plan</h2>
      <PricingTable currentPlan={active ? sub?.plan : "free"} />
    </>
  );
}
