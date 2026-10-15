import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { dayKey, getCurrentUser, requireAdmin } from "./lib";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

type ClerkUser = {
  first_name: string | null;
  last_name: string | null;
  image_url?: string;
  primary_email_address_id: string | null;
  email_addresses: { id: string; email_address: string }[];
};

/**
 * Sync the signed-in user into Convex. Called by the client after sign-in.
 *
 * Clerk's default session token has no email/name claims, and client-supplied
 * profile data can't be trusted for ADMIN_EMAILS, so the profile is fetched
 * server-side from the Clerk Backend API (CLERK_SECRET_KEY on Convex).
 */
export const sync = action({
  args: {},
  handler: async (ctx): Promise<Id<"users"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    let profile: { email?: string; name?: string; imageUrl?: string } = {};
    const secret = process.env.CLERK_SECRET_KEY;
    if (secret) {
      const res = await fetch(`https://api.clerk.com/v1/users/${identity.subject}`, {
        headers: { authorization: `Bearer ${secret}` },
      });
      if (res.ok) {
        const u = (await res.json()) as ClerkUser;
        const primary = u.email_addresses.find((e) => e.id === u.primary_email_address_id);
        profile = {
          email: primary?.email_address?.toLowerCase(),
          name: [u.first_name, u.last_name].filter(Boolean).join(" ") || undefined,
          imageUrl: u.image_url,
        };
      }
    }
    return await ctx.runMutation(internal.users.upsert, {
      tokenIdentifier: identity.tokenIdentifier,
      externalId: identity.subject,
      email: profile.email ?? identity.email?.toLowerCase(),
      name: profile.name ?? identity.name,
      imageUrl: profile.imageUrl ?? identity.pictureUrl,
    });
  },
});

/** The first user ever created becomes admin; ADMIN_EMAILS also grants admin. */
export const upsert = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    externalId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const isListedAdmin = !!args.email && adminEmails().includes(args.email);
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email ?? existing.email,
        name: args.name ?? existing.name,
        imageUrl: args.imageUrl ?? existing.imageUrl,
        lastSeenAt: now,
        ...(isListedAdmin && existing.role !== "admin" ? { role: "admin" as const } : {}),
      });
      return existing._id;
    }

    const anyUser = await ctx.db.query("users").first();
    const userId = await ctx.db.insert("users", {
      ...args,
      role: !anyUser || isListedAdmin ? "admin" : "member",
      createdAt: now,
      lastSeenAt: now,
    });
    await ctx.db.insert("events", { name: "signup", userId, day: dayKey(now) });
    return userId;
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
    return { ...user, subscription };
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);
    const users = await ctx.db
      .query("users")
      .withIndex("by_created")
      .order("desc")
      .take(Math.min(limit ?? 50, 200));
    return await Promise.all(
      users.map(async (u) => ({
        ...u,
        subscription: await ctx.db
          .query("subscriptions")
          .withIndex("by_user", (q) => q.eq("userId", u._id))
          .order("desc")
          .first(),
      })),
    );
  },
});

export const setRole = mutation({
  args: { userId: v.id("users"), role: v.union(v.literal("admin"), v.literal("member")) },
  handler: async (ctx, { userId, role }) => {
    const admin = await requireAdmin(ctx);
    if (admin._id === userId && role !== "admin") {
      throw new Error("You can't demote yourself");
    }
    await ctx.db.patch(userId, { role });
  },
});
