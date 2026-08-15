// convex/dashboard.ts
import { query } from "./_generated/server";

export const getDashboardOverview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const tokenIdentifier = identity.tokenIdentifier;

    // 1. Fetch posts, accounts, and logs scoped strictly to the authenticated user
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", tokenIdentifier)
      )
      .collect();

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", tokenIdentifier)
      )
      .collect();

    const activityLogs = await ctx.db
      .query("activityLogs")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", tokenIdentifier)
      )
      .order("desc")
      .take(10);

    // 2. Calculate timestamp threshold for "today" (Midnight start of local/UTC day)
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    // 3. Compute Card 1: Scheduled Posts
    const scheduledPosts = posts.filter((p) => p.status === "scheduled");
    const scheduledTotal = scheduledPosts.length;
    const scheduledTodayCount = scheduledPosts.filter(
      (p) => (p.scheduledFor ?? p._creationTime) >= startOfToday
    ).length;

    // 4. Compute Card 2: Published Posts
    const publishedPosts = posts.filter((p) => p.status === "published");
    const publishedTotal = publishedPosts.length;
    const publishedTodayCount = publishedPosts.filter(
      (p) => (p.updatedAt ?? p._creationTime) >= startOfToday
    ).length;

    // 5. Compute Card 3: Connected Accounts
    const activeAccountsCount = accounts.filter(
      (a) => a.status === "connected"
    ).length;

    // 6. Return exact data structure required by the dashboard UI
    return {
      stats: {
        scheduled: {
          total: scheduledTotal,
          todayDelta: scheduledTodayCount,
        },
        published: {
          total: publishedTotal,
          todayDelta: publishedTodayCount,
        },
        connectedAccounts: {
          total: activeAccountsCount,
          statusText: activeAccountsCount > 0 ? "Active" : "Inactive",
        },
      },
      recentActivity: activityLogs.map((log) => ({
        id: log._id,
        actionType: log.actionType,
        description: log.description,
        platform: log.platform,
        timestamp: log._creationTime,
      })),
    };
  },
});