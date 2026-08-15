// app/dashboard/page.tsx
"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Loader } from "lucide-react";

export default function CheckUser() {
  const { user, zernioProfileId, isLoading } = useCurrentUser();

  if (isLoading) return <div className="flex"><Loader className="size-26 animate-spin"/></div>;
  if (!user) return <div>Please sign in</div>;

  return (
    <div>
     
      <p>Clerk ID: {user.clerkUserId}</p>
      <p>Zernio Profile ID: {zernioProfileId ?? "Syncing workspace..."}</p>
    </div>
  );
}