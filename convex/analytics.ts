import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { dayKey, getCurrentUser, requireAdmin } from "./lib";

const ALLOWED_EVENTS = new Set(["pageview", "cta_click", "checkout_started", "signup"]);

/** First-party, cookie-less analytics. Works with zero third-party setup. */
export const track = mutation({
  args: {
    name: v.string(),
    path: v.optional(v.string()),
    anonymousId: v.optional(v.string()),
    referrer: v.optional(v.string()),
    props: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))),
  },
  handler: async (ctx, args) => {
    if (!ALLOWED_EVENTS.has(args.name)) return;
    const user = await getCurrentUser(ctx);
    await ctx.db.insert("events", {
      name: args.name,
      path: args.path?.slice(0, 300),
      anonymousId: args.anonymousId?.slice(0, 64),
      referrer: args.referrer?.slice(0, 300),
      props: args.props,
      userId: user?._id,
      day: dayKey(Date.now()),
    });
  },
});

export const overview = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days }) => {
    await requireAdmin(ctx);
    const span = Math.min(Math.max(days ?? 14, 1), 90);
    const now = Date.now();
    const series: { day: string; pageviews: number; signups: number; visitors: number }[] = [];

    for (let i = span - 1; i >= 0; i--) {
      const day = dayKey(now - i * 86_400_000);
      const pageviews = await ctx.db
        .query("events")
        .withIndex("by_name_day", (q) => q.eq("name", "pageview").eq("day", day))
        .take(5000);
      const signups = await ctx.db
        .query("events")
        .withIndex("by_name_day", (q) => q.eq("name", "signup").eq("day", day))
        .take(5000);
      series.push({
        day,
        pageviews: pageviews.length,
        signups: signups.length,
        visitors: new Set(pageviews.map((e) => e.anonymousId ?? e.userId ?? e._id)).size,
      });
    }

    const users = await ctx.db.query("users").take(10_000);
    const active = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(10_000);
    const mrrCents = active.reduce((sum, s) => sum + s.amountCents, 0);

    const recent = await ctx.db.query("events").order("desc").take(400);
    const pathCounts = new Map<string, number>();
    for (const e of recent) {
      if (e.name === "pageview" && e.path) pathCounts.set(e.path, (pathCounts.get(e.path) ?? 0) + 1);
    }
    const topPages = [...pathCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([path, views]) => ({ path, views }));

    return {
      series,
      totals: {
        users: users.length,
        admins: users.filter((u) => u.role === "admin").length,
        activeSubscriptions: active.length,
        mrrCents,
        pageviews: series.reduce((s, d) => s + d.pageviews, 0),
        signups: series.reduce((s, d) => s + d.signups, 0),
      },
      topPages,
    };
  },
});
