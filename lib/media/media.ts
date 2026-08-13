import { prisma } from "@/lib/prisma";

export interface MediaLibraryFilters {
  q?: string;
  folder?: string;
  mimeType?: string;
}

export async function getMediaLibrary(filters: MediaLibraryFilters = {}) {
  return prisma.media.findMany({
    where: {
      ...(filters.q ? { fileName: { contains: filters.q } } : {}),
      ...(filters.folder ? { folder: filters.folder } : {}),
      ...(filters.mimeType ? { mimeType: filters.mimeType } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMediaById(id: string) {
  return prisma.media.findUnique({ where: { id } });
}

export async function findMediaByChecksum(checksum: string) {
  return prisma.media.findUnique({ where: { checksum } });
}

/**
 * Every place a Media row can be referenced from, per the schema's actual
 * relations. Returns a human-readable description per reference found —
 * empty means it's safe to delete.
 */
export async function getMediaUsage(mediaId: string): Promise<string[]> {
  const [
    siteSettingLogo,
    siteSettingLogoDark,
    siteSettingFavicon,
    siteSettingSeo,
    siteSettingQris,
    socialMedia,
    hero,
    tagline,
    event,
    eventCategory,
    galleryAlbum,
    galleryPhoto,
    financialProgram,
    donationProgram,
  ] = await Promise.all([
    prisma.siteSetting.count({ where: { logoId: mediaId } }),
    prisma.siteSetting.count({ where: { logoDarkId: mediaId } }),
    prisma.siteSetting.count({ where: { faviconId: mediaId } }),
    prisma.siteSetting.count({ where: { defaultSeoImageId: mediaId } }),
    prisma.siteSetting.count({ where: { qrisImageId: mediaId } }),
    prisma.socialMedia.count({ where: { iconId: mediaId } }),
    prisma.hero.count({ where: { backgroundImageId: mediaId } }),
    prisma.tagline.count({ where: { iconId: mediaId } }),
    prisma.event.count({ where: { featuredImageId: mediaId } }),
    prisma.eventCategory.count({ where: { iconId: mediaId } }),
    prisma.galleryAlbum.count({ where: { coverImageId: mediaId } }),
    prisma.galleryPhoto.count({ where: { mediaId } }),
    prisma.financialProgram.count({ where: { iconId: mediaId } }),
    prisma.donationProgram.count({ where: { coverImageId: mediaId } }),
  ]);

  const usages: string[] = [];
  if (siteSettingLogo) usages.push("Site Settings logo");
  if (siteSettingLogoDark) usages.push("Site Settings dark logo");
  if (siteSettingFavicon) usages.push("Site Settings favicon");
  if (siteSettingSeo) usages.push("Site Settings SEO image");
  if (siteSettingQris) usages.push("Site Settings QRIS image");
  if (socialMedia) usages.push(`${socialMedia} social media icon(s)`);
  if (hero) usages.push(`${hero} Hero background(s)`);
  if (tagline) usages.push(`${tagline} tagline icon(s)`);
  if (event) usages.push(`${event} event featured image(s)`);
  if (eventCategory) usages.push(`${eventCategory} event category icon(s)`);
  if (galleryAlbum) usages.push(`${galleryAlbum} gallery album cover(s)`);
  if (galleryPhoto) usages.push(`${galleryPhoto} gallery photo(s)`);
  if (financialProgram) usages.push(`${financialProgram} financial program icon(s)`);
  if (donationProgram) usages.push(`${donationProgram} donation program cover(s)`);

  return usages;
}
