"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function Sync() {
  const params = useSearchParams();
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const sessionId = params.get("session_id");
    const checkoutId = params.get("checkout_id");
    void fetch("/api/billing/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, checkoutId }),
    })
      .then((res) => (res.ok ? router.replace("/dashboard/billing?upgraded=1") : setFailed(true)))
      .catch(() => setFailed(true));
  }, [params, router]);

  return failed ? (
    <p role="alert" className="text-danger">
      Payment went through, but we couldn&apos;t confirm it yet. Refresh in a minute — the webhook will update
      your plan.
    </p>
  ) : (
    <p role="status" className="text-ink-soft">
      Confirming your payment…
    </p>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<p className="text-ink-soft">Confirming your payment…</p>}>
      <Sync />
    </Suspense>
  );
}
