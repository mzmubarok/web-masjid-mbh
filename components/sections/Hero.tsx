"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CloudSun, Moon, MoonStar, Sun, Sunrise, Sunset } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PrayerScheduleCard, type PrayerScheduleItem } from "@/components/features/prayer/PrayerScheduleCard";
import { EASE_PREMIUM, fadeUp, staggerChildren } from "@/lib/motion";
import { cn } from "@/lib/utils";

const DEFAULT_SCHEDULE: PrayerScheduleItem[] = [
  { name: "Subuh", time: "04:30", icon: MoonStar },
  { name: "Terbit", time: "05:45", icon: Sunrise },
  { name: "Zuhur", time: "11:52", icon: Sun },
  { name: "Asar", time: "15:15", icon: CloudSun },
  { name: "Maghrib", time: "17:48", icon: Sunset },
  { name: "Isya", time: "19:00", icon: Moon },
];

/** Today's real Gregorian date — plain formatting, not a prayer-time calculation. */
function getTodayGregorianDate() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

// Background-only fade — a plain opacity transition (no translate), separate
// from the staggered content below so the photo starts revealing immediately
// on mount rather than waiting its turn in the stagger sequence.
const bgFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9, ease: EASE_PREMIUM } },
};

export interface HeroProps {
  tagline?: string;
  mosqueName?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Placeholder until a Hijri calendar source is wired up. */
  hijriDate?: string;
  /** Defaults to today's real date if omitted — see `getTodayGregorianDate`. */
  gregorianDate?: string;
  schedule?: PrayerScheduleItem[];
  className?: string;
}

/**
 * Homepage welcome — full-bleed photo with a glass content panel carrying
 * only the mosque name and tagline, and a floating gold card surfacing
 * today's prayer schedule (see `PrayerScheduleCard` for the live countdown/
 * auto-rotation logic — none of that ticking state lives here, so Hero
 * itself never re-renders on the countdown's account).
 */
export function Hero({
  tagline = "Mengaji • Mengabdi • Menghidupi",
  // Embedded newline is deliberate — paired with `whitespace-pre-line`
  // below, it forces the break between the mosque name and its location
  // at this exact point, rather than leaving it to the browser's natural
  // (width-dependent, unpredictable) wrapping.
  mosqueName = "Masjid Baitul Hikmah\nGondolayu Lor",
  imageSrc = "/images/hero/hero-masjid.webp",
  imageAlt = "Tampak bangunan Masjid Baitul Hikmah Gondolayu Lor",
  hijriDate = "12 Ramadan 1447 H",
  gregorianDate,
  schedule = DEFAULT_SCHEDULE,
  className,
}: HeroProps) {
  const reduceMotion = useReducedMotion();
  // `false` (not `undefined`) is what tells framer-motion to skip the mount
  // animation entirely and render straight into the final state.
  const initial = reduceMotion ? false : "hidden";
  const resolvedGregorianDate = gregorianDate ?? getTodayGregorianDate();

  return (
    <Section
      as="section"
      spacing="none"
      className={cn(
        // Pulled up by the sticky Navbar's own rendered height (its
        // transparent/floating-state height specifically — see Navbar.tsx)
        // so the photo starts right where the navbar sits — no gap,
        // transparent navbar overlays the image instead of blank space.
        // `pt-*` is still a hard floor (padding on a flex container can't be
        // encroached on by centered children, so the glass card can never
        // render behind the navbar) — but it no longer has to clear the
        // navbar's *full* height, only the actual logo glyph within it.
        // Navbar centers a 40/44/48px logo in an 80/96/112px bar, so the
        // logo's own bottom edge sits at (bar+logo)/2 = 60/70/80px from the
        // bar's top, +8px safety margin: 68/78/88px. The transparent strip
        // below the logo (its bottom margin inside the bar) is fair game.
        "relative isolate -mt-20 flex min-h-[58vh] items-center overflow-hidden pt-[68px] sm:-mt-24 sm:min-h-[64vh] sm:pt-[78px] lg:-mt-28 lg:min-h-[70vh] lg:pt-[88px] 2xl:min-h-[78vh]",
        className
      )}
    >
      <motion.div initial={initial} animate="visible" variants={bgFade} className="absolute inset-0 -z-10">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          // Pushed further right (84% — as far as the source photo's tower
          // allows before its left edge would clip) and biased toward the
          // upper-middle (38%) rather than the base, since the source photo
          // has the finial/dome sitting in the top half of the frame — this
          // keeps the dome fully in view even on tall/narrow viewports.
          className="object-cover object-[90%_38%]"
        />
        {/* Scrim biased left-to-right — keeps the left text column legible
            without darkening the mosque itself on the right. */}
        <div className="absolute inset-0 bg-gradient-to-r from-heading/55 via-heading/20 to-transparent" />
      </motion.div>

      {/* Half the standard section padding (reusing the same --space-section-y
          token via calc, the same formula Section's own "sm" spacing uses) —
          a shorter hero needs less vertical breathing room around its content. */}
      <Container className="py-[calc(var(--space-section-y)/2)]">
        <motion.div
          initial={initial}
          animate="visible"
          variants={staggerChildren(0.15)}
          className="flex flex-col items-start text-left"
        >
          {/* Same max-width and horizontal padding as the prayer schedule
              card below — their edges align and they read as one composition
              rather than two unrelated boxes. Sits behind the gold card
              (z-0) where the two overlap. */}
          <motion.div
            variants={fadeUp}
            className="relative z-0 w-full max-w-2xl rounded-2xl border border-surface/20 bg-heading/30 p-5 text-left shadow-2xl backdrop-blur-lg sm:p-6"
          >
            <p className="text-label text-accent">{tagline}</p>
            <h1 className="mt-3 whitespace-pre-line text-h1 font-heading text-surface">{mosqueName}</h1>
          </motion.div>

          {/* Deliberately layered on top (z-10) of the glass panel's bottom
              edge — a subtle, elegant cascade rather than two stacked but
              unrelated boxes. Even top/bottom padding on the card itself
              (matching the glass panel) now that the active prayer card is
              much smaller — no more need to lean on asymmetric padding to
              carve out headroom for the title/date row.
              The overlap amount stays deliberately smaller than the gold
              card's own top padding (p-5/p-6 = 20/24px) — e.g. -mt-2 (8px)
              leaves a clear ~12px buffer before "Jadwal Sholat Hari Ini"
              starts, so the glass panel's edge tucks behind the gold card's
              corner without ever reaching the header text. */}
          <motion.div variants={fadeUp} className="relative z-10 -mt-2 w-full max-w-2xl sm:-mt-3">
            <PrayerScheduleCard
              schedule={schedule}
              hijriDate={hijriDate}
              gregorianDate={resolvedGregorianDate}
              className="p-5 sm:p-6"
            />
          </motion.div>
        </motion.div>
      </Container>
    </Section>
  );
}
