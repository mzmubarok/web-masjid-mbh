import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Stack } from "@/components/layout/Stack";
import { cn } from "@/lib/utils";

export interface GalleryCardProps {
  src: string;
  /** Required — a meaningful description, not the filename (see design-system a11y rules). */
  alt: string;
  title?: string;
  /** Pre-formatted date, e.g. "14 Maret 2026". No date logic lives here. */
  date?: string;
  /** When provided (with `title` and/or `date`), renders a "Lihat" link inside the hover overlay. */
  href?: string;
  /** @default "Lihat" */
  ctaLabel?: string;
  /** "auto" fills its parent's dimensions — use inside a grid that sizes the cell itself (e.g. a bento layout). @default "video" */
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  className?: string;
}

const aspectClass = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  auto: "h-full",
} as const;

/**
 * A single optimized image tile. If `title` and/or `date` are given, they
 * (plus an optional `href` CTA) appear in a scrim overlay on hover/focus —
 * hidden visually until then, but always present for screen readers.
 */
export function GalleryCard({
  src,
  alt,
  title,
  date,
  href,
  ctaLabel = "Lihat",
  aspectRatio = "video",
  className,
}: GalleryCardProps) {
  const hasOverlay = Boolean(title || date);

  return (
    <figure
      className={cn("group relative w-full overflow-hidden rounded-lg", aspectClass[aspectRatio], className)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        loading="lazy"
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
      />
      {hasOverlay ? (
        <figcaption
          className={cn(
            "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-heading/85 via-heading/20 to-transparent",
            "p-(--space-card-padding) opacity-0 transition-opacity duration-200",
            "group-hover:opacity-100 group-focus-within:opacity-100"
          )}
        >
          <Stack gap="xs">
            {date ? <span className="text-caption text-surface/80">{date}</span> : null}
            {title ? <span className="text-h4 font-heading text-surface">{title}</span> : null}
            {href ? (
              <Link
                href={href}
                className="mt-1 inline-flex w-fit items-center gap-1 text-button text-surface underline-offset-4 hover:underline"
              >
                {ctaLabel}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            ) : null}
          </Stack>
        </figcaption>
      ) : null}
    </figure>
  );
}
