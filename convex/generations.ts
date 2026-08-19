import { action, mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";
import { getCurrentUserOrThrow } from "./users";

import { NanoBanana } from "convex-nano-banana";
const nanoBanana = new NanoBanana(components.nanoBanana);

/**
 * 1. AI Text Generation using Google Gemini (Strict Output Prompt)
 */
export const generateTextWithGemini = action({
  args: {
    prompt: v.string(),
    tone: v.optional(v.string()),
    platformTarget: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const targetPlatform = "general";
    const charLimit =280;
    
    // Strict prompt to eliminate conversational filler/meta intros
    const formattedPrompt = `You are a team of professional social media content creator with 25 years of experience on marketing, management and advertising[Apply proven direct-response frameworks (AIDA, PAS, Hook-Story-Offer)] .
Write a social media post based on the following context.

Context / Idea: ${args.prompt}
Tone: ${args.tone ?? "engaging and professional"}
Target Platform: ${targetPlatform}
Make sure is up to date on country like EU this text.
Getting very high creative variant .
CRITICAL INSTRUCTIONS:
- STRICT CHARACTER LIMIT: The entire response MUST NOT exceed ${charLimit} characters (including spaces, emojis, and hashtags).
- Return ONLY the exact post content ready to be published.
- Do NOT include intro phrases (e.g., "Here is a post proposal", "Iată o propunere").
- Do NOT include conversational commentary, explanations, or quotes surrounding the text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: formattedPrompt,
    });

    return response.text?.trim() ?? "";
  },
});

/**
 * 2. AI Image Generation using Google Nano Banana Convex Component
 */
export const generateImageWithNanoBanana = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const result = await nanoBanana.generate(ctx, {
      prompt: args.prompt,
      imageSize: "1K",
      model: "gemini-2.5-flash-image",
      aspectRatio: "16:9",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      userId: "",
    });

    return result;
  },
});

/**
 * 3. Save Generation
 */
export const saveGeneration = mutation({
  args: {
    prompt: v.string(),
    content: v.string(),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    storageId: v.optional(v.id("_storage")),
    tone: v.optional(v.string()),
    isPublicInspiration: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { user } = await getCurrentUserOrThrow(ctx);

    return await ctx.db.insert("generations", {
      creatorUserId: user._id,
      creatorName: user.name,
      prompt: args.prompt,
      content: args.content,
      mediaUrl: args.mediaUrl,
      mediaType: args.mediaType,
      storageId: args.storageId,
      tone: args.tone,
      isPublicInspiration: args.isPublicInspiration ?? true,
      createdAt: Date.now(),
    });
  },
});

/**
 * 4. Browse Inspiration Feed
 */
export const getInspirationFeed = query({
  args: {},
  handler: async (ctx) => {
    const generations = await ctx.db
      .query("generations")
      .withIndex("by_creation_time")
      .order("desc")
      .take(50);

    return generations.filter((g) => g.isPublicInspiration);
  },
});