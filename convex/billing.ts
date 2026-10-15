import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertServerSecret, requireAdmin, requireUser } from "./lib";
import { billingProvider, subscriptionStatus } from "./schema";

/**
 * Called by Next.js route handlers after they verify a provider webhook or
 * checkout session. Guarded by CONVEX_SERVER_SECRET (set by `npm run setup`).
 */
export const syncSubscription = mutation({
  args: {
    secret: v.string(),
    externalUserId: v.string(),
    provider: billingProvider,
    plan: v.string(),
    status: subscriptionStatus,
    amountCents: v.number(),
    currency: v.string(),
    externalCustomerId: v.optional(v.string()),
    externalSubscriptionId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, { secret, externalUserId, ...data }) => {
    assertServerSecret(secret);
    const user = await ctx.db
      .query("users")
      .withIndex("by_external_id", (q) => q.eq("externalId", externalUserId))
      .unique();
    if (!user) throw new Error(`Unknown user ${externalUserId}`);

    const existing = data.externalSubscriptionId
      ? await ctx.db
          .query("subscriptions")
          .withIndex("by_external_subscription", (q) =>
            q.eq("externalSubscriptionId", data.externalSubscriptionId),
          )
          .unique()
      : await ctx.db
          .query("subscriptions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .order("desc")
          .first();

    const doc = { userId: user._id, ...data, updatedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, doc);
    else await ctx.db.insert("subscriptions", doc);
  },
});

/** Demo billing: lets the full upgrade flow work before any payment provider is connected. */
export const demoCheckout = mutation({
  args: { plan: v.string(), amountCents: v.number(), currency: v.string() },
  handler: async (ctx, args) => {
    if ((process.env.BILLING_MODE ?? "demo") !== "demo") {
      throw new Error("Demo checkout is disabled (BILLING_MODE is not 'demo')");
    }
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
    const doc = {
      userId: user._id,
      provider: "demo" as const,
      plan: args.plan,
      status: "active" as const,
      amountCents: args.amountCents,
      currency: args.currency,
      currentPeriodEnd: Date.now() + 30 * 86_400_000,
      updatedAt: Date.now(),
    };
    if (existing) await ctx.db.patch(existing._id, doc);
    else await ctx.db.insert("subscriptions", doc);
  },
});

export const demoCancel = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
    if (sub && sub.provider === "demo") {
      await ctx.db.patch(sub._id, { status: "canceled", updatedAt: Date.now() });
    }
  },
});

export const listSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const subs = await ctx.db.query("subscriptions").order("desc").take(100);
    return await Promise.all(
      subs.map(async (s) => {
        const user = await ctx.db.get(s.userId);
        return { ...s, email: user?.email, name: user?.name };
      }),
    );
  },
});
