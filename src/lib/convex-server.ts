import "server-only";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { serverSecret } from "./env";
import type { SubscriptionSync } from "./billing/types";

export async function pushSubscription(sync: SubscriptionSync) {
  await fetchMutation(api.billing.syncSubscription, { secret: serverSecret(), ...sync });
}
