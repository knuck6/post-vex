// convex/zernioClient.ts
import Zernio from "@zernio/node";
import { ActionCtx } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { UserIdentity } from "convex/server";


export interface ZernioClientContext {
  zernio: Zernio;
  user: Doc<"users">;
  identity: UserIdentity;
}

export async function getZernioClientForClerkUser(
  ctx: ActionCtx
): Promise<ZernioClientContext> {
  // Explicitly annotate result to break circular type inference
  const result: { user: Doc<"users">; identity: UserIdentity } | null =
    await ctx.runQuery(internal.users.getCurrentUserForAction);

  if (!result || !result.user || !result.identity) {
    throw new Error("Unauthenticated: Sign in via Clerk first.");
  }

  const { user, identity } = result;

  if (!user.zernioKey) {
    throw new Error(
      "Please configure your Zernio API key in user settings first."
    );
  }

  const zernio = new Zernio({ apiKey: user.zernioKey });
  return { zernio, user, identity };
}


export async function getZernioClientForUser(ctx: ActionCtx) {
  const user = await ctx.runQuery(api.users.getCurrentUser);
  if (!user) throw new Error("Unauthorized");

  // Fallback to global environment API key if user hasn't supplied their own key
  const apiKey = user.zernioKey || process.env.ZERNIO_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Zernio SDK API Key");
  }

  const zernio = new Zernio({ apiKey });

  return { zernio, user };
}