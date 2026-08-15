// convex/users.ts
import Zernio from "@zernio/node";
import { api, internal } from "./_generated/api";
import { internalQuery, mutation, query, QueryCtx, MutationCtx, internalMutation, action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Helper for Queries and Mutations (which have direct ctx.db access)
 */
export async function getCurrentUserOrThrow(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: Sign in via Clerk first.");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token_identifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    throw new Error("User record not found in Convex database.");
  }
  return { identity, user };
}

/**
 * Internal Query for Actions (called via ctx.runQuery)
 */
export const getCurrentUserForAction = internalQuery({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (!user) return null;

    return { identity, user };
  },
});


export const syncClerkUser = mutation({
  args: { zernioKey: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: identity.name ?? identity.nickname ?? "User",
        email: identity.email ?? "",
        avatarUrl: identity.pictureUrl,
        ...(args.zernioKey ? { zernioKey: args.zernioKey } : {}),
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? identity.nickname ?? "User",
      email: identity.email ?? "",
      avatarUrl: identity.pictureUrl,
      zernioKey: args.zernioKey,
    });
  },
});

export const me = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();
  },
});

export const upsertFromWebhook = internalMutation({
  args: {
    clerkUserId: v.string(),
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .unique();

    if (existingUser !== null) {
      await ctx.db.patch(existingUser._id, {
        clerkUserId: args.clerkUserId,
        name: args.name,
        email: args.email,
       
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      tokenIdentifier: args.tokenIdentifier,
      name: args.name,
      email: args.email,
      
      zernioKey: "", // Configured later in settings
      
    });
  },
});


export const deleteFromWebhook = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

export const storeUser = mutation({
  args: {
   
  },
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Raw Clerk User ID (e.g. "user_2...")
    const clerkUserId = identity.subject;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (existingUser !== null) {
      await ctx.db.patch(existingUser._id, {
        clerkUserId,
        name: identity.name ?? identity.nickname ?? "User",
        email: identity.email ?? "",
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId,
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? identity.nickname ?? "User",
      email: identity.email ?? "",
      
    });
  },
});


export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
  },
});

export const updateZernioKey = mutation({
  args: {
    zernioKey: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      zernioKey: args.zernioKey,
    });
  },
});


function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "sk_...????";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

// ------------------------------------------------------------------
// QUERY: Read API Key Status
// ------------------------------------------------------------------
export const getApiKeyStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return null;

    const key = user.zernioKey?.trim() || "";
    const hasKey = key.length > 0;

    return {
      hasKey,
      zernioKey: user.zernioKey ?? null,
      maskedKey: hasKey ? maskApiKey(key) : null,
      zernioProfileId: user.zernioProfileId ?? null,
    };
  },
});


// Internal helper query accessible only by server actions
export const getUserByTokenIdentifier = internalQuery({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .unique();
  },
});
export const updateApiKeyValidationStatus = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    isValid: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        apiKeyValid: args.isValid,
        apiKeyLastValidatedAt: Date.now(),
      });
    }
  },
});

// Convex Action matching your tRPC validateApiKey procedure
export const validateApiKey = action({
  args: {},
  handler: async (ctx): Promise<{ valid: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // 1. Fetch user's stored Zernio key
    const user: { zernioKey?: string } | null = await ctx.runQuery(
      internal.users.getUserByTokenIdentifier,
      { tokenIdentifier: identity.tokenIdentifier }
    );

    const apiKey: string | undefined =
      user?.zernioKey;

    // If no key exists at all, mark invalid and return false
    if (!apiKey) {
      await ctx.runMutation(internal.users.updateApiKeyValidationStatus, {
        tokenIdentifier: identity.tokenIdentifier,
        isValid: false,
      });
      return { valid: false };
    }

    let isValid = false;

    // 2. Try validating against Zernio SDK
    try {
      const zernio = new Zernio({ apiKey });
      await zernio.profiles.listProfiles();
      isValid = true;
    } catch {
      isValid = false;
    }

    // 3. Update database record with result and timestamp
    await ctx.runMutation(internal.users.updateApiKeyValidationStatus, {
      tokenIdentifier: identity.tokenIdentifier,
      isValid,
    });

    return { valid: isValid };
  },
});


export const getZernioKey = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Lookup user using the indexed tokenIdentifier
    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return null;
    }

    return {
      zernioKey: user.zernioKey ?? null,
    };
  },
});