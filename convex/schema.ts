import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users mapped directly from Clerk identity
  users: defineTable({
    clerkUserId: v.string(), // Clerk User ID (sub)
    tokenIdentifier: v.string(), // Full Clerk Issuer token identifier
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    zernioKey: v.optional(v.string()),
    apiKeyValid: v.optional(v.boolean()),
    apiKeyLastValidatedAt: v.optional(v.number()),
    zernioProfileId: v.optional(v.string()),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_token_identifier", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  // Strictly user-isolated accounts
  accounts: defineTable({
    userId: v.id("users"),
    tokenIdentifier: v.string(), // Clerk token identifier
    accessToken: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    handle: v.optional(v.string()),
    platform: v.union(
      v.literal("twitter"),
      v.literal("linkedin"),
      v.literal("facebook"),
      v.literal("facebook_page"),
      v.literal("linkedin_page"),
      v.literal("instagram_business"),
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("youtube"),
      v.literal("pinterest"),       // Added
      v.literal("threads"),         // Added
      v.literal("bluesky"),         // Added
      v.literal("reddit"),          // Added
      v.literal("snapchat"),        // Added
      v.literal("google_business"), // Added
      v.literal("telegram")
    ),
    username: v.optional(v.string()),   // Made optional to prevent validator crashes
    displayName: v.string(),
    refreshToken: v.optional(v.string()),
    status: v.union(v.literal("connected"), v.literal("disconnected")),
    updatedAt: v.optional(v.float64()),
    zernioAccountId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_token_identifier", ["tokenIdentifier"])
    .index("by_token_and_platform", ["tokenIdentifier", "platform"]),

  // Strictly user-isolated posts
  posts: defineTable({
    userId: v.id("users"),
    tokenIdentifier: v.string(), // Clerk token identifier
    zernioPostId: v.optional(v.string()), // <--- ADD THIS LINE
    accountIds: v.optional(v.array(v.string())),
    content: v.string(),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    mediaUrl: v.optional(v.string()),
    platforms: v.array(
      v.union(
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
      )
    ),
    scheduledFor: v.optional(v.float64()),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("failed")
    ),
    updatedAt: v.optional(v.float64()),
    createdAt: v.optional(v.float64()),
  })
    .index("by_token_identifier", ["tokenIdentifier"])
    .index("by_status_and_scheduled_for", ["status", "scheduledFor"]),

  // Shared/Inspiration Generations Feed (Loose Access)
  generations: defineTable({
    creatorUserId: v.id("users"),
    creatorName: v.string(),
    prompt: v.string(),
    content: v.string(), // AI generated copy
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    mediaUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")), // Nano Banana image storage reference
    tone: v.optional(v.string()),
    isPublicInspiration: v.boolean(), // Allows sharing to general inspiration feed
    createdAt: v.float64(),
  }).index("by_creator", ["creatorUserId"]),

  // Activity logs per user
  activityLogs: defineTable({
    userId: v.id("users"),
    tokenIdentifier: v.string(),
    actionType: v.union(
      v.literal("POST_PUBLISHED"),
      v.literal("AI_REPLY"),
      v.literal("AI_GENERATED")
    ),
    aiGeneratedText: v.optional(v.string()),
    description: v.string(),
    platform: v.optional(v.string()),
    relatedPostId: v.optional(v.id("posts")),
  })
    .index("by_token_identifier", ["tokenIdentifier"])
    .index("by_related_post", ["relatedPostId"]),
});