import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const role = v.union(v.literal("admin"), v.literal("member"));

export const subscriptionStatus = v.union(
  v.literal("active"),
  v.literal("trialing"),
  v.literal("past_due"),
  v.literal("canceled"),
  v.literal("incomplete"),
);

export const billingProvider = v.union(v.literal("stripe"), v.literal("polar"), v.literal("demo"));

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    externalId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role,
    createdAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_external_id", ["externalId"])
    .index("by_created", ["createdAt"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    provider: billingProvider,
    plan: v.string(),
    status: subscriptionStatus,
    externalCustomerId: v.optional(v.string()),
    externalSubscriptionId: v.optional(v.string()),
    amountCents: v.number(),
    currency: v.string(),
    currentPeriodEnd: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_external_subscription", ["externalSubscriptionId"])
    .index("by_status", ["status"]),

  items: defineTable({
    userId: v.id("users"),
    title: v.string(),
    done: v.boolean(),
  }).index("by_user", ["userId"]),

  events: defineTable({
    name: v.string(),
    path: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    anonymousId: v.optional(v.string()),
    referrer: v.optional(v.string()),
    props: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))),
    day: v.string(),
  })
    .index("by_day", ["day"])
    .index("by_name_day", ["name", "day"]),
});
