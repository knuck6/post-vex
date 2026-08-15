import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const platformValidator = v.union(
  v.literal("twitter"),
  v.literal("linkedin"),
  v.literal("facebook"),
  v.literal("facebook_page"),
  v.literal("linkedin_page"),
  v.literal("instagram_business"),
  v.literal("instagram"),
  v.literal("tiktok"),
  v.literal("youtube"),
  v.literal("pinterest"),
  v.literal("threads"),
  v.literal("bluesky")
);

// ------------------------------------------------------------------
export const getZernioPosts = action({
  args: {},
  handler: async (ctx) => {
    const userZernio = await ctx.runQuery(api.users.getZernioKey);
    if (!userZernio?.zernioKey) {
      return { upcoming: [], published: [], drafts: [] };
    }

    const response = await fetch("https://api.zernio.com/v1/posts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userZernio.zernioKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Zernio posts: ${response.statusText}`);
    }

    const data = await response.json();
    const rawPosts: any[] = Array.isArray(data) ? data : data.posts || [];

    // Parse platform list and sum up reactions/engagement stats
    const formatted = rawPosts.map((p) => {
      const platforms = (p.platforms || []).map((item: any) =>
        typeof item === "string" ? item : item.platform
      );

      // Zernio returns engagement inside stats or analytics
      const stats = p.stats || p.analytics || {};
      const likes = stats.likes || 0;
      const comments = stats.comments || 0;
      const shares = stats.shares || stats.retweets || 0;
      const totalReactions =
        stats.reactions !== undefined
          ? stats.reactions
          : likes + comments + shares;

      return {
        id: p.id || p._id,
        content: p.content,
        status: p.status,
        platforms, // e.g. ["bluesky", "youtube"]
        reactions: totalReactions, // total reactions count
        stats: { likes, comments, shares },
        scheduledFor: p.scheduledFor,
        createdAt: p.createdAt,
      };
    });

    return {
      upcoming: formatted.filter(
        (p) => p.status === "scheduled" || p.status === "queued"
      ),
      published: formatted.filter((p) => p.status === "published"),
      drafts: formatted.filter((p) => p.status === "draft"),
    };
  },
});

// ------------------------------------------------------------------
// 2. Sync live Zernio status into local Convex DB
// ------------------------------------------------------------------
export const syncZernioPosts = action({
  args: {},
  handler: async (ctx) => {
    const userZernio = await ctx.runQuery(api.users.getZernioKey);
    if (!userZernio?.zernioKey) return;

    const response = await fetch("https://api.zernio.com/v1/posts", {
      headers: { Authorization: `Bearer ${userZernio.zernioKey}` },
    });

    if (!response.ok) return;

    const data = await response.json();
    const zernioPosts: any[] = Array.isArray(data) ? data : data.posts || [];

    for (const zPost of zernioPosts) {
      await ctx.runMutation(api.posts.upsertZernioPostRecord, {
        zernioPostId: zPost.id || zPost._id,
        content: zPost.content || "",
        status: zPost.status,
        scheduledFor: zPost.scheduledFor
          ? new Date(zPost.scheduledFor).getTime()
          : undefined,
      });
    }
  },
});

export const upsertZernioPostRecord = mutation({
  args: {
    zernioPostId: v.string(),
    content: v.string(),
    status: v.string(),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const existing = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("zernioPostId"), args.zernioPostId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status as any,
        scheduledFor: args.scheduledFor,
        updatedAt: Date.now(),
      });
    }
  },
});

// ------------------------------------------------------------------
// 3. Create Post Action
// ------------------------------------------------------------------
export const createPost = action({
  args: {
    platforms: v.array(platformValidator),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    publishType: v.optional(v.union(v.literal("now"), v.literal("scheduled"))),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userZernio = await ctx.runQuery(api.users.getZernioKey);
    if (!userZernio?.zernioKey) {
      throw new Error("Zernio API key is missing for this user.");
    }

    const connectedAccounts = await ctx.runQuery(api.accounts.listAccounts);
    if (!connectedAccounts || connectedAccounts.length === 0) {
      throw new Error("No connected social accounts found.");
    }

    const formattedPlatforms = args.platforms
      .map((platform) => {
        const account = connectedAccounts.find(
          (acc: any) => acc.platform === platform && acc.status === "connected"
        );
        if (!account) return null;

        return {
          platform,
          accountId: account.zernioAccountId || account._id,
        };
      })
      .filter(Boolean);

    if (formattedPlatforms.length === 0) {
      throw new Error("No connected account matched the selected platforms.");
    }

    const payload: Record<string, any> = {
      platforms: formattedPlatforms,
      content: args.content,
    };

    if (args.mediaUrl) {
      payload.mediaUrl = args.mediaUrl;
      payload.mediaType = args.mediaType || "image";
    }

    if (args.publishType === "scheduled" && args.scheduledFor) {
      payload.publishNow = false;
      payload.status = "scheduled";
      payload.scheduledFor = new Date(args.scheduledFor).toISOString();
    } else {
      payload.publishNow = true;
      payload.status = "published";
    }

    const response = await fetch("https://api.zernio.com/v1/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userZernio.zernioKey}`,
      },
      body: JSON.stringify(payload),
    });

    const resData = (await response.json()) as { id?: string; postId?: string };

    if (!response.ok) {
      throw new Error(
        `Zernio API Error [${response.status}]: ${JSON.stringify(resData)}`
      );
    }

    const zernioPostId = resData.id || resData.postId;

    await ctx.runMutation(api.posts.savePostRecord, {
      zernioPostId,
      platforms: args.platforms,
      content: args.content,
      mediaUrl: args.mediaUrl,
      mediaType: args.mediaType,
      status: args.publishType === "scheduled" ? "scheduled" : "published",
      scheduledFor: args.scheduledFor,
    });

    return {
      success: true,
      status: args.publishType === "scheduled" ? "scheduled" : "published",
      zernioPostId,
    };
  },
});

export const savePostRecord = mutation({
  args: {
    zernioPostId: v.optional(v.string()),
    platforms: v.array(platformValidator),
    accountIds: v.optional(v.array(v.string())),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    status: v.union(
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("draft")
    ),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated user.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User record not found in database.");
    }

    return await ctx.db.insert("posts", {
      userId: user._id,
      tokenIdentifier: identity.tokenIdentifier,
      zernioPostId: args.zernioPostId,
      platforms: args.platforms,
      accountIds: args.accountIds,
      content: args.content,
      mediaUrl: args.mediaUrl,
      mediaType: args.mediaType,
      status: args.status,
      scheduledFor: args.scheduledFor,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});



export const getPostsOverview = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { upcoming: [], published: [] };

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    if (!user) return { upcoming: [], published: [] };

    const upcoming = await ctx.db
      .query("posts")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("status"), "scheduled")
        )
      )
      .order("desc")
      .take(20);

    const published = await ctx.db
      .query("posts")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("status"), "published")
        )
      )
      .order("desc")
      .take(20);

    return { upcoming, published };
  },
});