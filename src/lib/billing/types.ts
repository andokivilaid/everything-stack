export type SubscriptionSync = {
  externalUserId: string;
  provider: "stripe" | "polar" | "demo";
  plan: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  amountCents: number;
  currency: string;
  externalCustomerId?: string;
  externalSubscriptionId?: string;
  currentPeriodEnd?: number;
};
