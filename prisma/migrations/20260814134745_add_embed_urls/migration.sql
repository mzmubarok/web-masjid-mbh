-- Adds interactive-embed URL columns. All three are nullable, purely
-- additive, with no prior equivalent column to backfill from.

-- AlterTable
ALTER TABLE "ContactLocation" ADD COLUMN "googleMapsEmbedUrl" TEXT;

-- AlterTable
ALTER TABLE "SocialMedia" ADD COLUMN "instagramEmbedUrl" TEXT;
ALTER TABLE "SocialMedia" ADD COLUMN "tiktokEmbedUrl" TEXT;
