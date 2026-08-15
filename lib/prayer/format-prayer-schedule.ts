import type { PrayerTimesRecord } from "@/lib/prayer/apply-prayer-ihtiyath";
import type { PrayerScheduleItem } from "@/components/features/prayer/PrayerScheduleCard";

type PrayerTimeKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

/** Indonesian labels matching Hero's own DEFAULT_SCHEDULE naming exactly, in display order. */
const PRAYER_LABELS: { key: PrayerTimeKey; name: string }[] = [
  { key: "fajr", name: "Subuh" },
  { key: "sunrise", name: "Terbit" },
  { key: "dhuhr", name: "Zuhur" },
  { key: "asr", name: "Asar" },
  { key: "maghrib", name: "Maghrib" },
  { key: "isha", name: "Isya" },
];

/** "HH:MM", 24-hour wall-clock time in `timezone` — matches PrayerScheduleItem's own documented format. */
function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Maps the final (Ihtiyath-applied, ceiling-rounded) `PrayerTimesRecord`
 * into the exact `PrayerScheduleItem[]` shape Hero already expects. `icon`
 * is intentionally omitted — icons are never CMS/calculation-driven,
 * they're resolved by name inside Hero itself (see `PRAYER_ICON_BY_NAME`)
 * — so this stays pure data formatting with no presentation or calculation
 * concerns of its own; every value it receives is already final.
 */
export function formatPrayerSchedule(prayerTimes: PrayerTimesRecord, timezone: string): PrayerScheduleItem[] {
  return PRAYER_LABELS.map(({ key, name }) => ({
    name,
    time: formatTime(prayerTimes[key], timezone),
  }));
}
