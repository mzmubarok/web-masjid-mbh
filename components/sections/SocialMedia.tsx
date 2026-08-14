"use client";

import type { ComponentType } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Image as ImageIcon, Play, Video } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Stack } from "@/components/layout/Stack";
import { Grid } from "@/components/layout/Grid";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface SocialPreviewItem {
  /** Omit until a real API integration exists — renders a placeholder tile instead. */
  imageSrc?: string;
  imageAlt?: string;
}

export interface SocialPlatform {
  name: string;
  handle: string;
  href: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  ctaLabel: string;
  previewAspect: "square" | "portrait";
  previews: SocialPreviewItem[];
}

const DEFAULT_PLATFORMS: SocialPlatform[] = [
  {
    name: "Instagram",
    handle: "@masjidbaitulhikmah_",
    href: "https://instagram.com/masjidbaitulhikmah_",
    description: "Kajian, dokumentasi kegiatan, dan pembaruan terkini dari Masjid Baitul Hikmah.",
    icon: ImageIcon,
    ctaLabel: "Ikuti di Instagram",
    previewAspect: "square",
    previews: Array.from({ length: 6 }, () => ({})),
  },
  {
    name: "TikTok",
    handle: "@masjidbaitulhikmah",
    href: "https://tiktok.com/@masjidbaitulhikmah",
    description: "Video singkat kajian, momen kegiatan, dan cuplikan dakwah Masjid Baitul Hikmah.",
    icon: Video,
    ctaLabel: "Ikuti di TikTok",
    previewAspect: "portrait",
    previews: Array.from({ length: 4 }, () => ({})),
  },
];

export interface SocialMediaProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  /** The two featured platform cards — a prop, so real accounts/data can be swapped in later. */
  platforms?: SocialPlatform[];
  /**
   * Interactive post/reel embed URLs, matched to a platform by its `name`
   * ("Instagram"/"TikTok") — kept separate from `platforms` so the rest of
   * each card's hardcoded copy never has to be duplicated just to add an
   * embed. Omit to keep the existing placeholder preview grid exactly as
   * today; the same container swaps to a live `<iframe>` the moment a URL
   * is provided, no other change needed.
   */
  instagramEmbedUrl?: string;
  tiktokEmbedUrl?: string;
  /** Anchor id — no Navbar link points here yet, kept for consistency with other sections. */
  id?: string;
  className?: string;
}

/** Matches a platform card to its embed URL by name — the only two platforms this teaser ever shows by default. */
function embedUrlForPlatform(
  platformName: string,
  instagramEmbedUrl: string | undefined,
  tiktokEmbedUrl: string | undefined
): string | undefined {
  if (platformName === "Instagram") return instagramEmbedUrl;
  if (platformName === "TikTok") return tiktokEmbedUrl;
  return undefined;
}

/**
 * Social media teaser — two featured platform cards with a placeholder
 * preview grid each. No embeds, no API calls: `previews` items are props
 * with an optional `imageSrc`; once a backend integration (Instagram Graph
 * API, TikTok oEmbed, etc.) exists, populating that field is the only
 * change needed — the placeholder tiles and real thumbnails share the same
 * markup path.
 */
export function SocialMedia({
  eyebrow = "Media Sosial",
  title = "Ikuti Aktivitas Kami",
  description = "Stay connected with the latest activities, lectures, and community updates from Masjid Baitul Hikmah Gondolayu Lor.",
  platforms = DEFAULT_PLATFORMS,
  instagramEmbedUrl,
  tiktokEmbedUrl,
  id = "media-sosial",
  className,
}: SocialMediaProps) {
  return (
    <Section id={id} background="surface" spacing="md" className={className}>
      <Container>
        <Stack gap="lg">
          <SectionHeader align="center" level="h2" eyebrow={eyebrow} title={title} description={description} />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren(0.1)}
          >
            <Grid cols={2}>
              {platforms.map((platform) => {
                const embedUrl = embedUrlForPlatform(platform.name, instagramEmbedUrl, tiktokEmbedUrl);

                return (
                <motion.div key={platform.name} variants={fadeUp}>
                  <Card interactive className="h-full">
                    <Stack gap="md">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <platform.icon className="size-5" aria-hidden />
                          </div>
                          <div className="flex flex-col">
                            <CardTitle>{platform.name}</CardTitle>
                            <span className="text-small text-muted-foreground">{platform.handle}</span>
                          </div>
                        </div>
                        <CardDescription className="pt-1">{platform.description}</CardDescription>
                      </CardHeader>

                      {embedUrl ? (
                        <div
                          className={cn(
                            "relative w-full overflow-hidden rounded-md bg-muted",
                            platform.previewAspect === "square" ? "aspect-square" : "aspect-[9/16]"
                          )}
                        >
                          <iframe
                            src={embedUrl}
                            title={`${platform.name} embed`}
                            loading="lazy"
                            className="absolute inset-0 size-full border-0"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "grid gap-2",
                            platform.previewAspect === "square" ? "grid-cols-3" : "grid-cols-4"
                          )}
                        >
                          {platform.previews.map((preview, index) => (
                            <div
                              key={index}
                              className={cn(
                                "relative overflow-hidden rounded-md bg-muted",
                                platform.previewAspect === "square" ? "aspect-square" : "aspect-[9/16]"
                              )}
                            >
                              {preview.imageSrc ? (
                                <Image
                                  src={preview.imageSrc}
                                  alt={preview.imageAlt ?? ""}
                                  fill
                                  loading="lazy"
                                  sizes="160px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
                                  {platform.previewAspect === "square" ? (
                                    <ImageIcon className="size-5" aria-hidden />
                                  ) : (
                                    <Play className="size-5" aria-hidden />
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <a
                        href={platform.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "outline", size: "md" }), "w-full")}
                      >
                        {platform.ctaLabel}
                      </a>
                    </Stack>
                  </Card>
                </motion.div>
                );
              })}
            </Grid>
          </motion.div>
        </Stack>
      </Container>
    </Section>
  );
}
