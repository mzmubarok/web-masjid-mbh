import type { PrayerTimesRecord } from "@/lib/prayer/apply-prayer-ihtiyath";

/**
 * Ceils one instant up to the next full minute — always up, never a normal
 * round, never a truncation. Unchanged when already exactly on a minute
 * boundary (zero seconds *and* zero milliseconds — a sub-second remainder
 * alone, e.g. 17:39:00.500, still isn't "exactly 17:39" and gets ceiled
 * too). Minute/hour/day rollovers (17:59:03 -> 18:00, 18:59:59 -> 19:00)
 * fall out of plain Date arithmetic — no manual carry logic needed.
 */
function ceilToMinute(date: Date): Date {
  if (date.getSeconds() === 0 && date.getMilliseconds() === 0) {
    return date;
  }
  const ceiled = new Date(date);
  ceiled.setSeconds(0, 0);
  return new Date(ceiled.getTime() + 60_000);
}

/**
 * Ceiling-rounds every prayer time up to the next full minute. Runs after
 * Ihtiyath and before formatting — the last adjustment made to the raw
 * instants before they become display strings.
 */
export function ceilPrayerTimesToMinute(record: PrayerTimesRecord): PrayerTimesRecord {
  return {
    fajr: ceilToMinute(record.fajr),
    sunrise: ceilToMinute(record.sunrise),
    dhuhr: ceilToMinute(record.dhuhr),
    asr: ceilToMinute(record.asr),
    maghrib: ceilToMinute(record.maghrib),
    isha: ceilToMinute(record.isha),
  };
}
