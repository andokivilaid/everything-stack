"use client";

import { useMutation } from "convex/react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { Suspense, useEffect, useRef } from "react";
import { api } from "../../../convex/_generated/api";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

function anonymousId() {
  try {
    const key = "es_aid";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

function Tracker() {
  const pathname = usePathname();
  const track = useMutation(api.analytics.track);
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (POSTHOG_KEY && !posthog.__loaded) {
      posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST, capture_pageview: false });
    }
  }, []);

  useEffect(() => {
    if (!pathname || last.current === pathname) return;
    last.current = pathname;
    void track({
      name: "pageview",
      path: pathname,
      anonymousId: anonymousId(),
      referrer: document.referrer || undefined,
    }).catch(() => {});
    if (POSTHOG_KEY) posthog.capture("$pageview", { $current_url: window.location.href });
  }, [pathname, track]);

  return null;
}

/** First-party pageviews into Convex, plus PostHog when a key is configured. */
export function Analytics() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return null;
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
