import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getZernioClientForClerkUser } from "./zernioClient";

export const upsertAccount = internalMutation({
  args: {
    userId: v.id("users"),
    tokenIdentifier: v.string(),
    handle: v.string(),
    platform: v.any(),
    zernioAccountId: v.string(),
    avatarUrl: v.optional(v.string()),
    status: v.union(v.literal("connected"), v.literal("disconnected")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_token_and_platform", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier).eq("platform", args.platform)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        handle: args.handle,
        avatarUrl: args.avatarUrl,
        zernioAccountId: args.zernioAccountId,
        status: args.status,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("accounts", {
        userId: args.userId,
        tokenIdentifier: args.tokenIdentifier,
        platform: args.platform,
        handle: args.handle,
        displayName:"",
        zernioAccountId: args.zernioAccountId,
        avatarUrl: args.avatarUrl,
        status: args.status,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getConnectUrl = action({
  args: { platform: v.string(), redirectUrl: v.string() },
  handler: async (ctx, args) => {
    const { zernio, user } = await getZernioClientForClerkUser(ctx);
    if (!user.zernioProfileId) throw new Error("Default profile not initialized.");

    const res = await zernio.connect.getConnectUrl({
      path: { platform: args.platform },
      query: { profileId: user.zernioProfileId, redirect_url: args.redirectUrl },
    });

    return res.data.authUrl;
  },
});



export const getAccount = internalQuery({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => ctx.db.get(args.accountId),
});

export const markDisconnected = internalMutation({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.accountId, { status: "disconnected", updatedAt: Date.now() });
  },
});