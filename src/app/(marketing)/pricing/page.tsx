import type { Metadata } from "next";
import { PricingTable } from "@/components/marketing/pricing-table";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16">
      <h1 className="display text-4xl sm:text-5xl">Pricing</h1>
      <p className="prose-measure mt-4 text-lg text-ink-soft">
        Every plan includes the full product. Paid plans lift the limits. Cancel any time from your billing
        page.
      </p>
      <div className="mt-12">
        <PricingTable />
      </div>
    </section>
  );
}
