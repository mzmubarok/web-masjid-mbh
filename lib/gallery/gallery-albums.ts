import { prisma } from "@/lib/prisma";

/** All gallery albums with their event, cover image, and photo count, sorted for display: sortOrder first, title as a stable tie-breaker. */
export async function getGalleryAlbums() {
  return prisma.galleryAlbum.findMany({
    include: {
      event: true,
      coverImage: true,
      _count: { select: { photos: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}

/** One album with everything its edit page needs: its photos (with each photo's Media), cover image, and event. */
export async function getGalleryAlbumById(id: string) {
  return prisma.galleryAlbum.findUnique({
    where: { id },
    include: {
      event: true,
      coverImage: true,
      photos: {
        include: { media: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
