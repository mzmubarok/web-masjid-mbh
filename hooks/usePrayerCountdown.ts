"use client";

import { useEffect, useMemo, useState } from "react";

export interface PrayerScheduleEntry {
  name: string;
  /** "HH:MM", 24-hour, Asia/Jakarta wall-clock time. */
  time: string;
}

export interface PrayerCountdownResult {
  /** Index into the input `schedule` array of the current/next prayer. */
  activeIndex: number;
  /** Seconds remaining until the active prayer starts — ticks down live. */
  secondsRemaining: number;
}

const JAKARTA_TIME_ZONE = "Asia/Jakarta";
const SECONDS_PER_DAY = 24 * 60 * 60;

function getJakartaSecondsSinceMidnight(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return get("hour") * 3600 + get("minute") * 60 + get("second");
}

function findActivePrayer(prayerSeconds: number[]): PrayerCountdownResult {
  const nowSeconds = getJakartaSecondsSinceMidnight(new Date());
  let activeIndex = 0;
  let secondsRemaining = Infinity;

  prayerSeconds.forEach((seconds, index) => {
    // Prayers already past today wrap to tomorrow (+24h) so the last prayer
    // of the day still counts down to the first prayer, not backwards.
    const remaining = seconds >= nowSeconds ? seconds - nowSeconds : seconds + SECONDS_PER_DAY - nowSeconds;
    if (remaining < secondsRemaining) {
      secondsRemaining = remaining;
      activeIndex = index;
    }
  });

  return { activeIndex, secondsRemaining };
}

/**
 * Finds today's next upcoming prayer and ticks a live countdown to it,
 * wrapping to tomorrow's first prayer once the last one of the day passes —
 * no manual interaction, no page refresh.
 *
 * Reads `schedule[].time` as "HH:MM" Asia/Jakarta wall-clock and nothing
 * else — a live prayer-time API can swap the `schedule` array in later with
 * no change to this hook or its consumers.
 */
export function usePrayerCountdown(schedule: PrayerScheduleEntry[]): PrayerCountdownResult {
  const prayerSeconds = useMemo(
    () =>
      schedule.map((prayer) => {
        const [hour, minute] = prayer.time.split(":").map(Number);
        return (hour || 0) * 3600 + (minute || 0) * 60;
      }),
    [schedule]
  );

  const [result, setResult] = useState(() => findActivePrayer(prayerSeconds));

  useEffect(() => {
    const tick = () => {
      setResult((prev) => {
        const next = findActivePrayer(prayerSeconds);
        // Same reference when nothing changed — avoids triggering a
        // re-render of everything downstream every second for no reason.
        return next.activeIndex === prev.activeIndex && next.secondsRemaining === prev.secondsRemaining
          ? prev
          : next;
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [prayerSeconds]);

  return result;
}
