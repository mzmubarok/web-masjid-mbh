"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { slugify } from "@/lib/slug";
import { parseDateOnly } from "@/lib/date";

export interface GalleryAlbumActionState {
  status: "idle" | "success" | "error";
  message: string;
}

export interface DeleteGalleryAlbumState {
  status: "idle" | "error";
  message: string;
}

export interface GalleryPhotoActionState {
  status: "idle" | "success" | "error";
  message: string;
}

function readOptionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
}

/** True when `error` is a Prisma unique-constraint violation (P2002). */
function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

interface ParsedAlbumInput {
  title: string;
  slug: string;
  description: string | null;
  coverImageId: string | null;
  eventId: string | null;
  eventDate: Date | null;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
}

function parseAlbumForm(formData: FormData): ParsedAlbumInput | { error: string } {
  const title = readOptionalString(formData, "title");
  if (!title) {
    return { error: "Please fill in the following required field: Title." };
  }

  const sortOrderRaw = formData.get("sortOrder");
  const sortOrderText = typeof sortOrderRaw === "string" ? sortOrderRaw.trim() : "";
  if (!sortOrderText) {
    return { error: "Please fill in the following required field: Sort Order." };
  }

  const sortOrder = Number(sortOrderText);
  if (!Number.isInteger(sortOrder)) {
    return { error: "Sort Order must be a valid integer." };
  }

  const slugInput = readOptionalString(formData, "slug");
  const slug = slugify(slugInput ?? title);
  if (!slug) {
    return { error: "Slug must contain at least one letter or number." };
  }

  const eventDateText = readOptionalString(formData, "eventDate");
  let eventDate: Date | null = null;
  if (eventDateText) {
    eventDate = parseDateOnly(eventDateText);
    if (!eventDate) {
      return { error: "Event Date is not a valid date." };
    }
  }

  return {
    title,
    slug,
    description: readOptionalString(formData, "description"),
    coverImageId: readOptionalString(formData, "coverImageId"),
    eventId: readOptionalString(formData, "eventId"),
    eventDate,
    isFeatured: formData.get("isFeatured") !== null,
    isPublished: formData.get("isPublished") !== null,
    sortOrder,
  };
}

/** Confirms `coverImageId`, when provided, refers to a real Media record. */
async function validateCoverImage(coverImageId: string | null): Promise<string | null> {
  if (!coverImageId) {
    return null;
  }
  const media = await prisma.media.findUnique({ where: { id: coverImageId } });
  return media ? null : "Selected cover image does not exist.";
}

/** Confirms `eventId`, when provided, refers to a real Event. Gallery never creates or modifies Events — only links to one. */
async function validateEvent(eventId: string | null): Promise<string | null> {
  if (!eventId) {
    return null;
  }
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  return event ? null : "Selected event does not exist.";
}

