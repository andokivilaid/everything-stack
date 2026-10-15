"use client";

import { useAuth } from "@clerk/nextjs";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCheckout } from "@/components/app/use-checkout";
import { Button } from "@/components/ui/button";
import { formatPrice, plans } from "@/config/site";
import { cn } from "@/lib/utils";

export function PricingTable({ currentPlan }: { currentPlan?: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { checkout, pending, error } = useCheckout();
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id || (!currentPlan && plan.id === "free" && isSignedIn);
          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-[var(--radius)] border bg-paper p-6",
                plan.highlighted ? "border-2 border-ink" : "border-rule",
              )}
            >
              <h3 className="display text-2xl">{plan.name}</h3>
              <p className="mt-1 text-sm text-ink-soft">{plan.blurb}</p>
              <p className="mt-6">
                <span className="display text-4xl">{formatPrice(plan.priceCents, plan.currency)}</span>
                <span className="text-ink-soft"> / {plan.interval}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {plan.id === "free" ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={!isLoaded || isCurrent}
                    onClick={() => router.push(isSignedIn ? "/dashboard" : "/sign-up")}
                  >
                    {isCurrent ? "Your plan" : "Start free"}
                  </Button>
                ) : (
                  <Button
                    variant={plan.highlighted ? "primary" : "secondary"}
                    className="w-full"
                    disabled={!isLoaded || isCurrent || (pending && chosen === plan.id)}
                    onClick={() => {
                      if (!isSignedIn) return router.push("/sign-up");
                      setChosen(plan.id);
                      void checkout(plan.id as "pro" | "team");
                    }}
                  >
                    {isCurrent
                      ? "Your plan"
                      : pending && chosen === plan.id
                        ? "Opening checkout…"
                        : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
