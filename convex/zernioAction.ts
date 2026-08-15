// convex/zernioActions.ts
import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getZernioClientForClerkUser } from "./zernioClient";

/**
 * Ensures the authenticated user has a valid profileId in Zernio.
 * If not, fetches the default profile or creates a dedicated workspace profile.
 */
export const ensureZernioProfile = action({
  args: {},
  handler: async (ctx): Promise<string | null> => {
    const { zernio, user } = await getZernioClientForClerkUser(ctx);

    if (!user) return null;

    // If user already has a zernioProfileId stored, return it
    if (user.zernioProfileId) {
      return user.zernioProfileId;
    }

    // 1. Fetch available profiles from Zernio API
    const response = await zernio.profiles.listProfiles();
    const profiles = response.data?.profiles || [];

    // 2. Find default profile or one matching user's name
    let targetProfile = profiles.find((p: any) => p.isDefault) || profiles[0];

    // 3. If no profile exists, create a dedicated workspace profile for the user
    if (!targetProfile) {
      const created = await zernio.profiles.createProfile({
        name: `${user.name}'s Workspace`,
      });
      targetProfile = created.data;
    }

    const profileId = targetProfile?._id || targetProfile?.id;

    if (profileId) {
      // 4. Save the profileId back to the user's document in Convex
      await ctx.runMutation(internal.zernioAction.updateUserProfileId, {
        userId: user._id,
        zernioProfileId: profileId,
      });
    }

    return profileId ?? null;
  },
});

/**
 * Internal mutation to update zernioProfileId on the user record
 */
export const updateUserProfileId = internalMutation({
  args: {
    userId: v.id("users"),
    zernioProfileId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      zernioProfileId: args.zernioProfileId,
    });
  },
});