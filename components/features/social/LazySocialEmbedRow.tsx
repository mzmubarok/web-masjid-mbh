"use client";

import { Image as ImageIcon, Play } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { InstagramEmbed } from "@/components/features/social/InstagramEmbed";
import { TikTokEmbed } from "@/components/features/social/TikTokEmbed";
import { cn } from "@/lib/utils";

export interface LazySocialEmbedRowProps {
  platform: "Instagram" | "TikTok";
  posts: { id: string; postUrl: string }[];
}

/**
 * Gates an entire platform's embed row behind a single useInView call —
 * nothing mounts, no platform script loads, and no iframe is created until
 * the row scrolls near the viewport. All of that platform's posts then
 * mount together in the same tick.
 *
 * Mounting is batched per row (rather than gated per post) specifically
 * because of a TikTok limitation confirmed empirically while building this:
 * TikTok's embed.js scans the DOM for `.tiktok-embed` blockquotes exactly
 * once, at load time, and exposes no public API to trigger a re-scan
 * (unlike Instagram, whose `Embeds.process(element)` can be called again
 * per new blockquote — see InstagramEmbed). A TikTok blockquote added to
 * the DOM *after* its script has already run never becomes a live embed.
 * Batching the row keeps every blockquote's first paint synchronized with
 * that one-time scan, so it stays correct for both platforms — and it's
 * also simply more efficient: one IntersectionObserver per platform row
 * (two total on this page) instead of one per post.
 */
export function LazySocialEmbedRow({ platform, posts }: LazySocialEmbedRowProps) {
  const [ref, isInView] = useInView<HTMLDivElement>();
  const isSquare = platform === "Instagram";

  return (
    <div ref={ref} className="flex gap-4 overflow-x-auto pb-2" role="list" aria-label={`${platform} posts`}>
      {posts.map((post) => (
        // Instagram enforces a 326px min-width on its own embed iframe
        // (TikTok, 325px) — the item is sized to comfortably fit either
        // without internal clipping; `relative` gives Instagram's
        // `position: absolute` iframe the correct containing block, so it
        // sizes against this item instead of an ancestor further up.
        <div key={post.id} className="relative w-[340px] shrink-0" role="listitem">
          {isInView ? (
            platform === "Instagram" ? (
              <InstagramEmbed postUrl={post.postUrl} />
            ) : (
              <TikTokEmbed postUrl={post.postUrl} />
            )
          ) : (
            <div
              aria-hidden="true"
              className={cn(
                "flex w-full items-center justify-center rounded-md bg-muted text-muted-foreground/50",
                isSquare ? "aspect-square" : "aspect-[9/16]"
              )}
            >
              {isSquare ? <ImageIcon className="size-5" /> : <Play className="size-5" />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
