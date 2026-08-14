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

/**
 * Published gallery albums for the public homepage teaser — featured
 * albums preferred, then the same sortOrder/title ordering `getGalleryAlbums`
 * already uses. Albums without a cover image are excluded: `GalleryCard`'s
 * `src` is required and has no placeholder-image path (unlike EventCard),
 * so an album with no cover image can't be honestly rendered there.
 */
export async function getFeaturedGalleryAlbums(limit = 6) {
  const albums = await prisma.galleryAlbum.findMany({
    where: { isPublished: true, coverImageId: { not: null } },
    include: { coverImage: true },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
    take: limit,
  });

  // The `coverImageId: { not: null }` filter guarantees `coverImage` is
  // present, but Prisma's generated type can't express that — narrow it
  // here so callers get a non-null `coverImage` without a `!` assertion.
  return albums.filter(
    (album): album is typeof album & { coverImage: NonNullable<typeof album.coverImage> } =>
      album.coverImage !== null
  );
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
