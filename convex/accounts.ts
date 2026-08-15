// convex/accounts.ts
import Zernio from "@zernio/node";
import { action, internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Allowed platform union from your schema.ts
export type SupportedPlatform =
  | "twitter"
  | "linkedin"
  | "linkedin_page"
  | "facebook"
  | "facebook_page"
  | "instagram"
  | "instagram_business"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "threads"
  | "bluesky"
  | "reddit"
  | "snapchat"
  | "google_business"
  | "telegram";

const VALID_PLATFORMS = new Set<string>([
  "twitter",
  "linkedin",
  "linkedin_page",
  "facebook",
  "facebook_page",
  "instagram",
  "instagram_business",
  "tiktok",
  "youtube",
  "pinterest",
  "threads",
  "bluesky",
  "reddit",
  "snapchat",
  "google_business",
  "telegram",
]);
function normalizePlatform(rawPlatform: string): SupportedPlatform {
  const normalized = rawPlatform.toLowerCase().trim().replace(/-/g, "_");
  if (VALID_PLATFORMS.has(normalized)) {
    return normalized as SupportedPlatform;
  }
  // Common aliases
  if (normalized === "x") return "twitter";
  if (normalized === "youtube_channel") return "youtube";
  if (normalized === "google_my_business" || normalized === "gmb") return "google_business";
  
  return normalized as SupportedPlatform; // Return actual string instead of defaulting to twitter
}
export const saveSyncedAccounts = internalMutation({
  args: {
    userId: v.id("users"),
    tokenIdentifier: v.optional(v.string()),
    accounts: v.array(
      v.object({
        zernioAccountId: v.string(),
        platform: v.string(),
        username: v.optional(v.string()),
        handle: v.optional(v.string()),
        displayName: v.string(),
        avatarUrl: v.optional(v.string()),
        isConnected: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const existingMap = new Map(existing.map((acc) => [acc.zernioAccountId, acc]));

    for (const acc of args.accounts) {
      const match = existingMap.get(acc.zernioAccountId);

      const platform = normalizePlatform(acc.platform);
      const status: "connected" | "disconnected" = acc.isConnected
        ? "connected"
        : "disconnected";

      const handle =
        acc.handle ||
        (acc.username
          ? `@${acc.username}`
          : `@${acc.displayName.toLowerCase().replace(/\s+/g, "")}`);

      if (match) {
        await ctx.db.patch(match._id, {
          platform,
          username: acc.username,
          handle,
          displayName: acc.displayName,
          avatarUrl: acc.avatarUrl,
          status,
          tokenIdentifier: args.tokenIdentifier ?? match.tokenIdentifier ?? "",
        });
        existingMap.delete(acc.zernioAccountId);
      } else {
        await ctx.db.insert("accounts", {
          userId: args.userId,
          tokenIdentifier: args.tokenIdentifier ?? "",
          zernioAccountId: acc.zernioAccountId,
          platform,
          username: acc.username,
          handle,
          displayName: acc.displayName,
          avatarUrl: acc.avatarUrl,
          status,
        });
      }
    }

    for (const [, orphan] of existingMap) {
      await ctx.db.delete(orphan._id);
    }
  },
});
export const getUserWithKey = internalQuery({
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



// 3. Action to fetch accounts from Zernio and format platform-specific payload
export const syncAccountsFromZernio = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; count: number }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user: { _id: any; zernioKey?: string; zernioProfileId?: string } | null =
      await ctx.runQuery(internal.accounts.getUserWithKey, {
        tokenIdentifier: identity.tokenIdentifier,
      });

    if (!user) throw new Error("User not found");

    const apiKey: string | undefined =
      user.zernioKey ;

    if (!apiKey) throw new Error("No Zernio API key configured");

    const zernio = new Zernio({ apiKey });

    try {
      const response = await zernio.accounts.listAccounts({
        profileId: user.zernioProfileId,
      });

      const rawList: any[] = Array.isArray(response)
        ? response
        : response?.data?.accounts || response?.data || [];

      // Extract details flexibly across all social platform payloads
      const formattedAccounts = rawList.map((acc) => {
        const username = acc.username || acc.handle || acc.screenName || undefined;
        const displayName =
          acc.displayName || acc.name || acc.title || username || "Social Channel";

        return {
          zernioAccountId: String(acc.id || acc._id),
          platform: String(acc.platform || acc.provider || "unknown").toLowerCase(),
          username: username ? String(username) : undefined,
          displayName: String(displayName),
          avatarUrl: acc.avatarUrl || acc.picture || acc.avatar || undefined,
          isConnected: acc.status === "active" || acc.connected !== false,
        };
      });

      await ctx.runMutation(internal.accounts.saveSyncedAccounts, {
        userId: user._id,
        accounts: formattedAccounts,
      });

      return { success: true, count: formattedAccounts.length };
    } catch (error) {
      console.error("Zernio account sync error:", error);
      return { success: false, count: 0 };
    }
  },
});

// 4. Reactive Query for accounts
export const listAccounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});


