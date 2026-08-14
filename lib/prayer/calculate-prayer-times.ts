import { Coordinates, PrayerTimes } from "adhan";
import type { PrayerSetting } from "@/lib/generated/prisma/client";
import { buildCalculationParameters } from "@/lib/prayer/prayer-parameters";

/**
 * Computes one day's prayer times for a mosque — pure local astronomical
 * calculation via `adhan`, no network calls. `date` only needs to identify
 * the calendar day (any wall-clock moment on that day works); the caller
 * decides what "today" means for the mosque's own timezone.
 */
export function calculatePrayerTimes(setting: PrayerSetting, date: Date): PrayerTimes {
  const coordinates = new Coordinates(setting.latitude.toNumber(), setting.longitude.toNumber());
  const parameters = buildCalculationParameters(setting);
  return new PrayerTimes(coordinates, date, parameters);
}
