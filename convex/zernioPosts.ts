// convex/zernioPosts.ts
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { getZernioClientForClerkUser } from "./zernioClient";

const platformValidator = v.union(
  v.literal("twitter"),
  v.literal("linkedin"),
  v.literal("facebook"),
  v.literal("facebook_page"),
  v.literal("linkedin_page"),
  v.literal("instagram_business"),
  v.literal("instagram"),
  v.literal("tiktok")
);

const statusValidator = v.union(
  v.literal("draft"),
  v.literal("scheduled"),
  v.literal("published"),
  v.literal("failed")
);

/**
 * Action: Create and Publish/Schedule a Post via Zernio SDK
 */
export const createAndPublishPost = action({
  args: {
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    platforms: v.array(platformValidator),
    scheduledFor: v.optional(v.float64()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ postId: Id<"posts">; zernioPostId: string }> => {
    // 1. Get authenticated Zernio client and user context safely
    const { zernio, user, identity } = await getZernioClientForClerkUser(ctx);

    const initialStatus = args.scheduledFor ? "scheduled" : "draft";

    // 2. Insert initial post into Convex DB
    const postId: Id<"posts"> = await ctx.runMutation(
      internal.zernioPosts.savePost,
      {
        userId: user._id,
        tokenIdentifier: identity.tokenIdentifier,
        content: args.content,
        mediaUrl: args.mediaUrl,
        mediaType: args.mediaType,
        platforms: args.platforms,
        scheduledFor: args.scheduledFor,
        status: initialStatus,
      }
    );

    try {
      const mediaItems =
        args.mediaUrl && args.mediaType
          ? [{ type: args.mediaType, url: args.mediaUrl }]
          : undefined;

      // 3. Call Zernio API via Node SDK
      const { data: postResult } = await zernio.posts.createPost({
        content: args.content,
        mediaItems,
        platforms: args.platforms.map((platform) => ({ platform })),
        publishNow: !args.scheduledFor,
        scheduledAt: args.scheduledFor
          ? new Date(args.scheduledFor).toISOString()
          : undefined,
      });

      const finalStatus = args.scheduledFor ? "scheduled" : "published";

      // 4. Update post status to success
      await ctx.runMutation(internal.zernioPosts.updatePostStatus, {
        postId,
        status: finalStatus,
      });

      // 5. Log activity record
      await ctx.runMutation(internal.zernioPosts.logActivity, {
        userId: user._id,
        tokenIdentifier: identity.tokenIdentifier,
        description: `Successfully ${finalStatus} post to ${args.platforms.join(", ")}`,
        relatedPostId: postId,
      });

      return { postId, zernioPostId: postResult._id };
    } catch (error: any) {
      // Handle failures gracefully without breaking action workflow
      await ctx.runMutation(internal.zernioPosts.updatePostStatus, {
        postId,
        status: "failed",
      });

      await ctx.runMutation(internal.zernioPosts.logActivity, {
        userId: user._id,
        tokenIdentifier: identity.tokenIdentifier,
        description: `Failed to publish post: ${error.message || "Unknown error"}`,
        relatedPostId: postId,
      });

      throw error;
    }
  },
});

/**
 * Action: Fetch Post Analytics from Zernio
 */
export const getPostAnalytics = action({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args): Promise<any> => {
    const { zernio } = await getZernioClientForClerkUser(ctx);

    const post = await ctx.runQuery(internal.zernioPosts.getPost, {
      postId: args.postId,
    });

    if (!post) {
      throw new Error("Post record not found.");
    }

    // Call Zernio SDK analytics method
    const { data: analytics } = await zernio.analytics.getAnalytics({
      query: { postId: String(args.postId) },
    });

    return analytics;
  },
});

// ==========================================
// INTERNAL DB MUTATIONS AND QUERIES
// ==========================================

export const savePost = internalMutation({
  args: {
    userId: v.id("users"),
    tokenIdentifier: v.string(),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    platforms: v.array(platformValidator),
    scheduledFor: v.optional(v.float64()),
    status: statusValidator,
  },
  handler: async (ctx, args): Promise<Id<"posts">> => {
    return await ctx.db.insert("posts", {
      userId: args.userId,
      tokenIdentifier: args.tokenIdentifier,
      content: args.content,
      mediaUrl: args.mediaUrl,
      mediaType: args.mediaType,
      platforms: args.platforms,
      scheduledFor: args.scheduledFor,
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const updatePostStatus = internalMutation({
  args: {
    postId: v.id("posts"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const logActivity = internalMutation({
  args: {
    userId: v.id("users"),
    tokenIdentifier: v.string(),
    description: v.string(),
    relatedPostId: v.optional(v.id("posts")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLogs", {
      userId: args.userId,
      tokenIdentifier: args.tokenIdentifier,
      actionType: "POST_PUBLISHED",
      description: args.description,
      relatedPostId: args.relatedPostId,
    });
  },
});

export const getPost = internalQuery({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});