"use client";

import { useMemo, useState } from "react";
import { useQuery, useAction } from "convex/react";
import { useForm } from "@tanstack/react-form-nextjs";
import { api } from "@/convex/_generated/api";
import {
    Calendar as CalendarIcon,
    Clock,
    SendHorizontal,
    CheckCircle2,
    AlertCircle,
    Globe,
    Image as ImageIcon,
    Film,
    Loader2,
    ExternalLink,
} from "lucide-react";
import {
    FaBluesky,
    FaFacebook,
    FaFacebookF,
    FaInstagram,
    FaLinkedin,
    FaLinkedinIn,
    FaPinterest,
    FaSquareInstagram,
    FaThreads,
    FaTiktok,
    FaTwitter,
    FaYoutube,
} from "react-icons/fa6";
import { DashboardPosts } from "./dashboard-posts";

type PlatformUnion =
    | "twitter"
    | "linkedin"
    | "linkedin_page"
    | "facebook"
    | "facebook_page"
    | "instagram"
    | "instagram_business"
    | "tiktok"
    | "youtube"
    | "pinterest"
    | "threads"
    | "bluesky";

const PLATFORM_CONFIG: Record<
    string,
    { label: string; icon: any; acceptsTextOnly: boolean; acceptsImage: boolean; acceptsVideo: boolean }
> = {
    youtube: { label: "YouTube", icon: FaYoutube, acceptsTextOnly: false, acceptsImage: false, acceptsVideo: true },
    twitter: { label: "X / Twitter", icon: FaTwitter, acceptsTextOnly: true, acceptsImage: true, acceptsVideo: true },
    linkedin: { label: "LinkedIn Profile", icon: FaLinkedinIn, acceptsTextOnly: true, acceptsImage: true, acceptsVideo: true },
    linkedin_page: { label: "LinkedIn Page", icon: FaLinkedin, acceptsTextOnly: true, acceptsImage: true, acceptsVideo: true },
    facebook: { label: "Facebook Profile", icon: FaFacebookF, acceptsTextOnly: true, acceptsImage: true, acceptsVideo: true },
    facebook_page: { label: "Facebook Page", icon: FaFacebook, acceptsTextOnly: true, acceptsImage: true, acceptsVideo: true },
    instagram: { label: "Instagram", icon: FaInstagram, acceptsTextOnly: false, acceptsImage: true, acceptsVideo: true },
    instagram_business: { label: "Instagram Business", icon: FaSquareInstagram, acceptsTextOnly: false, acceptsImage: true, acceptsVideo: true },
    tiktok: { label: "TikTok", icon: FaTiktok, acceptsTextOnly: false, acceptsImage: true, acceptsVideo: true },
    pinterest: { label: "Pinterest", icon: FaPinterest, acceptsTextOnly: false, acceptsImage: true, acceptsVideo: true },
    threads: { label: "Threads", icon: FaThreads, acceptsTextOnly: true, acceptsImage: true, acceptsVideo: true },
    bluesky: { label: "Bluesky", icon: FaBluesky, acceptsTextOnly: true, acceptsImage: true, acceptsVideo: true },
};

function isPlatformSupported(
    platformId: string,
    hasMedia: boolean,
    mediaType: "image" | "video"
): boolean {
    const config = PLATFORM_CONFIG[platformId];
    if (!config) return true;

    if (!hasMedia) {
        return config.acceptsTextOnly;
    }

    if (mediaType === "image") {
        return config.acceptsImage;
    }

    if (mediaType === "video") {
        return config.acceptsVideo;
    }

    return true;
}

function getIncompatibilityReason(
    platformId: string,
    hasMedia: boolean,
    mediaType: "image" | "video"
): string {
    const config = PLATFORM_CONFIG[platformId];
    if (!config) return "";

    if (!hasMedia && !config.acceptsTextOnly) {
        return config.acceptsVideo && !config.acceptsImage ? "Requires Video" : "Requires Media";
    }

    if (hasMedia && mediaType === "image" && !config.acceptsImage) {
        return "Requires Video";
    }

    return "";
}

