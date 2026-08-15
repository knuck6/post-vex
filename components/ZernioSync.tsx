"use client";
//to add this on layout to work 

import { useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function ZernioSync({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useCurrentUser();
  const ensureZernioProfile = useAction(api.zernioAction.ensureZernioProfile);

  useEffect(() => {
    // Fire only when Convex user is loaded but Zernio profile isn't provisioned yet
    if (!isLoading && user && !user.zernioProfileId) {
      ensureZernioProfile().catch((err) => {
        console.error("ZernioSync: Failed to provision profile", err);
      });
    }
  }, [user, isLoading, ensureZernioProfile]);

  return <>{children}</>;
}