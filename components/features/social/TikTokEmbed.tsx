"use client";

import Script from "next/script";

export interface TikTokEmbedProps {
  postUrl: string;
}

/** TikTok's embed URLs end in /video/<numeric id> — used as the blockquote's data-video-id hint. */
function extractVideoId(postUrl: string): string | undefined {
  return postUrl.match(/\/video\/(\d+)/)?.[1];
}

/**
 * Renders one TikTok video via TikTok's own documented embed mechanism: a
 * `<blockquote class="tiktok-embed" cite={postUrl}>` that TikTok's own
 * embed.js (loaded once, deduped by src across every TikTokEmbed on the
 * page) replaces with a live embed at runtime — it scans the DOM for
 * `.tiktok-embed` blockquotes itself, no manual reprocessing call needed.
 * No `<iframe src>` is written here — TikTok doesn't support embedding an
 * arbitrary video URL that way — and no HTML/script is stored or injected
 * beyond this static, hardcoded markup; `postUrl` only ever fills a
 * `cite`/`data-video-id` attribute and a plain fallback link.
 */
export function TikTokEmbed({ postUrl }: TikTokEmbedProps) {
  return (
    <>
      <blockquote
        className="tiktok-embed"
        cite={postUrl}
        data-video-id={extractVideoId(postUrl)}
        style={{ maxWidth: 325, minWidth: 325, margin: 0 }}
      >
        <section>
          <a href={postUrl} target="_blank" rel="noopener noreferrer">
            View this video on TikTok
          </a>
        </section>
      </blockquote>
      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
    </>
  );
}