/** Creates a new GalleryAlbum. `createdById`/`updatedById` are always the current session's user — never client-supplied. */
export async function createGalleryAlbum(
  _prevState: GalleryAlbumActionState,
  formData: FormData
): Promise<GalleryAlbumActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage the gallery." };
  }

  const parsed = parseAlbumForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const coverImageError = await validateCoverImage(parsed.coverImageId);
  if (coverImageError) {
    return { status: "error", message: coverImageError };
  }

  const eventError = await validateEvent(parsed.eventId);
  if (eventError) {
    return { status: "error", message: eventError };
  }

  const slugTaken = await prisma.galleryAlbum.findUnique({ where: { slug: parsed.slug } });
  if (slugTaken) {
    return {
      status: "error",
      message: `The slug "${parsed.slug}" is already in use. Try a different title or provide a custom slug.`,
    };
  }

  const isPublished = parsed.isPublished;
  const publishedAt = isPublished ? new Date() : null;

  try {
    await prisma.galleryAlbum.create({
      data: {
        title: parsed.title,
        slug: parsed.slug,
        description: parsed.description,
        coverImageId: parsed.coverImageId,
        eventId: parsed.eventId,
        eventDate: parsed.eventDate,
        isFeatured: parsed.isFeatured,
        isPublished,
        publishedAt,
        sortOrder: parsed.sortOrder,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "That slug is already in use by another album." };
    }
    console.error("Failed to create gallery album:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

/** Updates an existing GalleryAlbum by id. `updatedById` is always the current session's user. */
export async function updateGalleryAlbum(
  _prevState: GalleryAlbumActionState,
  formData: FormData
): Promise<GalleryAlbumActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage the gallery." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing album id." };
  }

  const existing = await prisma.galleryAlbum.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This album no longer exists. Please reload the page." };
  }

  const parsed = parseAlbumForm(formData);
  if ("error" in parsed) {
    return { status: "error", message: parsed.error };
  }

  const coverImageError = await validateCoverImage(parsed.coverImageId);
  if (coverImageError) {
    return { status: "error", message: coverImageError };
  }

  const eventError = await validateEvent(parsed.eventId);
  if (eventError) {
    return { status: "error", message: eventError };
  }

  const slugConflict = await prisma.galleryAlbum.findFirst({
    where: { id: { not: id }, slug: parsed.slug },
  });
  if (slugConflict) {
    return { status: "error", message: `The slug "${parsed.slug}" is already in use by another album.` };
  }

  // Only stamp publishedAt on the unpublished -> published transition;
  // clear it on unpublish; leave it untouched while staying published.
  const isPublished = parsed.isPublished;
  const publishedAt = !isPublished ? null : existing.isPublished ? existing.publishedAt : new Date();

  try {
    await prisma.galleryAlbum.update({
      where: { id },
      data: {
        title: parsed.title,
        slug: parsed.slug,
        description: parsed.description,
        coverImageId: parsed.coverImageId,
        eventId: parsed.eventId,
        eventDate: parsed.eventDate,
        isFeatured: parsed.isFeatured,
        isPublished,
        publishedAt,
        sortOrder: parsed.sortOrder,
        updatedById: session.user.id,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { status: "error", message: "That slug is already in use by another album." };
    }
    console.error("Failed to update gallery album:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/admin/gallery");
  revalidatePath(`/admin/gallery/${id}/edit`);
  redirect("/admin/gallery");
}

/**
 * Deletes a GalleryAlbum. Its GalleryPhoto rows are deleted first, in the
 * same transaction, so the album can always be deleted in one step — the
 * underlying Media records those photos (and the cover image) point to are
 * never touched, and the associated Event (if any) is never modified.
 */
export async function deleteGalleryAlbum(
  _prevState: DeleteGalleryAlbumState,
  formData: FormData
): Promise<DeleteGalleryAlbumState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage the gallery." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing album id." };
  }

  const existing = await prisma.galleryAlbum.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This album no longer exists. Please reload the page." };
  }

  try {
    await prisma.$transaction([
      prisma.galleryPhoto.deleteMany({ where: { albumId: id } }),
      prisma.galleryAlbum.delete({ where: { id } }),
    ]);
  } catch (error) {
    console.error("Failed to delete gallery album:", error);
    return { status: "error", message: "Something went wrong while deleting. Please try again." };
  }

  revalidatePath("/admin/gallery");

  // The row disappears from the revalidated list on success — nothing left
  // on the page to attach a success message to.
  return { status: "idle", message: "" };
}

/**
 * Flips `isPublished`, keeping `publishedAt` consistent: set to now when
 * publishing, cleared when unpublishing. Bound with
 * `.bind(null, id, nextIsPublished)` from a plain Server Component form.
 */
export async function toggleGalleryAlbumPublished(id: string, nextIsPublished: boolean): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  await prisma.galleryAlbum.update({
    where: { id },
    data: {
      isPublished: nextIsPublished,
      publishedAt: nextIsPublished ? new Date() : null,
      updatedById: session.user.id,
    },
  });

  revalidatePath("/admin/gallery");
}

/** Flips `isFeatured`. Bound with `.bind(null, id, nextIsFeatured)`. No maximum-featured-count is enforced — plain boolean. */
export async function toggleGalleryAlbumFeatured(id: string, nextIsFeatured: boolean): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  await prisma.galleryAlbum.update({
    where: { id },
    data: { isFeatured: nextIsFeatured, updatedById: session.user.id },
  });

  revalidatePath("/admin/gallery");
}

/** The next free sortOrder in an album — existing highest plus one, or 1 for the first photo. */
async function nextPhotoSortOrder(albumId: string): Promise<number> {
  const last = await prisma.galleryPhoto.findFirst({
    where: { albumId },
    orderBy: { sortOrder: "desc" },
  });
  return (last?.sortOrder ?? 0) + 1;
}

/**
 * Adds an existing Media record to an album as a GalleryPhoto. Never
 * uploads or creates Media — `mediaId` must already exist.
 */
