"use client";

import { useState, useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Clock, ArrowRight, Loader2, Calendar as CalendarIcon, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "../ui/separator";

const TONES = ["Profesional", "Creativ", "Amuzant", "Minimalist", "Excitant"];

const PLATFORM_LABELS: Record<string, string> = {
  bluesky: "Bluesky",
  linkedin: "LinkedIn",
  linkedin_page: "LinkedIn Page",
  twitter: "X / Twitter",
  facebook: "Facebook",
  facebook_page: "Facebook Page",
  youtube: "YouTube",
  threads: "Threads",
  instagram: "Instagram",
  instagram_business: "Instagram Business",
  tiktok: "TikTok",
  pinterest: "Pinterest",
};

// Check if a target platform supports the current post's media type
const checkPlatformEligibility = (platform: string, mediaType?: string) => {
  if (platform === "youtube" && mediaType !== "video") {
    return { disabled: true, reason: "Requires Video" };
  }
  return { disabled: false, reason: null };
};

export default function GenerationView() {
  const [prompt, setPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState("Profesional");
  const [generateImageToggle, setGenerateImageToggle] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Scheduling Modal State
  const [schedulingGen, setSchedulingGen] = useState<any | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [publishType, setPublishType] = useState<"now" | "scheduled">("scheduled");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Convex hooks
  const generateText = useAction(api.generations.generateTextWithGemini);
  const generateImage = useAction(api.generations.generateImageWithNanoBanana);
  const saveGeneration = useMutation(api.generations.saveGeneration);
  const inspirationFeed = useQuery(api.generations.getInspirationFeed) ?? [];
  const createPost = useAction(api.posts.createPost);

  const connectedAccounts = useQuery(api.accounts.listAccounts) ?? [];
  const activeConnectedAccounts = connectedAccounts.filter(
    (acc: any) => acc.status === "connected"
  );

  // Auto-select eligible connected platforms when modal opens
  useEffect(() => {
    if (schedulingGen && activeConnectedAccounts.length > 0) {
      const eligible = activeConnectedAccounts.find((acc: any) => {
        const { disabled } = checkPlatformEligibility(acc.platform, schedulingGen.mediaType);
        return !disabled;
      });

      setSelectedPlatforms(eligible ? [eligible.platform] : []);
    }
  }, [schedulingGen]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const content = await generateText({
        prompt,
        tone: selectedTone,
      });

      let mediaUrl: string | undefined = undefined;
      let storageId: any = undefined;

      if (generateImageToggle) {
        const imageResult = await generateImage({ prompt });
        // mediaUrl = imageResult?.url;
        // storageId = imageResult?.storageId;
      }

      await saveGeneration({
        prompt,
        content: content ?? "",
        mediaUrl,
        mediaType: mediaUrl ? "image" : undefined,
        storageId,
        tone: selectedTone,
        isPublicInspiration: true,
      });

      setPrompt("");
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlatformToggle = (platformId: string, disabled: boolean) => {
    if (disabled) return;

    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleScheduleSubmit = async () => {
    if (!schedulingGen || selectedPlatforms.length === 0) return;
    setIsPublishing(true);

    try {
      const scheduledTimestamp =
        publishType === "scheduled" && scheduledDateTime
          ? new Date(scheduledDateTime).getTime()
          : undefined;

      await createPost({
        platforms: selectedPlatforms as any,
        content: schedulingGen.content,
        mediaUrl: schedulingGen.mediaUrl,
        mediaType: schedulingGen.mediaType,
        publishType,
        scheduledFor: scheduledTimestamp,
      });

      setSchedulingGen(null);
    } catch (err) {
      console.error("Failed to schedule post:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Ce creeam azi  ?
        </h1>
      </div>

      {/* Input Form */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="relative border rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-4 space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="share your idea ...."
            className="w-full border-none shadow-none resize-none focus-visible:ring-0 min-h-[100px] text-base placeholder:text-slate-400"
          />

          <div className="flex items-center justify-end space-x-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              
              {/* <Switch
                checked={generateImageToggle}
                onCheckedChange={setGenerateImageToggle}
                
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                AI Image
              </span> */}
            </div>
                <Separator orientation="vertical"/>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2 flex items-center gap-2 text-sm font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generez...
                </>
              ) : (
                <>
                  Genereaza <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tones */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
          {TONES.map((tone) => {
            const isSelected = selectedTone === tone;
            return (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-red-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {tone}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Feed */}
      <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-lg">
            <Clock className="w-5 h-5 text-slate-500" />
            <h2>Generate</h2>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {inspirationFeed.length} total
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {inspirationFeed.map((gen) => (
            <Card
              key={gen._id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between overflow-hidden"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {new Date(gen.createdAt).toLocaleString("en-US", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })}
                  </span>
                  {gen.tone && (
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-none px-2 py-0.5 text-[10px] rounded-md font-semibold"
                    >
                      {gen.tone}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-4 leading-relaxed">
                  {gen.content}
                </p>

                {gen.mediaUrl && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                    <img
                      src={gen.mediaUrl}
                      alt={gen.prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-1 pb-1">
                <span className="pb-0.5"></span>
                <Button
                  onClick={() => setSchedulingGen(gen)}
                  variant="secondary"
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-medium py-2 h-auto flex items-center gap-2 justify-center"
                >
                  <CalendarIcon className="size-5 text-teal-600/45" />
                  <span className="text-black dark:text-gray-50">
                  Posteaza-mi asta
                  </span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Schedule Post Modal */}
      <Dialog
        open={!!schedulingGen}
        onOpenChange={(open) => !open && setSchedulingGen(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Posteaza-mi, postul generat
            </DialogTitle>
          </DialogHeader>

          {schedulingGen && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                <p className="text-md text-slate-700 dark:text-slate-300  leading-relaxed">
                  {schedulingGen.content}
                </p>
                {schedulingGen.mediaUrl && (
                  <img
                    src={schedulingGen.mediaUrl}
                    alt="Preview"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Connected Target Platforms */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Platforme pentru postat
                </label>

                {activeConnectedAccounts.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Nici un cont conectat</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {activeConnectedAccounts.map((account: any) => {
                      const { disabled, reason } = checkPlatformEligibility(
                        account.platform,
                        schedulingGen.mediaType
                      );
                      const active =
                        selectedPlatforms.includes(account.platform) && !disabled;
                      const label =
                        PLATFORM_LABELS[account.platform] || account.platform;

                      return (
                        <button
                          key={account._id || account.platform}
                          type="button"
                          disabled={disabled}
                          onClick={() =>
                            handlePlatformToggle(account.platform, disabled)
                          }
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                            disabled
                              ? "bg-slate-100 text-slate-400 dark:bg-slate-800/40 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-800"
                              : active
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          <span className="capitalize">{label}</span>
                          {account.handle && (
                            <span className="text-[10px] opacity-70">
                              ({account.handle})
                            </span>
                          )}
                          {reason && (
                            <span className="text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold px-1.5 py-0.5 rounded border border-amber-500/20">
                              {reason}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Publish Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Modul de publicare
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={publishType === "now" ? "default" : "outline"}
                    className="flex-1 text-xs rounded-xl h-8"
                    onClick={() => setPublishType("now")}
                  >
                    Acum publica !
                  </Button>
                  <Button
                    type="button"
                    variant={publishType === "scheduled" ? "default" : "outline"}
                    className="flex-1 text-xs rounded-xl h-8"
                    onClick={() => setPublishType("scheduled")}
                  >
                    Programabil
                  </Button>
                </div>
              </div>

              {/* Date & Time Input */}
              {publishType === "scheduled" && (
                <div className="space-y-1.5">
                  <form>

                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Postat in data si timpul
                  </label>
                  <Input
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="text-xs rounded-xl h-9"
                    />
                    </form>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={handleScheduleSubmit}
              disabled={
                isPublishing ||
                selectedPlatforms.length === 0 ||
                (publishType === "scheduled" && !scheduledDateTime)
              }
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold py-2 h-9 flex items-center gap-2 justify-center"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {publishType === "now" ? "Publica" : "Confirm ca va fi publicat"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}