export const getConnectUrl = action({
  args: {
    platform: v.string(),
    redirectUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user: {
      _id: any;
      tokenIdentifier: string;
      zernioKey?: string;
      zernioProfileId?: string;
    } | null = await ctx.runQuery(internal.accounts.getUserWithKey, {
      tokenIdentifier: identity.tokenIdentifier,
    });

    if (!user) throw new Error("User record not found");

    const apiKey = user.zernioKey || process.env.ZERNIO_API_KEY;
    if (!apiKey) throw new Error("No Zernio API key configured");

    try {
      const zernio = new Zernio({ apiKey });
      let authUrl = "";

      // 1. Try SDK getConnectUrl method
      if (typeof (zernio as any).connect?.getConnectUrl === "function") {
        const res = await (zernio as any).connect.getConnectUrl({
          path: { platform: args.platform },
          query: {
            profileId: user.zernioProfileId,
            redirect_url: args.redirectUrl,
          },
        });
        authUrl = res?.data?.authUrl || res?.authUrl;
      } 
      // 2. Try SDK accounts.connect method
      else if (typeof (zernio as any).accounts?.connect === "function") {
        const res = await (zernio as any).accounts.connect({
          platform: args.platform,
          profileId: user.zernioProfileId,
          redirectUrl: args.redirectUrl,
        });
        authUrl = res?.authUrl || res?.data?.authUrl;
      }

      // 3. Fallback direct HTTP endpoint (https://zernio.com/api/v1/connect/{platform})
      if (!authUrl) {
        const queryParams = new URLSearchParams();
        if (user.zernioProfileId) queryParams.append("profileId", user.zernioProfileId);
        if (args.redirectUrl) queryParams.append("redirect_url", args.redirectUrl);

        const res = await fetch(
          `https://zernio.com/api/v1/connect/${args.platform}?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        authUrl = data.authUrl || data.url || data.data?.authUrl;
      }

      if (!authUrl) throw new Error("Failed to generate auth URL from Zernio.");

      return { url: authUrl };
    } catch (error: any) {
      console.error("Zernio getConnectUrl error:", error);
      throw new Error(error.message || "Could not generate OAuth redirect link");
    }
  },
});


export const getAccountById = internalQuery({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.accountId);
  },
});

export const deleteAccountRecord = internalMutation({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.accountId);
  },
});

export const disconnectAccount = action({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Fetch account details
    const account = await ctx.runQuery(internal.accounts.getAccountById, {
      accountId: args.accountId,
    });

    if (!account) throw new Error("Account not found");

    const user = await ctx.runQuery(internal.accounts.getUserWithKey, {
      tokenIdentifier: identity.tokenIdentifier,
    });

    if (!user || account.userId !== user._id) {
      throw new Error("Unauthorized to disconnect this account");
    }

    const apiKey = user.zernioKey || process.env.ZERNIO_API_KEY;

    // 1. Revoke / delete account from Zernio
    if (apiKey && account.zernioAccountId) {
      try {
        const zernio = new Zernio({ apiKey });

        if (typeof (zernio as any).accounts?.deleteAccount === "function") {
          await (zernio as any).accounts.deleteAccount({
            path: { accountId: account.zernioAccountId },
          });
        } else if (typeof (zernio as any).accounts?.disconnect === "function") {
          await (zernio as any).accounts.disconnect({
            path: { accountId: account.zernioAccountId },
          });
        } else {
          // Direct REST API fallback
          await fetch(`https://zernio.com/api/v1/accounts/${account.zernioAccountId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          });
        }
      } catch (err) {
        console.warn("Zernio disconnect API notice:", err);
      }
    }

    // 2. Remove record from Convex database
    await ctx.runMutation(internal.accounts.deleteAccountRecord, {
      accountId: args.accountId,
    });

    return { success: true };
  },
});

export const listUserAccountsInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});