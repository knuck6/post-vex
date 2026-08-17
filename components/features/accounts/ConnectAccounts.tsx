"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCircle2, AlertCircle, Globe, PlusCircle, RefreshCw, ExternalLink, X, Loader2, Trash2 } from "lucide-react";
import {FaFacebook, FaInstagram, FaLinkedin,FaThreads, FaLinkedinIn, FaPinterest, FaTiktok, FaTwitter, FaYoutube, FaFacebookF, FaBluesky} from "react-icons/fa6"
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";

// ==========================================
// MAIN CONNECTED ACCOUNTS COMPONENT
// ==========================================
const AVAILABLE_PLATFORMS = [
  { id: "youtube", name: "YouTube", icon: FaYoutube, color: "bg-red-600 text-white" },
  { id: "twitter", name: "X / Twitter", icon: FaTwitter, color: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" },
  { id: "linkedin", name: "LinkedIn Profile", icon: FaLinkedinIn, color: "bg-blue-600 text-white" },
  { id: "facebook", name: "Facebook Profile", icon: FaFacebook, color: "bg-blue-500 text-white" },
  { id: "instagram", name: "Instagram", icon: FaInstagram, color: "bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white" },
  { id: "tiktok", name: "TikTok", icon: FaTiktok, color: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" },
  { id: "pinterest", name: "Pinterest", icon: FaPinterest, color: "bg-rose-600 text-white" },
  { id: "threads", name: "Threads", icon: FaThreads, color: "bg-zinc-800 text-white" },
  { id: "bluesky", name: "Bluesky", icon: FaBluesky, color: "bg-sky-500 text-white" },
];

const PLATFORM_CONFIG = Object.fromEntries(
  AVAILABLE_PLATFORMS.map((p) => [p.id, { label: p.name, color: p.color, icon: p.icon }])
);

export default function ConnectedAccounts() {
const accounts = useQuery(api.accounts.listAccounts);
  const syncAccounts = useAction(api.accounts.syncAccountsFromZernio);
  const getConnectUrl = useAction(api.accounts.getConnectUrl);
  const disconnectAccount = useAction(api.accounts.disconnectAccount);

  const [isSyncing, setIsSyncing] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<Id<"accounts"> | null>(null);
  const [accountToDisconnect, setAccountToDisconnect] = useState<{ id: Id<"accounts">; name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await syncAccounts();
      if (result.success) {
        setSyncFeedback({
          message: `Sincronizat cu succes ${result.count} cont${result.count === 1 ? "" : "uri"}.`,
          type: "success",
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        message: err.message || "An unexpected error occurred while syncing.",
        type: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectPlatform = async (platformId: string) => {
    setConnectingPlatform(platformId);
    setSyncFeedback(null);
    try {
      const currentUrl = typeof window !== "undefined" ? window.location.href : "";
      const { url } = await getConnectUrl({
        platform: platformId,
        redirectUrl: currentUrl,
      });

      if (url) window.location.href = url;
    } catch (err: any) {
      setSyncFeedback({
        message: err.message || `Failed to initiate connection for ${platformId}.`,
        type: "error",
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!accountToDisconnect) return;

    setDisconnectingId(accountToDisconnect.id);
    setSyncFeedback(null);
    try {
      await disconnectAccount({ accountId: accountToDisconnect.id });
      setSyncFeedback({
        message: `Disconnected ${accountToDisconnect.name}.`,
        type: "success",
      });
    } catch (err: any) {
      setSyncFeedback({
        message: err.message || "Eroare la deconectare a contului.",
        type: "error",
      });
    } finally {
      setDisconnectingId(null);
      setAccountToDisconnect(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Conecteaza-te la social media
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Zernio va fi un intermediar care nu va mentine data
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Conecteaza un cont
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Sincronizez..." : "Sincronizeaza conturile"}
          </button>
        </div>
      </div>

      {/* Status banner */}
      {syncFeedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg text-sm ${
            syncFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {syncFeedback.type === "success" ? (
            <CheckCircle2 className="size-8 shrink-0" />
          ) : (
            <AlertCircle className="size-8 shrink-0" />
          )}
          <span>{syncFeedback.message}</span>
        </div>
      )}

      {/* Accounts List */}
      {accounts && accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            const platformConfig = PLATFORM_CONFIG[acc.platform] || {
              label: acc.platform,
              color: "bg-zinc-700 text-white",
              icon: Globe,
            };
            const IconComponent = platformConfig.icon;
            const isDeleting = disconnectingId === acc._id;

            return (
              <div
                key={acc._id}
                className="group relative flex flex-col justify-between p-5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-blue-50/20 dark:bg-zinc-900 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="relative">
                    {acc.avatarUrl ? (
                      <Image
                        src={acc.avatarUrl}
                        alt={acc.displayName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                        {acc.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-1 -right-1 p-1 rounded-full ${platformConfig.color} ring-2 ring-white dark:ring-zinc-900`}
                      title={platformConfig.label}
                    >
                      <IconComponent className="w-3 h-3" />
                    </span>
                  </div>

                  <button
                    onClick={() => setAccountToDisconnect({ id: acc._id, name: acc.displayName })}
                    disabled={isDeleting}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition opacity-80 group-hover:opacity-100"
                    title="Deconecteza-ma"
                  >
                    {isDeleting ? (
                      <Loader2 className="size-7 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="size-7" />
                    )}
                  </button>
                </div>

                <div className="mt-4">
                  <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {acc.displayName}
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    {acc.handle || acc.username || `@${acc.displayName.toLowerCase().replace(/\s+/g, "")}`}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <span className="capitalize font-semibold text-lg text-black dark:text-white leading-relaxed">{platformConfig.label}</span>
                  <span className="font-mono text-[10px] text-zinc-400">
                    ID: {acc.zernioAccountId!.slice(-6)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {accountToDisconnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
             Deconecteaza contul?
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Esti sigur ca vrei sa deconectezi <strong>{accountToDisconnect.name}</strong>? Ai nevoie de reautentificare pentru a posta din nou.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAccountToDisconnect(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 rounded-lg transition"
              >
                Anuleaza
              </button>
              <button
                onClick={handleConfirmDisconnect}
                disabled={disconnectingId !== null}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {disconnectingId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Deconecteza-ma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Connect Social Account
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Select a network to authorize via Zernio OAuth.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {AVAILABLE_PLATFORMS.map((platform) => {
                const IconComponent = platform.icon;
                const isLoading = connectingPlatform === platform.id;

                return (
                  <button
                    key={platform.id}
                    onClick={() => handleConnectPlatform(platform.id)}
                    disabled={connectingPlatform !== null}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${platform.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {platform.name}
                      </span>
                    </div>
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}