"use client";

import { useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    instgrm?: { Embeds?: { process?: (element?: Element) => void } };
  }
}

export interface InstagramEmbedProps {
  postUrl: string;
}

/**
 * Renders one Instagram post/reel via Meta's own documented embed
 * mechanism: a `<blockquote class="instagram-media" data-instgrm-permalink>`
 * that Instagram's own embed.js (loaded once, deduped by src across every
 * InstagramEmbed on the page) replaces with a live embed at runtime. No
 * `<iframe src>` is written here — Instagram doesn't support embedding an
 * arbitrary post URL that way — and no HTML/script is stored or injected
 * beyond this static, hardcoded markup; `postUrl` only ever fills a data
 * attribute and a plain fallback link.
 *
 * Meant to be mounted lazily (see LazySocialEmbed) — each mount calls
 * `process()` exactly once, scoped to this instance's own blockquote via
 * the optional element argument Instagram's API accepts, so it never
 * re-scans blockquotes other instances already processed. `next/script`
 * fires `onLoad` for every mounted `<Script>` requesting a given `src`,
 * even ones that mount after that src has already finished loading
 * elsewhere — so this fires correctly whether embed.js is still loading or
 * was already cached by an earlier post.
 */
export function InstagramEmbed({ postUrl }: InstagramEmbedProps) {
  const blockquoteRef = useRef<HTMLQuoteElement>(null);

  return (
    <>
      <blockquote
        ref={blockquoteRef}
        className="instagram-media"
        data-instgrm-permalink={postUrl}
        data-instgrm-version="14"
        style={{ margin: 0, width: "100%", background: "transparent" }}
      >
        <a href={postUrl} target="_blank" rel="noopener noreferrer">
          View this post on Instagram
        </a>
      </blockquote>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => window.instgrm?.Embeds?.process?.(blockquoteRef.current ?? undefined)}
      />
    </>
  );
}
