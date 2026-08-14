-- Replaces SocialMedia.instagramEmbedUrl/.tiktokEmbedUrl (a single URL per
-- platform, which turned out unusable — Instagram/TikTok don't allow an
-- arbitrary post URL to be embedded directly in an <iframe>) with a proper
-- one-to-many SocialMediaPost table, so each platform can have any number
-- of individually managed embedded posts. No existing SocialMedia row data
-- is lost — only these two columns (added in a prior, now-superseded
-- migration) are dropped; platform/url/iconId/displayOrder/isActive are untouched.

-- DropColumn
ALTER TABLE "SocialMedia" DROP COLUMN "instagramEmbedUrl";
ALTER TABLE "SocialMedia" DROP COLUMN "tiktokEmbedUrl";

-- CreateTable
CREATE TABLE "SocialMediaPost" (
    "id" TEXT NOT NULL,
    "socialMediaId" TEXT NOT NULL,
    "postUrl" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMediaPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialMediaPost_socialMediaId_idx" ON "SocialMediaPost"("socialMediaId");

-- CreateIndex
CREATE INDEX "SocialMediaPost_displayOrder_idx" ON "SocialMediaPost"("displayOrder");

-- CreateIndex
CREATE INDEX "SocialMediaPost_isPublished_idx" ON "SocialMediaPost"("isPublished");

-- AddForeignKey
ALTER TABLE "SocialMediaPost" ADD CONSTRAINT "SocialMediaPost_socialMediaId_fkey" FOREIGN KEY ("socialMediaId") REFERENCES "SocialMedia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
