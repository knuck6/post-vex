import { action, internalMutation,  } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getZernioClientForClerkUser } from "./zernioClient";

export const setProfileId = internalMutation({
  args: { userId: v.id("users"), zernioProfileId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { zernioProfileId: args.zernioProfileId });
  },
});

export const ensureDefaultProfile = action({
  handler: async (ctx) => {
    const { zernio, user } = await getZernioClientForClerkUser(ctx);

    if (user.zernioProfileId) return { profileId: user.zernioProfileId };

    const { data: existing } = await zernio.profiles.listProfiles();
    if (existing && existing.length > 0) {
      const profileId = existing[0]._id;
      await ctx.runMutation(internal.zernioProfiles.setProfileId, {
        userId: user._id,
        zernioProfileId: profileId,
      });
      return { profileId };
    }

    const { data: newProfile } = await zernio.profiles.createProfile({
      name: `App Default (${user.name})`,
      description: "App Social Profile",
    });

    await ctx.runMutation(internal.zernioProfiles.setProfileId, {
      userId: user._id,
      zernioProfileId: newProfile._id,
    });

    return { profileId: newProfile._id };
  },
});