export function ComposePostManager() {
    const connectedAccounts = useQuery(api.accounts.listAccounts);
    const createPost = useAction(api.posts.createPost);

    const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const activeAccounts = useMemo(() => {
        return (connectedAccounts || []).filter((acc) => acc.status === "connected");
    }, [connectedAccounts]);

    const form = useForm({
        defaultValues: {
            platforms: [] as PlatformUnion[],
            content: "",
            mediaUrl: "",
            mediaType: "image" as "image" | "video",
            publishType: "now" as "now" | "scheduled",
            date: "",
            time: "",
        },
        onSubmit: async ({ value }) => {
            setFeedback(null);

            if (!value.platforms.length) {
                setFeedback({ message: "Please select at least one connected account.", type: "error" });
                return;
            }

            try {
                let scheduledFor: number | undefined = undefined;

                if (value.publishType === "scheduled") {
                    if (!value.date) {
                        setFeedback({ message: "Please select a target date to schedule your post.", type: "error" });
                        return;
                    }
                    if (value.time) {
                        scheduledFor = new Date(`${value.date}T${value.time}`).getTime();
                    } else {
                        scheduledFor = new Date(`${value.date}T12:00`).getTime();
                    }
                }

                const res = await createPost({
                    platforms: value.platforms,
                    content: value.content,
                    mediaUrl: value.mediaUrl.trim() ? value.mediaUrl : undefined,
                    mediaType: value.mediaUrl.trim() ? value.mediaType : undefined,
                    publishType: value.publishType,
                    scheduledFor,
                });

                if (res.success) {
                    setFeedback({
                        message:
                            res.status === "scheduled"
                                ? "Post scheduled successfully!"
                                : "Post published successfully!",
                        type: "success",
                    });
                    form.reset();
                }
            } catch (err: any) {
                setFeedback({
                    message: err.message || "Failed to process post.",
                    type: "error",
                });
            }
        },
    });

    const pruneUnsupportedPlatforms = (
        nextMediaUrl: string,
        nextMediaType: "image" | "video"
    ) => {
        const hasMedia = Boolean(nextMediaUrl.trim());
        const currentPlatforms = form.getFieldValue("platforms");

        const validPlatforms = currentPlatforms.filter((p) =>
            isPlatformSupported(p, hasMedia, nextMediaType)
        );

        if (validPlatforms.length !== currentPlatforms.length) {
            form.setFieldValue("platforms", validPlatforms);
        }
    };


    return (
        <div className="w-full max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 rounded-2xl p-6 space-y-6 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Compose Post</h2>

                {feedback && (
                    <div
                        className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                            feedback.type === "success"
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        }`}
                    >
                        {feedback.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span>{feedback.message}</span>
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                    className="space-y-5"
                >
                    {/* Reactive Accounts Picker */}
                    <form.Subscribe
                        selector={(s) => ({
                            mediaUrl: s.values.mediaUrl,
                            mediaType: s.values.mediaType,
                            platforms: s.values.platforms,
                        })}
                    >
                        {({ mediaUrl, mediaType, platforms }) => {
                            const hasMedia = Boolean(mediaUrl.trim());

                            return (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                            Target Accounts
                                        </label>
                                        <span className="text-[11px] text-zinc-400 font-mono">
                                            {platforms.length} selected
                                        </span>
                                    </div>

                                    {connectedAccounts === undefined ? (
                                        <div className="flex items-center gap-2 py-4 text-xs text-zinc-400">
                                            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                                            <span>Loading connected accounts...</span>
                                        </div>
                                    ) : activeAccounts.length === 0 ? (
                                        <div className="p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs space-y-2">
                                            <p className="font-semibold flex items-center gap-1.5">
                                                <AlertCircle className="w-4 h-4" /> No accounts connected
                                            </p>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                Connect your social channels in settings before composing a post.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {activeAccounts.map((account) => {
                                                const platformId = account.platform as PlatformUnion;
                                                const config = PLATFORM_CONFIG[platformId] || {
                                                    label: account.displayName || platformId,
                                                    icon: Globe,
                                                };
                                                const Icon = config.icon;
                                                const isSelected = platforms.includes(platformId);

                                                const supported = isPlatformSupported(platformId, hasMedia, mediaType);
                                                const reason = getIncompatibilityReason(platformId, hasMedia, mediaType);

                                                return (
                                                    <button
                                                        type="button"
                                                        key={account._id}
                                                        disabled={!supported}
                                                        onClick={() => {
                                                            const next = isSelected
                                                                ? platforms.filter((id) => id !== platformId)
                                                                : [...platforms, platformId];
                                                            form.setFieldValue("platforms", next);
                                                        }}
                                                        className={`relative p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                                                            !supported
                                                                ? "opacity-40 cursor-not-allowed border-zinc-200 dark:border-zinc-800/50 bg-zinc-100/50 dark:bg-zinc-900/20"
                                                                : isSelected
                                                                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20"
                                                                : "border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-700"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div
                                                                className={`p-2 rounded-lg shrink-0 ${
                                                                    isSelected
                                                                        ? "bg-indigo-600 text-white"
                                                                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                                                }`}
                                                            >
                                                                <Icon className="w-4 h-4" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                                                    {account.displayName || config.label}
                                                                </p>
                                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize truncate">
                                                                    {config.label}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {!supported ? (
                                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0 ml-1">
                                                                {reason}
                                                            </span>
                                                        ) : (
                                                            <ExternalLink className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                    </form.Subscribe>

                    {/* Content Field */}
                    <form.Field name="content">
                        {(field) => (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Content
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="What you wish to share today"
                                        rows={4}
                                        className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    />
                                    <div className="absolute bottom-3 right-3 text-[11px] text-zinc-400 font-mono">
                                        {field.state.value.length}/280
                                    </div>
                                </div>
                            </div>
                        )}
                    </form.Field>

                    {/* Media Section */}
                    <div className="space-y-3">
                        <form.Field name="mediaUrl">
                            {(field) => (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Media URL (Optional)
                                    </label>
                                    <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
                                        <input
                                            type="text"
                                            value={field.state.value}
                                            onChange={(e) => {
                                                const nextUrl = e.target.value;
                                                field.handleChange(nextUrl);
                                                pruneUnsupportedPlatforms(nextUrl, form.getFieldValue("mediaType"));
                                            }}
                                            placeholder="https://example.com/image.png or video URL"
                                            className="w-full p-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </form.Field>

                        {/* Media Type Toggle */}
                        <form.Field name="mediaType">
                            {(field) => (
                                <div className="flex items-center justify-end gap-2 text-xs">
                                    <span className="text-zinc-500">Tip:</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            field.handleChange("image");
                                            pruneUnsupportedPlatforms(form.getFieldValue("mediaUrl"), "image");
                                        }}
                                        className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                                            field.state.value === "image"
                                                ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                                                : "border-zinc-200 dark:border-zinc-800 text-zinc-400"
                                        }`}
                                    >
                                        <ImageIcon className="size-4" /> Imagine
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            field.handleChange("video");
                                            pruneUnsupportedPlatforms(form.getFieldValue("mediaUrl"), "video");
                                        }}
                                        className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                                            field.state.value === "video"
                                                ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                                                : "border-zinc-200 dark:border-zinc-800 text-zinc-400"
                                        }`}
                                    >
                                        <Film className="size-4" /> Video
                                    </button>
                                </div>
                            )}
                        </form.Field>
                    </div>

                    {/* PUBLISH TYPE TOGGLE (Now vs Scheduled) */}
                    <form.Field name="publishType">
                        {(field) => (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Modul de publicare
                                </label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => field.handleChange("now")}
                                        className={`py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                                            field.state.value === "now"
                                                ? "bg-rose-500 text-white shadow-sm"
                                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                        }`}
                                    >
                                        <SendHorizontal className="size-5" /> Publica acum
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => field.handleChange("scheduled")}
                                        className={`py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                                            field.state.value === "scheduled"
                                                ? "bg-rose-500 text-white shadow-sm"
                                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                        }`}
                                    >
                                        <Clock className="size-5" /> Publica in viitor
                                    </button>
                                </div>
                            </div>
                        )}
                    </form.Field>

                    {/* CONDITIONALLY RENDER DATE & TIME INPUTS */}
                    <form.Subscribe selector={(s) => s.values.publishType}>
                        {(publishType) =>
                            publishType === "scheduled" ? (
                                <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                                    <form.Field name="date">
                                        {(field) => (
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                                    Data
                                                </label>
                                                <div className="relative flex items-center">
                                                    <CalendarIcon className="size-5 text-zinc-400 absolute left-3 pointer-events-none" />
                                                    <input
                                                        type="date"
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </form.Field>

                                    <form.Field name="time">
                                        {(field) => (
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                                    Timpul
                                                </label>
                                                <div className="relative flex items-center">
                                                    <Clock className="size-5 text-zinc-400 absolute left-3 pointer-events-none" />
                                                    <input
                                                        type="time"
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </form.Field>
                                </div>
                            ) : null
                        }
                    </form.Subscribe>

                    {/* Dynamic Submit Button */}
                    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting, s.values.publishType] as const}>
                        {([canSubmit, isSubmitting, publishType]) => (
                            <button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                                className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 active:bg-rose-700 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="size-5 animate-spin" />
                                        <span>{publishType === "now" ? "Public acum..." : "Public in viitor..."}</span>
                                    </div>
                                ) : publishType === "now" ? (
                                    <>
                                        Public acum <SendHorizontal className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        Public in viitor <Clock className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </form.Subscribe>
                </form>
            </div>

            {/* Feed Column */}
            <div className="lg:col-span-6 space-y-3">
                <DashboardPosts/>
            </div>
        </div>
    );
}