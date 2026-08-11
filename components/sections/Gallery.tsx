"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Stack } from "@/components/layout/Stack";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { buttonVariants } from "@/components/ui/Button";
import { GalleryCard } from "@/components/features/gallery/GalleryCard";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  src: string;
  alt: string;
  title: string;
  /** Pre-formatted date, e.g. "10 Januari 2026". No date logic lives here. */
  date: string;
  href: string;
}

// Six explicit spans for a hand-curated editorial bento (not a repeating
// pattern) — one large feature tile, two wide tiles, two small tiles.
// Only active at `lg:` — below that, items stack in a plain 1/2-col grid.
const BENTO_SPANS = [
  "lg:col-span-2 lg:row-span-2",
  "lg:col-span-2 lg:row-span-1",
  "lg:col-span-1 lg:row-span-1",
  "lg:col-span-1 lg:row-span-1",
  "lg:col-span-2 lg:row-span-1",
  "lg:col-span-2 lg:row-span-1",
];

const DEFAULT_ITEMS: GalleryItem[] = [
  {
    // No dedicated gallery photos exist yet in /public/images/gallery/ —
    // every item falls back to the Hero photograph (the only real asset
    // available) until real photos are added.
    src: "/images/hero/hero-masjid.webp",
    alt: "Kajian ba'da Maghrib di Masjid Baitul Hikmah",
    title: "Kajian Ba'da Maghrib",
    date: "10 Januari 2026",
    href: "/galeri/kajian-bada-maghrib",
  },
  {
    src: "/images/hero/hero-masjid.webp",
    alt: "Gotong royong membersihkan lingkungan masjid",
    title: "Gotong Royong Masjid",
    date: "17 Januari 2026",
    href: "/galeri/gotong-royong-masjid",
  },
  {
    src: "/images/hero/hero-masjid.webp",
    alt: "Peringatan Maulid Nabi Muhammad SAW",
    title: "Peringatan Maulid Nabi",
    date: "24 Januari 2026",
    href: "/galeri/peringatan-maulid-nabi",
  },
  {
    src: "/images/hero/hero-masjid.webp",
    alt: "Buka puasa bersama jamaah masjid",
    title: "Buka Puasa Bersama",
    date: "2 Februari 2026",
    href: "/galeri/buka-puasa-bersama",
  },
  {
    src: "/images/hero/hero-masjid.webp",
    alt: "Santunan untuk anak yatim piatu",
    title: "Santunan Yatim Piatu",
    date: "9 Februari 2026",
    href: "/galeri/santunan-yatim-piatu",
  },
  {
    src: "/images/hero/hero-masjid.webp",
    alt: "Renovasi ruang wudhu masjid",
    title: "Renovasi Ruang Wudhu",
    date: "16 Februari 2026",
    href: "/galeri/renovasi-ruang-wudhu",
  },
];

export interface GalleryProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: GalleryItem[];
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Anchor id — Navbar's "Galeri" link points to `#galeri` by default. */
  id?: string;
  className?: string;
}

/**
 * Editorial photo gallery teaser — a hand-curated bento layout, not a
 * uniform grid. `items` is a prop with placeholder defaults, so a CMS can
 * inject real photos/captions later without any change to this component.
 */
export function Gallery({
  eyebrow = "Galeri",
  title = "Galeri Kegiatan",
  description = "Sekilas dokumentasi ibadah, kajian, dan kegiatan sosial yang berlangsung di Masjid Baitul Hikmah.",
  items = DEFAULT_ITEMS,
  viewAllHref = "/galeri",
  viewAllLabel = "Lihat Semua Galeri",
  id = "galeri",
  className,
}: GalleryProps) {
  return (
    <Section id={id} spacing="md" className={className}>
      <Container>
        <Stack gap="lg">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader eyebrow={eyebrow} title={title} description={description} level="h2" />
            <Link
              href={viewAllHref}
              className={cn(buttonVariants({ variant: "outline", size: "md" }), "shrink-0")}
            >
              {viewAllLabel}
            </Link>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerChildren(0.06)}
            className="grid grid-cols-1 auto-rows-[16rem] gap-(--space-grid-gap) sm:grid-cols-2 lg:grid-cols-4"
          >
            {items.map((item, index) => (
              <motion.div key={item.href} variants={fadeUp} className={BENTO_SPANS[index]}>
                <GalleryCard
                  src={item.src}
                  alt={item.alt}
                  title={item.title}
                  date={item.date}
                  href={item.href}
                  aspectRatio="auto"
                />
              </motion.div>
            ))}
          </motion.div>
        </Stack>
      </Container>
    </Section>
  );
}
