"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export interface UseInViewOptions {
  /** How far outside the viewport counts as "near" — passed straight to IntersectionObserver. @default "200px" */
  rootMargin?: string;
}

/**
 * True once the returned ref's element has entered (or come within
 * `rootMargin` of) the viewport, and stays true forever after — the
 * observer disconnects itself on the first intersection, so this never
 * re-triggers for an element that later scrolls back out of view.
 *
 * SSR-safe: `isInView` starts `false` on both the server render and the
 * first client render (no hydration mismatch), then flips to `true` once
 * IntersectionObserver confirms visibility client-side. Falls back to
 * `true` immediately in environments without IntersectionObserver, so
 * content is never permanently stuck behind a placeholder.
 */
export function useInView<T extends Element>({ rootMargin = "200px" }: UseInViewOptions = {}): [
  RefObject<T | null>,
  boolean,
] {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (isInView) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isInView, rootMargin]);

  return [ref, isInView];
}