export async function addGalleryPhoto(
  _prevState: GalleryPhotoActionState,
  formData: FormData
): Promise<GalleryPhotoActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage the gallery." };
  }

  const albumId = readOptionalString(formData, "albumId");
  if (!albumId) {
    return { status: "error", message: "Missing album id." };
  }

  const album = await prisma.galleryAlbum.findUnique({ where: { id: albumId } });
  if (!album) {
    return { status: "error", message: "This album no longer exists. Please reload the page." };
  }

  const mediaId = readOptionalString(formData, "mediaId");
  if (!mediaId) {
    return { status: "error", message: "Please select a media item to add." };
  }

  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) {
    return { status: "error", message: "Selected media item does not exist." };
  }

  const sortOrderRaw = readOptionalString(formData, "sortOrder");
  let sortOrder: number;
  if (sortOrderRaw) {
    sortOrder = Number(sortOrderRaw);
    if (!Number.isInteger(sortOrder)) {
      return { status: "error", message: "Sort Order must be a valid integer." };
    }
  } else {
    sortOrder = await nextPhotoSortOrder(albumId);
  }

  try {
    await prisma.galleryPhoto.create({
      data: {
        albumId,
        mediaId,
        caption: readOptionalString(formData, "caption"),
        altText: readOptionalString(formData, "altText"),
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Failed to add gallery photo:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath(`/admin/gallery/${albumId}/edit`);

  return { status: "success", message: "Photo added to the album." };
}

/** Updates a GalleryPhoto's caption, alt text, and sort order. `mediaId`/`albumId` are never editable here. */
export async function updateGalleryPhoto(
  _prevState: GalleryPhotoActionState,
  formData: FormData
): Promise<GalleryPhotoActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage the gallery." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing photo id." };
  }

  const existing = await prisma.galleryPhoto.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This photo no longer exists. Please reload the page." };
  }

  const sortOrderRaw = formData.get("sortOrder");
  const sortOrderText = typeof sortOrderRaw === "string" ? sortOrderRaw.trim() : "";
  if (!sortOrderText) {
    return { status: "error", message: "Please fill in the following required field: Sort Order." };
  }

  const sortOrder = Number(sortOrderText);
  if (!Number.isInteger(sortOrder)) {
    return { status: "error", message: "Sort Order must be a valid integer." };
  }

  try {
    await prisma.galleryPhoto.update({
      where: { id },
      data: {
        caption: readOptionalString(formData, "caption"),
        altText: readOptionalString(formData, "altText"),
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Failed to update gallery photo:", error);
    return { status: "error", message: "Something went wrong while saving. Please try again." };
  }

  revalidatePath(`/admin/gallery/${existing.albumId}/edit`);

  return { status: "success", message: "Photo updated." };
}

/** Removes a photo from its album. Only the GalleryPhoto row is deleted — the underlying Media record is never touched. */
export async function removeGalleryPhoto(
  _prevState: GalleryPhotoActionState,
  formData: FormData
): Promise<GalleryPhotoActionState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { status: "error", message: "You must be signed in to manage the gallery." };
  }

  const id = readOptionalString(formData, "id");
  if (!id) {
    return { status: "error", message: "Missing photo id." };
  }

  const existing = await prisma.galleryPhoto.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "This photo no longer exists. Please reload the page." };
  }

  try {
    await prisma.galleryPhoto.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to remove gallery photo:", error);
    return { status: "error", message: "Something went wrong while removing. Please try again." };
  }

  revalidatePath(`/admin/gallery/${existing.albumId}/edit`);

  // The row disappears from the revalidated list on success — nothing left
  // on the page to attach a success message to.
  return { status: "idle", message: "" };
}

/**
 * Swaps sortOrder with the adjacent photo in the same album. Bound with
 * `.bind(null, id, "up" | "down")` from a plain Server Component form. A
 * no-op at either edge of the list (no neighbor to swap with).
 */
export async function reorderGalleryPhoto(id: string, direction: "up" | "down"): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    return;
  }

  const photo = await prisma.galleryPhoto.findUnique({ where: { id } });
  if (!photo) {
    return;
  }

  const neighbor = await prisma.galleryPhoto.findFirst({
    where: {
      albumId: photo.albumId,
      sortOrder: direction === "up" ? { lt: photo.sortOrder } : { gt: photo.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });

  if (!neighbor) {
    return;
  }

  await prisma.$transaction([
    prisma.galleryPhoto.update({ where: { id: photo.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.galleryPhoto.update({ where: { id: neighbor.id }, data: { sortOrder: photo.sortOrder } }),
  ]);

  revalidatePath(`/admin/gallery/${photo.albumId}/edit`);
}
