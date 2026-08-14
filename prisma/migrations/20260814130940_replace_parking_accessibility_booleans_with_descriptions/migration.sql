-- Replace ContactLocation.parking/accessibility (Boolean) with
-- parkingDescription/accessibilityDescription (nullable text), matching
-- how every other facility/notes field on this model already works.
--
-- Existing rows are backfilled before the old columns are dropped, so no
-- data is silently discarded: a `true` boolean becomes the same descriptive
-- sentence the public site already showed as its hardcoded fallback for
-- that facility; a `false` boolean becomes NULL (nothing to say), which the
-- public site already treats as "show the hardcoded fallback" for an
-- unfilled optional field — the same behavior as before the migration for
-- an unconfigured facility, not a regression.

-- AddColumn
ALTER TABLE "ContactLocation" ADD COLUMN "parkingDescription" TEXT;
ALTER TABLE "ContactLocation" ADD COLUMN "accessibilityDescription" TEXT;

-- Backfill from the columns being dropped
UPDATE "ContactLocation"
SET "parkingDescription" = CASE WHEN "parking" THEN 'Tersedia area parkir motor dan mobil di halaman masjid' ELSE NULL END;

UPDATE "ContactLocation"
SET "accessibilityDescription" = CASE WHEN "accessibility" THEN 'Akses ramah kursi roda tersedia melalui pintu utama' ELSE NULL END;

-- DropColumn
ALTER TABLE "ContactLocation" DROP COLUMN "parking";
ALTER TABLE "ContactLocation" DROP COLUMN "accessibility";
