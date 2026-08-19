"use client";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { Globe } from "lucide-react";

import { useEffect, useState } from "react";
import { FaBluesky, FaFacebook, FaFacebookF, FaInstagram, FaLinkedin, FaLinkedinIn, FaPinterest, FaSquareInstagram, FaThreads, FaTiktok, FaTwitter, FaYoutube } from "react-icons/fa6";

export const PLATFORM_CONFIG: Record<
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


const formatTimestamp = (ts?: number) => {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export function DashboardPosts() {
  const getZernioPosts = useAction(api.posts.getZernioPosts);
  const [posts, setPosts] = useState<{ upcoming: any[]; published: any[] }>({
    upcoming: [],
    published: [],
  });

  const fetchPosts = async () => {
    const data = await getZernioPosts();
    setPosts({ upcoming: data.upcoming, published: data.published });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="lg:col-span-4 space-y-6 ">
      {/* Upcoming Section */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Vor fi publicate ({posts.upcoming.length})</h3>
          <div className="space-y-3">
            {posts.upcoming.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    {post.platforms.map((p: string) => {
                      const config = PLATFORM_CONFIG[p] || { icon: Globe };
                      const Icon = config.icon;
                      return <Icon key={p} className="w-3.5 h-3.5 text-zinc-400" />;
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    {post.mediaType && (
                      <span className="capitalize text-[11px] text-zinc-400">
                        {post.mediaType}
                      </span>
                    )}
                    <span>{formatTimestamp(post.scheduledFor || post.createdAt)}</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 line-clamp-2">
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Published Section */}
      <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 rounded-2xl p-6 space-y-4 shadow-sm overflow-y-scroll max-h-72">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Publicate  ({posts.published.length})</h3>
        </div>
        {!posts.published || posts.published.length === 0 ? (
          <p>Nici un post publicat</p>
        ) : (

          <div className="space-y-3">
            {posts.published.map((post) => (
              <div key={post.id} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-2 line-clamp-4" >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {post.platforms.map((p: string) => {
                      const config = PLATFORM_CONFIG[p] || { icon: Globe };
                      const Icon = config.icon;
                      return <Icon key={p} className="size-6 text-zinc-400" />;
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-emerald-500 font-medium">Publicate</span>
                    <span className="text-[11px] text-zinc-400">{formatTimestamp(post.createdAt)}</span>
                  </div>
                </div>
                <div className="items-center">
                  <p className="text-sm text-zinc-800 dark:text-zinc-200  flex flex-wrap">{post.content}</p>
                </div>
                {/* Reactions badge */}
                <div className="flex items-center gap-1 text-sm text-pink-500 font-semibold">
                  <span>❤️</span>
                  <span>{post.reactions}</span>
                </div>
              </div>

            ))}
          </div>
        )}
      </div>
    </div>
  );
}