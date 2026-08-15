import type { PrayerTimes } from "adhan";
import type { PrayerSetting } from "@/lib/generated/prisma/client";

/**
 * The six calculated prayer instants, independent of adhan's own
 * `PrayerTimes` class — once Ihtiyath is applied, nothing downstream in
 * this pipeline needs adhan's methods (`currentPrayer`/`nextPrayer`/etc.),
 * only these six Date values.
 */
export interface PrayerTimesRecord {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

/**
 * Applies each prayer's own configured Ihtiyath (extra safety minutes) on
 * top of the astronomically-calculated time — a purely operational
 * adjustment, never a change to the calculation itself. `prayerTimes`
 * (adhan's output) is read, never mutated; the calculation stage above
 * this function is completely untouched by Ihtiyath.
 */
export function applyPrayerIhtiyath(prayerTimes: PrayerTimes, setting: PrayerSetting): PrayerTimesRecord {
  return {
    fajr: addMinutes(prayerTimes.fajr, setting.fajrIhtiyath),
    sunrise: addMinutes(prayerTimes.sunrise, setting.sunriseIhtiyath),
    dhuhr: addMinutes(prayerTimes.dhuhr, setting.dhuhrIhtiyath),
    asr: addMinutes(prayerTimes.asr, setting.asrIhtiyath),
    maghrib: addMinutes(prayerTimes.maghrib, setting.maghribIhtiyath),
    isha: addMinutes(prayerTimes.isha, setting.ishaIhtiyath),
  };
}
