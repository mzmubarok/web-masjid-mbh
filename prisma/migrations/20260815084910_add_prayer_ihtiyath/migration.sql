-- Adds per-prayer Ihtiyath (extra safety minutes) to PrayerSetting.
-- Additive only — every existing row defaults every new column to 0 (no
-- adjustment), no other column changes, no data loss.

-- AlterTable
ALTER TABLE "PrayerSetting" ADD COLUMN "fajrIhtiyath" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PrayerSetting" ADD COLUMN "sunriseIhtiyath" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PrayerSetting" ADD COLUMN "dhuhrIhtiyath" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PrayerSetting" ADD COLUMN "asrIhtiyath" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PrayerSetting" ADD COLUMN "maghribIhtiyath" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PrayerSetting" ADD COLUMN "ishaIhtiyath" INTEGER NOT NULL DEFAULT 0;
