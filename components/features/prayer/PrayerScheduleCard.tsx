"use client";

import type { ComponentType } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PrayerCard } from "@/components/features/prayer/PrayerCard";
import { ActivePrayerCard } from "@/components/features/prayer/ActivePrayerCard";
import { usePrayerCountdown } from "@/hooks/usePrayerCountdown";
import { formatCountdown } from "@/utils/formatCountdown";
import { EASE_PREMIUM } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface PrayerScheduleItem {
  /** e.g. "Subuh" — already localized by the caller. */
  name: string;
  /** "HH:MM", 24-hour, Asia/Jakarta wall-clock time. */
  time: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface PrayerScheduleCardProps {
  schedule: PrayerScheduleItem[];
  hijriDate: string;
  gregorianDate: string;
  className?: string;
}

// Below this, the countdown card intensifies (bigger ring, larger digits) —
// never animated/flashy, per the brief.
const URGENT_THRESHOLD_SECONDS = 10 * 60;

/**
 * Gold "today's prayer schedule" card — the next upcoming prayer always
 * leads the list, featured via `ActivePrayerCard` with a live countdown;
 * the rest render as plain `PrayerCard`s in schedule order behind it. All
 * ticking state lives in `usePrayerCountdown`, isolated to this component —
 * a parent Hero section never re-renders on the countdown's account.
 */
export function PrayerScheduleCard({ schedule, hijriDate, gregorianDate, className }: PrayerScheduleCardProps) {
  const { activeIndex, secondsRemaining } = usePrayerCountdown(schedule);
  const reduceMotion = useReducedMotion();
  const urgent = secondsRemaining < URGENT_THRESHOLD_SECONDS;

  // Rotate so the active prayer leads, e.g. Asar → Maghrib → Isya → Subuh →
  // Terbit → Zuhur — only changes when `activeIndex` changes, not every tick.
  const ordered = [...schedule.slice(activeIndex), ...schedule.slice(0, activeIndex)];
  const [active, ...rest] = ordered;

  const cardTransition = { duration: reduceMotion ? 0 : 0.3, ease: EASE_PREMIUM };

  return (
    <div className={cn("w-full rounded-2xl bg-accent p-6 shadow-2xl sm:p-8", className)}>
      {/* `items-baseline` (not `items-start`) so the title and the date row
          share one visual baseline instead of both just pinning to the top —
          with the date now a single line, baseline alignment reads as the
          title settling slightly down to meet it. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-label font-semibold text-accent-foreground">Jadwal Sholat Hari Ini</span>
        <p className="text-right text-small text-accent-foreground">
          <span className="font-heading">{hijriDate}</span>
          {/* Full opacity, not dimmed — reduced-opacity accent-foreground
              measures well under 4.5:1 against this gold background (see
              Infaq.tsx/Hero.tsx notes elsewhere in this codebase). */}
          <span className="mx-2 text-accent-foreground" aria-hidden>
            •
          </span>
          {gregorianDate}
        </p>
      </div>

      {/* Mobile: horizontal carousel (explicitly allowed), cards keep their
          natural size. Tablet/desktop: never wraps and never scrolls — the
          active card stays fixed-size (it must stay legible) while the
          secondary cards are allowed to shrink (down to a readable floor)
          so all six always fit on one row. `items-center` (not the flex
          default `stretch`) — without it, every shorter secondary-card
          wrapper was stretched to match the taller ActivePrayerCard and
          then left its actual Card block-positioned at the top, which is
          what read as "top-aligned with empty space below." Centering
          each card at its own natural height keeps the active card and
          every secondary card level around one shared middle. */}
      <div className="mt-4 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 sm:gap-2.5 sm:overflow-visible sm:pb-0">
        {active ? (
          <motion.div key={active.name} layout transition={cardTransition} className="shrink-0">
            <ActivePrayerCard
              name={active.name}
              time={active.time}
              icon={active.icon}
              countdown={formatCountdown(secondsRemaining)}
              urgent={urgent}
            />
          </motion.div>
        ) : null}

        {rest.map((prayer) => (
          <motion.div
            key={prayer.name}
            layout
            transition={cardTransition}
            className="shrink-0 sm:min-w-0 sm:flex-1"
          >
            <PrayerCard
              name={prayer.name}
              time={prayer.time}
              icon={prayer.icon ? <prayer.icon className="size-4" /> : undefined}
              className="w-full"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
