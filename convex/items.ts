import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib";

const FREE_LIMIT = 5;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("items")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100);
  },
});

export const create = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const user = await requireUser(ctx);
    const trimmed = title.trim().slice(0, 200);
    if (!trimmed) throw new Error("Title is required");

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
    const isPaid = sub && (sub.status === "active" || sub.status === "trialing");
    if (!isPaid) {
      const count = (
        await ctx.db
          .query("items")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .take(FREE_LIMIT + 1)
      ).length;
      if (count >= FREE_LIMIT) {
        throw new Error(`Free plan is limited to ${FREE_LIMIT} items. Upgrade to add more.`);
      }
    }
    return await ctx.db.insert("items", { userId: user._id, title: trimmed, done: false });
  },
});

export const toggle = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, { id }) => {
    const user = await requireUser(ctx);
    const item = await ctx.db.get(id);
    if (!item || item.userId !== user._id) throw new Error("Not found");
    await ctx.db.patch(id, { done: !item.done });
  },
});

export const remove = mutation({
  args: { id: v.id("items") },
  handler: async (ctx, { id }) => {
    const user = await requireUser(ctx);
    const item = await ctx.db.get(id);
    if (!item || item.userId !== user._id) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});
