-- Adds the LFNU/CUSTOM calculation-mode switch to PrayerSetting. Additive
-- only — every existing row defaults to "LFNU" (this project's default
-- mode), no other column changes, no data loss.

-- AlterTable
ALTER TABLE "PrayerSetting" ADD COLUMN "calculationMode" TEXT NOT NULL DEFAULT 'LFNU';
