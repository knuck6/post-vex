// hooks/useCurrentUser.ts
"use client";

import { useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useCurrentUser() {
  const user = useQuery(api.users.getCurrentUser);
  const ensureZernioProfile = useAction(api.zernioAction.ensureZernioProfile);

  useEffect(() => {
    // If the user exists in DB but doesn't have a zernioProfileId yet, auto-provision it
    if (user && !user.zernioProfileId) {
      ensureZernioProfile().catch((err) =>
        console.error("Failed to provision Zernio Profile:", err)
      );
    }
  }, [user, ensureZernioProfile]);

  return {
    user,
    isLoading: user === undefined,
    zernioProfileId: user?.zernioProfileId ?? null,
    zernioKey: user?.zernioKey ?? null,
  };
}