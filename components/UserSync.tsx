"use client";

import { useEffect } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserSync({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.users.storeUser);

  useEffect(() => {
    if (isAuthenticated) {
      storeUser().catch((err) => {
        console.error("Failed to sync authenticated user to DB:", err);
      });
    }
  }, [isAuthenticated, storeUser]);

  return <>{children}</>;
}