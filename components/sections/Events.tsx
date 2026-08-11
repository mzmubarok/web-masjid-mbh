"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Stack } from "@/components/layout/Stack";
import { Grid } from "@/components/layout/Grid";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Badge, type BadgeProps } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { EventCard } from "@/components/features/events/EventCard";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface EventItem {
  title: string;
  category: string;
  categoryTone?: BadgeProps["tone"];
  /** Pre-formatted date, e.g. "14 Maret 2026". No date logic lives here. */
  date: string;
  /** Pre-formatted time, e.g. "19.30 WIB". */
  time: string;
  location: string;
  imageSrc?: string;
  imageAlt?: string;
  href: string;
}

const DEFAULT_EVENTS: EventItem[] = [
  {
    title: "Kajian Tafsir Al-Qur'an",
    category: "Kajian",
    categoryTone: "primary",
    date: "14 Maret 2026",
    time: "19.30 WIB",
    location: "Aula Utama Masjid",
    // No dedicated event photos exist yet in /public/images/events/ — falls
    // back to the Hero photograph (the only real asset available) until
    // real per-event photos are added.
    imageSrc: "/images/hero/hero-masjid.webp",
    imageAlt: "Suasana kajian di Masjid Baitul Hikmah",
    href: "/kegiatan/kajian-tafsir-al-quran",
  },
  {
    title: "Santunan Anak Yatim",
    category: "Sosial",
    categoryTone: "accent",
    date: "22 Maret 2026",
    time: "09.00 WIB",
    location: "Halaman Masjid",
    imageSrc: "/images/hero/hero-masjid.webp",
    imageAlt: "Kegiatan santunan di Masjid Baitul Hikmah",
    href: "/kegiatan/santunan-anak-yatim",
  },
  {
    title: "Pelatihan Tahsin Al-Qur'an",
    category: "Pendidikan",
    categoryTone: "secondary",
    date: "29 Maret 2026",
    time: "16.00 WIB",
    location: "Ruang Kelas",
    imageSrc: "/images/hero/hero-masjid.webp",
    imageAlt: "Kegiatan pendidikan di Masjid Baitul Hikmah",
    href: "/kegiatan/pelatihan-tahsin-al-quran",
  },
];

export interface EventsProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  events?: EventItem[];
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Anchor id — Navbar's "Kegiatan" link points to `#kegiatan` by default. */
  id?: string;
  className?: string;
}

/**
 * Upcoming events teaser. Presentational only — `events` is a prop with
 * placeholder defaults, so a CMS can later inject real listings (and their
 * own `href`s) without any change to this component.
 */
export function Events({
  eyebrow = "Kegiatan",
  title = "Kegiatan Masjid",
  description = "Ikuti kajian, pelatihan, dan kegiatan sosial yang rutin diselenggarakan Masjid Baitul Hikmah untuk jamaah dan warga sekitar.",
  events = DEFAULT_EVENTS,
  viewAllHref = "/kegiatan",
  viewAllLabel = "Lihat Semua Kegiatan",
  id = "kegiatan",
  className,
}: EventsProps) {
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
          >
            <Grid cols={3}>
              {events.map((event) => (
                <motion.div key={event.href} variants={fadeUp}>
                  <EventCard
                    title={event.title}
                    category={
                      <Badge tone={event.categoryTone ?? "default"}>{event.category}</Badge>
                    }
                    date={event.date}
                    time={event.time}
                    location={event.location}
                    imageSrc={event.imageSrc}
                    imageAlt={event.imageAlt}
                    href={event.href}
                  />
                </motion.div>
              ))}
            </Grid>
          </motion.div>
        </Stack>
      </Container>
    </Section>
  );
}
